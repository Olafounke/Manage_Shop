param ([switch]$Force = $false)

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line -split "=", 2
            $key = $parts[0].Trim()
            $value = $parts[1].Trim() -replace '"', ''
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    return 0
}

$mongoUser = [Environment]::GetEnvironmentVariable('MONGODB_USER')
$mongoPass = [Environment]::GetEnvironmentVariable('MONGODB_PASSWORD')
$mongoCluster = [Environment]::GetEnvironmentVariable('STORE_MONGODB_CLUSTER')
$mongoOptions = [Environment]::GetEnvironmentVariable('MONGODB_OPTIONS')

$mongoUri = "mongodb+srv://$mongoUser`:$mongoPass@$mongoCluster`?$mongoOptions"

try {
    $allIds = & mongosh $mongoUri --eval "db.stores_config.distinct('storeId')" --quiet 2>&1
} catch {
    return 0
}

$content = @()
$content += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$content += "services:"

$storeCount = 0
$availableIds = @()

if ($allIds -and $allIds -ne "[ ]") {
    $idMatches = [regex]::Matches($allIds, "'([^']+)'")
    foreach ($match in $idMatches) {
        if ($match.Success) {
            $availableIds += $match.Groups[1].Value
        }
    }
}

foreach ($id in $availableIds) {
    try {
        $nameResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {storeName: 1, _id: 0})" --quiet 2>&1
        $portResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {port: 1, _id: 0})" --quiet 2>&1
        $addressResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {storeAddress: 1, _id: 0})" --quiet 2>&1
        $userResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {userId: 1, _id: 0})" --quiet 2>&1
        
        $storeName = ""
        $storePort = ""
        $storeAddress = ""
        $userId = ""
        
        if ($nameResult -match "storeName:\s*'([^']+)'") { $storeName = $matches[1] }
        if ($portResult -match "port:\s*(\d+)") { $storePort = $matches[1] }
        if ($addressResult -match "storeAddress:\s*'([^']+)'") { $storeAddress = $matches[1] }
        if ($userResult -match "userId:\s*'([^']+)'") { $userId = $matches[1] }
        
        if ($storeName -and $storePort -and $storeAddress -and $userId) {
            $storeCount++
            
            $content += ""
            $content += "  ms_store_$storeName`:"
            $content += "    container_name: ms-store-$storeName"
            $content += "    build:"
            $content += "      context: ./Microservice_store"
            $content += "      dockerfile: Dockerfile"
            $content += "    restart: unless-stopped"
            $content += "    depends_on:"
            $content += "      ms-postgres-db:"
            $content += "        condition: service_healthy"
            $content += "    environment:"
            $content += "      - STORE_ID=$id"
            $content += "      - STORE_NAME=$storeName"
            $content += "      - STORE_ADDRESS=$storeAddress"
            $content += "      - USER_ID=$userId"
            $content += "      - PORT=$storePort"
            $content += "      - POSTGRES_HOST=ms-postgres-db"
            $content += "      - POSTGRES_PORT=5432"
            $content += "      - POSTGRES_USER=`${POSTGRES_USER}"
            $content += "      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}"
            $content += "      - DB_NAME=db-store-$storeName"
            $content += "    ports:"
            $content += "      - `"$storePort`:$storePort`""
            $content += "    networks:"
            $content += "      - manage-shop-network"
        }
    } catch {}
}

if ($storeCount -eq 0) {
    $content += ""
    $content += "  placeholder-store:"
    $content += "    image: alpine:latest"
    $content += "    container_name: placeholder-store"
    $content += "    command: echo 'Aucun magasin configure'"
    $content += "    networks:"
    $content += "      - manage-shop-network"
}

$content | Out-File -FilePath "_docker-compose/docker-compose.stores.yml" -Encoding UTF8

if ($storeCount -gt 0) {
    Write-Host "Genere: $storeCount magasins" -ForegroundColor Green
}

return $storeCount 
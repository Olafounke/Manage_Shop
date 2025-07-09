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
        $slugResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {storeNameSlug: 1, _id: 0})" --quiet 2>&1
        $portResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {port: 1, _id: 0})" --quiet 2>&1
        $addressResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {storeAddress: 1, _id: 0})" --quiet 2>&1
        $longitudeResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {longitude: 1, _id: 0})" --quiet 2>&1
        $latitudeResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {latitude: 1, _id: 0})" --quiet 2>&1
        $userResult = & mongosh $mongoUri --eval "db.stores_config.findOne({storeId: '$id'}, {userId: 1, _id: 0})" --quiet 2>&1
        
        $storeName = ""
        $storeNameSlug = ""
        $storePort = ""
        $storeAddress = ""
        $longitude = ""
        $latitude = ""
        $userId = ""
        
        Write-Host "[GEN-LOG] Parsing des donnees..." -ForegroundColor Gray
        if ($nameResult -match "storeName:\s*'([^']+)'") { 
            $storeName = $matches[1] 
            Write-Host "[GEN-LOG] [OK] storeName extrait: $storeName" -ForegroundColor Green
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire storeName" -ForegroundColor Red
        }
        
        if ($slugResult -match "storeNameSlug:\s*'([^']+)'") { 
            $storeNameSlug = $matches[1] 
            Write-Host "[GEN-LOG] [OK] storeNameSlug extrait: $storeNameSlug" -ForegroundColor Green
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire storeNameSlug" -ForegroundColor Red
        }
        
        if ($portResult -match "port:\s*(\d+)") { 
            $storePort = $matches[1] 
            Write-Host "[GEN-LOG] [OK] port extrait: $storePort" -ForegroundColor Green
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire port" -ForegroundColor Red
        }
        
        if ($addressResult -match "storeAddress:\s*'([^']+)'") { 
            $storeAddress = $matches[1] 
            Write-Host "[GEN-LOG] [OK] storeAddress extrait: $storeAddress" -ForegroundColor Green
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire storeAddress" -ForegroundColor Red
        }
        
        if ($longitudeResult -match "longitude:\s*Decimal128\('([^']+)'\)") { 
            $longitude = $matches[1] 
            Write-Host "[GEN-LOG] [OK] longitude extrait: $longitude" -ForegroundColor Green
        } elseif ($longitudeResult -match "longitude:\s*([0-9.-]+)") {
            $longitude = $matches[1] 
            Write-Host "[GEN-LOG] [OK] longitude extrait (format numérique): $longitude" -ForegroundColor Green
        } elseif ($longitudeResult -match "longitude:\s*null") {
            $longitude = ""
            Write-Host "[GEN-LOG] [OK] longitude null" -ForegroundColor Yellow
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire longitude: $longitudeResult" -ForegroundColor Red
        }
        
        if ($latitudeResult -match "latitude:\s*Decimal128\('([^']+)'\)") { 
            $latitude = $matches[1] 
            Write-Host "[GEN-LOG] [OK] latitude extrait: $latitude" -ForegroundColor Green
        } elseif ($latitudeResult -match "latitude:\s*([0-9.-]+)") {
            $latitude = $matches[1] 
            Write-Host "[GEN-LOG] [OK] latitude extrait (format numérique): $latitude" -ForegroundColor Green
        } elseif ($latitudeResult -match "latitude:\s*null") {
            $latitude = ""
            Write-Host "[GEN-LOG] [OK] latitude null" -ForegroundColor Yellow
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire latitude: $latitudeResult" -ForegroundColor Red
        }
        
        if ($userResult -match "userId:\s*'([^']+)'") { 
            $userId = $matches[1] 
            Write-Host "[GEN-LOG] [OK] userId extrait: $userId" -ForegroundColor Green
        } else {
            Write-Host "[GEN-ERROR] [KO] Impossible d'extraire userId" -ForegroundColor Red
        }
        
        if ($storeName -and $storeNameSlug -and $storePort -and $storeAddress -and $longitude -and $latitude) {
            $storeCount++
            
            $content += ""
            $content += "  ms_store_$storeNameSlug`:"
            $content += "    container_name: ms-store-$storeNameSlug"
            $content += "    build:"
            $content += "      context: ../Microservice_store"
            $content += "      dockerfile: Dockerfile"
            $content += "    restart: unless-stopped"
            $content += "    depends_on:"
            $content += "      ms-postgres-db:"
            $content += "        condition: service_healthy"
            $content += "    environment:"
            $content += "      - STORE_ID=$id"
            $content += "      - STORE_NAME=$storeName"
            $content += "      - STORE_NAME_SLUG=$storeNameSlug"
            $content += "      - STORE_ADDRESS=$storeAddress"
            $content += "      - STORE_LONGITUDE=$longitude"
            $content += "      - STORE_LATITUDE=$latitude"
            $content += "      - USER_ID=$userId"
            $content += "      - PORT=$storePort"
            $content += "      - POSTGRES_HOST=ms-postgres-db"
            $content += "      - POSTGRES_PORT=5432"
            $content += "      - POSTGRES_USER=`${POSTGRES_USER}"
            $content += "      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}"
            $content += "      - DB_NAME=db-store-$storeNameSlug"
            $content += "    ports:"
            $content += "      - `"$storePort`:$storePort`""
            $content += "    networks:"
            $content += "      - manage-shop-network"
        }
    } catch {
        Write-Host "[GEN-ERROR] Erreur lors du traitement du store ID $id : $_" -ForegroundColor Red
    }
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
# Worker pour la gestion automatique des nouveaux magasins
# Version CORRIGEE avec mise a jour des statuts

param (
    [int]$CheckInterval = 10
)

$Host.UI.RawUI.WindowTitle = "Store Worker"

function Load-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Host "Fichier .env manquant" -ForegroundColor Red
        return $false
    }
    
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line -split "=", 2
            $key = $parts[0].Trim()
            $value = $parts[1].Trim() -replace '"', ''
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    return $true
}

function Get-MongoUri {
    $mongoUser = [Environment]::GetEnvironmentVariable('MONGODB_USER')
    $mongoPass = [Environment]::GetEnvironmentVariable('MONGODB_PASSWORD')
    $mongoCluster = [Environment]::GetEnvironmentVariable('STORE_MONGODB_CLUSTER')
    $mongoOptions = [Environment]::GetEnvironmentVariable('MONGODB_OPTIONS')
    
    return "mongodb+srv://$mongoUser`:$mongoPass@$mongoCluster`?$mongoOptions"
}

function Update-StoreStatus {
    param ([string]$StoreId, [string]$Status, [string]$Error = "")
    
    $mongoUri = Get-MongoUri
    
    try {
        if ($Error) {
            $cmd = "db.stores_config.updateOne({storeId: '$StoreId'}, {`$set: {status: '$Status', error: '$Error', updatedAt: new Date()}})"
        } else {
            $cmd = "db.stores_config.updateOne({storeId: '$StoreId'}, {`$set: {status: '$Status', updatedAt: new Date()}})"
        }
        
        & mongosh $mongoUri --eval $cmd --quiet | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-PendingStoresDetails {
    $mongoUri = Get-MongoUri
    
    try {
        $countResult = & mongosh $mongoUri --eval "db.stores_config.countDocuments({status: 'pending'})" --quiet 2>&1
        
        if ($countResult -eq "0") {
            return @()
        }
        
        $storeNameResult = & mongosh $mongoUri --eval "db.stores_config.findOne({status: 'pending'}, {storeName: 1, _id: 0})" --quiet 2>&1
        $storeIdResult = & mongosh $mongoUri --eval "db.stores_config.findOne({status: 'pending'}, {storeId: 1, _id: 0})" --quiet 2>&1
        
        $stores = @()
        if ($storeNameResult -match "storeName:\s*'([^']+)'") {
            $storeName = $matches[1]
            if ($storeIdResult -match "storeId:\s*'([^']+)'") {
                $storeId = $matches[1]
                $stores += @{
                    storeId = $storeId
                    storeName = $storeName
                }
            }
        }
        
        return $stores
    } catch {
        return @()
    }
}

if (-not (Load-EnvFile)) {
    Write-Host "Erreur chargement .env" -ForegroundColor Red
    exit 1
}

$mongoUri = Get-MongoUri
try {
    $pingResult = & mongosh $mongoUri --eval "db.runCommand('ping')" --quiet 2>&1
    if (-not ($pingResult -like "*ok*")) {
        Write-Host "Connexion MongoDB echouee" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Erreur MongoDB" -ForegroundColor Red
    exit 1
}

Write-Host "Worker actif (check: ${CheckInterval}s)" -ForegroundColor Green

$totalProcessed = 0
while ($true) {
    try {
        $pendingStores = Get-PendingStoresDetails
        
        if ($pendingStores.Count -gt 0) {
            foreach ($store in $pendingStores) {
                Write-Host "Deploiement: $($store.storeName)" -ForegroundColor Cyan
                
                Update-StoreStatus -StoreId $store.storeId -Status "processing"
                
                & .\_scripts\generate-stores-compose.ps1 | Out-Null
                $dockerResult = docker-compose -f dockerCompose/docker-compose.yml up -d --no-recreate 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Update-StoreStatus -StoreId $store.storeId -Status "completed"
                    Write-Host "Succes: $($store.storeName)" -ForegroundColor Green
                    $totalProcessed++
                } else {
                    Update-StoreStatus -StoreId $store.storeId -Status "failed" -Error "Docker error: $LASTEXITCODE"
                    Write-Host "Echec: $($store.storeName)" -ForegroundColor Red
                }
            }
        }
        
        Start-Sleep -Seconds $CheckInterval
        
    } catch {
        Start-Sleep -Seconds 30
    }
}
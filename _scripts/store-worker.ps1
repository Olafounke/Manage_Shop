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

function Remove-StoreContainer {
    param([string]$ContainerName)
    
    try {
        $containerExists = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
        
        if ($containerExists) {
            Write-Host "Arrêt du container $ContainerName..." -ForegroundColor Yellow
            docker stop $ContainerName 2>$null | Out-Null
            
            Write-Host "Suppression du container $ContainerName..." -ForegroundColor Yellow
            docker rm $ContainerName 2>$null | Out-Null
            
            Write-Host "Container $ContainerName supprimé" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Container $ContainerName n'existe pas" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "Erreur lors de la suppression du container: $_" -ForegroundColor Red
        return $false
    }
}

function Remove-StoreDatabase {
    param([string]$DatabaseName)
    
    try {
        $postgresUser = [Environment]::GetEnvironmentVariable('POSTGRES_USER')
        
        if ($postgresUser) {
            Write-Host "Suppression de la base de données $DatabaseName..." -ForegroundColor Yellow
            
            $dropDbCommand = "DROP DATABASE IF EXISTS `"$DatabaseName`";"
            docker exec ms-postgres-db psql -U $postgresUser -c $dropDbCommand 2>$null | Out-Null
            
            Write-Host "Base de données $DatabaseName supprimée" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Variable POSTGRES_USER manquante" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "Erreur lors de la suppression de la BDD: $_" -ForegroundColor Red
        return $false
    }
}

function Remove-StoreFromMongoDB {
    param([string]$StoreId)
    
    try {
        $mongoUri = Get-MongoUri
        
        Write-Host "Suppression du store $StoreId de MongoDB..." -ForegroundColor Yellow
        
        $deleteCommand = "db.stores_config.deleteOne({storeId:'$StoreId'})"
        $result = & mongosh $mongoUri --eval $deleteCommand --quiet 2>&1
        
        if ($result -and ($result -like "*deleted*" -or $result -like "*acknowledged*")) {
            Write-Host "Store $StoreId supprimé de MongoDB" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Erreur lors de la suppression du store de MongoDB" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Erreur MongoDB: $_" -ForegroundColor Red
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
                    action = "create"
                }
            }
        }
        
        return $stores
    } catch {
        return @()
    }
}

function Get-DeletingStoresDetails {
    $mongoUri = Get-MongoUri
    
    try {
        $countResult = & mongosh $mongoUri --eval "db.stores_config.countDocuments({status: 'deleting'})" --quiet 2>&1
        
        if ($countResult -eq "0") {
            return @()
        }
        
        $storeNameResult = & mongosh $mongoUri --eval "db.stores_config.findOne({status: 'deleting'}, {storeName: 1, _id: 0})" --quiet 2>&1
        $storeIdResult = & mongosh $mongoUri --eval "db.stores_config.findOne({status: 'deleting'}, {storeId: 1, _id: 0})" --quiet 2>&1
        $storeSlugResult = & mongosh $mongoUri --eval "db.stores_config.findOne({status: 'deleting'}, {storeNameSlug: 1, _id: 0})" --quiet 2>&1
        
        $stores = @()
        if ($storeNameResult -match "storeName:\s*'([^']+)'") {
            $storeName = $matches[1]
            if ($storeIdResult -match "storeId:\s*'([^']+)'") {
                $storeId = $matches[1]
                $storeSlug = ""
                if ($storeSlugResult -match "storeNameSlug:\s*'([^']+)'") {
                    $storeSlug = $matches[1]
                }
                $stores += @{
                    storeId = $storeId
                    storeName = $storeName
                    storeNameSlug = $storeSlug
                    action = "delete"
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
        # Traitement des nouveaux stores à créer
        $pendingStores = Get-PendingStoresDetails
        
        if ($pendingStores.Count -gt 0) {
            foreach ($store in $pendingStores) {
                Write-Host "Deploiement: $($store.storeName)" -ForegroundColor Cyan
                
                Update-StoreStatus -StoreId $store.storeId -Status "processing"
                
                & .\_scripts\generate-stores-compose.ps1 | Out-Null
                Push-Location _docker-compose
                $dockerResult = docker-compose up -d --no-recreate 2>&1
                Pop-Location
                
                if ($LASTEXITCODE -eq 0) {
                    Update-StoreStatus -StoreId $store.storeId -Status "deployed"
                    Write-Host "Succes: $($store.storeName)" -ForegroundColor Green
                    $totalProcessed++
                } else {
                    Update-StoreStatus -StoreId $store.storeId -Status "failed" -Error "Docker error: $LASTEXITCODE"
                    Write-Host "Echec: $($store.storeName)" -ForegroundColor Red
                }
            }
        }

        # Traitement des stores à supprimer
        $deletingStores = Get-DeletingStoresDetails
        
        if ($deletingStores.Count -gt 0) {
            foreach ($store in $deletingStores) {
                Write-Host "Suppression: $($store.storeName)" -ForegroundColor Red
                
                $containerName = "ms-store-$($store.storeNameSlug)"
                $databaseName = "db-store-$($store.storeNameSlug)"
                
                $containerRemoved = Remove-StoreContainer -ContainerName $containerName
                
                $dbRemoved = Remove-StoreDatabase -DatabaseName $databaseName
                
                if ($containerRemoved) {
                    $storeRemoved = Remove-StoreFromMongoDB -StoreId $store.storeId
                    
                    if ($storeRemoved) {
                        & .\_scripts\generate-stores-compose.ps1 | Out-Null
                        Push-Location _docker-compose
                        docker-compose down --remove-orphans 2>$null | Out-Null
                        docker-compose up -d 2>$null | Out-Null
                        Pop-Location
                        
                        Write-Host "Store $($store.storeName) supprimé avec succès" -ForegroundColor Green
                    } else {
                        Write-Host "Erreur lors de la suppression de $($store.storeName)" -ForegroundColor Red
                    }
                } else {
                    Write-Host "Erreur lors de la suppression du container de $($store.storeName)" -ForegroundColor Red
                }
            }
        }
        
        Start-Sleep -Seconds $CheckInterval
        
    } catch {
        Start-Sleep -Seconds 30
    }
}
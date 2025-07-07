param (
    [Parameter(Mandatory = $true)][string]$StoreId,
    [Parameter(Mandatory = $true)][string]$StoreName,
    [Parameter(Mandatory = $true)][string]$StoreAddress,
    [Parameter(Mandatory = $true)][string]$UserId,
    [Parameter(Mandatory = $true)][int]$StorePort
)

# Lire le fichier docker-compose.yml existant s'il existe
$dockerComposeFile = "docker-compose.yml"
$existingContent = ""
$servicesSection = ""

if (Test-Path $dockerComposeFile) {
    $existingContent = Get-Content $dockerComposeFile -Raw
    Write-Host "Fichier docker-compose.yml existant trouvé, ajout du nouveau service..."
    
    # Extraire la section services existante (sans le service postgres pour éviter les doublons)
    if ($existingContent -match "services:\s*(.*?)(?=volumes:|$)") {
        $servicesSection = $matches[1]
        # Supprimer le service postgres s'il existe déjà pour éviter les doublons
        $servicesSection = $servicesSection -replace "(?s)  postgres:.*?(?=  \w+:|$)", ""
        # S'assurer que la section se termine par une nouvelle ligne
        if (-not $servicesSection.EndsWith("`n")) {
            $servicesSection += "`n"
        }
    }
} else {
    Write-Host "Création d'un nouveau fichier docker-compose.yml..."
    $servicesSection = ""
}

# Créer le nouveau service pour ce magasin
$newStoreService = @"
  ms_store_$StoreName`:
    container_name: ms-store-$StoreName
    build: .
    depends_on:
      - postgres
    environment:
      - STORE_ID=$StoreId
      - STORE_NAME=$StoreName
      - STORE_ADDRESS=$StoreAddress
      - USER_ID=$UserId
      - PORT=$StorePort
      - POSTGRES_HOST=`${POSTGRES_HOST} 
      - POSTGRES_PORT=`${POSTGRES_PORT} 
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
      - DB_NAME=db-store-$StoreName 
    ports:
      - "$StorePort`:$StorePort" 

"@

# Service PostgreSQL (partagé par tous les magasins)
$postgresService = @"
  postgres:
    container_name: ms-postgres-db
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

"@

# Construire le contenu complet du docker-compose.yml
$dockerComposeContent = @"
services:
$servicesSection$newStoreService$postgresService
volumes:
  pgdata:
"@

# Écriture du fichier docker-compose.yml
$dockerComposeContent | Out-File -FilePath "docker-compose.yml" -Encoding UTF8

Write-Host "Fichier docker-compose.yml mis à jour avec succès."
Write-Host "Ajout du service ms_store_$StoreName sur le port $StorePort ..."

# Lancement du container Docker
docker compose --env-file .env -f docker-compose.yml up --build -d

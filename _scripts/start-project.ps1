param (
    [switch]$Rebuild = $false,
    [switch]$NoWorker = $false
)

function Load-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Host "Fichier .env manquant" -ForegroundColor Red
        exit 1
    }
}

function Test-Prerequisites {
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
    }
    catch {
        Write-Host "Docker/Docker-Compose manquant" -ForegroundColor Red
        exit 1
    }
}

Load-EnvFile
Test-Prerequisites

Write-Host "Generation magasins..." -ForegroundColor Cyan
$storeCount = & .\_scripts\generate-stores-compose.ps1

if ($Rebuild) {
    Push-Location _docker-compose
    docker-compose down --remove-orphans 2>$null
    Pop-Location
    docker container prune -f 2>$null
}

Write-Host "Demarrage services..." -ForegroundColor Green
$buildFlag = if ($Rebuild) { "--build" } else { "" }
Push-Location _docker-compose
Invoke-Expression "docker-compose up -d $buildFlag"
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur demarrage" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 5

if (-not $NoWorker) {
    $existingWorkers = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { 
        try {
            $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            return $commandLine -like "*store-worker.ps1*"
        } catch {
            return $false
        }
    }
    if ($existingWorkers) {
        $existingWorkers | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path ".\_scripts\store-worker.ps1") {
        try {
            $workerProcess = Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", ".\_scripts\store-worker.ps1" -WindowStyle Hidden -PassThru
            Start-Sleep -Seconds 2
            
            if ($workerProcess -and !$workerProcess.HasExited) {
                Write-Host "Worker demarre: PID $($workerProcess.Id)" -ForegroundColor Green
            }
        } catch {
            Write-Host "Erreur worker" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nSERVICES ACTIFS:" -ForegroundColor Green
Write-Host "Frontend: http://localhost" -ForegroundColor White
Write-Host "API Gateway: http://localhost:3000" -ForegroundColor White

if ($storeCount -gt 0) {
    Write-Host "Magasins: $storeCount deployes" -ForegroundColor Cyan
} else {
    Write-Host "Creer magasin: .\API_Gateway\create-store.ps1 ID NOM ADRESSE USER PORT" -ForegroundColor Yellow
} 
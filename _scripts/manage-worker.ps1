param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "status", "restart")]
    [string]$Action
)

function Get-WorkerProcess {
    return Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { 
        try {
            $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            return $commandLine -like "*store-worker.ps1*"
        } catch {
            return $false
        }
    }
}

function Show-WorkerStatus {
    $workers = Get-WorkerProcess
    
    if ($workers) {
        Write-Host "Worker actif: PID $($workers[0].Id)" -ForegroundColor Green
    } else {
        Write-Host "Worker inactif" -ForegroundColor Red
    }
}

function Start-Worker {
    if (Get-WorkerProcess) {
        Write-Host "Worker deja actif" -ForegroundColor Yellow
        return
    }
    
    if (-not (Test-Path ".\_scripts\store-worker.ps1")) {
        Write-Host "_scripts/store-worker.ps1 introuvable" -ForegroundColor Red
        return
    }
    
    try {
        $workerProcess = Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", ".\_scripts\store-worker.ps1" -WindowStyle Hidden -PassThru
        Start-Sleep -Seconds 2
        
        if ($workerProcess -and !$workerProcess.HasExited) {
            Write-Host "Worker demarre en arriere-plan: PID $($workerProcess.Id)" -ForegroundColor Green
        } else {
            Write-Host "Echec demarrage worker" -ForegroundColor Red
        }
    } catch {
        Write-Host "Erreur: $_" -ForegroundColor Red
    }
}

function Stop-Worker {
    $workers = Get-WorkerProcess
    
    if (-not $workers) {
        Write-Host "Aucun worker a arreter" -ForegroundColor Gray
        return
    }
    
    foreach ($worker in $workers) {
        try {
            $worker | Stop-Process -Force
            Write-Host "Worker arrete: PID $($worker.Id)" -ForegroundColor Green
        } catch {
            Write-Host "Erreur arret PID $($worker.Id)" -ForegroundColor Red
        }
    }
}

switch ($Action) {
    "start" { Start-Worker }
    "stop" { Stop-Worker }
    "status" { Show-WorkerStatus }
    "restart" {
        Stop-Worker
        Start-Sleep -Seconds 2
        Start-Worker
    }
}
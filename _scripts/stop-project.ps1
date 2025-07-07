param (
    [switch]$Force = $false,      # Force l'arret des containers
    [switch]$Clean = $false,      # Nettoie les volumes et networks
    [switch]$KeepWorker = $false  # Ne pas arreter le worker
)

function Stop-StoreWorker {
    $workerProcesses = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { 
        try {
            $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            return $commandLine -like "*store-worker.ps1*"
        } catch {
            return $false
        }
    }
    
    if ($workerProcesses) {
        foreach ($process in $workerProcesses) {
            try {
                Stop-Process -Id $process.Id -Force -ErrorAction Stop
                Write-Host "Worker arrete: PID $($process.Id)" -ForegroundColor Green
            } catch {}
        }
    }
}

function Stop-DockerServices {
    param ([switch]$ForceStop = $false, [switch]$CleanUp = $false)
    
    Push-Location _docker-compose
    $downCommand = "docker-compose down --remove-orphans"
    if ($ForceStop) {
        $downCommand += " --volumes"
    }
    
    Invoke-Expression $downCommand
    Pop-Location
    
    if ($CleanUp) {
        docker container prune -f 2>$null
        docker image prune -f 2>$null
        docker volume prune -f 2>$null
        docker network prune -f 2>$null
    }
}

Write-Host "Arret projet..." -ForegroundColor Red

if (-not $KeepWorker) {
    Stop-StoreWorker
}

Stop-DockerServices -ForceStop:$Force -CleanUp:$Clean

Write-Host "Projet arrete" -ForegroundColor Green 
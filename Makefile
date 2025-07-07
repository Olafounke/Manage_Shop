.PHONY: start stop restart clean worker-start worker-stop worker-status worker-restart

start:
	@echo "Demarrage du projet Manage Shop..."
	@powershell -ExecutionPolicy Bypass -File _scripts/start-project.ps1

stop:
	@echo "Arret du projet Manage Shop..."
	@powershell -ExecutionPolicy Bypass -File _scripts/stop-project.ps1

restart:
	@echo "Redemarrage du projet Manage Shop..."
	@powershell -ExecutionPolicy Bypass -File _scripts/stop-project.ps1
	@timeout /t 3 /nobreak > nul
	@powershell -ExecutionPolicy Bypass -File _scripts/start-project.ps1

rebuild:
	@echo "Reconstruction et redemarrage du projet..."
	@powershell -ExecutionPolicy Bypass -File _scripts/start-project.ps1 -Rebuild

clean:
	@echo "Nettoyage complet (containers, images, volumes, networks)..."
	@powershell -ExecutionPolicy Bypass -File _scripts/stop-project.ps1 -Clean

# Gestion du worker
worker-start:
	@echo "Demarrage du worker..."
	@powershell -ExecutionPolicy Bypass -File _scripts/manage-worker.ps1 start

worker-stop:
	@echo "Arret du worker..."
	@powershell -ExecutionPolicy Bypass -File _scripts/manage-worker.ps1 stop

worker-status:
	@echo "Statut du worker..."
	@powershell -ExecutionPolicy Bypass -File _scripts/manage-worker.ps1 status

worker-restart:
	@echo "Redemarrage du worker..."
	@powershell -ExecutionPolicy Bypass -File _scripts/manage-worker.ps1 restart
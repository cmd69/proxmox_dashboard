.DEFAULT_GOAL := help

.PHONY: help up down logs build up-dev down-dev logs-dev shell setup

help: ## Mostrar esta ayuda
	@echo "proxmox_dashboard"
	@echo ""
	@echo "  make setup      Copia .env.example -> .env"
	@echo "  make up         Producción (build estático, puerto 3000)"
	@echo "  make down       Parar producción"
	@echo "  make logs       Logs producción"
	@echo "  make build      Construir imagen de producción"
	@echo "  make up-dev     Desarrollo (hot-reload, puerto 3000)"
	@echo "  make down-dev   Parar desarrollo"
	@echo "  make logs-dev   Logs desarrollo"
	@echo "  make shell      Shell en el contenedor dev"

setup: ## Crear .env desde .env.example si no existe
	@[ -f .env ] && echo ".env ya existe" || (cp .env.example .env && echo ".env creado — edítalo antes de levantar")

# === Producción ===

up: ## Iniciar producción
	docker compose up -d

down: ## Detener producción
	docker compose down

logs: ## Ver logs producción
	docker compose logs -f

build: ## Construir imagen de producción
	docker compose build

# === Desarrollo ===

up-dev: ## Iniciar desarrollo con hot-reload
	docker compose -f docker-compose.dev.yml up -d

down-dev: ## Detener desarrollo
	docker compose -f docker-compose.dev.yml down

logs-dev: ## Ver logs desarrollo
	docker compose -f docker-compose.dev.yml logs -f

shell: ## Shell en el contenedor dev
	docker compose -f docker-compose.dev.yml exec app sh

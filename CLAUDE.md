# proxmox_dashboard

Dashboard web para visualizar y controlar la arquitectura del homelab Proxmox. Login, checkpoints, paneles de control.

## Stack

- **Lenguaje:** TypeScript
- **Framework:** Vite + React (frontend) + Express (server)
- **Base de datos:** ficheros JSON en /data
- **Deploy:** Docker Compose (dev con hot-reload, prod con build estático)
- **Tipo:** dev y prod en el mismo repo

## Arrancar

```bash
# Desarrollo (hot-reload en puerto 3000)
docker compose up -d       # docker-compose.yml es dev por defecto
docker compose logs -f

# Producción
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down
```

## Ejecución de comandos

**Todos los comandos que requieren librerías se ejecutan dentro del contenedor:**

```bash
docker compose exec architecture_dashboard pnpm install <paquete>
docker compose exec architecture_dashboard pnpm run build
docker compose exec architecture_dashboard pnpm run lint
docker compose exec architecture_dashboard sh
```

**Nunca ejecutar `pnpm`, `npm`, `npx`, `node` u otros comandos directamente en el host.**

## Estructura

```
proxmox_dashboard/
├── docker-compose.yml        # dev (hot-reload, monta código)
├── docker-compose.prod.yml   # prod (build estático)
├── Dockerfile                # multi-stage: development / production
├── client/                   # frontend React
├── server/                   # backend Express
├── data/                     # datos persistentes
├── patches/                  # pnpm patches
├── package.json
├── pnpm-lock.yaml
└── vite.config.ts
```

## Puertos

| Entorno | Puerto host |
|---|---|
| Dev / Prod | 3000 (configurable via PORT en .env) |

## Variables de entorno

```env
AUTH_USERNAME=     # login del dashboard
AUTH_PASSWORD=     # password del dashboard
PORT=3000
```

## Convención de commits

```
[NN] TYPE(scope): descripción breve
```

- `[NN]` secuencial por repo (último: `[07]`, siguiente: `[08]`)
- Tipos: `FEAT` `FIX` `DOCS` `REFACTOR` `CHORE` `TEST` `CI` `INFRA` `STYLE`
- Guía completa: `~/.agent/CODING.md`

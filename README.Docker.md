# Architecture Dashboard - Docker Setup

Este proyecto ha sido configurado para ejecutarse en Docker con las siguientes características:

## Características

- **Servicio**: `architecture_dashboard`
- **Puerto**: 3000
- **Red**: `demo` (red personalizada)
- **Health Check**: Incluido para monitoreo del estado del contenedor
- **Restart Policy**: `unless-stopped`
- **Hot-Reload**: Soporte para desarrollo con recarga automática

## Requisitos

- Docker
- Docker Compose
- Archivo `.env` configurado (ver `.env` de ejemplo)

## Modos de Ejecución

### 🔧 Modo Desarrollo (con hot-reload)

Este es el modo **recomendado para desarrollo**. Los cambios en el código se reflejan automáticamente sin necesidad de reconstruir.

```bash
# Iniciar en modo desarrollo
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f architecture_dashboard

# Detener
docker-compose down
```

**Características del modo desarrollo:**
- ✅ Hot-reload activado (Vite)
- ✅ Código fuente montado como volumen
- ✅ Cambios instantáneos sin rebuild
- ✅ DevDependencies incluidas
- ✅ Source maps disponibles

### 🚀 Modo Producción (optimizado)

Para producción, usa el archivo `docker-compose.prod.yml`:

```bash
# Iniciar en modo producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f architecture_dashboard

# Detener
docker-compose -f docker-compose.prod.yml down
```

**Características del modo producción:**
- ✅ Build optimizado
- ✅ Solo production dependencies
- ✅ Código compilado y minificado
- ✅ Imagen más ligera
- ✅ Mejor rendimiento

## Comandos de Uso

### Desarrollo

```bash
# Iniciar contenedor (primera vez o después de cambios en package.json)
docker-compose up -d --build

# Iniciar contenedor (cambios solo en código)
docker-compose up -d

# Reiniciar contenedor (aplica cambios de .env)
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f architecture_dashboard

# Detener contenedor
docker-compose down

# Detener y limpiar volúmenes
docker-compose down -v
```

### Producción

```bash
# Construir y ejecutar
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener
docker-compose -f docker-compose.prod.yml down
```

## Acceso a la aplicación

Una vez que el contenedor esté en ejecución, puedes acceder a la aplicación en:

```
http://localhost:3000
```

## 📁 Estructura de Docker

### Dockerfile (Multi-stage)

El Dockerfile tiene **3 stages** para diferentes propósitos:

1. **development**: Para desarrollo con hot-reload
   - Incluye todas las dependencias
   - Ejecuta `pnpm dev`
   - Código montado como volumen

2. **builder**: Para construir la aplicación
   - Compila el código
   - Genera los archivos optimizados

3. **production**: Para producción optimizada
   - Solo dependencias de producción
   - Código compilado y minificado
   - Imagen más ligera

### docker-compose.yml (Desarrollo)

Define el entorno de desarrollo:
- ✅ Volúmenes montados para hot-reload
- ✅ Variables de entorno desde `.env`
- ✅ Red personalizada `demo`
- ✅ Health check incluido
- ✅ Comando: `pnpm dev`

### docker-compose.prod.yml (Producción)

Define el entorno de producción:
- ✅ Build optimizado
- ✅ Sin volúmenes de código
- ✅ Variables de entorno para producción
- ✅ Comando: `node dist/index.js`

### .dockerignore

Excluye archivos innecesarios del contexto de construcción.

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Diario

1. **Iniciar el contenedor** (primera vez):
```bash
docker-compose up -d --build
```

2. **Hacer cambios en el código** - Los cambios se reflejan automáticamente gracias a Vite

3. **Ver logs si hay errores**:
```bash
docker-compose logs -f architecture_dashboard
```

4. **Reiniciar solo si cambias `.env` o `package.json`**:
```bash
# Si cambias package.json
docker-compose down && docker-compose up -d --build

# Si solo cambias .env
docker-compose restart
```

5. **Al terminar el día**:
```bash
docker-compose down
```

### Actualizar Código

**Cambios en archivos .ts, .tsx, .css:**
- ✅ No hacer nada - Hot reload automático

**Cambios en package.json (nuevas dependencias):**
```bash
docker-compose down
docker-compose up -d --build
```

**Cambios en .env:**
```bash
docker-compose restart
```

**Cambios en Dockerfile o docker-compose.yml:**
```bash
docker-compose down
docker-compose up -d --build
```

## ⚙️ Configuración del Archivo .env

Crea un archivo `.env` en la raíz del proyecto:

```env
# Environment Configuration
NODE_ENV=development
PORT=3000

# Application
VITE_APP_TITLE=Architecture Dashboard

# Optional: Otras configuraciones...
```

Puedes usar `.env.development` como referencia.

## 🐛 Troubleshooting

### El puerto 3000 está ocupado

Modifica el puerto en `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Cambia 8080 por el puerto que prefieras
```

### Los cambios no se reflejan

1. Verifica que el contenedor esté en modo desarrollo:
```bash
docker-compose ps
```

2. Revisa los logs:
```bash
docker-compose logs -f architecture_dashboard
```

3. Si es necesario, reconstruye:
```bash
docker-compose down && docker-compose up -d --build
```

### Error "Cannot find module"

Probablemente agregaste una nueva dependencia. Reconstruye:
```bash
docker-compose down && docker-compose up -d --build
```

### Ver el estado del health check

```bash
docker inspect architecture_dashboard | grep -A 10 Health
```

### Acceder al contenedor en ejecución

```bash
docker exec -it architecture_dashboard sh
```

### Limpiar todo y empezar de cero

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📊 Comparación de Modos

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| Hot-reload | ✅ Sí | ❌ No |
| DevDependencies | ✅ Sí | ❌ No |
| Source Maps | ✅ Sí | ❌ No |
| Código Minificado | ❌ No | ✅ Sí |
| Tamaño Imagen | ~500MB | ~200MB |
| Velocidad Inicio | Rápido | Muy Rápido |
| Uso: | Desarrollo | Deploy |

## 🎯 Tips

1. **Deja el contenedor corriendo durante el desarrollo** - No necesitas pararlo entre sesiones
2. **Usa `docker-compose logs -f`** - Para ver errores en tiempo real
3. **Solo reconstruye cuando sea necesario** - El hot-reload maneja la mayoría de cambios
4. **Usa producción para testing final** - Antes de deployar
5. **Limpia volúmenes periódicamente** - `docker-compose down -v`


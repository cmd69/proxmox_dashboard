# Proxmox Architecture Dashboard - TODO

## Características Principales

### Página Principal (Diagrama Interactivo)
- [x] Crear componente de diagrama interactivo con React Flow o D3.js
- [x] Visualizar nodos de arquitectura (Proxmox Host, VM101-VM104, Cliente Externo, Almacenamiento)
- [x] Implementar líneas de flujo de comunicación (Cliente -> Nginx -> VMs, NFS, CI/CD)
- [x] Agregar información on-hover (ID, Rol, CPU/RAM, Criticidad)
- [x] Implementar click en elementos para expandir información o navegar a detalle

### Páginas de Detalle por VM
- [x] Crear página de detalle para VM101 (TrueNAS)
- [x] Crear página de detalle para VM102 (DockerHost)
- [x] Crear página de detalle para VM103 (GPUProduction)
- [x] Crear página de detalle para VM104 (StagingAgent)
- [ ] Crear página de detalle para Proxmox Host

### Contenido de Páginas de Detalle
- [x] Sección de Hardware y Configuración (CPU, RAM, BIOS, Passthrough)
- [x] Sección de Servicios y Software (Docker, Nginx, Jellyfin, etc.)
- [x] Sección de Troubleshooting (Guía de resolución de problemas específica por VM)
- [x] Sección de Motivo de Elecciones de Diseño (Justificación de recursos y configuración)
- [x] Sección de Almacenamiento (Montes NFS, Volúmenes)

### Diseño y Estilo
- [x] Elegir paleta de colores moderna y coherente
- [x] Implementar tema claro/oscuro (switchable)
- [x] Crear componentes reutilizables (Card, Badge, Tooltip, Modal)
- [x] Aplicar animaciones y transiciones suaves
- [x] Asegurar diseño responsive (mobile, tablet, desktop)

### Navegación y Enrutamiento
- [x] Configurar rutas principales (/, /vm/:id, /about, etc.)
- [x] Crear barra de navegación principal
- [x] Implementar breadcrumbs para navegación de detalle
- [x] Agregar botón "Volver" en páginas de detalle

### Datos y Estructura
- [x] Crear archivo de datos JSON con especificaciones de VMs
- [x] Crear archivo de datos JSON con información de troubleshooting
- [x] Crear archivo de datos JSON con motivos de elecciones de diseño
- [x] Crear contexto React para compartir datos de arquitectura

### Optimización y Pulido
- [x] Optimizar rendimiento del diagrama interactivo
- [x] Agregar loading states y skeleton screens
- [x] Implementar error boundaries
- [x] Agregar meta tags y SEO básico
- [x] Verificar accesibilidad (WCAG)

## Bugs y Problemas Conocidos
(Ninguno identificado en este momento)

## Notas de Implementación
- Usar shadcn/ui para componentes de UI consistentes
- Usar Tailwind CSS para estilismo
- Usar Wouter para enrutamiento ligero
- Considerar usar react-flow para el diagrama interactivo
- Mantener estructura modular y reutilizable


## Mejoras Adicionales Solicitadas

### Página de Configuración/Troubleshooting
- [x] Crear página de Configuración con toda la documentación del sistema
- [x] Agregar sección de instalación y configuración inicial de Proxmox
- [x] Incluir guías de instalación para cada VM (Ubuntu setup, Docker, NFS, GPU)
- [x] Agregar sección de Backup Strategy con ejemplos de comandos
- [x] Incluir sección de Monitoring and Maintenance con comandos útiles
- [x] Agregar sección de Security Considerations con configuración de firewall
- [x] Crear sección de Common Issues and Solutions con todos los troubleshooting

### Diagrama Mejorado
- [x] Visualizar volumen NFS como elemento central
- [x] Conectar TrueNAS con volumen NFS
- [x] Conectar todas las VMs al volumen NFS con flechas
- [x] Agregar iconos/visuales a elementos principales
- [x] Mostrar GPU conectada a VM103
- [x] Mostrar servicios específicos en las VMs (Nginx, Ollama, Jellyfin, Docker)
- [x] Mejorar estilo visual del diagrama con colores y formas distintivas
- [x] Agregar etiquetas de puertos y protocolos en las conexiones

### Volcado Completo de Documentación
- [x] Extraer toda la información del documento de especificaciones
- [x] Organizar por secciones (Hardware, VMs, CI/CD, Backup, Monitoring, Security)
- [x] Crear páginas navegables para cada sección
- [x] Incluir ejemplos de comandos y configuraciones
- [x] Agregar tablas de referencia rápida


## Mejoras Adicionales del Diagrama

### Layout y Posicionamiento
- [x] Mover Cliente Externo hacia abajo para evitar superposición con hover
- [x] Reorganizar posiciones de elementos para mejor flujo visual
- [x] Mejorar espaciado entre nodos

### Conexiones y Flechas
- [x] Conectar Cliente Externo con flechas a elementos apropiados
- [x] Mejorar visibilidad de todas las flechas
- [x] Agregar etiquetas más claras en las conexiones
- [x] Asegurar que todas las conexiones sean visibles sin superposición

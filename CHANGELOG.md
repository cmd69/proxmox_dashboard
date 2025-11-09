# Changelog - Architecture Dashboard

## Versión 1.1.0 - Mejoras Estructurales y Correcciones

### ✨ Nuevas Características

#### 🎨 Interfaz Mejorada
- **Menú Hamburguesa en Móvil**: Implementado menú lateral deslizante para acceder a "Configuración" y "Acerca de" desde dispositivos móviles
- **Navegación Responsive**: Los botones de navegación ahora son accesibles en todos los tamaños de pantalla
- **Logo de Proxmox**: Añadido logo oficial de Proxmox en el header y favicon

#### 🌐 Internacionalización
- Traducción completa al español de todos los textos de la interfaz
- ErrorBoundary ahora muestra mensajes en español
- Página 404 completamente traducida
- Atributo `lang="es"` en el HTML

### 🐛 Correcciones de Bugs

#### Errores Corregidos
- **Bug de VM inexistente**: Corregida referencia a "VM150" que no existe en los datos (línea 159 de About.tsx)
- **Botones ocultos en móvil**: Los botones "Configuración" y "Acerca de" ahora son accesibles mediante menú hamburguesa en dispositivos móviles
- **Título incorrecto**: Cambiado "App" por "Architecture Dashboard" en toda la aplicación

### 📝 Mejoras de Código

#### Estructura
- Código más limpio y mantenible en el componente Header
- Mejor organización de navegación desktop vs móvil
- Consistencia en nombres y branding en todos los footers

#### Documentación
- Archivo CHANGELOG.md creado para documentar cambios
- README.Docker.md con instrucciones completas de Docker
- Comentarios mejorados en componentes clave

### 🎯 Cambios Específicos por Archivo

#### `/client/src/components/Header.tsx`
- ✅ Implementado Sheet (menú lateral) para navegación móvil
- ✅ Añadidos iconos Settings e Info para mejor UX
- ✅ Separación clara entre navegación desktop y móvil
- ✅ Estado del menú gestionado con useState
- ✅ Cierre automático del menú al navegar

#### `/client/src/const.ts`
- ✅ APP_TITLE cambiado a "Architecture Dashboard"
- ✅ APP_LOGO apuntando a logo de Proxmox local

#### `/client/index.html`
- ✅ Título estático "Architecture Dashboard"
- ✅ Meta descripción añadida para SEO
- ✅ Lang cambiado a "es"
- ✅ Favicon actualizado al logo de Proxmox

#### `/client/src/pages/About.tsx`
- ✅ Corregida referencia errónea a VM150
- ✅ Footer actualizado con nombre correcto

#### `/client/src/pages/Configuration.tsx`
- ✅ Footer actualizado con nombre correcto

#### `/client/src/pages/VMDetail.tsx`
- ✅ Footer actualizado con nombre correcto

#### `/client/src/pages/NotFound.tsx`
- ✅ Textos traducidos al español
- ✅ "Go Home" → "Ir al Inicio"
- ✅ "Page Not Found" → "Página No Encontrada"

#### `/client/src/components/ErrorBoundary.tsx`
- ✅ Mensajes de error en español
- ✅ "An unexpected error occurred" → "Ha ocurrido un error inesperado"
- ✅ "Reload Page" → "Recargar Página"

### 🐳 Docker

#### Archivos Creados
- `Dockerfile`: Build multi-etapa optimizado
- `docker-compose.yml`: Configuración con red personalizada "demo"
- `.dockerignore`: Optimización del contexto de build
- `README.Docker.md`: Documentación completa de Docker

### 📊 Recursos

#### Assets Añadidos
- `/client/public/proxmox-logo.png`: Logo oficial de Proxmox (800x121px)

### 🔧 Mejoras Técnicas

#### Performance
- Logo de Proxmox servido localmente (no placeholder externo)
- Construcción Docker optimizada con layers en caché

#### Accesibilidad
- Menú móvil con roles ARIA apropiados
- Iconos descriptivos en navegación móvil
- Contraste mejorado en todos los estados

#### UX/UI
- Transiciones suaves en menú móvil
- Estados hover mejorados
- Feedback visual claro en todas las interacciones

### 📱 Compatibilidad

#### Responsive Design
- ✅ Mobile (< 640px): Menú hamburguesa
- ✅ Tablet (640px - 768px): Navegación adaptativa
- ✅ Desktop (> 768px): Navegación completa en header

### 🚀 Próximos Pasos Sugeridos

1. Implementar tests unitarios para nuevos componentes
2. Añadir animaciones más fluidas con Framer Motion
3. Implementar PWA para instalación en dispositivos móviles
4. Añadir modo offline con Service Workers
5. Implementar analytics para tracking de uso

---

**Fecha**: 2025-11-09
**Versión**: 1.1.0
**Autor**: AI Assistant


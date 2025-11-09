import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Header
    'header.guide': 'Guía Técnica',
    'header.about': 'Acerca de',
    'header.menu': 'Menú',
    'header.theme.light': 'Claro',
    'header.theme.dark': 'Oscuro',
    
    // Home
    'home.footer': 'Haz clic en cualquier máquina virtual para ver más detalles',
    
    // Configuration
    'config.title': 'Guía Técnica y Troubleshooting',
    'config.subtitle': 'Documentación completa de instalación, configuración y resolución de problemas',
    'config.toc': 'Índice de Contenidos',
    'config.back': 'Volver al diagrama',
    'config.copy': 'Copiar',
    'config.copied': 'Copiado',
    
    // About
    'about.title': 'Acerca de la Arquitectura',
    'about.subtitle': 'Información detallada sobre el sistema Proxmox y sus máquinas virtuales',
    'about.overview.title': 'Visión General del Sistema',
    'about.overview.intro': 'Este sistema está construido sobre',
    'about.overview.proxmox': 'Proxmox VE',
    'about.overview.description': 'un hipervisor de código abierto basado en KVM que permite ejecutar múltiples máquinas virtuales en un único servidor físico.',
    'about.overview.features': 'La arquitectura está diseñada para separar roles y responsabilidades, permitiendo:',
    'about.overview.storage': 'Almacenamiento centralizado y compartido (NFS)',
    'about.overview.production': 'Servicios de producción aislados y críticos',
    'about.overview.gpu': 'Aceleración GPU para cargas de trabajo especializadas',
    'about.overview.cicd': 'Entorno de desarrollo y CI/CD separado de producción',
    'about.hardware.title': 'Especificaciones del Hardware Físico',
    'about.hardware.cpu': 'CPU',
    'about.hardware.cpuValue': 'núcleos físicos',
    'about.hardware.ram': 'RAM',
    'about.hardware.ramValue': 'GB de memoria física',
    'about.hardware.gpu': 'GPU',
    'about.hardware.gpuValue': 'NVIDIA GTX 1060 6GB (passthrough a VM103)',
    'about.hardware.storage': 'Almacenamiento',
    'about.hardware.storageValue': 'HDD array + SSD para discos del sistema',
    'about.resources.title': 'Asignación de Recursos',
    'about.resources.intro': 'La estrategia de asignación de recursos utiliza',
    'about.resources.overcommit': 'overcommit',
    'about.resources.controlled': 'controlado:',
    'about.resources.cpu': 'CPU Overcommit: 2:1',
    'about.resources.cpuDesc': '8 vCPU asignados en 4 núcleos físicos. Normal en virtualización.',
    'about.resources.ram': 'RAM Overcommit: 6GB',
    'about.resources.ramDesc': '38GB asignados en 32GB físicos. Aceptable porque TrueNAS y VM103 raramente usan el máximo.',
    'about.concepts.title': 'Conceptos Clave',
    'about.concepts.nfs': 'NFS (Network File System)',
    'about.concepts.nfsDesc': 'Protocolo que permite compartir almacenamiento entre máquinas. TrueNAS (VM101) actúa como servidor NFS, proporcionando almacenamiento compartido a todas las demás VMs.',
    'about.concepts.docker': 'Docker & Containers',
    'about.concepts.dockerDesc': 'Tecnología de containerización que permite empaquetar aplicaciones con sus dependencias. Utilizado en VM102, VM103 y VM104 para ejecutar servicios aislados.',
    'about.concepts.jenkins': 'Jenkins CI/CD',
    'about.concepts.jenkinsDesc': 'Sistema de automatización que orquesta pipelines de construcción, prueba y despliegue. Jenkins Master (VM102) coordina con Jenkins Agent (VM104).',
    'about.concepts.passthrough': 'GPU Passthrough',
    'about.concepts.passthroughDesc': 'Técnica que permite que una VM acceda directamente a un dispositivo GPU físico. Requiere configuración especial (q35 chipset, OVMF BIOS, IOMMU habilitado).',
    'about.practices.title': 'Mejores Prácticas',
    'about.practices.monitor': 'Monitorear el uso de memoria con',
    'about.practices.monitorDesc': 'para detectar presión de memoria',
    'about.practices.backup': 'Realizar backups regulares de VMs críticas (VM101, VM102, VM103)',
    'about.practices.snapshots': 'Usar snapshots de ZFS en TrueNAS para protección de datos',
    'about.practices.separate': 'Mantener separados los entornos de desarrollo (VM104) y producción (VM102)',
    'about.explore.title': 'Explorar la Arquitectura',
    'about.explore.description': 'Haz clic en cualquier máquina virtual en el diagrama para ver detalles específicos de su configuración, servicios, y guía de troubleshooting.',
    'about.explore.button': 'Ir al Diagrama Interactivo',
    'about.back': 'Volver al diagrama',
    
    // ArchitectureDiagram
    'diagram.clickDetails': 'Click para más detalles',
    'diagram.services': 'Servicios',
    'diagram.specialHardware': 'Hardware Especial',
    
    // VM Detail
    'vm.back': 'Volver al diagrama',
    'vm.notFound': 'Máquina Virtual no encontrada',
    'vm.notFoundDesc': 'no existe en la arquitectura.',
    'vm.notFoundButton': 'Volver al diagrama',
    'vm.hardware': 'Configuración de Hardware',
    'vm.hardware.cpu': 'CPU',
    'vm.hardware.cores': 'Cores',
    'vm.hardware.ram': 'RAM',
    'vm.hardware.disk': 'Disco',
    'vm.hardware.bios': 'BIOS',
    'vm.hardware.machine': 'Tipo de Máquina',
    'vm.hardware.special': 'Hardware Especial',
    'vm.services': 'Servicios y Software',
    'vm.nfs': 'Montes NFS',
    'vm.ports': 'Puertos Expuestos',
    'vm.design': 'Motivo de las Elecciones de Diseño',
    'vm.troubleshooting': 'Guía de Troubleshooting',
    
    // NotFound
    'notFound.title': 'Página No Encontrada',
    'notFound.description': 'Lo sentimos, la página que buscas no existe.',
    'notFound.description2': 'Puede haber sido movida o eliminada.',
    'notFound.button': 'Ir al Inicio',
    
    // ErrorBoundary
    'error.title': 'Ha ocurrido un error inesperado.',
    'error.reload': 'Recargar Página',
    
    // Footer
    'footer.text': 'Architecture Dashboard',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
  },
  en: {
    // Header
    'header.guide': 'Technical Guide',
    'header.about': 'About',
    'header.menu': 'Menu',
    'header.theme.light': 'Light',
    'header.theme.dark': 'Dark',
    
    // Home
    'home.footer': 'Click on any virtual machine to see more details',
    
    // Configuration
    'config.title': 'Technical Guide and Troubleshooting',
    'config.subtitle': 'Complete documentation for installation, configuration and troubleshooting',
    'config.toc': 'Table of Contents',
    'config.back': 'Back to diagram',
    'config.copy': 'Copy',
    'config.copied': 'Copied',
    
    // About
    'about.title': 'About the Architecture',
    'about.subtitle': 'Detailed information about the Proxmox system and its virtual machines',
    'about.overview.title': 'System Overview',
    'about.overview.intro': 'This system is built on',
    'about.overview.proxmox': 'Proxmox VE',
    'about.overview.description': 'an open-source hypervisor based on KVM that allows running multiple virtual machines on a single physical server.',
    'about.overview.features': 'The architecture is designed to separate roles and responsibilities, enabling:',
    'about.overview.storage': 'Centralized and shared storage (NFS)',
    'about.overview.production': 'Isolated and critical production services',
    'about.overview.gpu': 'GPU acceleration for specialized workloads',
    'about.overview.cicd': 'Development and CI/CD environment separated from production',
    'about.hardware.title': 'Physical Hardware Specifications',
    'about.hardware.cpu': 'CPU',
    'about.hardware.cpuValue': 'physical cores',
    'about.hardware.ram': 'RAM',
    'about.hardware.ramValue': 'GB of physical memory',
    'about.hardware.gpu': 'GPU',
    'about.hardware.gpuValue': 'NVIDIA GTX 1060 6GB (passthrough to VM103)',
    'about.hardware.storage': 'Storage',
    'about.hardware.storageValue': 'HDD array + SSD for system disks',
    'about.resources.title': 'Resource Allocation',
    'about.resources.intro': 'The resource allocation strategy uses controlled',
    'about.resources.overcommit': 'overcommit',
    'about.resources.controlled': ':',
    'about.resources.cpu': 'CPU Overcommit: 2:1',
    'about.resources.cpuDesc': '8 vCPUs allocated on 4 physical cores. Normal in virtualization.',
    'about.resources.ram': 'RAM Overcommit: 6GB',
    'about.resources.ramDesc': '38GB allocated on 32GB physical. Acceptable because TrueNAS and VM103 rarely use maximum.',
    'about.concepts.title': 'Key Concepts',
    'about.concepts.nfs': 'NFS (Network File System)',
    'about.concepts.nfsDesc': 'Protocol that allows sharing storage between machines. TrueNAS (VM101) acts as NFS server, providing shared storage to all other VMs.',
    'about.concepts.docker': 'Docker & Containers',
    'about.concepts.dockerDesc': 'Containerization technology that allows packaging applications with their dependencies. Used in VM102, VM103 and VM104 to run isolated services.',
    'about.concepts.jenkins': 'Jenkins CI/CD',
    'about.concepts.jenkinsDesc': 'Automation system that orchestrates build, test and deployment pipelines. Jenkins Master (VM102) coordinates with Jenkins Agent (VM104).',
    'about.concepts.passthrough': 'GPU Passthrough',
    'about.concepts.passthroughDesc': 'Technique that allows a VM to directly access a physical GPU device. Requires special configuration (q35 chipset, OVMF BIOS, IOMMU enabled).',
    'about.practices.title': 'Best Practices',
    'about.practices.monitor': 'Monitor memory usage with',
    'about.practices.monitorDesc': 'to detect memory pressure',
    'about.practices.backup': 'Perform regular backups of critical VMs (VM101, VM102, VM103)',
    'about.practices.snapshots': 'Use ZFS snapshots in TrueNAS for data protection',
    'about.practices.separate': 'Keep development (VM104) and production (VM102) environments separate',
    'about.explore.title': 'Explore the Architecture',
    'about.explore.description': 'Click on any virtual machine in the diagram to see specific details about its configuration, services, and troubleshooting guide.',
    'about.explore.button': 'Go to Interactive Diagram',
    'about.back': 'Back to diagram',
    
    // ArchitectureDiagram
    'diagram.clickDetails': 'Click for more details',
    'diagram.services': 'Services',
    'diagram.specialHardware': 'Special Hardware',
    
    // VM Detail
    'vm.back': 'Back to diagram',
    'vm.notFound': 'Virtual Machine not found',
    'vm.notFoundDesc': 'does not exist in the architecture.',
    'vm.notFoundButton': 'Back to diagram',
    'vm.hardware': 'Hardware Configuration',
    'vm.hardware.cpu': 'CPU',
    'vm.hardware.cores': 'Cores',
    'vm.hardware.ram': 'RAM',
    'vm.hardware.disk': 'Disk',
    'vm.hardware.bios': 'BIOS',
    'vm.hardware.machine': 'Machine Type',
    'vm.hardware.special': 'Special Hardware',
    'vm.services': 'Services and Software',
    'vm.nfs': 'NFS Mounts',
    'vm.ports': 'Exposed Ports',
    'vm.design': 'Design Decision Rationale',
    'vm.troubleshooting': 'Troubleshooting Guide',
    
    // NotFound
    'notFound.title': 'Page Not Found',
    'notFound.description': 'Sorry, the page you are looking for does not exist.',
    'notFound.description2': 'It may have been moved or deleted.',
    'notFound.button': 'Go Home',
    
    // ErrorBoundary
    'error.title': 'An unexpected error occurred.',
    'error.reload': 'Reload Page',
    
    // Footer
    'footer.text': 'Architecture Dashboard',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VM } from '@/data/architecture';
import { useArchitecture } from '@/contexts/ArchitectureContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useMobile';
import { Link, useLocation } from 'wouter';
import { HardDrive, Server, Zap, Database, Cloud, Layers, RotateCcw, Save, ChevronDown, Eye, EyeOff, ChevronRight, ChevronUp, Minimize2, Maximize2, GripVertical, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { diagramStorage, DiagramCheckpoint } from '@/services/diagramStorage';
import { LocalStorageService } from '@/services/storageService';
import {
  applyCheckpointPositions,
  loadCheckpointFromServer,
  requireAuth,
  extractNodePositions,
  calculateServiceRelativePositions,
} from '@/utils/checkpointHelpers';

interface VMNodeData {
  vm: VM;
  isExpanded?: boolean;
  onToggle?: (vmId: string) => void;
}

interface ProxmoxNodeData {
  label: string;
  cpu: number;
  ram: number;
}

interface ClientNodeData {
  label: string;
}

interface StorageNodeData {
  label: string;
}

interface ServiceNodeData {
  label: string;
  icon: string;
  vmColor?: string;
  imageUrl?: string;
}

type NodeData = VMNodeData | ProxmoxNodeData | ClientNodeData | StorageNodeData | ServiceNodeData;

const VMNode: React.FC<{ data: VMNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();
  const { architecture } = useArchitecture();
  const services = architecture.services || [];
  const isExpanded = data.isExpanded || false;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.onToggle) {
      data.onToggle(data.vm.id);
    }
  };

  const [, setLocation] = useLocation();
  
  const handleCardClick = async (e: React.MouseEvent) => {
    // Only navigate if clicking the card, not the button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Small delay to allow any pending saves to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    setLocation(`/vm/${data.vm.id}`);
  };

  return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      {/* Top handle - para recibir de Proxmox */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top" 
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
      {/* Left handle - para recibir NFS y otros */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left-target" 
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
      {/* Right handle - para recibir GPU y otros */}
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right-target" 
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
      {/* Bottom handle - para recibir NFS y otros */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom-target" 
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
      {/* Bottom handle - para servicios */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom" 
        className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
      {/* Left handle - para servicios laterales */}
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left-source" 
        className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
      {/* Right handle - para servicios laterales */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right-source" 
        className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" 
        isConnectable={true} 
      />
      
        <Card
        className={`p-4 border-2 w-56 shadow-lg transition-all duration-200 ${
          isHovered ? 'scale-[1.02]' : ''
        } bg-white dark:bg-slate-800 dark:border-slate-700`}
          style={{
          borderColor: isHovered ? data.vm.color : `${data.vm.color}80`,
          borderWidth: isHovered ? '3px' : '2px',
          backgroundColor: isHovered 
            ? `${data.vm.color}25` 
            : undefined,
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                {data.vm.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">VM{data.vm.vmId}</p>
              </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggle}
              className="h-6 w-6 p-0 z-10 relative"
              title={isExpanded ? t('diagram.hideServices') : t('diagram.showServices')}
            >
              <Layers className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Role */}
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{data.vm.role}</p>

          {/* Hardware Info */}
            <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">{data.vm.hardware.cpu}</span> {t('diagram.cpu')}
              </span>
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">{data.vm.hardware.ram}</span>{t('diagram.gb')} {t('diagram.ram')}
              </span>
            </div>

            {/* Aplicaciones */}
            <div className="space-y-1">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors">
                  <span>{t('vm.services')}</span>
                  <ChevronDown className="h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <div className="flex flex-wrap gap-1">
                    {data.vm.services.map((serviceId: string, idx: number) => {
                      const service = services.find((s: any) => s.id === serviceId);
                      if (!service) return null;
                      return (
                        <Badge key={idx} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-300 dark:border-green-700 flex items-center gap-1">
                          {service.imageUrl ? (
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="h-3 w-3 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Server className="h-3 w-3" />
                          )}
                          {service.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

          </div>
        </Card>
      </div>
  );
};

// Service Node Component
const ServiceNode: React.FC<{ data: ServiceNodeData }> = ({ data }) => {
  const vmColor = data.vmColor || '#a855f7';
  
  return (
    <>
      {/* Top handle - para recibir de VM */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top" 
        className="w-3 h-3 !border-2 !border-white hover:!scale-125" 
        style={{ backgroundColor: vmColor }}
        isConnectable={true} 
      />
      
      {/* Left handle - para recibir de VM */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left" 
        className="w-3 h-3 !border-2 !border-white hover:!scale-125" 
        style={{ backgroundColor: vmColor }}
        isConnectable={true} 
      />
      
      {/* Right handle - para recibir de VM */}
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right" 
        className="w-3 h-3 !border-2 !border-white hover:!scale-125" 
        style={{ backgroundColor: vmColor }}
        isConnectable={true} 
      />
      
      <Card 
        className="p-3 border-2 shadow-md w-36 relative"
        style={{
          borderColor: `${vmColor}80`,
          backgroundColor: `${vmColor}25`,
        }}
      >
        <div 
          className="absolute inset-0 rounded-lg opacity-0 dark:opacity-40"
          style={{
            backgroundColor: vmColor,
          }}
        />
        <div className="relative flex flex-col items-center justify-center gap-2">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt={data.label}
              className="h-12 w-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = 'block';
              }}
            />
          ) : null}
          {!data.imageUrl && (
            <Server 
              className="h-8 w-8" 
              style={{ color: vmColor }} 
            />
          )}
          <p className="text-xs font-semibold text-white text-center leading-tight">
            {data.label}
          </p>
        </div>
      </Card>
    </>
  );
};

const StorageVolumeNode: React.FC<{ data: StorageNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Handle type="target" position={Position.Top} id="top" className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left" className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      
      <Card
        className={`p-4 w-48 border-2 bg-blue-50 dark:bg-blue-950 ${
          isHovered ? 'border-blue-500' : 'border-blue-400'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{data.label}</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300">
            {t('diagram.nfsSharedStorage')}
            </p>
        </div>
      </Card>
    </div>
  );
};

const ProxmoxNode: React.FC<{ data: ProxmoxNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleCardClick = async (e: React.MouseEvent) => {
    // Only navigate if clicking the card, not the handle
    if ((e.target as HTMLElement).closest('.react-flow__handle')) {
      return;
    }
    // Small delay to allow any pending saves to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    setLocation('/configuration');
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      {/* Bottom handle - para enviar a VMs */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-5 h-5 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      
      <Card
        className={`p-4 w-56 border-2 bg-purple-50 dark:bg-purple-950 cursor-pointer ${
          isHovered ? 'border-purple-600 shadow-lg' : 'border-purple-400'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{data.label}</h3>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{data.cpu}</span> {t('diagram.cpu')}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{data.ram}</span>{t('diagram.gb')} {t('diagram.ram')}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('diagram.proxmoxHypervisor')}</p>
        </div>
      </Card>
    </div>
  );
};

const ClientNode: React.FC<{ data: ClientNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Handle type="source" position={Position.Top} id="top" className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      
      <Card
        className={`p-4 w-48 border-2 bg-green-50 dark:bg-green-950 ${
          isHovered ? 'border-green-600' : 'border-green-400'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Cloud className="w-8 h-8 text-green-600 dark:text-green-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{data.label}</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300">{t('diagram.internetAccess')}</p>
        </div>
      </Card>
    </div>
  );
};

const GPUNode: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Handle type="source" position={Position.Left} id="left" className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="right" className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      
      <Card
        className={`p-3 w-40 border-2 bg-orange-50 dark:bg-orange-950 ${
          isHovered ? 'border-orange-600' : 'border-orange-400'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">{t('diagram.gpu')}</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300">GTX 1060</p>
        </div>
      </Card>
    </div>
  );
};

const StorageNode: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Handle type="source" position={Position.Right} id="right" className="w-4 h-4 !bg-green-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" className="w-4 h-4 !bg-blue-500 !border-2 !border-white hover:!scale-125" isConnectable={true} />
      
      <Card
        className={`p-3 w-40 border-2 bg-gray-50 dark:bg-gray-800 ${
          isHovered ? 'border-gray-600' : 'border-gray-400'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <HardDrive className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">{t('diagram.storage')}</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300">{t('diagram.hddSsd')}</p>
        </div>
      </Card>
    </div>
  );
};

export const ArchitectureDiagram: React.FC = () => {
  const { architecture } = useArchitecture();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  // Initialize with all VMs expanded (services visible by default)
  const [expandedVMs, setExpandedVMs] = useState<Set<string>>(
    () => new Set(architecture.vms.map(vm => vm.id))
  );
  const [isVMPanelMinimized, setIsVMPanelMinimized] = useState(false);
  const [isCheckpointPanelMinimized, setIsCheckpointPanelMinimized] = useState(false);
  
  // Responsive panel dimensions
  const PANEL_MARGIN = isMobile ? 8 : 16;
  const DEFAULT_PANEL_HEIGHT = 320;
  
  // Calculate panel width based on screen size
  const [panelWidth, setPanelWidth] = useState(280);
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      setPanelWidth(Math.min(280, window.innerWidth - 16));
    } else {
      setPanelWidth(280);
    }
  }, [isMobile]);
  
  // Panel positions state - responsive initial positions
  const getInitialVMPosition = () => {
    if (isMobile) {
      return { x: PANEL_MARGIN, y: PANEL_MARGIN };
    }
    return { x: PANEL_MARGIN, y: PANEL_MARGIN };
  };
  
  // Calculate minimized panel height (compact header only)
  const MINIMIZED_PANEL_HEIGHT = 48; // Compact header height
  const MINIMIZED_PANEL_WIDTH = 64; // Narrow width when minimized (more square-like)
  
  const getInitialCheckpointPosition = () => {
    if (isMobile) {
      // On mobile, stack panels vertically when minimized
      const vmMinimizedHeight = isVMPanelMinimized ? MINIMIZED_PANEL_HEIGHT : DEFAULT_PANEL_HEIGHT;
      const gap = (isVMPanelMinimized && isCheckpointPanelMinimized) ? 4 : 8;
      return { x: PANEL_MARGIN, y: vmMinimizedHeight + PANEL_MARGIN + gap };
    }
    return { x: PANEL_MARGIN, y: 240 };
  };
  
  const [vmPanelPosition, setVmPanelPosition] = useState(getInitialVMPosition);
  const [checkpointPanelPosition, setCheckpointPanelPosition] = useState(getInitialCheckpointPosition);
  const [isDraggingVM, setIsDraggingVM] = useState(false);
  const [isDraggingCheckpoint, setIsDraggingCheckpoint] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const vmPanelRef = useRef<HTMLDivElement | null>(null);
  const checkpointPanelRef = useRef<HTMLDivElement | null>(null);
  const lastDraggedPanelRef = useRef<'vm' | 'checkpoint' | null>(null);
  
  // Update positions when mobile state or minimized state changes
  // Only adjust checkpoint position, don't move VM panel to avoid moving the diagram
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated with new heights
    requestAnimationFrame(() => {
      const vmElement = vmPanelRef.current;
      if (!vmElement) return;
      
      // Calculate VM panel height
      const vmHeight = vmElement.offsetHeight || (isVMPanelMinimized ? MINIMIZED_PANEL_HEIGHT : DEFAULT_PANEL_HEIGHT);
      const gap = (isVMPanelMinimized && isCheckpointPanelMinimized) ? 4 : 8;
      
      if (isMobile) {
        // On mobile, only adjust checkpoint position relative to current VM position
        // Don't reset VM position to avoid moving the diagram
        setCheckpointPanelPosition((prev) => ({
          x: prev.x,
          y: vmPanelPosition.y + vmHeight + gap
        }));
      } else {
        // On desktop, adjust checkpoint position based on VM panel height
        // This ensures checkpoint moves down when VM panel expands
        setCheckpointPanelPosition((prev) => ({
          x: prev.x,
          y: vmPanelPosition.y + vmHeight + gap
        }));
      }
    });
  }, [isMobile, isVMPanelMinimized, isCheckpointPanelMinimized, vmPanelPosition.y]);
  
  const positionsAreEqual = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
  
  const clampPanelPosition = useCallback(
    (position: { x: number; y: number }, size: { width: number; height: number }) => {
      if (typeof window === 'undefined') {
        return position;
      }
      const maxX = Math.max(PANEL_MARGIN, window.innerWidth - size.width - PANEL_MARGIN);
      const maxY = Math.max(PANEL_MARGIN, window.innerHeight - size.height - PANEL_MARGIN);
      return {
        x: Math.min(Math.max(position.x, PANEL_MARGIN), maxX),
        y: Math.min(Math.max(position.y, PANEL_MARGIN), maxY),
      };
    },
    [PANEL_MARGIN]
  );
  
  const resolveOverlapForPanel = useCallback(
    (
      position: { x: number; y: number },
      size: { width: number; height: number },
      otherPosition: { x: number; y: number },
      otherSize: { width: number; height: number }
    ) => {
      const rect = {
        left: position.x,
        right: position.x + size.width,
        top: position.y,
        bottom: position.y + size.height,
      };
      const otherRect = {
        left: otherPosition.x,
        right: otherPosition.x + otherSize.width,
        top: otherPosition.y,
        bottom: otherPosition.y + otherSize.height,
      };
      
      const overlapX = Math.min(rect.right, otherRect.right) - Math.max(rect.left, otherRect.left);
      const overlapY = Math.min(rect.bottom, otherRect.bottom) - Math.max(rect.top, otherRect.top);
      
      if (overlapX <= 0 || overlapY <= 0) {
        return clampPanelPosition(position, size);
      }
      
      const adjusted = { ...position };
      
      if (overlapX < overlapY) {
        if (rect.left < otherRect.left) {
          adjusted.x = otherRect.left - size.width - PANEL_MARGIN;
        } else {
          adjusted.x = otherRect.right + PANEL_MARGIN;
        }
      } else {
        if (rect.top < otherRect.top) {
          adjusted.y = otherRect.top - size.height - PANEL_MARGIN;
        } else {
          adjusted.y = otherRect.bottom + PANEL_MARGIN;
        }
      }
      
      let clamped = clampPanelPosition(adjusted, size);
      
      const clampedRect = {
        left: clamped.x,
        right: clamped.x + size.width,
        top: clamped.y,
        bottom: clamped.y + size.height,
      };
      
      const stillOverlapX =
        Math.min(clampedRect.right, otherRect.right) - Math.max(clampedRect.left, otherRect.left);
      const stillOverlapY =
        Math.min(clampedRect.bottom, otherRect.bottom) - Math.max(clampedRect.top, otherRect.top);
      
      if (stillOverlapX > 0 && stillOverlapY > 0) {
        const alternate = { ...adjusted };
        if (overlapX < overlapY) {
          if (rect.top < otherRect.top) {
            alternate.y = otherRect.top - size.height - PANEL_MARGIN;
          } else {
            alternate.y = otherRect.bottom + PANEL_MARGIN;
          }
        } else {
          if (rect.left < otherRect.left) {
            alternate.x = otherRect.left - size.width - PANEL_MARGIN;
          } else {
            alternate.x = otherRect.right + PANEL_MARGIN;
          }
        }
        clamped = clampPanelPosition(alternate, size);
      }
      
      return clamped;
    },
    [clampPanelPosition, PANEL_MARGIN]
  );

  // Load panel positions from localStorage on mount
  useEffect(() => {
    try {
      const savedVmPos = localStorage.getItem('vmPanelPosition');
      const savedCheckpointPos = localStorage.getItem('checkpointPanelPosition');
      if (savedVmPos) {
        setVmPanelPosition(JSON.parse(savedVmPos));
      }
      if (savedCheckpointPos) {
        setCheckpointPanelPosition(JSON.parse(savedCheckpointPos));
      }
    } catch (error) {
      console.error('Failed to load panel positions:', error);
    }
  }, []);

  // Save panel positions to localStorage
  const savePanelPosition = useCallback((panel: 'vm' | 'checkpoint', position: { x: number; y: number }) => {
    try {
      localStorage.setItem(`${panel}PanelPosition`, JSON.stringify(position));
    } catch (error) {
      console.error('Failed to save panel position:', error);
    }
  }, []);

  // Unified drag handler for both mouse and touch
  const handleVMPanelStart = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    if (isMobile && !isVMPanelMinimized) {
      // On mobile, only allow dragging when minimized or via header
      return;
    }
    lastDraggedPanelRef.current = 'vm';
    setIsDraggingVM(true);
    const rect = element.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  }, [isMobile, isVMPanelMinimized]);
  
  // Drag handlers for VM panel
  const handleVMPanelMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const grabArea = (e.currentTarget as HTMLElement).querySelector('.cursor-grab');
    if (grabArea && grabArea.contains(e.target as Node)) {
      e.preventDefault();
      handleVMPanelStart(e.clientX, e.clientY, e.currentTarget as HTMLElement);
    }
  }, [handleVMPanelStart]);
  
  const handleVMPanelTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const grabArea = (e.currentTarget as HTMLElement).querySelector('.cursor-grab');
    if (grabArea && grabArea.contains(e.target as Node)) {
      e.preventDefault();
      const touch = e.touches[0];
      handleVMPanelStart(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
    }
  }, [handleVMPanelStart]);

  const handleVMPanelMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingVM) return;
      const basePosition = {
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y,
      };
      const vmSize = {
        width: vmPanelRef.current?.offsetWidth ?? (isVMPanelMinimized ? MINIMIZED_PANEL_WIDTH : panelWidth),
        height: vmPanelRef.current?.offsetHeight ?? DEFAULT_PANEL_HEIGHT,
      };
      const newPosition = clampPanelPosition(basePosition, vmSize);
      setVmPanelPosition(newPosition);
      savePanelPosition('vm', newPosition);
    },
    [isDraggingVM, dragOffset, clampPanelPosition, savePanelPosition, panelWidth, DEFAULT_PANEL_HEIGHT, isVMPanelMinimized]
  );
  
  const handleVMPanelMouseMove = useCallback(
    (e: MouseEvent) => {
      handleVMPanelMove(e.clientX, e.clientY);
    },
    [handleVMPanelMove]
  );
  
  const handleVMPanelTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleVMPanelMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleVMPanelMove]
  );

  const handleVMPanelMouseUp = useCallback(() => {
    if (isDraggingVM) {
      setIsDraggingVM(false);
    }
  }, [isDraggingVM]);

  // Unified drag handler for checkpoint panel
  const handleCheckpointPanelStart = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    if (isMobile && !isCheckpointPanelMinimized) {
      // On mobile, only allow dragging when minimized or via header
      return;
    }
    lastDraggedPanelRef.current = 'checkpoint';
    setIsDraggingCheckpoint(true);
    const rect = element.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  }, [isMobile, isCheckpointPanelMinimized]);
  
  // Drag handlers for Checkpoint panel
  const handleCheckpointPanelMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const grabArea = (e.currentTarget as HTMLElement).querySelector('.cursor-grab');
    if (grabArea && grabArea.contains(e.target as Node)) {
      e.preventDefault();
      handleCheckpointPanelStart(e.clientX, e.clientY, e.currentTarget as HTMLElement);
    }
  }, [handleCheckpointPanelStart]);
  
  const handleCheckpointPanelTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const grabArea = (e.currentTarget as HTMLElement).querySelector('.cursor-grab');
    if (grabArea && grabArea.contains(e.target as Node)) {
      e.preventDefault();
      const touch = e.touches[0];
      handleCheckpointPanelStart(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
    }
  }, [handleCheckpointPanelStart]);

  const handleCheckpointPanelMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingCheckpoint) return;
      const basePosition = {
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y,
      };
      const checkpointSize = {
        width: checkpointPanelRef.current?.offsetWidth ?? (isCheckpointPanelMinimized ? MINIMIZED_PANEL_WIDTH : panelWidth),
        height: checkpointPanelRef.current?.offsetHeight ?? DEFAULT_PANEL_HEIGHT,
      };
      const newPosition = clampPanelPosition(basePosition, checkpointSize);
      setCheckpointPanelPosition(newPosition);
      savePanelPosition('checkpoint', newPosition);
    },
    [isDraggingCheckpoint, dragOffset, clampPanelPosition, savePanelPosition, panelWidth, DEFAULT_PANEL_HEIGHT, isCheckpointPanelMinimized]
  );
  
  const handleCheckpointPanelMouseMove = useCallback(
    (e: MouseEvent) => {
      handleCheckpointPanelMove(e.clientX, e.clientY);
    },
    [handleCheckpointPanelMove]
  );
  
  const handleCheckpointPanelTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleCheckpointPanelMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleCheckpointPanelMove]
  );

  const handleCheckpointPanelMouseUp = useCallback(() => {
    if (isDraggingCheckpoint) {
      setIsDraggingCheckpoint(false);
    }
  }, [isDraggingCheckpoint]);

  // Global mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDraggingVM) {
      window.addEventListener('mousemove', handleVMPanelMouseMove);
      window.addEventListener('mouseup', handleVMPanelMouseUp);
      window.addEventListener('touchmove', handleVMPanelTouchMove, { passive: false });
      window.addEventListener('touchend', handleVMPanelMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleVMPanelMouseMove);
        window.removeEventListener('mouseup', handleVMPanelMouseUp);
        window.removeEventListener('touchmove', handleVMPanelTouchMove);
        window.removeEventListener('touchend', handleVMPanelMouseUp);
      };
    }
  }, [isDraggingVM, handleVMPanelMouseMove, handleVMPanelTouchMove, handleVMPanelMouseUp]);

  useEffect(() => {
    if (isDraggingCheckpoint) {
      window.addEventListener('mousemove', handleCheckpointPanelMouseMove);
      window.addEventListener('mouseup', handleCheckpointPanelMouseUp);
      window.addEventListener('touchmove', handleCheckpointPanelTouchMove, { passive: false });
      window.addEventListener('touchend', handleCheckpointPanelMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCheckpointPanelMouseMove);
        window.removeEventListener('mouseup', handleCheckpointPanelMouseUp);
        window.removeEventListener('touchmove', handleCheckpointPanelTouchMove);
        window.removeEventListener('touchend', handleCheckpointPanelMouseUp);
      };
    }
  }, [isDraggingCheckpoint, handleCheckpointPanelMouseMove, handleCheckpointPanelTouchMove, handleCheckpointPanelMouseUp]);
  
  useEffect(() => {
    const vmElement = vmPanelRef.current;
    const checkpointElement = checkpointPanelRef.current;
    if (!vmElement || !checkpointElement) {
      return;
    }
    
    const vmSize = {
      width: vmElement.offsetWidth || (isVMPanelMinimized ? MINIMIZED_PANEL_WIDTH : panelWidth),
      height: Math.max(vmElement.offsetHeight || DEFAULT_PANEL_HEIGHT, 1),
    };
    const checkpointSize = {
      width: checkpointElement.offsetWidth || (isCheckpointPanelMinimized ? MINIMIZED_PANEL_WIDTH : panelWidth),
      height: Math.max(checkpointElement.offsetHeight || DEFAULT_PANEL_HEIGHT, 1),
    };
    
    const vmRect = {
      left: vmPanelPosition.x,
      right: vmPanelPosition.x + vmSize.width,
      top: vmPanelPosition.y,
      bottom: vmPanelPosition.y + vmSize.height,
    };
    const checkpointRect = {
      left: checkpointPanelPosition.x,
      right: checkpointPanelPosition.x + checkpointSize.width,
      top: checkpointPanelPosition.y,
      bottom: checkpointPanelPosition.y + checkpointSize.height,
    };
    
    const overlapX = Math.min(vmRect.right, checkpointRect.right) - Math.max(vmRect.left, checkpointRect.left);
    const overlapY = Math.min(vmRect.bottom, checkpointRect.bottom) - Math.max(vmRect.top, checkpointRect.top);
    const isOverlapping = overlapX > 0 && overlapY > 0;
    
    if (!isOverlapping || isDraggingVM || isDraggingCheckpoint) {
      return;
    }
    
    const targetPanel =
      lastDraggedPanelRef.current === 'vm'
        ? 'checkpoint'
        : lastDraggedPanelRef.current === 'checkpoint'
          ? 'vm'
          : 'checkpoint';
    
    const adjustPanelPosition = (panel: 'vm' | 'checkpoint') => {
      if (panel === 'vm') {
        const adjustedPosition = resolveOverlapForPanel(
          vmPanelPosition,
          vmSize,
          checkpointPanelPosition,
          checkpointSize
        );
        if (!positionsAreEqual(adjustedPosition, vmPanelPosition)) {
          setVmPanelPosition(adjustedPosition);
          savePanelPosition('vm', adjustedPosition);
          return true;
        }
      } else {
        const adjustedPosition = resolveOverlapForPanel(
          checkpointPanelPosition,
          checkpointSize,
          vmPanelPosition,
          vmSize
        );
        if (!positionsAreEqual(adjustedPosition, checkpointPanelPosition)) {
          setCheckpointPanelPosition(adjustedPosition);
          savePanelPosition('checkpoint', adjustedPosition);
          return true;
        }
      }
      return false;
    };
    
    if (!adjustPanelPosition(targetPanel)) {
      adjustPanelPosition(targetPanel === 'vm' ? 'checkpoint' : 'vm');
    }
  }, [
    vmPanelPosition,
    checkpointPanelPosition,
    isDraggingVM,
    isDraggingCheckpoint,
    resolveOverlapForPanel,
    savePanelPosition,
    panelWidth,
    DEFAULT_PANEL_HEIGHT,
    isVMPanelMinimized,
    isCheckpointPanelMinimized,
  ]);
  
  // Ensure services array exists (fallback for old data)
  const services = architecture.services || [];
  const [customEdges, setCustomEdges] = useState<Edge[]>([]);
  const [hiddenEdges, setHiddenEdges] = useState<Set<string>>(new Set());
  const [edgeLabels, setEdgeLabels] = useState<Record<string, string>>({});
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  
  // Load saved positions using storage service
  const loadNodePositions = useCallback(async () => {
    try {
      return await diagramStorage.loadNodePositions();
    } catch (error) {
      console.error('Failed to load node positions:', error);
      return {};
    }
  }, []);

  const saveNodePositions = useCallback(async (nodes: Node[]) => {
    try {
      // Load existing positions to preserve hidden nodes
      const existingPositions = await diagramStorage.loadNodePositions();
      
      // Extract current node positions
      const currentPositions = extractNodePositions(nodes);
      
      // Calculate relative positions for services
      const updatedPositions = calculateServiceRelativePositions(nodes, {
        ...existingPositions,
        ...currentPositions,
      });
      
      // Save to storage (localStorage for non-authenticated, server + localStorage for authenticated)
      await diagramStorage.saveNodePositions(updatedPositions);
      console.log(`✅ Node positions saved to ${isAuthenticated ? 'server' : 'localStorage'}:`, Object.keys(updatedPositions).length, 'nodes');
    } catch (error) {
      console.error('❌ Failed to save node positions:', error);
    }
  }, [isAuthenticated]);

  // Load and save custom edges using storage service
  const loadCustomEdges = useCallback(async () => {
    try {
      return await diagramStorage.loadCustomEdges();
    } catch (error) {
      console.error('Failed to load custom edges:', error);
      return [];
    }
  }, []);

  const saveCustomEdges = useCallback(async (edges: Edge[]) => {
    try {
      await diagramStorage.saveCustomEdges(edges);
      console.log(`✅ Custom edges saved to ${isAuthenticated ? 'server' : 'localStorage'}`);
    } catch (error) {
      console.error('Failed to save custom edges:', error);
    }
  }, [isAuthenticated]);

  // Load and save hidden edges using storage service
  const loadHiddenEdges = useCallback(async () => {
    try {
      return await diagramStorage.loadHiddenEdges();
    } catch (error) {
      console.error('Failed to load hidden edges:', error);
      return new Set<string>();
    }
  }, []);

  const saveHiddenEdges = useCallback(async (hidden: Set<string>) => {
    try {
      await diagramStorage.saveHiddenEdges(hidden);
      console.log(`✅ Hidden edges saved to ${isAuthenticated ? 'server' : 'localStorage'}`);
    } catch (error) {
      console.error('Failed to save hidden edges:', error);
    }
  }, [isAuthenticated]);

  // Load and save edge labels using storage service
  const loadEdgeLabels = useCallback(async () => {
    try {
      return await diagramStorage.loadEdgeLabels();
    } catch (error) {
      console.error('Failed to load edge labels:', error);
      return {};
    }
  }, []);

  const saveEdgeLabels = useCallback(async (labels: Record<string, string>) => {
    try {
      await diagramStorage.saveEdgeLabels(labels);
      console.log(`✅ Edge labels saved to ${isAuthenticated ? 'server' : 'localStorage'}`);
    } catch (error) {
      console.error('Failed to save edge labels:', error);
    }
  }, [isAuthenticated]);

  // Load custom edges, hidden edges, and edge labels on mount
  // Priority: Server checkpoint (always) > Individual storage keys (only for authenticated)
  // Non-authenticated users always load from server checkpoint, never from localStorage
  React.useEffect(() => {
    let isMounted = true;

    async function loadDiagramData() {
      try {
        // Always try to load checkpoint from server first
        let checkpoint: DiagramCheckpoint | null = null;
        
        try {
          checkpoint = await loadCheckpointFromServer();
          if (checkpoint) {
            console.log('📦 Loaded checkpoint from server on mount for diagram data');
            // Update localStorage if authenticated (for backup)
            if (isAuthenticated) {
              const localService = new LocalStorageService();
              await localService.set('diagram-checkpoint', checkpoint);
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to load checkpoint from server, trying fallback:', error);
          // Fallback: if authenticated, try localStorage
          if (isAuthenticated) {
            checkpoint = await diagramStorage.loadCheckpoint();
          }
        }
        
        if (checkpoint && isMounted) {
          console.log('📦 Loading diagram data from checkpoint...');
          setCustomEdges(checkpoint.customEdges || []);
          setHiddenEdges(new Set(checkpoint.hiddenEdges || []));
          setEdgeLabels(checkpoint.edgeLabels || {});
          console.log('✅ Loaded diagram data from checkpoint');
          return;
        }
        
        // If no checkpoint and authenticated, try individual storage keys
        if (isAuthenticated) {
          console.log('📥 Loading diagram data from individual storage keys...');
          const [loadedEdges, hidden, labels] = await Promise.all([
            loadCustomEdges(),
            loadHiddenEdges(),
            loadEdgeLabels(),
          ]);

          if (isMounted) {
            setCustomEdges(loadedEdges);
            setHiddenEdges(hidden);
            setEdgeLabels(labels);
            console.log('✅ Loaded diagram data from individual storage keys');
          }
        } else {
          // Non-authenticated user without checkpoint: use default values
          if (isMounted) {
            setCustomEdges([]);
            setHiddenEdges(new Set());
            setEdgeLabels({});
          }
        }
      } catch (error) {
        console.error('Failed to load diagram data:', error);
        if (isMounted) {
          setCustomEdges([]);
          setHiddenEdges(new Set());
          setEdgeLabels({});
        }
      }
    }

    loadDiagramData();

    return () => {
      isMounted = false;
    };
  }, [loadCustomEdges, loadHiddenEdges, loadEdgeLabels, isAuthenticated]);

  // Keep expandedVMs in sync with architecture.vms (add new VMs to expanded set)
  useEffect(() => {
    setExpandedVMs((prev) => {
      const newSet = new Set(prev);
      let changed = false;
      architecture.vms.forEach((vm) => {
        if (!newSet.has(vm.id)) {
          newSet.add(vm.id);
          changed = true;
        }
      });
      return changed ? newSet : prev;
    });
  }, [architecture.vms]);

  const handleToggleVM = useCallback((vmId: string) => {
    setExpandedVMs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vmId)) {
        newSet.delete(vmId);
      } else {
        newSet.add(vmId);
      }
      return newSet;
    });
  }, []);

  const handleToggleAllServices = useCallback(() => {
    setExpandedVMs((prev) => {
      // If all VMs are expanded, collapse all; otherwise expand all
      const allExpanded = architecture.vms.every(vm => prev.has(vm.id));
      if (allExpanded) {
        return new Set<string>();
      } else {
        return new Set(architecture.vms.map(vm => vm.id));
      }
    });
  }, [architecture.vms]);
  
  // Store ReactFlow instance ref to access viewport - must be declared before callbacks that use it
  const reactFlowInstanceRef = useRef<any>(null);
  
  const [savedPositions, setSavedPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isRestoringCheckpoint, setIsRestoringCheckpoint] = useState(false);

  // Load node positions on mount and whenever component remounts
  // Priority: Server checkpoint (always) > Individual storage keys (only for authenticated)
  // Non-authenticated users always load from server checkpoint, never from localStorage
  React.useEffect(() => {
    let isMounted = true;

    async function loadPositions() {
      try {
        // Always try to load checkpoint from server first
        let checkpoint: DiagramCheckpoint | null = null;
        
        try {
          checkpoint = await loadCheckpointFromServer();
          if (checkpoint) {
            console.log('📦 Loaded checkpoint from server on mount:', {
              timestamp: checkpoint.timestamp ? new Date(checkpoint.timestamp).toISOString() : 'no timestamp',
              nodePositions: Object.keys(checkpoint.nodePositions || {}).length,
            });
            // Update localStorage if authenticated (for backup)
            if (isAuthenticated) {
              const localService = new LocalStorageService();
              await localService.set('diagram-checkpoint', checkpoint);
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to load checkpoint from server, trying fallback:', error);
          // Fallback: if authenticated, try localStorage
          if (isAuthenticated) {
            checkpoint = await diagramStorage.loadCheckpoint();
          }
        }
        
        if (checkpoint && checkpoint.nodePositions && isMounted) {
          console.log('📦 Loading node positions from checkpoint...', Object.keys(checkpoint.nodePositions).length, 'positions');
          setIsRestoringCheckpoint(true);
          setSavedPositions(checkpoint.nodePositions);
          setTimeout(() => setIsRestoringCheckpoint(false), 300);
          console.log('✅ Loaded node positions from checkpoint');
          return;
        }
        
        // If no checkpoint and authenticated, try individual storage keys
        if (isAuthenticated) {
          console.log('📥 Loading node positions from individual storage key...');
          const positions = await loadNodePositions();
          console.log('✅ Loaded node positions:', Object.keys(positions).length, 'positions');
          if (isMounted) {
            setSavedPositions(positions);
          }
        } else {
          // Non-authenticated user without checkpoint: use default positions
          if (isMounted) {
            setSavedPositions({});
          }
        }
      } catch (error) {
        console.error('Failed to load node positions:', error);
        if (isMounted) {
          setSavedPositions({});
        }
      }
    }

    loadPositions();

    return () => {
      isMounted = false;
    };
  }, [loadNodePositions, isAuthenticated]);

  const nodes = React.useMemo<Node<NodeData>[]>(() => {
    return [
      // Proxmox Host - TOP
      {
        id: 'proxmox',
        data: { 
          label: architecture.proxmoxHost.name, 
          cpu: architecture.proxmoxHost.cpu, 
          ram: architecture.proxmoxHost.ram 
        },
        position: savedPositions['proxmox'] || { x: 500, y: 0 },
        type: 'proxmox',
      },

      // VMs - MIDDLE (debajo de Proxmox)
      ...architecture.vms.map((vm, index) => ({
        id: vm.id,
        data: { 
          vm, 
          isExpanded: expandedVMs.has(vm.id),
          onToggle: handleToggleVM,
        },
        position: savedPositions[vm.id] || { x: 50 + (index * 280), y: 180 },
        type: 'vm',
      })),

      // Physical Resources - SIDES
      {
        id: 'storage-physical',
        data: {} as NodeData,
        position: savedPositions['storage-physical'] || { x: 50, y: 50 },
        type: 'storage-physical',
      },
      {
        id: 'gpu-physical',
        data: {} as NodeData,
        position: savedPositions['gpu-physical'] || { x: 1100, y: 50 },
        type: 'gpu-physical',
      },


      // External Client - BOTTOM
      {
        id: 'client',
        data: { label: t('diagram.externalClient') },
        position: savedPositions['client'] || { x: 1100, y: 180 },
        type: 'client',
      },

      // Service Nodes - BOTTOM (debajo de cada VM)
      ...architecture.vms.flatMap((vm, vmIndex) => {
        if (!expandedVMs.has(vm.id)) return [];
        
        // Get current VM position (from savedPositions or default)
        const vmX = savedPositions[vm.id]?.x || (50 + (vmIndex * 280));
        const vmY = savedPositions[vm.id]?.y || 180;
        
        return vm.services
          .map((serviceId: string, serviceIndex: number) => {
            const service = services.find((s: any) => s.id === serviceId);
            if (!service) return null;
            
            const nodeId = `${vm.id}-service-${serviceIndex}`;
            
            // Try to get relative offset first (preferred for maintaining position relative to parent)
            const relativeOffsetKey = `${nodeId}_relative`;
            const relativeOffset = savedPositions[relativeOffsetKey];
            
            let servicePosition: { x: number; y: number };
            
            if (relativeOffset) {
              // Use relative offset: calculate absolute position based on current VM position
              servicePosition = {
                x: vmX + relativeOffset.x,
                y: vmY + relativeOffset.y,
              };
              console.log(`📍 Service ${nodeId} using relative offset:`, relativeOffset, '→ absolute:', servicePosition);
            } else {
              // Fallback: try absolute position if it exists
              const savedAbsolutePosition = savedPositions[nodeId];
              if (savedAbsolutePosition) {
                // Check if the absolute position is still valid (within reasonable distance of VM)
                const distanceFromVM = Math.sqrt(
                  Math.pow(savedAbsolutePosition.x - vmX, 2) + 
                  Math.pow(savedAbsolutePosition.y - vmY, 2)
                );
                
                // If position is too far from VM (likely VM was moved), recalculate based on relative offset
                // We'll calculate what the offset should have been and use it
                if (distanceFromVM > 500) {
                  // VM was likely moved, calculate new position based on default layout
                  const defaultOffset = {
                    x: ((serviceIndex % 2) * 130) - 50,
                    y: 200 + Math.floor(serviceIndex / 2) * 70,
                  };
                  servicePosition = {
                    x: vmX + defaultOffset.x,
                    y: vmY + defaultOffset.y,
                  };
                  console.log(`⚠️ Service ${nodeId} absolute position too far from VM, recalculating`);
                } else {
                  // Use saved absolute position
                  servicePosition = savedAbsolutePosition;
                }
              } else {
                // No saved position: calculate default position relative to VM
                servicePosition = {
                  x: vmX + ((serviceIndex % 2) * 130) - 50,
                  y: vmY + 200 + Math.floor(serviceIndex / 2) * 70,
                };
              }
            }
            
            return {
              id: nodeId,
              data: { 
                label: service.name, 
                icon: 'service', 
                vmColor: vm.color,
                imageUrl: service.imageUrl,
              } as ServiceNodeData,
              position: servicePosition,
              type: 'service',
            } as Node<NodeData>;
          })
          .filter((node): node is Node<NodeData> => node !== null);
      }),
    ];
  }, [architecture.vms, architecture.proxmoxHost, services, expandedVMs, handleToggleVM, t, savedPositions]);

  const defaultEdges = React.useMemo<Edge[]>(() => [
    // ============ PROXMOX TO VMs ============
    ...architecture.vms.map((vm) => ({
      id: `proxmox-${vm.id}`,
      source: 'proxmox',
      target: vm.id,
      animated: true,
      label: 'VM',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      labelStyle: { fill: '#6d28d9', fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: '#f3e8ff', fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 3,
    })),

    // ============ STORAGE TO VM101 (TrueNAS) ============
    {
      id: 'storage-vm101',
      source: 'storage-physical',
      sourceHandle: 'right',
      target: 'vm101',
      targetHandle: 'left-target',
      animated: true,
      label: t('diagram.hddPassthrough'),
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
      style: { stroke: '#6b7280', strokeWidth: 3 },
      labelStyle: { fill: '#1f2937', fontSize: 12, fontWeight: 700 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    },

    // ============ GPU TO VM103 ============
    {
      id: 'gpu-vm103',
      source: 'gpu-physical',
      sourceHandle: 'left',
      target: 'vm103',
      targetHandle: 'right-target',
      animated: true,
      label: t('diagram.gpuPassthrough'),
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
      style: { stroke: '#f97316', strokeWidth: 3 },
      labelStyle: { fill: '#ea580c', fontSize: 12, fontWeight: 700 },
      labelBgStyle: { fill: '#ffedd5', fillOpacity: 0.95 },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    },

    // ============ SERVICE CONNECTIONS ============
    // Dynamic edges connecting services to their VMs
    ...architecture.vms.flatMap((vm) => {
      if (!expandedVMs.has(vm.id)) return [];
      
      return vm.services
        .map((serviceId: string, serviceIndex: number) => {
          const service = services.find((s: any) => s.id === serviceId);
          if (!service) return null;
          
          // Special label for NFS service
          const isNFS = serviceId === 'nfs-server';
          
          return {
            id: `${vm.id}-to-service-${serviceIndex}`,
            source: vm.id,
            target: `${vm.id}-service-${serviceIndex}`,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: vm.color },
            style: { stroke: vm.color, strokeWidth: 2 },
            ...(isNFS && {
              label: t('diagram.nfsMount'),
              labelStyle: { fill: vm.color, fontSize: 11, fontWeight: 600 },
              labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
              labelBgPadding: [6, 3] as [number, number],
              labelBgBorderRadius: 3,
            }),
          } as Edge;
        })
        .filter((edge): edge is Edge => edge !== null);
    }),
  ], [architecture.vms, services, expandedVMs, t]);

  // Combine default edges with custom edges, filter hidden, and apply custom labels
  const allEdges = React.useMemo(() => {
    const combined = [...defaultEdges, ...customEdges];
    
    // Filter out hidden edges
    const visible = combined.filter(edge => !hiddenEdges.has(edge.id));
    
    // Apply custom labels
    return visible.map(edge => {
      if (edgeLabels[edge.id]) {
        return { ...edge, label: edgeLabels[edge.id] };
      }
      return edge;
    });
  }, [defaultEdges, customEdges, hiddenEdges, edgeLabels]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(allEdges);

  // Update nodes when they change or when saved positions are loaded
  // Only apply saved positions when restoring checkpoint or on initial load
  // Preserve current positions when user is actively editing
  React.useEffect(() => {
    console.log('🔄 Updating flow nodes, savedPositions:', Object.keys(savedPositions).length, 'positions', 'isRestoring:', isRestoringCheckpoint);
    
    setFlowNodes((currentNodes) => {
      // Create a map of current node positions for reference
      const currentNodeMap = new Map(currentNodes.map(node => [node.id, node]));
      
      // Create a map of VM positions (current or saved) for calculating service positions
      const vmPositionMap = new Map<string, { x: number; y: number }>();
      nodes.forEach(node => {
        if (node.type === 'vm' || node.id === 'proxmox') {
          const currentVM = currentNodeMap.get(node.id);
          // Use current position if available, otherwise use saved or default
          vmPositionMap.set(node.id, currentVM?.position || node.position);
        }
      });
      
      // Only apply saved positions if:
      // 1. We're restoring from checkpoint (isRestoringCheckpoint = true)
      // 2. OR we have no current nodes (initial load)
      // Otherwise, preserve current positions to allow user editing
      const shouldApplySavedPositions = isRestoringCheckpoint || currentNodes.length === 0;
      
      if (shouldApplySavedPositions && Object.keys(savedPositions).length > 0) {
        console.log('📥 Applying saved positions to nodes (restoring checkpoint or initial load)');
        const updatedNodes = nodes.map(newNode => {
          // For service nodes, use relative offset if available
          if (newNode.type === 'service' && newNode.id.includes('-service-')) {
            const vmId = newNode.id.split('-service-')[0];
            const vmPosition = vmPositionMap.get(vmId);
            
            if (vmPosition) {
              // Try relative offset first
              const relativeOffsetKey = `${newNode.id}_relative`;
              const relativeOffset = savedPositions[relativeOffsetKey];
              
              if (relativeOffset) {
                // Calculate position based on current VM position + relative offset
                const calculatedPosition = {
                  x: vmPosition.x + relativeOffset.x,
                  y: vmPosition.y + relativeOffset.y,
                };
                console.log(`  ✅ Service ${newNode.id} using relative offset from VM ${vmId}`);
                return { ...newNode, position: calculatedPosition };
              }
            }
            
            // Fallback: use saved absolute position
            const savedPosition = savedPositions[newNode.id];
            if (savedPosition) {
              return { ...newNode, position: savedPosition };
            }
            return newNode;
          }
          
          // For non-service nodes (VMs, etc.)
          const savedPosition = savedPositions[newNode.id];
          if (savedPosition) {
            console.log(`  ✅ Applying saved position to ${newNode.id}:`, savedPosition);
            return { ...newNode, position: savedPosition };
          }
          
          return newNode;
        });
        return updatedNodes;
      }
      
      // If we have current nodes and we're not restoring, preserve current positions
      // This allows users (including non-authenticated) to edit the diagram
      if (currentNodes.length > 0) {
        // Preserve positions of existing nodes, use default for new nodes
        const nodeMap = new Map(currentNodes.map(node => [node.id, node]));
        
        return nodes.map(newNode => {
          const existingNode = nodeMap.get(newNode.id);
          if (existingNode) {
            return { ...newNode, position: existingNode.position };
          }
          return newNode;
        });
      }
      
      // Default: return nodes as-is (will use positions from useMemo)
      return nodes;
    });
  }, [nodes, savedPositions, setFlowNodes, isRestoringCheckpoint]);

  React.useEffect(() => {
    setFlowEdges(allEdges);
  }, [allEdges, setFlowEdges]);

  // Refs to track current state for cleanup
  const nodesRef = useRef<Node[]>([]);
  const customEdgesRef = useRef<Edge[]>([]);
  const hiddenEdgesRef = useRef<Set<string>>(new Set());
  const edgeLabelsRef = useRef<Record<string, string>>({});
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to track previous VM positions for calculating relative offsets
  const previousVMPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  // Update refs whenever state changes
  useEffect(() => {
    nodesRef.current = flowNodes;
    
    // Update previous VM positions for calculating relative offsets
    flowNodes.forEach(node => {
      if (node.type === 'vm' || node.id === 'proxmox') {
        previousVMPositionsRef.current.set(node.id, node.position);
      }
    });
  }, [flowNodes]);

  useEffect(() => {
    customEdgesRef.current = customEdges;
  }, [customEdges]);

  useEffect(() => {
    hiddenEdgesRef.current = hiddenEdges;
  }, [hiddenEdges]);

  useEffect(() => {
    edgeLabelsRef.current = edgeLabels;
  }, [edgeLabels]);

  // Save positions on component unmount (when navigating away)
  useEffect(() => {
    return () => {
      // Cleanup: save positions when component unmounts
      // Clear any pending debounced saves
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      // Save immediately on unmount (no debounce) - use refs to get latest values
      const currentNodes = nodesRef.current;
      const currentEdges = customEdgesRef.current;
      const currentHidden = hiddenEdgesRef.current;
      const currentLabels = edgeLabelsRef.current;
      
      console.log('🔄 Component unmounting, saving all diagram state...', {
        nodes: currentNodes.length,
        edges: currentEdges.length,
        hidden: currentHidden.size,
        labels: Object.keys(currentLabels).length,
      });
      
      // Save to localStorage immediately as synchronous backup
      if (currentNodes.length > 0) {
        try {
          const positions: Record<string, { x: number; y: number }> = {};
          currentNodes.forEach(node => {
            positions[node.id] = node.position;
          });
          localStorage.setItem('diagram-node-positions', JSON.stringify(positions));
          console.log('💾 Saved positions to localStorage as backup');
        } catch (e) {
          console.warn('Failed to save positions to localStorage:', e);
        }
      }
      
      try {
        localStorage.setItem('diagram-custom-edges', JSON.stringify(currentEdges));
        localStorage.setItem('diagram-hidden-edges', JSON.stringify(Array.from(currentHidden)));
        localStorage.setItem('diagram-edge-labels', JSON.stringify(currentLabels));
        console.log('💾 Saved edges state to localStorage as backup');
      } catch (e) {
        console.warn('Failed to save edges to localStorage:', e);
      }
      
      // Use Promise.all to ensure all saves complete
      // Always save, even if empty, to maintain consistency
      const savePromises: Promise<void>[] = [];
      
      // Always save node positions if there are nodes
      if (currentNodes.length > 0) {
        savePromises.push(
          saveNodePositions(currentNodes).catch((error) => {
            console.error('❌ Failed to save node positions on unmount:', error);
          })
        );
      }
      
      // Always save edges state (even if empty arrays/objects)
      savePromises.push(
        saveCustomEdges(currentEdges).catch((error) => {
          console.error('❌ Failed to save custom edges on unmount:', error);
        })
      );
      
      savePromises.push(
        saveHiddenEdges(currentHidden).catch((error) => {
          console.error('❌ Failed to save hidden edges on unmount:', error);
        })
      );
      
      savePromises.push(
        saveEdgeLabels(currentLabels).catch((error) => {
          console.error('❌ Failed to save edge labels on unmount:', error);
        })
      );
      
      // Try to complete saves, but don't block unmount
      if (savePromises.length > 0) {
        Promise.all(savePromises).then(() => {
          console.log('✅ All diagram state saved on unmount');
        }).catch((error) => {
          console.error('❌ Error saving diagram state on unmount:', error);
        });
      }
    };
  }, [saveNodePositions, saveCustomEdges, saveHiddenEdges, saveEdgeLabels]);

  // Function to save all diagram state immediately
  const saveAllDiagramState = useCallback(async () => {
    const currentNodes = nodesRef.current;
    const currentEdges = customEdgesRef.current;
    const currentHidden = hiddenEdgesRef.current;
    const currentLabels = edgeLabelsRef.current;
    
    console.log('💾 Saving all diagram state...', {
      nodes: currentNodes.length,
      edges: currentEdges.length,
      hidden: currentHidden.size,
      labels: Object.keys(currentLabels).length,
    });
    
    const savePromises: Promise<void>[] = [];
    
    // Always save all state, even if empty
    if (currentNodes.length > 0) {
      savePromises.push(saveNodePositions(currentNodes));
    }
    // Always save edges state (even if empty)
    savePromises.push(saveCustomEdges(currentEdges));
    savePromises.push(saveHiddenEdges(currentHidden));
    savePromises.push(saveEdgeLabels(currentLabels));
    
    if (savePromises.length > 0) {
      await Promise.all(savePromises);
      console.log('✅ All diagram state saved');
    }
  }, [saveNodePositions, saveCustomEdges, saveHiddenEdges, saveEdgeLabels]);

  // Save before page unload (refresh/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use synchronous storage if available, otherwise try async
      const currentNodes = nodesRef.current;
      const currentEdges = customEdgesRef.current;
      const currentHidden = hiddenEdgesRef.current;
      const currentLabels = edgeLabelsRef.current;
      
      // Try to save synchronously using sendBeacon or localStorage as fallback
      if (currentNodes.length > 0) {
        try {
          const positions: Record<string, { x: number; y: number }> = {};
          currentNodes.forEach(node => {
            positions[node.id] = node.position;
          });
          // Use localStorage as immediate fallback
          localStorage.setItem('diagram-node-positions', JSON.stringify(positions));
        } catch (e) {
          console.warn('Failed to save positions on unload:', e);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Debounced save function
  const debouncedSavePositions = useCallback((nodes: Node[]) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      saveNodePositions(nodes).then(() => {
        // Update savedPositions with current positions to maintain them during session
        // This allows users (including non-authenticated) to keep their edits
        const currentPositions = extractNodePositions(nodes);
        const updatedPositions = calculateServiceRelativePositions(nodes, currentPositions);
        setSavedPositions(updatedPositions);
        console.log('✅ Updated savedPositions state with current positions (debounced)');
      }).catch((error) => {
        console.error('Failed to save node positions:', error);
      });
    }, 500); // 500ms debounce
  }, [saveNodePositions]);

  // Save node positions when they change
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      
      // Save positions after nodes have moved
      const isDragEnd = changes.some((change: any) => change.type === 'position' && change.dragging === false);
      const isPositionChange = changes.some((change: any) => change.type === 'position');
      
      if (isDragEnd || isPositionChange) {
        // Check if any VM was moved and update service positions accordingly
        const vmMovedChanges = changes.filter((change: any) => 
          change.type === 'position' && 
          (change.id === 'proxmox' || change.id?.startsWith('vm'))
        );
        
        // Use requestAnimationFrame to ensure state is updated after React render
        requestAnimationFrame(() => {
          setFlowNodes((currentNodes) => {
            let updatedNodes = currentNodes;
            
            // If a VM was moved and services are visible, update their positions
            if (vmMovedChanges.length > 0) {
              console.log('🔄 VM moved, updating service positions...');
              
              // Calculate relative offsets from CURRENT positions (not savedPositions)
              // This ensures we use the most recent positions after services were moved
              updatedNodes = currentNodes.map(node => {
                // If this is a service node, check if its parent VM was moved
                if (node.type === 'service' && node.id.includes('-service-')) {
                  const vmId = node.id.split('-service-')[0];
                  const vmMoved = vmMovedChanges.find((c: any) => c.id === vmId);
                  
                  if (vmMoved) {
                    // Find the VM node to get its new position
                    const vmNode = currentNodes.find(n => n.id === vmId);
                    if (vmNode) {
                      // Get the PREVIOUS position of the VM from the ref
                      // This is the position before the VM was moved
                      const oldVMPosition = previousVMPositionsRef.current.get(vmId) || vmNode.position;
                      
                      // Calculate relative offset from CURRENT service position to OLD VM position
                      // This preserves the current relative position of the service (after it was moved)
                      const relativeOffset = {
                        x: node.position.x - oldVMPosition.x,
                        y: node.position.y - oldVMPosition.y,
                      };
                      
                      // Calculate new position based on VM's NEW position + current offset
                      const newPosition = {
                        x: vmNode.position.x + relativeOffset.x,
                        y: vmNode.position.y + relativeOffset.y,
                      };
                      
                      console.log(`  📍 Updating service ${node.id} position relative to VM ${vmId}:`, {
                        serviceCurrent: node.position,
                        oldVM: oldVMPosition,
                        newVM: vmNode.position,
                        offset: relativeOffset,
                        newServicePos: newPosition
                      });
                      return { ...node, position: newPosition };
                    }
                  }
                }
                return node;
              });
              
              // Update previous VM positions after moving services
              updatedNodes.forEach(node => {
                if (node.type === 'vm' || node.id === 'proxmox') {
                  previousVMPositionsRef.current.set(node.id, node.position);
                }
              });
            }
            
            nodesRef.current = updatedNodes;
            // Save immediately on drag end, otherwise use debounce
            if (isDragEnd) {
              // Clear any pending debounced save
              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
              }
              // Save immediately and also to localStorage as backup
              const positions: Record<string, { x: number; y: number }> = {};
              updatedNodes.forEach(node => {
                positions[node.id] = node.position;
              });
              try {
                localStorage.setItem('diagram-node-positions', JSON.stringify(positions));
              } catch (e) {
                console.warn('Failed to save to localStorage:', e);
              }
              
              console.log('💾 Drag ended, saving positions immediately...', updatedNodes.length, 'nodes');
              saveNodePositions(updatedNodes).then(() => {
                console.log('✅ Positions saved after drag end');
                // Update savedPositions with current positions to maintain them during session
                // This allows users (including non-authenticated) to keep their edits
                const currentPositions = extractNodePositions(updatedNodes);
                const updatedPositions = calculateServiceRelativePositions(updatedNodes, currentPositions);
                setSavedPositions(updatedPositions);
                console.log('✅ Updated savedPositions state with current positions');
              }).catch((error) => {
                console.error('❌ Failed to save node positions:', error);
              });
            } else {
              debouncedSavePositions(updatedNodes);
            }
            return updatedNodes;
          });
        });
      }
    },
    [onNodesChange, debouncedSavePositions, saveNodePositions, setFlowNodes, savedPositions, loadNodePositions]
  );

  // Handle new connections
  const onConnect = useCallback(
    async (connection: any) => {
      // Determine edge type based on handle positions
      // If connecting from right to left, use 'step' for more direct routing
      // Otherwise use 'smoothstep' for smoother curves
      const sourceHandleId = connection.sourceHandle || '';
      const targetHandleId = connection.targetHandle || '';
      const isRightToLeft = (sourceHandleId.includes('right') || sourceHandleId === 'right') && 
                           (targetHandleId.includes('left') || targetHandleId === 'left-target');
      
      const newEdge: Edge = {
        id: `custom-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: isRightToLeft ? 'step' : 'smoothstep',
        animated: true,
        label: t('diagram.customConnection'),
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#047857', fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: '#d1fae5', fillOpacity: 0.9 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 3,
      };

      setCustomEdges((prevEdges) => {
        const updatedEdges = [...prevEdges, newEdge];
        saveCustomEdges(updatedEdges).catch((error) => {
          console.error('Failed to save custom edges:', error);
        });
        return updatedEdges;
      });
    },
    [saveCustomEdges, t]
  );

  // Handle edge deletion and selection
  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      
      // Handle edge selection
      const selectedChanges = changes.filter((change: any) => change.type === 'select' && change.selected);
      if (selectedChanges.length > 0) {
        setSelectedEdge(selectedChanges[0].id);
      }
      
      // Check if any edges were removed
      const removedEdges = changes.filter((change: any) => change.type === 'remove');
      if (removedEdges.length > 0) {
        const removedIds = removedEdges.map((change: any) => change.id);
        
        // Separate custom edges from default edges
        const customRemovedIds = removedIds.filter((id: string) => id.startsWith('custom-'));
        const defaultRemovedIds = removedIds.filter((id: string) => !id.startsWith('custom-'));
        
        // Remove custom edges
        if (customRemovedIds.length > 0) {
          setCustomEdges((prevEdges) => {
            const updatedEdges = prevEdges.filter((edge) => !customRemovedIds.includes(edge.id));
            saveCustomEdges(updatedEdges).catch((error) => {
              console.error('Failed to save custom edges:', error);
            });
            return updatedEdges;
          });
        }
        
        // Hide default edges
        if (defaultRemovedIds.length > 0) {
          setHiddenEdges((prev) => {
            const newHidden = new Set(prev);
            defaultRemovedIds.forEach((id: string) => newHidden.add(id));
            saveHiddenEdges(newHidden).catch((error) => {
              console.error('Failed to save hidden edges:', error);
            });
            return newHidden;
          });
        }
      }
    },
    [onEdgesChange, saveCustomEdges, saveHiddenEdges]
  );
  
  // Handle edge label editing
  const handleEdgeDoubleClick = useCallback((event: any, edge: any) => {
    setSelectedEdge(edge.id);
    setEditLabel(edgeLabels[edge.id] || edge.label || '');
    setIsEditDialogOpen(true);
  }, [edgeLabels]);
  
  const handleSaveLabel = useCallback(async () => {
    if (selectedEdge && editLabel.trim()) {
      setEdgeLabels((prev) => {
        const updated = { ...prev, [selectedEdge]: editLabel.trim() };
        saveEdgeLabels(updated).catch((error) => {
          console.error('Failed to save edge labels:', error);
        });
        return updated;
      });
    }
    setIsEditDialogOpen(false);
    setSelectedEdge(null);
    setEditLabel('');
  }, [selectedEdge, editLabel, saveEdgeLabels]);

  const handleDeleteEdge = useCallback(async () => {
    if (selectedEdge) {
      try {
        // Check if it's a custom edge or default edge
        if (selectedEdge.startsWith('custom-')) {
          // Remove from custom edges
          setCustomEdges((prevEdges) => {
            const updatedEdges = prevEdges.filter((edge) => edge.id !== selectedEdge);
            saveCustomEdges(updatedEdges).catch((error) => {
              console.error('Failed to save custom edges:', error);
            });
            return updatedEdges;
          });
        } else {
          // Hide default edge
          setHiddenEdges((prev) => {
            const newHidden = new Set(prev);
            newHidden.add(selectedEdge);
            saveHiddenEdges(newHidden).catch((error) => {
              console.error('Failed to save hidden edges:', error);
            });
            return newHidden;
          });
        }
        
        // Also remove custom label if exists
        setEdgeLabels((prev) => {
          const updated = { ...prev };
          delete updated[selectedEdge];
          saveEdgeLabels(updated).catch((error) => {
            console.error('Failed to save edge labels:', error);
          });
          return updated;
        });
      } catch (error) {
        console.error('Failed to delete edge:', error);
      }
    }
    setIsEditDialogOpen(false);
    setSelectedEdge(null);
    setEditLabel('');
  }, [selectedEdge, saveCustomEdges, saveHiddenEdges, saveEdgeLabels]);

  // Reset all connections to default
  // Save checkpoint function
  const handleSaveCheckpoint = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired') || 'You must be logged in to save checkpoints');
      return;
    }
    
    try {
      // Get current viewport from ReactFlow
      const reactFlowInstance = reactFlowInstanceRef.current || (window as any).__reactFlowInstance;
      const viewport = reactFlowInstance?.getViewport() ? {
        x: reactFlowInstance.getViewport().x,
        y: reactFlowInstance.getViewport().y,
        zoom: reactFlowInstance.getViewport().zoom,
      } : undefined;
      
      // Get current node positions from refs
      const currentNodes = nodesRef.current;
      const nodePositions = extractNodePositions(currentNodes);
      
      const checkpoint: DiagramCheckpoint = {
        nodePositions,
        customEdges: customEdges,
        hiddenEdges: Array.from(hiddenEdges),
        edgeLabels: edgeLabels,
        viewport,
        timestamp: Date.now(),
      };
      
      await diagramStorage.saveCheckpoint(checkpoint);
      console.log('✅ Checkpoint saved successfully');
      toast.success(t('diagram.checkpointSaved') || 'Checkpoint guardado correctamente');
    } catch (error) {
      console.error('❌ Failed to save checkpoint:', error);
      toast.error(t('diagram.checkpointSaveError') || 'Error al guardar el checkpoint');
    }
  }, [customEdges, hiddenEdges, edgeLabels, isAuthenticated, t]);

  // Restore from checkpoint function
  // All users (authenticated or not) can restore from the admin's server checkpoint
  const handleRestoreCheckpoint = useCallback(async () => {
    if (!window.confirm(t('diagram.confirmReset') || '¿Restaurar el diagrama desde el checkpoint guardado?')) {
      return;
    }
    
    try {
      setIsRestoringCheckpoint(true);
      
      // Always load from server first
      let checkpoint: DiagramCheckpoint | null = null;
      try {
        checkpoint = await loadCheckpointFromServer();
      } catch (error) {
        // Fallback to localStorage if authenticated
        if (isAuthenticated) {
          checkpoint = await diagramStorage.loadCheckpoint();
        }
      }
      
      if (!checkpoint) {
        setIsRestoringCheckpoint(false);
        toast.error(t('diagram.noCheckpoint') || 'No se encontró ningún checkpoint guardado');
        return;
      }
      
      console.log('✅ Loaded checkpoint from server:', {
        timestamp: checkpoint.timestamp ? new Date(checkpoint.timestamp).toISOString() : 'no timestamp',
        nodePositions: Object.keys(checkpoint.nodePositions || {}).length,
      });
      
      // Update localStorage if authenticated
      if (isAuthenticated) {
        const localService = new LocalStorageService();
        await localService.set('diagram-checkpoint', checkpoint);
        await diagramStorage.saveNodePositions(checkpoint.nodePositions);
        await diagramStorage.saveCustomEdges(checkpoint.customEdges);
        await diagramStorage.saveHiddenEdges(new Set(checkpoint.hiddenEdges));
        await diagramStorage.saveEdgeLabels(checkpoint.edgeLabels);
      }
      
      // Apply checkpoint to state
      setSavedPositions(checkpoint.nodePositions || {});
      setFlowNodes(() => applyCheckpointPositions(nodes, checkpoint.nodePositions || {}));
      setCustomEdges(checkpoint.customEdges || []);
      setHiddenEdges(new Set(checkpoint.hiddenEdges || []));
      setEdgeLabels(checkpoint.edgeLabels || {});
      
      // Restore viewport if available
      if (checkpoint.viewport && reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.setViewport(
          { x: checkpoint.viewport.x, y: checkpoint.viewport.y },
          { zoom: checkpoint.viewport.zoom, duration: 200 }
        );
      }
      
      setTimeout(() => setIsRestoringCheckpoint(false), 100);
      
      console.log('✅ Checkpoint restored successfully');
      toast.success(t('diagram.checkpointRestored') || 'Checkpoint restaurado correctamente');
    } catch (error) {
      setIsRestoringCheckpoint(false);
      console.error('❌ Failed to restore checkpoint:', error);
      toast.error(t('diagram.checkpointRestoreError') || 'Error al restaurar el checkpoint');
    }
  }, [t, setSavedPositions, isAuthenticated, nodes, setFlowNodes]);

  const handleResetConnections = useCallback(async () => {
    if (window.confirm(t('diagram.confirmReset'))) {
      try {
        // Clear all custom edges
        setCustomEdges([]);
        await saveCustomEdges([]);
        
        // Clear all hidden edges
        setHiddenEdges(new Set());
        await saveHiddenEdges(new Set());
        
        // Clear all custom labels
        setEdgeLabels({});
        await saveEdgeLabels({});
        
        // The useEffect will automatically update flowEdges when allEdges changes
      } catch (error) {
        console.error('Failed to reset connections:', error);
      }
    }
  }, [t, saveCustomEdges, saveHiddenEdges, saveEdgeLabels]);

  const nodeTypes = useMemo<NodeTypes>(() => ({
    vm: VMNode,
    proxmox: ProxmoxNode,
    client: ClientNode,
    'storage-physical': StorageNode,
    'gpu-physical': GPUNode,
    service: ServiceNode,
  }), []);
  
  const onInit = useCallback((instance: any) => {
    reactFlowInstanceRef.current = instance;
    (window as any).__reactFlowInstance = instance;
  }, []);

  // Internal component to handle viewport restoration from checkpoint only (no auto-fit)
  const AutoFitView: React.FC = () => {
    const { setViewport } = useReactFlow();
    const hasRestoredViewport = useRef(false);
    
    useEffect(() => {
      const restoreViewportFromCheckpoint = async () => {
        if (hasRestoredViewport.current) return;
        
        // Wait a bit for ReactFlow to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const checkpoint = await diagramStorage.loadCheckpoint();
          if (checkpoint && checkpoint.viewport) {
            console.log('📍 Restoring viewport from checkpoint:', checkpoint.viewport);
            setViewport(
              { x: checkpoint.viewport.x, y: checkpoint.viewport.y },
              { zoom: checkpoint.viewport.zoom, duration: 0 }
            );
            hasRestoredViewport.current = true;
          }
        } catch (error) {
          console.warn('Failed to restore viewport from checkpoint:', error);
        }
      };

      restoreViewportFromCheckpoint();
    }, [setViewport]);

    return null;
  };

  return (
    <div className="w-full h-full" style={{ minHeight: 0, position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <ReactFlow 
        nodes={flowNodes} 
        edges={flowEdges} 
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        onInit={onInit}
        fitView={false}
        fitViewOnInit={false}
        fitViewOnResize={false}
        fitViewOptions={{ padding: 0.1, maxZoom: 1.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
        connectionMode="loose"
        elementsSelectable={true}
        selectNodesOnDrag={false}
        preventScrolling={false}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <AutoFitView />
        
        {/* Panel de control de VMs - Draggable */}
        <div
          ref={vmPanelRef}
          className={`absolute bg-white dark:bg-slate-800 rounded-lg shadow-lg z-10 pointer-events-auto ${
            isMobile ? 'touch-none' : ''
          }`}
          style={{
            width: isVMPanelMinimized ? `${MINIMIZED_PANEL_WIDTH}px` : `${panelWidth}px`,
            maxWidth: isVMPanelMinimized ? `${MINIMIZED_PANEL_WIDTH}px` : (isMobile ? 'calc(100vw - 16px)' : '280px'),
            left: `${vmPanelPosition.x}px`,
            top: `${vmPanelPosition.y}px`,
            cursor: isMobile ? 'default' : (isDraggingVM ? 'grabbing' : 'grab'),
            pointerEvents: 'auto',
            willChange: 'transform',
          }}
          onMouseDown={handleVMPanelMouseDown}
          onTouchStart={handleVMPanelTouchStart}
        >
          <div className={isVMPanelMinimized ? "p-1.5" : "p-4"}>
            <div className={`flex items-center ${isVMPanelMinimized ? 'justify-center' : 'justify-between'} ${isVMPanelMinimized ? '' : 'mb-4'}`}>
              {!isVMPanelMinimized && (
                <div className={`flex items-center gap-2 flex-1 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}>
                  {!isMobile && <GripVertical className="w-4 h-4 text-gray-400" />}
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {t('diagram.vmControl')}
                  </h3>
                </div>
              )}
              <div className={`flex items-center ${isVMPanelMinimized ? 'gap-1.5' : 'gap-1'}`}>
                {isVMPanelMinimized && (
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                {!isVMPanelMinimized && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleAllServices}
                    className="h-7 w-7 p-0"
                    title={architecture.vms.every(vm => expandedVMs.has(vm.id)) 
                      ? t('diagram.hideAllServices')
                      : t('diagram.showAllServices')}
                  >
                    {architecture.vms.every(vm => expandedVMs.has(vm.id)) ? (
                      <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVMPanelMinimized(!isVMPanelMinimized)}
                  className={`${isVMPanelMinimized ? 'h-6 w-6' : 'h-7 w-7'} p-0`}
                  title={isVMPanelMinimized ? 'Maximizar' : 'Minimizar'}
                >
                  {isVMPanelMinimized ? (
                    <Maximize2 className={`${isVMPanelMinimized ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-400`} />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            {!isVMPanelMinimized && (
              <div className={`space-y-2 ${isMobile ? 'max-h-[40vh]' : 'max-h-[60vh]'} overflow-y-auto`}>
                {architecture.vms.map((vm) => {
                  const isExpanded = expandedVMs.has(vm.id);
                  return (
                    <div
                      key={vm.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: vm.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {vm.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVM(vm.id)}
                        className="h-7 w-7 p-0"
                        title={isExpanded 
                          ? t('diagram.hideServices')
                          : t('diagram.showServices')}
                      >
                        {isExpanded ? (
                          <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Panel de Checkpoint - Draggable */}
        <div
          ref={checkpointPanelRef}
          className={`absolute bg-white dark:bg-slate-800 rounded-lg shadow-lg z-10 pointer-events-auto ${
            isMobile ? 'touch-none' : ''
          }`}
          style={{
            width: isCheckpointPanelMinimized ? `${MINIMIZED_PANEL_WIDTH}px` : `${panelWidth}px`,
            maxWidth: isCheckpointPanelMinimized ? `${MINIMIZED_PANEL_WIDTH}px` : (isMobile ? 'calc(100vw - 16px)' : '280px'),
            left: `${checkpointPanelPosition.x}px`,
            top: `${checkpointPanelPosition.y}px`,
            cursor: isMobile ? 'default' : (isDraggingCheckpoint ? 'grabbing' : 'grab'),
            pointerEvents: 'auto',
            willChange: 'transform',
          }}
          onMouseDown={handleCheckpointPanelMouseDown}
          onTouchStart={handleCheckpointPanelTouchStart}
        >
          <div className={isCheckpointPanelMinimized ? "p-1.5" : "p-3"}>
            <div className={`flex items-center ${isCheckpointPanelMinimized ? 'justify-center' : 'justify-between'} ${isCheckpointPanelMinimized ? '' : 'mb-3'}`}>
              {!isCheckpointPanelMinimized && (
                <div className={`flex items-center gap-2 flex-1 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}>
                  {!isMobile && <GripVertical className="w-4 h-4 text-gray-400" />}
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {t('diagram.controls') || 'Controles'}
                  </h3>
                </div>
              )}
              <div className={`flex items-center ${isCheckpointPanelMinimized ? 'gap-1.5' : 'gap-0'}`}>
                {isCheckpointPanelMinimized && (
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCheckpointPanelMinimized(!isCheckpointPanelMinimized)}
                  className={`${isCheckpointPanelMinimized ? 'h-6 w-6' : 'h-7 w-7'} p-0`}
                  title={isCheckpointPanelMinimized ? 'Maximizar' : 'Minimizar'}
                >
                  {isCheckpointPanelMinimized ? (
                    <Maximize2 className={`${isCheckpointPanelMinimized ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-400`} />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            {!isCheckpointPanelMinimized && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <p>{t('diagram.doubleClickEdit')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCheckpoint}
                  className="w-full mt-3 gap-2"
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? (t('auth.loginRequired') || 'Login required to save checkpoints') : ''}
                >
                  <Save className="w-3 h-3" />
                  {t('diagram.saveCheckpoint')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreCheckpoint}
                  className="w-full mt-2 gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('diagram.resetDiagram')}
                </Button>
              </>
            )}
          </div>
        </div>
      </ReactFlow>

      {/* Dialog para editar etiquetas */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('diagram.editLabel')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edge-label">{t('diagram.labelText')}</Label>
              <Input
                id="edge-label"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveLabel();
                  } else if (e.key === 'Escape') {
                    setIsEditDialogOpen(false);
                  }
                }}
                placeholder={t('diagram.enterLabel')}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={handleDeleteEdge}
              className="mr-auto"
            >
              {t('common.delete')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveLabel}>
                {t('common.save')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { architectureData, VM } from '@/data/architecture';
import { Link } from 'wouter';
import { HardDrive, Server, Zap, Database, Cloud } from 'lucide-react';

interface VMNodeData {
  vm: VM;
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
}

type NodeData = VMNodeData | ProxmoxNodeData | ClientNodeData | StorageNodeData | ServiceNodeData;

const VMNode: React.FC<{ data: VMNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/vm/${data.vm.id}`}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer transition-all duration-200"
      >
        <Card
          className={`p-4 w-56 border-2 transition-all duration-200 ${
            isHovered ? 'shadow-xl scale-105 z-50' : 'shadow-lg'
          }`}
          style={{
            borderColor: data.vm.color,
            backgroundColor: isHovered ? `${data.vm.color}20` : 'white',
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-900">{data.vm.name}</h3>
                <p className="text-xs text-gray-600">VM{data.vm.vmId}</p>
              </div>
              <Badge
                variant={
                  data.vm.criticality === 'critical'
                    ? 'destructive'
                    : data.vm.criticality === 'high'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs whitespace-nowrap"
              >
                {data.vm.criticality}
              </Badge>
            </div>

            {/* Role */}
            <p className="text-xs text-gray-700 font-medium">{data.vm.role}</p>

            {/* Services */}
            <div className="flex flex-wrap gap-1">
              {data.vm.services.slice(0, 3).map((service, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                  {service}
                </Badge>
              ))}
              {data.vm.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{data.vm.services.length - 3}
                </Badge>
              )}
            </div>

            {/* Hover Info */}
            {isHovered && (
              <div className="border-t pt-3 space-y-2 bg-white rounded">
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">{data.vm.hardware.cpu}</span> CPU
                  </span>
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">{data.vm.hardware.ram}</span>GB
                    RAM
                  </span>
                </div>
                {data.vm.specialHardware && data.vm.specialHardware.length > 0 && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    <span className="font-semibold">Hardware Especial:</span>
                    <br />
                    {data.vm.specialHardware[0]}
                  </div>
                )}
                <p className="text-xs text-blue-600 font-semibold">→ Click para más detalles</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Link>
  );
};

const StorageVolumeNode: React.FC<{ data: StorageNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Card
        className={`p-4 w-48 border-2 border-blue-400 bg-blue-50 dark:bg-blue-950 transition-all duration-200 ${
          isHovered ? 'shadow-xl scale-105' : 'shadow-lg'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{data.label}</h3>
          {isHovered && (
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Almacenamiento compartido NFS
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

const ProxmoxNode: React.FC<{ data: ProxmoxNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Card
        className={`p-4 w-56 border-2 border-purple-400 bg-purple-50 dark:bg-purple-950 transition-all duration-200 ${
          isHovered ? 'shadow-xl scale-105' : 'shadow-lg'
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{data.label}</h3>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{data.cpu}</span> CPU
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{data.ram}</span>GB RAM
            </span>
          </div>
          {isHovered && (
            <p className="text-xs text-gray-700 dark:text-gray-300">Hipervisor Proxmox VE</p>
          )}
        </div>
      </Card>
    </div>
  );
};

const ClientNode: React.FC<{ data: ClientNodeData }> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Card
        className={`p-4 w-48 border-2 border-green-400 bg-green-50 dark:bg-green-950 transition-all duration-200 ${
          isHovered ? 'shadow-xl scale-105' : 'shadow-lg'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Cloud className="w-8 h-8 text-green-600 dark:text-green-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{data.label}</h3>
          {isHovered && (
            <p className="text-xs text-gray-700 dark:text-gray-300">Acceso desde internet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

const GPUNode: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Card
        className={`p-3 w-40 border-2 border-orange-400 bg-orange-50 dark:bg-orange-950 transition-all duration-200 ${
          isHovered ? 'shadow-lg scale-105' : 'shadow-md'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">GPU</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300">NVIDIA GTX 1060</p>
          {isHovered && (
            <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold">
              Passthrough a VM103
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

const StorageNode: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      <Card
        className={`p-3 w-40 border-2 border-gray-400 bg-gray-50 dark:bg-gray-800 transition-all duration-200 ${
          isHovered ? 'shadow-lg scale-105' : 'shadow-md'
        }`}
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <HardDrive className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">Almacenamiento</h3>
          <p className="text-xs text-gray-700 dark:text-gray-300">HDD + SSD</p>
          {isHovered && (
            <p className="text-xs text-gray-700 dark:text-gray-300">Passthrough a TrueNAS</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export const ArchitectureDiagram: React.FC = () => {
  const nodes: Node<NodeData>[] = [
    // Proxmox Host
    {
      id: 'proxmox',
      data: { label: 'Proxmox VE', cpu: 4, ram: 32 },
      position: { x: 400, y: 0 },
      type: 'proxmox',
    },

    // Physical Storage & GPU
    {
      id: 'storage-physical',
      data: {} as NodeData,
      position: { x: 50, y: 150 },
      type: 'storage-physical',
    },
    {
      id: 'gpu-physical',
      data: {} as NodeData,
      position: { x: 750, y: 150 },
      type: 'gpu-physical',
    },

    // NFS Volume (Central)
    {
      id: 'nfs-volume',
      data: { label: 'Volumen NFS' },
      position: { x: 400, y: 150 },
      type: 'storage-volume',
    },

    // VMs
    {
      id: 'vm101',
      data: { vm: architectureData.vms[0] },
      position: { x: 50, y: 300 },
      type: 'vm',
    },
    {
      id: 'vm102',
      data: { vm: architectureData.vms[1] },
      position: { x: 300, y: 300 },
      type: 'vm',
    },
    {
      id: 'vm103',
      data: { vm: architectureData.vms[2] },
      position: { x: 550, y: 300 },
      type: 'vm',
    },
    {
      id: 'vm104',
      data: { vm: architectureData.vms[3] },
      position: { x: 800, y: 300 },
      type: 'vm',
    },

    // External Client - MOVED DOWN
    {
      id: 'client',
      data: { label: 'Cliente Externo\n(Internet)' },
      position: { x: 400, y: 550 },
      type: 'client',
    },
  ];

  const edges: Edge[] = [
    // ============ PROXMOX CONNECTIONS ============
    // Proxmox to Physical Resources
    {
      id: 'proxmox-storage',
      source: 'proxmox',
      target: 'storage-physical',
      animated: true,
      label: 'Passthrough',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 },
      labelStyle: { fill: '#6b7280', fontSize: 11, fontWeight: 600 },
    },
    {
      id: 'proxmox-gpu',
      source: 'proxmox',
      target: 'gpu-physical',
      animated: true,
      label: 'Passthrough',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#f97316', strokeWidth: 2 },
      labelStyle: { fill: '#f97316', fontSize: 11, fontWeight: 600 },
    },

    // Proxmox to NFS Volume
    {
      id: 'proxmox-nfs',
      source: 'proxmox',
      target: 'nfs-volume',
      animated: true,
      label: 'Gestiona',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      labelStyle: { fill: '#3b82f6', fontSize: 11, fontWeight: 600 },
    },

    // ============ STORAGE CONNECTIONS ============
    // TrueNAS to Storage
    {
      id: 'truenas-storage',
      source: 'vm101',
      target: 'storage-physical',
      animated: true,
      label: 'HDD Passthrough',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 },
      labelStyle: { fill: '#6b7280', fontSize: 10 },
    },

    // ============ NFS CONNECTIONS (Central Hub) ============
    // TrueNAS as NFS Server
    {
      id: 'vm101-nfs',
      source: 'vm101',
      target: 'nfs-volume',
      animated: true,
      label: 'NFS Server',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      labelStyle: { fill: '#3b82f6', fontSize: 11, fontWeight: 600 },
    },

    // VM102 to NFS
    {
      id: 'vm102-nfs',
      source: 'vm102',
      target: 'nfs-volume',
      animated: true,
      label: 'NFS Mount',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      labelStyle: { fill: '#3b82f6', fontSize: 10 },
    },

    // VM103 to NFS
    {
      id: 'vm103-nfs',
      source: 'vm103',
      target: 'nfs-volume',
      animated: true,
      label: 'NFS Mount',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      labelStyle: { fill: '#3b82f6', fontSize: 10 },
    },

    // VM104 to NFS
    {
      id: 'vm104-nfs',
      source: 'vm104',
      target: 'nfs-volume',
      animated: true,
      label: 'NFS Mount',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      labelStyle: { fill: '#3b82f6', fontSize: 10 },
    },

    // ============ GPU CONNECTIONS ============
    // GPU to VM103
    {
      id: 'gpu-vm103',
      source: 'gpu-physical',
      target: 'vm103',
      animated: true,
      label: 'GPU Passthrough',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#f97316', strokeWidth: 3 },
      labelStyle: { fill: '#f97316', fontSize: 11, fontWeight: 600 },
    },

    // ============ CLIENT CONNECTIONS ============
    // Client to Proxmox (Internet)
    {
      id: 'client-proxmox',
      source: 'client',
      target: 'proxmox',
      animated: true,
      label: 'Internet',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      labelStyle: { fill: '#10b981', fontSize: 10 },
    },

    // Client to VM102 (Nginx Reverse Proxy)
    {
      id: 'client-vm102',
      source: 'client',
      target: 'vm102',
      animated: true,
      label: 'HTTP/HTTPS',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#10b981', strokeWidth: 3 },
      labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 },
    },

    // ============ SERVICE ROUTING ============
    // VM102 (Nginx) to VM103 (Services)
    {
      id: 'vm102-vm103',
      source: 'vm102',
      target: 'vm103',
      animated: true,
      label: 'Proxy → Jellyfin/Ollama',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#10b981', strokeWidth: 2 },
      labelStyle: { fill: '#10b981', fontSize: 10 },
    },

    // VM102 (Jenkins Master) to VM104 (Agent)
    {
      id: 'vm102-vm104',
      source: 'vm102',
      target: 'vm104',
      animated: true,
      label: 'Jenkins Master',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      labelStyle: { fill: '#8b5cf6', fontSize: 10 },
    },

    // VM104 (Agent) back to VM102
    {
      id: 'vm104-vm102',
      source: 'vm104',
      target: 'vm102',
      animated: true,
      label: 'Build Results',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5,5' },
      labelStyle: { fill: '#8b5cf6', fontSize: 10 },
    },

    // ============ ADDITIONAL CONNECTIONS ============
    // Client to VM103 (Direct access to media)
    {
      id: 'client-vm103',
      source: 'client',
      target: 'vm103',
      animated: true,
      label: 'Jellyfin/Ollama',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
      labelStyle: { fill: '#ec4899', fontSize: 10 },
    },

    // VM102 to VM101 (Data operations)
    {
      id: 'vm102-vm101',
      source: 'vm102',
      target: 'vm101',
      animated: true,
      label: 'Datos',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' },
      labelStyle: { fill: '#6366f1', fontSize: 10 },
    },

    // VM103 to VM101 (Media operations)
    {
      id: 'vm103-vm101',
      source: 'vm103',
      target: 'vm101',
      animated: true,
      label: 'Media',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' },
      labelStyle: { fill: '#6366f1', fontSize: 10 },
    },

    // VM104 to VM101 (Jenkins workspace)
    {
      id: 'vm104-vm101',
      source: 'vm104',
      target: 'vm101',
      animated: true,
      label: 'Workspace',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' },
      labelStyle: { fill: '#6366f1', fontSize: 10 },
    },
  ];

  const [flowNodes, setFlowNodes] = useNodesState(nodes);
  const [flowEdges, setFlowEdges] = useEdgesState(edges);

  const nodeTypes: NodeTypes = {
    vm: VMNode,
    proxmox: ProxmoxNode,
    client: ClientNode,
    'storage-volume': StorageVolumeNode,
    'storage-physical': StorageNode,
    'gpu-physical': GPUNode,
  };

  return (
    <div className="w-full h-full">
      <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes}>
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

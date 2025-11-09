export interface VM {
  id: string;
  name: string;
  vmId: number;
  role: string;
  description: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  hardware: {
    cpu: number;
    ram: number;
    disk: number;
    diskType: string;
    bios: string;
    machineType: string;
  };
  specialHardware?: string[];
  services: string[];
  nfsMounts?: string[];
  ports?: string[];
  color: string;
}

export interface ArchitectureData {
  vms: VM[];
  proxmoxHost: {
    name: string;
    cpu: number;
    ram: number;
    gpu: string;
    storage: string;
  };
}

export const architectureData: ArchitectureData = {
  proxmoxHost: {
    name: 'Proxmox VE',
    cpu: 4,
    ram: 32,
    gpu: 'NVIDIA GTX 1060 6GB (passthrough to VM103)',
    storage: 'HDD array (passthrough to VM101) + SSD for system disks',
  },
  vms: [
    {
      id: 'vm101',
      name: 'TrueNAS',
      vmId: 101,
      role: 'Storage Server (NFS)',
      description: 'Network-attached storage providing NFS exports for all VMs',
      criticality: 'critical',
      hardware: {
        cpu: 2,
        ram: 16,
        disk: 0,
        diskType: 'HDD Passthrough',
        bios: 'UEFI',
        machineType: 'Standard',
      },
      specialHardware: ['HDD Passthrough (raw disk access)'],
      services: ['NFS Server', 'Storage Pools', 'ZFS Snapshots'],
      nfsMounts: [
        '/mnt/nfs/backups (Proxmox host)',
        '/mnt/nfs/media (VM103)',
        '/mnt/nfs/data/$user (VM102)',
        '/mnt/nfs/jenkins (VM104)',
      ],
      color: '#3B82F6',
    },
    {
      id: 'vm102',
      name: 'DockerHost',
      vmId: 102,
      role: 'Production Server',
      description: 'Primary production environment with Docker, Nginx, and Jenkins Master',
      criticality: 'critical',
      hardware: {
        cpu: 2,
        ram: 6,
        disk: 64,
        diskType: 'SSD',
        bios: 'SeaBIOS',
        machineType: 'i440fx',
      },
      services: [
        'Docker Engine',
        'Docker Compose v2',
        'Nginx Reverse Proxy',
        'Jenkins Master',
        'Portainer',
        'Production Stacks A/B/C',
        'Nextcloud',
        'Pulse Service',
      ],
      nfsMounts: ['/mnt/nfs/data/$user (Nextcloud user data)'],
      ports: ['80 (HTTP)', '443 (HTTPS)', '8080 (Portainer)', '8081 (Jenkins)'],
      color: '#10B981',
    },
    {
      id: 'vm103',
      name: 'GPUProduction',
      vmId: 103,
      role: 'GPU Production Server',
      description: 'GPU-accelerated services for media and AI workloads - CRITICAL',
      criticality: 'critical',
      hardware: {
        cpu: 2,
        ram: 10,
        disk: 128,
        diskType: 'SSD',
        bios: 'OVMF (UEFI)',
        machineType: 'q35',
      },
      specialHardware: [
        'NVIDIA GTX 1060 6GB PCIe Passthrough',
        'Requires q35 chipset',
        'Requires OVMF/UEFI BIOS',
      ],
      services: [
        'Docker Engine',
        'Docker Compose v2',
        'NVIDIA Container Toolkit',
        'Jellyfin (Media Server with GPU transcoding)',
        'Ollama (LLM Inference with GPU)',
        'Development Stack (limited resources)',
      ],
      nfsMounts: ['/mnt/nfs/media (Jellyfin media library)'],
      ports: ['8096 (Jellyfin)', '11434 (Ollama)'],
      color: '#F59E0B',
    },
    {
      id: 'vm104',
      name: 'StagingAgent',
      vmId: 104,
      role: 'CI/CD Agent & Development',
      description: 'Jenkins build agent and development/testing environment',
      criticality: 'medium',
      hardware: {
        cpu: 2,
        ram: 6,
        disk: 64,
        diskType: 'SSD',
        bios: 'SeaBIOS',
        machineType: 'i440fx',
      },
      services: [
        'Docker Engine',
        'Docker Compose v2',
        'Jenkins Agent',
        'Docker Registry (optional)',
        'Development/Testing Stacks',
      ],
      nfsMounts: [
        '/mnt/nfs/data (shared artifacts)',
        '/mnt/nfs/jenkins (workspace sync)',
      ],
      ports: ['3000+ (Development apps)', '5000 (Docker Registry)'],
      color: '#8B5CF6',
    },
  ],
};

export const troubleshootingGuides: Record<string, string[]> = {
  vm101: [
    'Check NFS service on TrueNAS: showmount -e TRUENAS_IP',
    'Test mount manually: sudo mount -t nfs TRUENAS_IP:/mnt/pool/docker-data /mnt/test',
    'Check fstab syntax: cat /etc/fstab | grep nfs',
    'Remount all: sudo mount -a',
    'Check logs: sudo dmesg | grep nfs',
  ],
  vm102: [
    'Check container status: docker ps -a',
    'View container logs: docker logs container_name',
    'Check available resources: docker system df',
    'Restart Docker daemon: sudo systemctl restart docker',
    'Check if port is in use: sudo netstat -tulpn | grep :8080',
  ],
  vm103: [
    'Check GPU visibility: lspci | grep -i nvidia',
    'Monitor GPU stats: nvidia-smi',
    'Test GPU in Docker: docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi',
    'Check NVIDIA driver: lsmod | grep nvidia',
    'Reload kernel modules: sudo rmmod nvidia_drm nvidia_modeset nvidia && sudo modprobe nvidia',
  ],
  vm104: [
    'Check Jenkins agent connection: tail -f /home/jenkins/agent/remoting.log',
    'Verify SSH service: sudo systemctl status ssh',
    'Test SSH connection: ssh jenkins@VM104_IP',
    'Check Docker access: sudo -u jenkins docker ps',
    'Verify Java version: java -version',
  ],
};

export const designDecisions: Record<string, string[]> = {
  vm101: [
    'Dedicated storage VM ensures centralized data management and NFS exports',
    'TrueNAS provides enterprise-grade storage with ZFS snapshots and replication',
    '16GB RAM allocated for caching and metadata operations',
    'HDD passthrough provides direct disk access for optimal performance',
    'Serves as single source of truth for all persistent data across infrastructure',
  ],
  vm102: [
    'Primary production environment consolidates Docker, Nginx, and Jenkins Master',
    'Nginx Reverse Proxy routes all external traffic to appropriate services',
    'Jenkins Master orchestrates CI/CD pipeline (lightweight, delegates builds to Agent)',
    '6GB RAM sufficient for production containers + Jenkins Master (~500MB)',
    '2 vCPU cores handle production workloads with acceptable performance',
    'Criticality: CRITICAL - no downtime allowed for production services',
  ],
  vm103: [
    'Dedicated GPU VM isolates GPU-accelerated workloads (Jellyfin, Ollama)',
    'q35 chipset REQUIRED for PCIe passthrough support',
    'OVMF/UEFI BIOS REQUIRED for optimal GPU initialization',
    'GPU cannot be shared between VMs - single assignment only',
    '10GB RAM ensures sufficient memory for GPU workloads + transcoding cache',
    '128GB SSD provides space for transcoding temp files and model caching',
    'Criticality: CRITICAL - Jellyfin and Ollama are production services',
  ],
  vm104: [
    'Separate staging VM isolates development/testing from production',
    'Jenkins Agent executes all build jobs, Docker operations, and tests',
    'Can be restarted without affecting production (Medium criticality)',
    'Ephemeral PR environments created and destroyed per pull request',
    'Shared NFS mounts for artifacts and workspace sync with Jenkins Master',
    'Development containers have strict resource limits to prevent resource hogging',
  ],
};

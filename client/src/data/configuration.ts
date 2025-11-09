export interface ConfigurationSection {
  id: string;
  titleKey: string; // Translation key for title
  descriptionKey: string; // Translation key for description
  contentKey: string; // Translation key for content
  subsections?: ConfigurationSubsection[];
}

export interface ConfigurationSubsection {
  id: string;
  titleKey: string; // Translation key for title
  contentKey: string; // Translation key for content
  code?: string;
  codeLanguage?: string;
}

export const configurationData: ConfigurationSection[] = [
  {
    id: 'physical-infrastructure',
    titleKey: 'techGuide.physical.title',
    descriptionKey: 'techGuide.physical.description',
    contentKey: 'techGuide.physical.content',
    subsections: [
      {
        id: 'cpu-ram',
        titleKey: 'techGuide.physical.cpuRam.title',
        contentKey: 'techGuide.physical.cpuRam.content',
      },
      {
        id: 'gpu-storage',
        titleKey: 'techGuide.physical.gpuStorage.title',
        contentKey: 'techGuide.physical.gpuStorage.content',
      },
      {
        id: 'resource-allocation',
        titleKey: 'techGuide.physical.resourceAllocation.title',
        contentKey: 'techGuide.physical.resourceAllocation.content',
      },
    ],
  },
  {
    id: 'vm-configuration',
    titleKey: 'techGuide.vms.title',
    descriptionKey: 'techGuide.vms.description',
    contentKey: 'techGuide.vms.content',
    subsections: [
      {
        id: 'vm101-truenas',
        titleKey: 'techGuide.vms.vm101.title',
        contentKey: 'techGuide.vms.vm101.content',
        code: `VM ID: 101
CPU: 2 cores
RAM: 16GB
BIOS: UEFI
Special Hardware: HDD passthrough (raw disk access)
QEMU Guest Agent: Enabled

Services:
- NFS Server
- Storage pools for persistent data

NFS Exports:
/mnt/nfs/backups → Proxmox host (backup destination)
/mnt/nfs/media → VM103 (Jellyfin media files)
/mnt/nfs/data/$user → VM102 (Nextcloud user data)
/mnt/nfs/jenkins → VM104 (Jenkins workspace)`,
        codeLanguage: 'bash',
      },
      {
        id: 'vm102-dockerhost',
        titleKey: 'techGuide.vms.vm102.title',
        contentKey: 'techGuide.vms.vm102.content',
        code: `VM ID: 102
CPU: 2 cores
RAM: 6GB
Machine Type: i440fx
BIOS: SeaBIOS
Disk: 64GB SSD
Cache: Write back (with UPS) or Write through (without UPS)
Discard: Enabled (TRIM support)
IO Thread: Enabled

Installed Software:
- Ubuntu Server (latest LTS)
- Docker Engine
- Docker Compose v2
- Portainer (web-based Docker management)
- Jenkins Master (lightweight orchestration)
- Nginx (reverse proxy)

Running Services:
- Production Stack A/B/C
- Nextcloud (user data on NFS)
- Pulse service
- Jenkins Master
- Portainer
- Nginx Reverse Proxy

Docker Network:
networks:
  production:
    driver: bridge
    subnet: 172.20.0.0/24`,
        codeLanguage: 'yaml',
      },
      {
        id: 'vm103-gpuproduction',
        titleKey: 'techGuide.vms.vm103.title',
        contentKey: 'techGuide.vms.vm103.content',
        code: `VM ID: 103
CPU: 2 cores
RAM: 10GB
Machine Type: q35 (REQUIRED for GPU passthrough)
BIOS: OVMF (UEFI) (REQUIRED for GPU passthrough)
Disk: 128GB SSD
Special Hardware: NVIDIA GTX 1060 6GB passthrough

Critical Configuration Requirements:
- Chipset MUST be q35 for PCIe passthrough
- BIOS MUST be OVMF/UEFI for optimal GPU initialization
- EFI disk required (automatically created with OVMF)
- IOMMU must be enabled on Proxmox host
- Proxmox host must blacklist: nouveau, nvidia drivers
- VM boot argument: -cpu host,kvm=off

Installed Software:
- Ubuntu Server with GPU drivers
- Docker Engine
- Docker Compose v2
- NVIDIA Container Toolkit

Running Services (PRODUCTION):
- Jellyfin (Media server with GPU transcoding)
- Ollama (LLM inference with GPU acceleration)
- Development stack (LIMITED RESOURCES)

Storage Mounts:
- NFS mount: /mnt/nfs/media (Jellyfin media library)
- Local SSD cache for transcoding temp files`,
        codeLanguage: 'yaml',
      },
      {
        id: 'vm104-stagingagent',
        titleKey: 'techGuide.vms.vm104.title',
        contentKey: 'techGuide.vms.vm104.content',
        code: `VM ID: 104
CPU: 2 cores
RAM: 6GB
Machine Type: i440fx
BIOS: SeaBIOS
Disk: 64GB SSD

Installed Software:
- Ubuntu Server (latest LTS)
- Docker Engine
- Docker Compose v2
- Jenkins Agent (connected to Master via SSH/JNLP)
- Docker Registry (optional)

Running Services:
- Jenkins Agent (build execution)
- Development/testing Docker stacks
- Ephemeral PR deployment environments
- Docker image builds
- Automated testing pipelines

Docker Network:
networks:
  development:
    driver: bridge
    subnet: 172.21.0.0/24

Storage Mounts:
- Temporary volumes for testing
- NFS mount: /mnt/nfs/data (shared artifacts)
- NFS mount: /mnt/nfs/jenkins (workspace sync)`,
        codeLanguage: 'yaml',
      },
    ],
  },
  {
    id: 'installation-setup',
    titleKey: 'techGuide.installation.title',
    descriptionKey: 'techGuide.installation.description',
    contentKey: 'techGuide.installation.content',
    subsections: [
      {
        id: 'ubuntu-setup',
        titleKey: 'techGuide.installation.ubuntu.title',
        contentKey: 'techGuide.installation.ubuntu.content',
        code: `#!/bin/bash
# Execute on each new Ubuntu VM

# Update system
sudo apt update && sudo apt upgrade -y

# Install QEMU Guest Agent (CRITICAL)
sudo apt install qemu-guest-agent -y
sudo systemctl enable qemu-guest-agent
sudo systemctl start qemu-guest-agent

# Verify agent is running
sudo systemctl status qemu-guest-agent

# Enable TRIM timer for SSD
sudo systemctl enable fstrim.timer
sudo systemctl start fstrim.timer

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose v2 plugin
sudo apt install docker-compose-plugin -y

# Verify Docker installation
docker --version
docker compose version

# Install NFS client
sudo apt install nfs-common -y

# Create NFS mount points
sudo mkdir -p /mnt/nfs/{data,jenkins,media}

# Add NFS mounts to fstab (replace NFS_IP)
echo "NFS_IP:/mnt/pool/docker-data /mnt/nfs/data nfs defaults,_netdev 0 0" | sudo tee -a /etc/fstab
echo "NFS_IP:/mnt/pool/jenkins /mnt/nfs/jenkins nfs defaults,_netdev 0 0" | sudo tee -a /etc/fstab

# Mount NFS shares
sudo mount -a

# Verify mounts
df -h | grep nfs

# Install useful tools
sudo apt install htop ncdu tmux git -y

echo "✓ Base setup completed"
echo "⚠️  Remember to logout and login again for Docker group membership"`,
        codeLanguage: 'bash',
      },
      {
        id: 'gpu-setup',
        titleKey: 'techGuide.installation.gpu.title',
        contentKey: 'techGuide.installation.gpu.content',
        code: `#!/bin/bash
# Additional setup for VM103 after base setup

# Install NVIDIA drivers
sudo apt install nvidia-driver-535 -y  # Or latest stable version

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt update
sudo apt install nvidia-container-toolkit -y

# Configure Docker to use NVIDIA runtime
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Verify GPU is accessible
nvidia-smi

# Test GPU in Docker
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

echo "✓ GPU setup completed"`,
        codeLanguage: 'bash',
      },
      {
        id: 'jenkins-master-setup',
        titleKey: 'techGuide.installation.jenkinsMaster.title',
        contentKey: 'techGuide.installation.jenkinsMaster.content',
        code: `#!/bin/bash
# Install Jenkins Master as Docker container on VM102

mkdir -p ~/jenkins/{home,docker-certs}

# Run Jenkins container
docker run -d \\
  --name jenkins-master \\
  --restart unless-stopped \\
  -p 8080:8080 \\
  -p 50000:50000 \\
  -v ~/jenkins/home:/var/jenkins_home \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/jenkins/docker-certs:/certs/client:ro \\
  -e DOCKER_HOST=tcp://docker:2376 \\
  -e DOCKER_CERT_PATH=/certs/client \\
  -e DOCKER_TLS_VERIFY=1 \\
  jenkins/jenkins:lts-jdk17

# Get initial admin password
docker logs jenkins-master

echo "✓ Jenkins Master running on port 8080"
echo "⚠️  Access at http://VM102_IP:8080 and complete setup wizard"`,
        codeLanguage: 'bash',
      },
      {
        id: 'jenkins-agent-setup',
        titleKey: 'techGuide.installation.jenkinsAgent.title',
        contentKey: 'techGuide.installation.jenkinsAgent.content',
        code: `#!/bin/bash
# Configure VM104 as Jenkins Agent

# Install Java (required for Jenkins agent)
sudo apt install openjdk-17-jre -y

# Create Jenkins agent user
sudo useradd -m -s /bin/bash jenkins
sudo usermod -aG docker jenkins

# Create agent working directory
sudo mkdir -p /home/jenkins/agent
sudo chown jenkins:jenkins /home/jenkins/agent

# Set up SSH key authentication (from Jenkins Master)
# On Jenkins Master, generate key if not exists: ssh-keygen
# Copy public key to agent: ssh-copy-id jenkins@VM104_IP

echo "✓ Jenkins Agent prepared"
echo "⚠️  Configure agent in Jenkins Master UI:"
echo "   - Manage Jenkins → Manage Nodes → New Node"
echo "   - Launch method: Launch agents via SSH"
echo "   - Host: VM104_IP"
echo "   - Credentials: jenkins user SSH key"`,
        codeLanguage: 'bash',
      },
    ],
  },
  {
    id: 'backup-strategy',
    titleKey: 'techGuide.backup.title',
    descriptionKey: 'techGuide.backup.description',
    contentKey: 'techGuide.backup.content',
    subsections: [
      {
        id: 'proxmox-backups',
        titleKey: 'techGuide.backup.proxmox.title',
        contentKey: 'techGuide.backup.proxmox.content',
        code: `# Manual snapshot before major changes
qm snapshot 120 pre-update-$(date +%Y%m%d)
qm snapshot 130 pre-update-$(date +%Y%m%d)
qm snapshot 150 pre-update-$(date +%Y%m%d)

# Manual backup to Proxmox backup storage
vzdump 120 --mode snapshot --storage backup-storage
vzdump 150 --mode snapshot --storage backup-storage

# List snapshots
qm listsnapshot 120

# Rollback if needed
qm rollback 120 pre-update-20241109

# Backup Schedule:
# VM120 (DockerHost): Daily, 7 days retention (production critical)
# VM130 (StagingAgent): Weekly, 4 weeks retention (can be rebuilt)
# VM150 (GPUProduction): Daily, 14 days retention (GPU config complex)
# VM102 (TrueNAS): Weekly config backup only (data has own ZFS snapshots)`,
        codeLanguage: 'bash',
      },
      {
        id: 'docker-backups',
        titleKey: 'techGuide.backup.docker.title',
        contentKey: 'techGuide.backup.docker.content',
        code: `#!/bin/bash
# /usr/local/bin/docker-backup.sh

BACKUP_DIR="/mnt/nfs/backups/docker"
DATE=$(date +%Y%m%d-%H%M%S)
HOSTNAME=$(hostname)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup all named volumes
for volume in $(docker volume ls -q); do
    echo "Backing up volume: $volume"
    docker run --rm \
        -v $volume:/data \
        -v $BACKUP_DIR:/backup \
        alpine \
        tar czf /backup/\${HOSTNAME}-\${volume}-\${DATE}.tar.gz -C /data .
done

# Backup compose files and configs
tar czf $BACKUP_DIR/\${HOSTNAME}-compose-\${DATE}.tar.gz ~/docker-compose*.yml ~/.env

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "\${HOSTNAME}-*.tar.gz" -mtime +30 -delete

echo "✓ Backup completed: $BACKUP_DIR"

# Cron schedule (run daily at 2 AM):
# 0 2 * * * /usr/local/bin/docker-backup.sh >> /var/log/docker-backup.log 2>&1`,
        codeLanguage: 'bash',
      },
      {
        id: 'zfs-snapshots',
        titleKey: 'techGuide.backup.zfs.title',
        contentKey: 'techGuide.backup.zfs.content',
        code: `# Automated ZFS snapshots (configured in TrueNAS UI):
- Hourly snapshots: Keep 24 hours
- Daily snapshots: Keep 7 days
- Weekly snapshots: Keep 4 weeks
- Monthly snapshots: Keep 6 months

# These provide protection against accidental deletion and data corruption`,
        codeLanguage: 'bash',
      },
    ],
  },
  {
    id: 'monitoring-maintenance',
    titleKey: 'techGuide.monitoring.title',
    descriptionKey: 'techGuide.monitoring.description',
    contentKey: 'techGuide.monitoring.content',
    subsections: [
      {
        id: 'proxmox-monitoring',
        titleKey: 'techGuide.monitoring.proxmox.title',
        contentKey: 'techGuide.monitoring.proxmox.content',
        code: `# Check overall resource usage
pvesh get /nodes/proxmox/status

# Check individual VM status
qm list

# Monitor memory pressure (check overcommit)
free -h
cat /proc/meminfo | grep -E 'MemTotal|MemFree|MemAvailable'

# Check CPU usage
top
htop

# Check disk I/O
iostat -x 5

# Check network traffic
iftop

# View VM configurations
qm config 120
qm config 130
qm config 150

# Check QEMU agents
qm agent 120 ping
qm agent 130 ping
qm agent 150 ping

# Get VM IP addresses
qm agent 120 network-get-interfaces`,
        codeLanguage: 'bash',
      },
      {
        id: 'docker-monitoring',
        titleKey: 'techGuide.monitoring.docker.title',
        contentKey: 'techGuide.monitoring.docker.content',
        code: `# Container status
docker ps -a

# Resource usage (live)
docker stats

# Disk usage by Docker
docker system df

# Detailed breakdown
docker system df -v

# Check specific container logs
docker logs -f container_name

# Compose stack status
docker compose ps
docker compose logs -f

# List all volumes
docker volume ls

# Inspect volume usage
docker volume inspect volume_name`,
        codeLanguage: 'bash',
      },
      {
        id: 'gpu-monitoring',
        titleKey: 'techGuide.monitoring.gpu.title',
        contentKey: 'techGuide.monitoring.gpu.content',
        code: `# Real-time GPU stats
nvidia-smi

# Continuous monitoring
watch -n 1 nvidia-smi

# GPU usage by process
nvidia-smi pmon

# Check NVIDIA driver version
nvidia-smi --query-gpu=driver_version --format=csv

# Test GPU in Docker
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi`,
        codeLanguage: 'bash',
      },
      {
        id: 'network-diagnostics',
        titleKey: 'techGuide.monitoring.network.title',
        contentKey: 'techGuide.monitoring.network.content',
        code: `# From Proxmox host - ping VMs
ping 192.168.1.X

# From any VM - check NFS connectivity
showmount -e TRUENAS_IP
df -h | grep nfs

# Test inter-VM connectivity
ping jellyfin-ip  # From VM120 or VM130

# Check Docker networks
docker network ls
docker network inspect production
docker network inspect development

# Test external connectivity
curl -I https://google.com`,
        codeLanguage: 'bash',
      },
    ],
  },
  {
    id: 'troubleshooting-guide',
    titleKey: 'techGuide.troubleshooting.title',
    descriptionKey: 'techGuide.troubleshooting.description',
    contentKey: 'techGuide.troubleshooting.content',
    subsections: [
      {
        id: 'vm-wont-start',
        titleKey: 'techGuide.troubleshooting.vmWontStart.title',
        contentKey: 'techGuide.troubleshooting.vmWontStart.content',
        code: `# Check VM status
qm status 150

# Check for lock files
qm unlock 150

# View full error
journalctl -u pve-cluster -f

# Check QEMU process
ps aux | grep qemu | grep 150`,
        codeLanguage: 'bash',
      },
      {
        id: 'nfs-mount-fails',
        titleKey: 'techGuide.troubleshooting.nfsMountFails.title',
        contentKey: 'techGuide.troubleshooting.nfsMountFails.content',
        code: `# Check NFS service on TrueNAS
showmount -e TRUENAS_IP

# Test mount manually
sudo mount -t nfs TRUENAS_IP:/mnt/pool/docker-data /mnt/test

# Check fstab syntax
cat /etc/fstab | grep nfs

# Remount all
sudo mount -a

# Check logs
sudo dmesg | grep nfs
journalctl -u rpc-statd`,
        codeLanguage: 'bash',
      },
      {
        id: 'docker-container-wont-start',
        titleKey: 'techGuide.troubleshooting.dockerWontStart.title',
        contentKey: 'techGuide.troubleshooting.dockerWontStart.content',
        code: `# Check container logs
docker logs container_name

# Inspect container
docker inspect container_name

# Check available resources
docker system df
df -h

# Check if port is already in use
sudo netstat -tulpn | grep :8080

# Restart Docker daemon
sudo systemctl restart docker

# Remove and recreate container
docker compose down
docker compose up -d`,
        codeLanguage: 'bash',
      },
      {
        id: 'gpu-passthrough-issues',
        titleKey: 'techGuide.troubleshooting.gpuPassthrough.title',
        contentKey: 'techGuide.troubleshooting.gpuPassthrough.content',
        code: `# On Proxmox host - check IOMMU groups
find /sys/kernel/iommu_groups/ -type l

# Verify GPU is in its own group
lspci -nnk | grep -A 3 NVIDIA

# Check if drivers are blacklisted
cat /etc/modprobe.d/blacklist.conf | grep -E 'nouveau|nvidia'

# Verify VM has GPU assigned
qm config 150 | grep hostpci

# Inside VM103 - check if GPU is visible
lspci | grep -i nvidia
nvidia-smi

# Check NVIDIA driver is loaded
lsmod | grep nvidia

# Verify Docker can access GPU
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

# If GPU not working, reload kernel modules
sudo rmmod nvidia_drm nvidia_modeset nvidia
sudo modprobe nvidia

# Check dmesg for GPU errors
dmesg | grep -i nvidia`,
        codeLanguage: 'bash',
      },
      {
        id: 'jenkins-agent-connection',
        titleKey: 'techGuide.troubleshooting.jenkinsAgent.title',
        contentKey: 'techGuide.troubleshooting.jenkinsAgent.content',
        code: `# On VM104 - check if Jenkins user can access Docker
sudo -u jenkins docker ps

# Verify SSH service is running
sudo systemctl status ssh

# Check Jenkins agent log
tail -f /home/jenkins/agent/remoting.log

# On Jenkins Master - test SSH connection
ssh jenkins@VM104_IP

# Check if agent workspace is accessible
ls -la /home/jenkins/agent

# Verify Java version
java -version`,
        codeLanguage: 'bash',
      },
      {
        id: 'out-of-memory',
        titleKey: 'techGuide.troubleshooting.outOfMemory.title',
        contentKey: 'techGuide.troubleshooting.outOfMemory.content',
        code: `# On Proxmox host - check memory pressure
free -h
vmstat 1 10

# Check which VM is using most memory
qm status 120
qm status 130
qm status 150

# Inside problem VM - find memory hogs
ps aux --sort=-%mem | head -20
docker stats --no-stream

# Temporary solution - adjust VM balloon memory
qm set 130 --balloon 4096  # Allow shrinking to 4GB

# Permanent solution - reduce VM allocation or add physical RAM
qm set 130 --memory 5120  # Reduce from 6GB to 5GB`,
        codeLanguage: 'bash',
      },
      {
        id: 'disk-space-issues',
        titleKey: 'techGuide.troubleshooting.diskSpace.title',
        contentKey: 'techGuide.troubleshooting.diskSpace.content',
        code: `# Check disk usage on Proxmox
df -h

# Inside VM - find large files
ncdu /
du -sh /* | sort -rh | head -10

# Clean Docker resources
docker system prune -a --volumes
docker volume prune

# Clean old images
docker image prune -a

# Check Docker disk usage
docker system df -v

# Remove old logs
sudo journalctl --vacuum-time=7d

# Clean apt cache
sudo apt clean
sudo apt autoremove`,
        codeLanguage: 'bash',
      },
      {
        id: 'network-connectivity',
        titleKey: 'techGuide.troubleshooting.networkConnectivity.title',
        contentKey: 'techGuide.troubleshooting.networkConnectivity.content',
        code: `# Check if VM can reach gateway
ping 192.168.1.1

# Check DNS resolution
nslookup google.com
cat /etc/resolv.conf

# Check if Docker networks are healthy
docker network ls
docker network inspect production

# Restart Docker networking
sudo systemctl restart docker

# Recreate Docker networks
docker network rm production
docker network create production --subnet 172.20.0.0/24

# Check firewall rules (if enabled)
sudo ufw status
sudo iptables -L -n`,
        codeLanguage: 'bash',
      },
      {
        id: 'slow-performance',
        titleKey: 'techGuide.troubleshooting.slowPerformance.title',
        contentKey: 'techGuide.troubleshooting.slowPerformance.content',
        code: `# Check CPU usage
top
htop

# Check I/O wait
iostat -x 5

# Check if using swap
free -h
sudo swapon --show

# Check disk latency
sudo iotop

# Inside VM - check Docker overhead
docker stats

# Check if TRIM is working (SSD)
sudo fstrim -v /

# Verify VirtIO drivers are in use
lsmod | grep virtio`,
        codeLanguage: 'bash',
      },
      {
        id: 'reverse-proxy-issues',
        titleKey: 'techGuide.troubleshooting.reverseProxy.title',
        contentKey: 'techGuide.troubleshooting.reverseProxy.content',
        code: `# Check Traefik container status
docker ps | grep traefik
docker logs traefik

# Verify DNS resolves to Proxmox IP
nslookup app.domain.com

# Check if ports are accessible
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Test direct container access (bypass proxy)
curl http://container_ip:port

# Verify Traefik labels on containers
docker inspect container_name | grep traefik

# Check Traefik dashboard (if enabled)
curl http://localhost:8080/dashboard/`,
        codeLanguage: 'bash',
      },
    ],
  },
  {
    id: 'security-considerations',
    titleKey: 'techGuide.security.title',
    descriptionKey: 'techGuide.security.description',
    contentKey: 'techGuide.security.content',
    subsections: [
      {
        id: 'firewall-config',
        titleKey: 'techGuide.security.firewall.title',
        contentKey: 'techGuide.security.firewall.content',
        code: `# Proxmox Host Level:
# Allow SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow Proxmox web interface
iptables -A INPUT -p tcp --dport 8006 -j ACCEPT

# Allow HTTP/HTTPS to VM120
iptables -A FORWARD -d VM120_IP -p tcp --dport 80 -j ACCEPT
iptables -A FORWARD -d VM120_IP -p tcp --dport 443 -j ACCEPT

# Block direct access to VM130 from internet (staging)
iptables -A FORWARD -d VM130_IP -s ! 192.168.1.0/24 -j DROP

# Allow NFS only from local VMs
iptables -A INPUT -s 192.168.1.0/24 -p tcp --dport 2049 -j ACCEPT
iptables -A INPUT -p tcp --dport 2049 -j DROP

# Inside Ubuntu VMs (UFW):
# VM120 (Production)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# VM130 (Staging)
sudo ufw allow from 192.168.1.0/24 to any port 22  # SSH from local only
sudo ufw allow from VM120_IP  # Allow Jenkins Master
sudo ufw enable

# VM150 (GPU)
sudo ufw allow from 192.168.1.0/24  # Only local network access
sudo ufw enable`,
        codeLanguage: 'bash',
      },
      {
        id: 'jenkins-security',
        titleKey: 'techGuide.security.jenkins.title',
        contentKey: 'techGuide.security.jenkins.content',
        code: `# Jenkins Security Best Practices:
- Use SSH keys for agent authentication (not passwords)
- Store secrets in Jenkins Credentials (not in Jenkinsfile)
- Use RBAC (Role-Based Access Control)
- Enable CSRF protection
- Use reverse proxy with HTTPS (Traefik with Let's Encrypt)
- Limit network access to Jenkins (internal only or VPN)

# Example Jenkinsfile with Secrets:
pipeline {
    agent { label 'docker-agent-vm130' }
    
    environment {
        DOCKER_REGISTRY = credentials('docker-registry-creds')
        DB_PASSWORD = credentials('production-db-password')
    }
    
    stages {
        stage('Deploy') {
            steps {
                sh '''
                    docker login -u $DOCKER_REGISTRY_USR -p $DOCKER_REGISTRY_PSW
                    docker compose up -d
                '''
            }
        }
    }
}`,
        codeLanguage: 'groovy',
      },
      {
        id: 'docker-security',
        titleKey: 'techGuide.security.docker.title',
        contentKey: 'techGuide.security.docker.content',
        code: `# Docker Security Best Practices:
- Run containers as non-root user where possible
- Use read-only root filesystems when applicable
- Scan images for vulnerabilities: docker scout cve image_name
- Keep base images updated
- Use multi-stage builds to reduce attack surface
- Don't expose Docker socket unnecessarily
- Use secrets management for sensitive data

# Example Dockerfile with security:
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 3000
CMD ["node", "server.js"]`,
        codeLanguage: 'dockerfile',
      },
      {
        id: 'ssh-hardening',
        titleKey: 'techGuide.security.ssh.title',
        contentKey: 'techGuide.security.ssh.content',
        code: `# On all Ubuntu VMs:

# Disable root login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password authentication (use keys only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Change default SSH port (optional, 22 is fine if firewalled)
# sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart ssh

# Generate SSH key on local machine (if not already done):
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to VM:
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@vm_ip`,
        codeLanguage: 'bash',
      },
    ],
  },
];

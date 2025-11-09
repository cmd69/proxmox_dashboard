import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArchitecture } from '@/contexts/ArchitectureContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, Server, Cpu, HardDrive, Zap, Database, Network, Image as ImageIcon } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { VM, Service } from '@/data/architecture';
import { toast } from 'sonner';

export default function SystemConfig() {
  const { t } = useLanguage();
  const { architecture, updateArchitecture, resetArchitecture } = useArchitecture();
  const [config, setConfig] = useState(architecture);
  const [expandedVMs, setExpandedVMs] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  const handleProxmoxChange = (field: string, value: string | number) => {
    setConfig({
      ...config,
      proxmoxHost: {
        ...config.proxmoxHost,
        [field]: value,
      },
    });
  };

  const handleVMChange = (vmIndex: number, field: string, value: any) => {
    const newVMs = [...config.vms];
    const vm = { ...newVMs[vmIndex] };
    
    // Handle nested hardware fields
    if (field.startsWith('hardware.')) {
      const hardwareField = field.split('.')[1];
      vm.hardware = { ...vm.hardware, [hardwareField]: value };
    } else {
      (vm as any)[field] = value;
    }
    
    newVMs[vmIndex] = vm;
    setConfig({ ...config, vms: newVMs });
  };

  const handleArrayChange = (vmIndex: number, field: string, newArray: string[]) => {
    const newVMs = [...config.vms];
    (newVMs[vmIndex] as any)[field] = newArray;
    setConfig({ ...config, vms: newVMs });
  };

  const handlePortsArrayChange = (vmIndex: number, portType: 'exposed' | 'internal', newArray: string[]) => {
    const newVMs = [...config.vms];
    const vm = { ...newVMs[vmIndex] };
    if (!vm.ports) {
      vm.ports = {};
    }
    vm.ports[portType] = newArray;
    newVMs[vmIndex] = vm;
    setConfig({ ...config, vms: newVMs });
  };

  const addArrayItem = (vmIndex: number, field: string) => {
    const newVMs = [...config.vms];
    const currentArray = (newVMs[vmIndex] as any)[field] || [];
    (newVMs[vmIndex] as any)[field] = [...currentArray, ''];
    setConfig({ ...config, vms: newVMs });
  };

  const addPortItem = (vmIndex: number, portType: 'exposed' | 'internal') => {
    const newVMs = [...config.vms];
    const vm = { ...newVMs[vmIndex] };
    if (!vm.ports) {
      vm.ports = {};
    }
    if (!vm.ports[portType]) {
      vm.ports[portType] = [];
    }
    vm.ports[portType] = [...vm.ports[portType], ''];
    newVMs[vmIndex] = vm;
    setConfig({ ...config, vms: newVMs });
  };

  const removeArrayItem = (vmIndex: number, field: string, itemIndex: number) => {
    const newVMs = [...config.vms];
    const currentArray = (newVMs[vmIndex] as any)[field] || [];
    (newVMs[vmIndex] as any)[field] = currentArray.filter((_: any, i: number) => i !== itemIndex);
    setConfig({ ...config, vms: newVMs });
  };

  const removePortItem = (vmIndex: number, portType: 'exposed' | 'internal', itemIndex: number) => {
    const newVMs = [...config.vms];
    const vm = { ...newVMs[vmIndex] };
    if (vm.ports && vm.ports[portType]) {
      vm.ports[portType] = vm.ports[portType].filter((_: any, i: number) => i !== itemIndex);
      newVMs[vmIndex] = vm;
      setConfig({ ...config, vms: newVMs });
    }
  };

  // Service management functions
  const handleServiceChange = (serviceIndex: number, field: keyof Service, value: string) => {
    const newServices = [...config.services];
    newServices[serviceIndex] = { ...newServices[serviceIndex], [field]: value };
    setConfig({ ...config, services: newServices });
  };

  const addService = () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: 'New Service',
      imageUrl: '',
    };
    setConfig({ ...config, services: [...config.services, newService] });
  };

  const removeService = (serviceIndex: number) => {
    const serviceToRemove = config.services[serviceIndex];
    // Remove service from all VMs that use it
    const newVMs = config.vms.map(vm => ({
      ...vm,
      services: vm.services.filter(id => id !== serviceToRemove.id),
    }));
    setConfig({
      ...config,
      services: config.services.filter((_, i) => i !== serviceIndex),
      vms: newVMs,
    });
  };

  const toggleVMService = (vmIndex: number, serviceId: string) => {
    const newVMs = [...config.vms];
    const vm = { ...newVMs[vmIndex] };
    const serviceIndex = vm.services.indexOf(serviceId);
    if (serviceIndex > -1) {
      vm.services = vm.services.filter(id => id !== serviceId);
    } else {
      vm.services = [...vm.services, serviceId];
    }
    newVMs[vmIndex] = vm;
    setConfig({ ...config, vms: newVMs });
  };

  const addVM = () => {
    const newVM: VM = {
      id: `vm${config.vms.length + 1}`,
      name: 'New VM',
      vmId: config.vms.length + 101,
      role: 'New Role',
      description: 'New virtual machine',
      criticality: 'medium',
      hardware: {
        cpu: 2,
        ram: 4,
        disk: 32,
        diskType: 'SSD',
        bios: 'SeaBIOS',
        machineType: 'i440fx',
      },
      services: [],
      ports: {
        internal: [],
      },
      color: '#6366F1',
    };
    setConfig({ ...config, vms: [...config.vms, newVM] });
  };

  const removeVM = (vmIndex: number) => {
    if (window.confirm(t('sysconfig.vm.confirmRemove'))) {
      const newVMs = config.vms.filter((_, i) => i !== vmIndex);
      setConfig({ ...config, vms: newVMs });
    }
  };

  const handleSave = () => {
    updateArchitecture(config);
    toast.success(t('sysconfig.saved'));
  };

  const handleReset = () => {
    if (window.confirm(t('sysconfig.confirmReset'))) {
      resetArchitecture();
      setConfig(architecture);
      toast.success(t('sysconfig.resetSuccess'));
    }
  };

  const toggleVM = (vmId: string) => {
    setExpandedVMs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vmId)) {
        newSet.delete(vmId);
      } else {
        newSet.add(vmId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('vm.back')}
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('sysconfig.title')}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('sysconfig.subtitle')}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('sysconfig.reset')}
              </Button>
              <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Save className="w-4 h-4" />
                {t('sysconfig.save')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="space-y-8">
          {/* Proxmox Host Configuration */}
          <Card 
            className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div 
              className="cursor-pointer"
              onClick={() => setLocation('/configuration')}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('sysconfig.proxmox')}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="proxmox-name" className="text-base font-semibold mb-2 block">{t('sysconfig.proxmox.name')}</Label>
                <Input
                  id="proxmox-name"
                  className="h-11 text-base"
                  value={config.proxmoxHost.name}
                  onChange={(e) => handleProxmoxChange('name', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <Label htmlFor="proxmox-cpu" className="text-base font-semibold mb-2 block">{t('sysconfig.proxmox.cpu')}</Label>
                <Input
                  id="proxmox-cpu"
                  type="number"
                  className="h-11 text-base"
                  value={config.proxmoxHost.cpu}
                  onChange={(e) => handleProxmoxChange('cpu', parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <Label htmlFor="proxmox-ram" className="text-base font-semibold mb-2 block">{t('sysconfig.proxmox.ram')}</Label>
                <Input
                  id="proxmox-ram"
                  type="number"
                  className="h-11 text-base"
                  value={config.proxmoxHost.ram}
                  onChange={(e) => handleProxmoxChange('ram', parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <Label htmlFor="proxmox-gpu" className="text-base font-semibold mb-2 block">{t('sysconfig.proxmox.gpu')}</Label>
                <Input
                  id="proxmox-gpu"
                  className="h-11 text-base"
                  value={config.proxmoxHost.gpu}
                  onChange={(e) => handleProxmoxChange('gpu', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="proxmox-storage" className="text-base font-semibold mb-2 block">{t('sysconfig.proxmox.storage')}</Label>
                <Input
                  id="proxmox-storage"
                  className="h-11 text-base"
                  value={config.proxmoxHost.storage}
                  onChange={(e) => handleProxmoxChange('storage', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </Card>

          {/* Global Services Configuration */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('sysconfig.services.title')}</h2>
              </div>
              <Button onClick={addService} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('sysconfig.services.add')}
              </Button>
            </div>
            <div className="space-y-4">
              {config.services.map((service, serviceIndex) => (
                <Card key={service.id} className="p-4 border border-green-200 dark:border-green-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">{t('sysconfig.services.name')}</Label>
                      <Input
                        className="h-11 text-base"
                        value={service.name}
                        onChange={(e) => handleServiceChange(serviceIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold mb-2 block">{t('sysconfig.services.imageUrl')}</Label>
                      <Input
                        className="h-11 text-base"
                        value={service.imageUrl || ''}
                        onChange={(e) => handleServiceChange(serviceIndex, 'imageUrl', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(t('sysconfig.services.confirmRemove'))) {
                            removeService(serviceIndex);
                          }
                        }}
                        className="gap-2 w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('sysconfig.services.remove')}
                      </Button>
                    </div>
                  </div>
                  {service.imageUrl && (
                    <div className="mt-4 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>

          {/* Virtual Machines Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('sysconfig.vms')}</h2>
              <Button onClick={addVM} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('sysconfig.vm.add')}
              </Button>
            </div>

            {config.vms.map((vm, vmIndex) => {
              const isExpanded = expandedVMs.has(vm.id);
              return (
                <Card 
                  key={vm.id} 
                  className="overflow-hidden shadow-lg transition-all duration-200 hover:shadow-xl"
                  style={{
                    borderLeft: `4px solid ${vm.color}`,
                    borderTop: `1px solid ${vm.color}40`,
                    borderRight: `1px solid ${vm.color}40`,
                    borderBottom: `1px solid ${vm.color}40`,
                  }}
                >
                  {/* Header con botón de expandir/colapsar */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => toggleVM(vm.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg shadow-md"
                          style={{ backgroundColor: `${vm.color}20` }}
                        >
                          <Server className="w-5 h-5" style={{ color: vm.color }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {vm.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            VM{vm.vmId} • {vm.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVM(vm.id);
                          }}
                          className="gap-2"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              {t('sysconfig.collapse')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              {t('sysconfig.expand')}
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVM(vmIndex);
                          }} 
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('sysconfig.vm.remove')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {isExpanded && (
                    <div className="p-6 pt-0 space-y-6 border-t border-gray-200 dark:border-gray-700 mt-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.name')}</Label>
                      <Input
                        className="h-11 text-base"
                        value={vm.name}
                        onChange={(e) => handleVMChange(vmIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.id')}</Label>
                      <Input
                        type="number"
                        className="h-11 text-base"
                        value={vm.vmId}
                        onChange={(e) => handleVMChange(vmIndex, 'vmId', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.color')}</Label>
                      <Input
                        type="color"
                        className="h-11 w-full"
                        value={vm.color}
                        onChange={(e) => handleVMChange(vmIndex, 'color', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.role')}</Label>
                    <Input
                      className="h-11 text-base"
                      value={vm.role}
                      onChange={(e) => handleVMChange(vmIndex, 'role', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.description')}</Label>
                    <Textarea
                      className="text-base min-h-[100px]"
                      value={vm.description}
                      onChange={(e) => handleVMChange(vmIndex, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.criticality')}</Label>
                    <Select
                      value={vm.criticality}
                      onValueChange={(value) => handleVMChange(vmIndex, 'criticality', value)}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">{t('sysconfig.criticality.critical')}</SelectItem>
                        <SelectItem value="high">{t('sysconfig.criticality.high')}</SelectItem>
                        <SelectItem value="medium">{t('sysconfig.criticality.medium')}</SelectItem>
                        <SelectItem value="low">{t('sysconfig.criticality.low')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hardware Configuration */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Cpu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('vm.hardware')}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.cpu')}</Label>
                        <Input
                          type="number"
                          className="h-11 text-base"
                          value={vm.hardware.cpu}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.cpu', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.ram')}</Label>
                        <Input
                          type="number"
                          className="h-11 text-base"
                          value={vm.hardware.ram}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.ram', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.disk')}</Label>
                        <Input
                          type="number"
                          className="h-11 text-base"
                          value={vm.hardware.disk}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.disk', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.diskType')}</Label>
                        <Input
                          className="h-11 text-base"
                          value={vm.hardware.diskType}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.diskType', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.bios')}</Label>
                        <Input
                          className="h-11 text-base"
                          value={vm.hardware.bios}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.bios', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-base font-semibold mb-2 block">{t('sysconfig.vm.machineType')}</Label>
                        <Input
                          className="h-11 text-base"
                          value={vm.hardware.machineType}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.machineType', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <Label className="text-base font-semibold">{t('sysconfig.vm.services')}</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {config.services.map((service) => {
                        const isSelected = vm.services.includes(service.id);
                        return (
                          <div
                            key={service.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800'
                            }`}
                            onClick={() => toggleVMService(vmIndex, service.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleVMService(vmIndex, service.id)}
                              className="w-4 h-4"
                            />
                            {service.imageUrl && (
                              <img
                                src={service.imageUrl}
                                alt={service.name}
                                className="h-6 w-6 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <Label className="cursor-pointer flex-1">{service.name}</Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Software & Technologies */}
                  <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <Label className="text-base font-semibold">{t('sysconfig.vm.software')}</Label>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addArrayItem(vmIndex, 'software')}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t('sysconfig.addItem')}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(vm.software || []).map((tech, techIndex) => (
                        <div key={techIndex} className="flex gap-2">
                          <Input
                            className="h-11 text-base"
                            value={tech}
                            onChange={(e) => {
                              const newSoftware = [...(vm.software || [])];
                              newSoftware[techIndex] = e.target.value;
                              handleArrayChange(vmIndex, 'software', newSoftware);
                            }}
                            placeholder={t('sysconfig.softwarePlaceholder')}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArrayItem(vmIndex, 'software', techIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Hardware */}
                  {vm.specialHardware && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">{t('sysconfig.vm.specialHardware')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addArrayItem(vmIndex, 'specialHardware')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {vm.specialHardware.map((hw, hwIndex) => (
                          <div key={hwIndex} className="flex gap-2">
                            <Input
                              className="h-11 text-base"
                              value={hw}
                              onChange={(e) => {
                                const newHw = [...(vm.specialHardware || [])];
                                newHw[hwIndex] = e.target.value;
                                handleArrayChange(vmIndex, 'specialHardware', newHw);
                              }}
                              placeholder={t('sysconfig.itemPlaceholder')}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeArrayItem(vmIndex, 'specialHardware', hwIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NFS Mounts */}
                  {vm.nfsMounts && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">{t('sysconfig.vm.nfsMounts')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addArrayItem(vmIndex, 'nfsMounts')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {vm.nfsMounts.map((mount, mountIndex) => (
                          <div key={mountIndex} className="flex gap-2">
                            <Input
                              className="h-11 text-base"
                              value={mount}
                              onChange={(e) => {
                                const newMounts = [...(vm.nfsMounts || [])];
                                newMounts[mountIndex] = e.target.value;
                                handleArrayChange(vmIndex, 'nfsMounts', newMounts);
                              }}
                              placeholder={t('sysconfig.itemPlaceholder')}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeArrayItem(vmIndex, 'nfsMounts', mountIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ports */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <Label className="text-base font-semibold">{t('sysconfig.vm.ports')}</Label>
                    </div>
                    
                    {/* Exposed Ports */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium text-cyan-700 dark:text-cyan-400">{t('sysconfig.vm.portsExposed')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addPortItem(vmIndex, 'exposed')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(vm.ports?.exposed || []).map((port, portIndex) => (
                          <div key={portIndex} className="flex gap-2">
                            <Input
                              className="h-11 text-base"
                              value={port}
                              onChange={(e) => {
                                const newPorts = [...(vm.ports?.exposed || [])];
                                newPorts[portIndex] = e.target.value;
                                handlePortsArrayChange(vmIndex, 'exposed', newPorts);
                              }}
                              placeholder={t('sysconfig.portPlaceholder')}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removePortItem(vmIndex, 'exposed', portIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Internal Ports */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium text-cyan-700 dark:text-cyan-400">{t('sysconfig.vm.portsInternal')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addPortItem(vmIndex, 'internal')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(vm.ports?.internal || []).map((port, portIndex) => (
                          <div key={portIndex} className="flex gap-2">
                            <Input
                              className="h-11 text-base"
                              value={port}
                              onChange={(e) => {
                                const newPorts = [...(vm.ports?.internal || [])];
                                newPorts[portIndex] = e.target.value;
                                handlePortsArrayChange(vmIndex, 'internal', newPorts);
                              }}
                              placeholder={t('sysconfig.portPlaceholder')}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removePortItem(vmIndex, 'internal', portIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
}


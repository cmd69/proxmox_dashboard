import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArchitecture } from '@/contexts/ArchitectureContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { VM } from '@/data/architecture';
import { toast } from 'sonner';

export default function SystemConfig() {
  const { t } = useLanguage();
  const { architecture, updateArchitecture, resetArchitecture } = useArchitecture();
  const [config, setConfig] = useState(architecture);

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

  const addArrayItem = (vmIndex: number, field: string) => {
    const newVMs = [...config.vms];
    const currentArray = (newVMs[vmIndex] as any)[field] || [];
    (newVMs[vmIndex] as any)[field] = [...currentArray, ''];
    setConfig({ ...config, vms: newVMs });
  };

  const removeArrayItem = (vmIndex: number, field: string, itemIndex: number) => {
    const newVMs = [...config.vms];
    const currentArray = (newVMs[vmIndex] as any)[field] || [];
    (newVMs[vmIndex] as any)[field] = currentArray.filter((_: any, i: number) => i !== itemIndex);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('vm.back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sysconfig.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('sysconfig.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('sysconfig.reset')}
              </Button>
              <Button onClick={handleSave} className="gap-2">
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
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('sysconfig.proxmox')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proxmox-name">{t('sysconfig.proxmox.name')}</Label>
                <Input
                  id="proxmox-name"
                  value={config.proxmoxHost.name}
                  onChange={(e) => handleProxmoxChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="proxmox-cpu">{t('sysconfig.proxmox.cpu')}</Label>
                <Input
                  id="proxmox-cpu"
                  type="number"
                  value={config.proxmoxHost.cpu}
                  onChange={(e) => handleProxmoxChange('cpu', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="proxmox-ram">{t('sysconfig.proxmox.ram')}</Label>
                <Input
                  id="proxmox-ram"
                  type="number"
                  value={config.proxmoxHost.ram}
                  onChange={(e) => handleProxmoxChange('ram', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="proxmox-gpu">{t('sysconfig.proxmox.gpu')}</Label>
                <Input
                  id="proxmox-gpu"
                  value={config.proxmoxHost.gpu}
                  onChange={(e) => handleProxmoxChange('gpu', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="proxmox-storage">{t('sysconfig.proxmox.storage')}</Label>
                <Input
                  id="proxmox-storage"
                  value={config.proxmoxHost.storage}
                  onChange={(e) => handleProxmoxChange('storage', e.target.value)}
                />
              </div>
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

            {config.vms.map((vm, vmIndex) => (
              <Card key={vm.id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {vm.name} (VM{vm.vmId})
                  </h3>
                  <Button variant="destructive" size="sm" onClick={() => removeVM(vmIndex)} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    {t('sysconfig.vm.remove')}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>{t('sysconfig.vm.name')}</Label>
                      <Input
                        value={vm.name}
                        onChange={(e) => handleVMChange(vmIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{t('sysconfig.vm.id')}</Label>
                      <Input
                        type="number"
                        value={vm.vmId}
                        onChange={(e) => handleVMChange(vmIndex, 'vmId', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>{t('sysconfig.vm.color')}</Label>
                      <Input
                        type="color"
                        value={vm.color}
                        onChange={(e) => handleVMChange(vmIndex, 'color', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t('sysconfig.vm.role')}</Label>
                    <Input
                      value={vm.role}
                      onChange={(e) => handleVMChange(vmIndex, 'role', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>{t('sysconfig.vm.description')}</Label>
                    <Textarea
                      value={vm.description}
                      onChange={(e) => handleVMChange(vmIndex, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>{t('sysconfig.vm.criticality')}</Label>
                    <Select
                      value={vm.criticality}
                      onValueChange={(value) => handleVMChange(vmIndex, 'criticality', value)}
                    >
                      <SelectTrigger>
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
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('vm.hardware')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label>{t('sysconfig.vm.cpu')}</Label>
                        <Input
                          type="number"
                          value={vm.hardware.cpu}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.cpu', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>{t('sysconfig.vm.ram')}</Label>
                        <Input
                          type="number"
                          value={vm.hardware.ram}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.ram', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>{t('sysconfig.vm.disk')}</Label>
                        <Input
                          type="number"
                          value={vm.hardware.disk}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.disk', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>{t('sysconfig.vm.diskType')}</Label>
                        <Input
                          value={vm.hardware.diskType}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.diskType', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>{t('sysconfig.vm.bios')}</Label>
                        <Input
                          value={vm.hardware.bios}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.bios', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>{t('sysconfig.vm.machineType')}</Label>
                        <Input
                          value={vm.hardware.machineType}
                          onChange={(e) => handleVMChange(vmIndex, 'hardware.machineType', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{t('sysconfig.vm.services')}</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addArrayItem(vmIndex, 'services')}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t('sysconfig.addItem')}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {vm.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="flex gap-2">
                          <Input
                            value={service}
                            onChange={(e) => {
                              const newServices = [...vm.services];
                              newServices[serviceIndex] = e.target.value;
                              handleArrayChange(vmIndex, 'services', newServices);
                            }}
                            placeholder={t('sysconfig.itemPlaceholder')}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArrayItem(vmIndex, 'services', serviceIndex)}
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
                      <div className="flex items-center justify-between mb-2">
                        <Label>{t('sysconfig.vm.specialHardware')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addArrayItem(vmIndex, 'specialHardware')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {vm.specialHardware.map((hw, hwIndex) => (
                          <div key={hwIndex} className="flex gap-2">
                            <Input
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
                      <div className="flex items-center justify-between mb-2">
                        <Label>{t('sysconfig.vm.nfsMounts')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addArrayItem(vmIndex, 'nfsMounts')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {vm.nfsMounts.map((mount, mountIndex) => (
                          <div key={mountIndex} className="flex gap-2">
                            <Input
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
                  {vm.ports && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>{t('sysconfig.vm.ports')}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addArrayItem(vmIndex, 'ports')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('sysconfig.addItem')}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {vm.ports.map((port, portIndex) => (
                          <div key={portIndex} className="flex gap-2">
                            <Input
                              value={port}
                              onChange={(e) => {
                                const newPorts = [...(vm.ports || [])];
                                newPorts[portIndex] = e.target.value;
                                handleArrayChange(vmIndex, 'ports', newPorts);
                              }}
                              placeholder={t('sysconfig.itemPlaceholder')}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeArrayItem(vmIndex, 'ports', portIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
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


import { useMemo } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowLeft, Server, HardDrive, Zap, Shield, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArchitecture } from '@/contexts/ArchitectureContext';

export default function About() {
  const { t } = useLanguage();
  const { architecture } = useArchitecture();

  // Calculate resource allocation dynamically
  const resourceStats = useMemo(() => {
    const totalCPU = architecture.vms.reduce((sum, vm) => sum + vm.hardware.cpu, 0);
    const totalRAM = architecture.vms.reduce((sum, vm) => sum + vm.hardware.ram, 0);
    const cpuOvercommit = totalCPU / architecture.proxmoxHost.cpu;
    const ramOvercommit = totalRAM - architecture.proxmoxHost.ram;
    
    return {
      physicalCPU: architecture.proxmoxHost.cpu,
      physicalRAM: architecture.proxmoxHost.ram,
      assignedCPU: totalCPU,
      assignedRAM: totalRAM,
      cpuRatio: cpuOvercommit.toFixed(1),
      ramOvercommit: ramOvercommit,
    };
  }, [architecture]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Back Button */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-blue-100 dark:hover:bg-blue-900">
              <ArrowLeft className="w-4 h-4" />
              {t('about.back')}
            </Button>
          </Link>
        </div>

        {/* Title with Icon */}
        <div className="relative">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
          <div className="pl-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {t('about.title')}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('about.subtitle')}
            </p>
          </div>
        </div>

        {/* Overview */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
            <Server className="w-6 h-6" />
            {t('about.overview.title')}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {t('about.overview.intro')} <strong>{t('about.overview.proxmox')}</strong>, {t('about.overview.description')}
            </p>
            <p>
              {t('about.overview.features')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('about.overview.storage')}</li>
              <li>{t('about.overview.production')}</li>
              <li>{t('about.overview.gpu')}</li>
              <li>{t('about.overview.cicd')}</li>
            </ul>
          </div>
        </Card>

        {/* Hardware */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50">
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-4 flex items-center gap-2">
            <HardDrive className="w-6 h-6" />
            {t('about.hardware.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-100/60 dark:bg-emerald-900/40 p-4 rounded-lg border border-emerald-300/50 dark:border-emerald-700/50">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">{t('about.hardware.cpu')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{resourceStats.physicalCPU} {t('about.hardware.cpuValue')}</p>
            </div>
            <div className="bg-emerald-100/60 dark:bg-emerald-900/40 p-4 rounded-lg border border-emerald-300/50 dark:border-emerald-700/50">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">{t('about.hardware.ram')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{resourceStats.physicalRAM} {t('about.hardware.ramValue')}</p>
            </div>
            <div className="bg-emerald-100/60 dark:bg-emerald-900/40 p-4 rounded-lg border border-emerald-300/50 dark:border-emerald-700/50">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">{t('about.hardware.gpu')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t('about.hardware.gpuValue')}</p>
            </div>
            <div className="bg-emerald-100/60 dark:bg-emerald-900/40 p-4 rounded-lg border border-emerald-300/50 dark:border-emerald-700/50">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">{t('about.hardware.storage')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t('about.hardware.storageValue')}</p>
            </div>
          </div>
        </Card>

        {/* Resource Allocation */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            {t('about.resources.title')}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {t('about.resources.description')}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{t('about.resources.cpu')}</p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('about.resources.cpuDesc')} <strong>{resourceStats.assignedCPU} vCPU</strong> {t('about.resources.on')} <strong>{resourceStats.physicalCPU}</strong> {t('about.resources.physical')} ({resourceStats.cpuRatio}:1 {t('about.resources.ratio')})
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <p className="font-semibold text-amber-900 dark:text-amber-300 mb-2">{t('about.resources.ram')}</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {t('about.resources.ramDesc')} <strong>{resourceStats.assignedRAM} GB</strong> {t('about.resources.on')} <strong>{resourceStats.physicalRAM} GB</strong> {t('about.resources.physical')} ({resourceStats.ramOvercommit > 0 ? '+' : ''}{resourceStats.ramOvercommit} GB {t('about.resources.overcommit')})
              </p>
            </div>
          </div>
        </Card>

        {/* Key Concepts */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/50">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            {t('about.concepts.title')}
          </h2>
          <div className="space-y-4">
            <div className="bg-blue-100/50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300/50 dark:border-blue-700/50">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">NFS (Network File System)</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Protocolo que permite compartir almacenamiento entre máquinas. TrueNAS (VM101) actúa como
                servidor NFS, proporcionando almacenamiento compartido a todas las demás VMs.
              </p>
            </div>
            <div className="bg-blue-100/50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300/50 dark:border-blue-700/50">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Docker & Containers</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Tecnología de containerización que permite empaquetar aplicaciones con sus dependencias.
                Utilizado en VM102, VM103 y VM104 para ejecutar servicios aislados.
              </p>
            </div>
            <div className="bg-blue-100/50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300/50 dark:border-blue-700/50">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Jenkins CI/CD</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Sistema de automatización que orquesta pipelines de construcción, prueba y despliegue.
                Jenkins Master (VM102) coordina con Jenkins Agent (VM104).
              </p>
            </div>
            <div className="bg-blue-100/50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300/50 dark:border-blue-700/50">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">GPU Passthrough</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Técnica que permite que una VM acceda directamente a un dispositivo GPU físico. Requiere
                configuración especial (q35 chipset, OVMF BIOS, IOMMU habilitado).
              </p>
            </div>
          </div>
        </Card>

        {/* Best Practices */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('about.practices.title')}</h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 dark:text-green-300 font-bold">✓</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('about.practices.monitor')} <code className="bg-gray-200 dark:bg-slate-800 px-1 rounded">free -h</code> {t('about.practices.monitorDesc')}
              </p>
            </div>
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 dark:text-green-300 font-bold">✓</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('about.practices.backup')}
              </p>
            </div>
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 dark:text-green-300 font-bold">✓</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('about.practices.snapshots')}
              </p>
            </div>
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 dark:text-green-300 font-bold">✓</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('about.practices.separate')}
              </p>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('about.explore.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('about.explore.description')}
          </p>
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('about.explore.button')}
            </Button>
          </Link>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
}

import { useParams, Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowLeft, HardDrive, Cpu, MemoryStick, Zap, AlertCircle, Server, Network } from 'lucide-react';
import { troubleshootingGuides, designDecisions } from '@/data/architecture';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArchitecture } from '@/contexts/ArchitectureContext';

export default function VMDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { architecture } = useArchitecture();

  // Find the VM by ID
  const vm = architecture.vms.find((v) => v.id === id);

  if (!vm) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-8 text-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-300 dark:border-red-700">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('vm.notFound')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t('vm.notFoundDesc').replace('${id}', `"${id}"`)}</p>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700">{t('vm.notFoundButton')}</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const troubleshooting = troubleshootingGuides[id] || [];
  const decisions = designDecisions[id] || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Back Button */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-blue-100 dark:hover:bg-blue-900">
              <ArrowLeft className="w-4 h-4" />
              {t('vm.back')}
            </Button>
          </Link>
        </div>

        {/* Title Section with Icon */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${vm.color}20`, borderLeft: `4px solid ${vm.color}` }}>
              <Server className="w-8 h-8" style={{ color: vm.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{vm.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">VM{vm.vmId}</p>
            </div>
          </div>
          <Badge
            variant={
              vm.criticality === 'critical'
                ? 'destructive'
                : vm.criticality === 'high'
                  ? 'secondary'
                  : 'outline'
            }
            className="text-base px-4 py-2 font-semibold"
          >
            {vm.criticality.toUpperCase()}
          </Badge>
        </div>

        {/* Overview with gradient */}
        <Card className="p-6 border-l-4 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800" style={{ borderLeftColor: vm.color }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: vm.color }}>{vm.role}</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg">{vm.description}</p>
        </Card>

        {/* Hardware Configuration */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700/50">
          <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            {t('vm.hardware')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600/50">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-sm font-medium">{t('vm.hardware.cpu')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vm.hardware.cpu}</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">{t('vm.hardware.cores')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg border-2 border-green-300 dark:border-green-600/50">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                <MemoryStick className="w-4 h-4" />
                <span className="text-sm font-medium">{t('vm.hardware.ram')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vm.hardware.ram}</p>
              <p className="text-xs text-green-600 dark:text-green-300">GB</p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600/50">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">{t('vm.hardware.disk')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vm.hardware.disk || 'N/A'}</p>
              <p className="text-xs text-purple-600 dark:text-purple-300">{vm.hardware.diskType}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600/50">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">{t('vm.hardware.bios')}</div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{vm.hardware.bios}</p>
            </div>

            <div className="bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 p-4 rounded-lg border-2 border-teal-300 dark:border-teal-600/50">
              <div className="text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">{t('vm.hardware.machine')}</div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{vm.hardware.machineType}</p>
            </div>
          </div>

          {vm.specialHardware && vm.specialHardware.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {t('vm.hardware.special')}
              </h3>
              <ul className="space-y-1">
                {vm.specialHardware.map((hw, idx) => (
                  <li key={idx} className="text-sm text-amber-800 dark:text-amber-300">
                    • {hw}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Services - Apps Disponibles */}
        {vm.services && vm.services.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-700/50">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4 flex items-center gap-1">
              <Server className="w-5 h-5" />
              {t('vm.services')}
            </h2>
            <p className="text-sm text-green-800 dark:text-green-300 mb-3">{t('vm.servicesDesc')}</p>
            <div className="flex flex-wrap gap-1">
              {vm.services.map((serviceId, idx) => {
                const service = architecture.services.find(s => s.id === serviceId);
                if (!service) return null;
                return (
                  <Badge key={idx} className="bg-green-600 hover:bg-green-700 text-white border-green-700 text-sm px-3 py-1 flex items-center gap-1.5">
                    {service.imageUrl && (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="h-4 w-4 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {service.name}
                  </Badge>
                );
              })}
            </div>
          </Card>
        )}

        {/* Software - Tecnologías */}
        {vm.software && vm.software.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-300 dark:border-slate-700/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-300 mb-4 flex items-center gap-1">
              <Zap className="w-5 h-5" />
              {t('vm.software')}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-400 mb-3">{t('vm.softwareDesc')}</p>
            <div className="flex flex-wrap gap-1">
              {vm.software.map((tech, idx) => (
                <Badge key={idx} variant="outline" className="border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm px-2 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* NFS Mounts */}
        {vm.nfsMounts && vm.nfsMounts.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200 dark:border-cyan-700/50">
            <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-300 mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" />
              {t('vm.nfs')}
            </h2>
            <div className="space-y-2">
              {vm.nfsMounts.map((mount, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                  <div className="text-blue-600 dark:text-blue-300 mt-1 font-bold text-lg">→</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{mount}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Ports */}
        {vm.ports && ((vm.ports.exposed && vm.ports.exposed.length > 0) || (vm.ports.internal && vm.ports.internal.length > 0)) && (
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200 dark:border-cyan-700/50">
            <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-300 mb-4 flex items-center gap-1">
              <Network className="w-5 h-5" />
              {t('vm.ports')}
            </h2>
            
            {/* Exposed Ports */}
            {vm.ports.exposed && vm.ports.exposed.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 mb-2">{t('vm.portsExposed')}</h3>
                <div className="space-y-2">
                  {vm.ports.exposed.map((port, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg border-l-4 border-cyan-500 dark:border-cyan-400">
                      <div className="text-cyan-600 dark:text-cyan-300 mt-1 font-bold text-lg">🌐</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{port}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Ports */}
            {vm.ports.internal && vm.ports.internal.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 mb-2">{t('vm.portsInternal')}</h3>
                <div className="space-y-2">
                  {vm.ports.internal.map((port, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                      <div className="text-blue-600 dark:text-blue-300 mt-1 font-bold text-lg">🔒</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{port}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Design Decisions */}
        {decisions.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-2 border-violet-200 dark:border-violet-700/50">
            <h2 className="text-xl font-bold text-violet-900 dark:text-violet-300 mb-4">{t('vm.design')}</h2>
            <div className="space-y-3">
              {decisions.map((decision, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400">
                  <div className="text-indigo-600 dark:text-indigo-300 font-bold text-lg mt-0.5 min-w-[24px]">{idx + 1}.</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{decision}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Troubleshooting */}
        {troubleshooting.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-l-red-500 border-2 border-red-200 dark:border-red-700/50">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
              {t('vm.troubleshooting')}
            </h2>
            <div className="space-y-3">
              {troubleshooting.map((guide, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg border-l-4 border-red-500 dark:border-red-400">
                  <div className="text-red-600 dark:text-red-300 font-bold text-lg mt-0.5 min-w-[24px]">{idx + 1}.</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{guide}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
}

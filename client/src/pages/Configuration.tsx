import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Check, BookOpen, Code2, Settings2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArchitecture } from '@/contexts/ArchitectureContext';
import { configurationData } from '@/data/configuration';

export default function Configuration() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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


  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const scrollToSection = (id: string) => {
    // Cerrar todas las secciones y abrir solo la seleccionada
    setExpandedSections(new Set([id]));
    
    // Hacer scroll a la sección
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Pequeño delay para que se expanda primero
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Back Button */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-blue-100 dark:hover:bg-blue-900">
              <ArrowLeft className="w-4 h-4" />
              {t('config.back')}
            </Button>
          </Link>
        </div>

        {/* Title with Icon */}
        <div className="relative">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <div className="pl-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <Settings2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('config.title')}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('config.subtitle')}
            </p>
          </div>
        </div>

        {/* Resource Summary */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300">{t('configGuide.resources.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('configGuide.resources.cpu')}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('configGuide.resources.physical')}: <span className="font-bold">{resourceStats.physicalCPU}</span> {t('configGuide.resources.cores')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('configGuide.resources.assigned')}: <span className="font-bold">{resourceStats.assignedCPU}</span> vCPU
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('configGuide.resources.ratio')}: <span className="font-bold text-blue-600 dark:text-blue-400">{resourceStats.cpuRatio}:1</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('configGuide.resources.ram')}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('configGuide.resources.physical')}: <span className="font-bold">{resourceStats.physicalRAM}</span> GB
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('configGuide.resources.assigned')}: <span className="font-bold">{resourceStats.assignedRAM}</span> GB
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('configGuide.resources.overcommit')}: 
                <span className={`font-bold ml-1 ${resourceStats.ramOvercommit > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  {resourceStats.ramOvercommit > 0 ? '+' : ''}{resourceStats.ramOvercommit} GB
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* VMs Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('configGuide.vms.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architecture.vms.map((vm) => (
              <div 
                key={vm.id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800/50 dark:to-slate-900/50 p-4 rounded-lg border-2"
                style={{ borderColor: vm.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{vm.name}</h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">VM{vm.vmId}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{vm.role}</p>
                <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{vm.hardware.cpu} {t('diagram.cpu')}</span>
                  <span>{vm.hardware.ram} GB {t('diagram.ram')}</span>
                  <span>{vm.hardware.disk} GB</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Table of Contents */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300">{t('config.toc')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {configurationData.map((section, index) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-left text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1 rounded transition-colors text-sm font-medium leading-tight"
              >
                {index + 1}. {t(section.titleKey)}
              </button>
            ))}
          </div>
        </Card>

        {/* Configuration Sections */}
        <div className="space-y-6">
          {configurationData.map((section, index) => {
            const colors = [
              {
                border: 'border-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: 'text-blue-900 dark:text-blue-300',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                border: 'border-purple-500',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                text: 'text-purple-900 dark:text-purple-300',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                border: 'border-green-500',
                bg: 'bg-green-50 dark:bg-green-900/20',
                text: 'text-green-900 dark:text-green-300',
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                border: 'border-orange-500',
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                text: 'text-orange-900 dark:text-orange-300',
                gradient: 'from-orange-500 to-amber-500',
              },
              {
                border: 'border-red-500',
                bg: 'bg-red-50 dark:bg-red-900/20',
                text: 'text-red-900 dark:text-red-300',
                gradient: 'from-red-500 to-rose-500',
              },
            ];
            const colorTheme = colors[index % colors.length];

            return (
              <div key={section.id} id={section.id} className="scroll-mt-20">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full text-left"
                >
                  <Card className={`p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 ${colorTheme.border} ${colorTheme.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className={`text-2xl font-bold mb-2 ${colorTheme.text}`}>
                          {t(section.titleKey)}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {t(section.descriptionKey)}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t(section.contentKey)}
                        </p>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className={`w-6 h-6 flex-shrink-0 mt-1 ${colorTheme.text}`} />
                      ) : (
                        <ChevronDown className={`w-6 h-6 flex-shrink-0 mt-1 ${colorTheme.text}`} />
                      )}
                    </div>
                  </Card>
                </button>

                {expandedSections.has(section.id) && section.subsections && (
                  <div className="mt-4 space-y-4 ml-4 border-l-2 border-gray-300 dark:border-gray-700 pl-4">
                    {section.subsections.map((subsection) => (
                      <Card key={subsection.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-2 mb-3">
                          <Code2 className={`w-5 h-5 mt-0.5 ${colorTheme.text}`} />
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                            {t(subsection.titleKey)}
                          </h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {t(subsection.contentKey)}
                        </p>

                        {subsection.code && (
                          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden shadow-md">
                            <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
                              <span className="text-xs text-gray-400 font-mono">
                                {subsection.codeLanguage || 'code'}
                              </span>
                              <button
                                onClick={() => copyToClipboard(subsection.code!, subsection.id)}
                                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                              >
                                {copiedCode === subsection.id ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">{t('config.copied')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    {t('config.copy')}
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                              <code>{subsection.code}</code>
                            </pre>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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


import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full overflow-hidden" style={{ height: 0 }}>
        <ArchitectureDiagram />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{t('home.footer')}</p>
        </div>
      </footer>
    </div>
  );
}

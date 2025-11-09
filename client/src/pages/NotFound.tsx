import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-200 dark:bg-red-900/30 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-red-500 dark:text-red-400" />
            </div>
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">404</h1>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            {t('notFound.title')}
          </h2>

          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            {t('notFound.description')}
            <br />
            {t('notFound.description2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              {t('notFound.button')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

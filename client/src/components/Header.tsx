import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { APP_TITLE, APP_LOGO } from '@/const';
import { Moon, Sun, Menu, Settings, Info, Languages } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            {APP_LOGO && (
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="h-8 object-contain"
              />
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">{APP_TITLE}</h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/configuration">
            <Button variant="ghost" size="sm">
              {t('header.guide')}
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm">
              {t('header.about')}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Languages className="w-4 h-4" />
            <span className="font-semibold">{language.toUpperCase()}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span>{t('header.theme.light')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>{t('header.theme.dark')}</span>
              </>
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Languages className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t('header.menu')}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link href="/configuration">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {t('header.guide')}
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <Info className="w-4 h-4" />
                    {t('header.about')}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

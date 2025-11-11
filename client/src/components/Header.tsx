import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { APP_TITLE, APP_LOGO } from '@/const';
import { Moon, Sun, Menu, Settings, Info, Languages, Cog, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDialog } from './LoginDialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Check if title would wrap to two lines and hide it if so
  useEffect(() => {
    const checkTitleWidth = () => {
      // Only check on desktop (sm and up)
      if (window.innerWidth < 640) {
        setShowTitle(false);
        return;
      }

      if (!titleRef.current || !containerRef.current) return;

      const titleElement = titleRef.current;
      const containerElement = containerRef.current;
      
      // Get navigation buttons container to calculate available space
      const navWidth = navRef.current?.offsetWidth || 0;
      
      // Calculate available space for title
      const containerWidth = containerElement.offsetWidth;
      const logoWidth = 40; // h-10 = 40px
      const gap = 12; // gap-3 = 12px
      const padding = 16; // px-4 = 16px on each side
      const availableWidth = containerWidth - logoWidth - gap - navWidth - (padding * 2) - 20; // 20px buffer
      
      // Measure title width by temporarily making it visible and measuring
      const originalDisplay = titleElement.style.display;
      const originalVisibility = titleElement.style.visibility;
      const originalPosition = titleElement.style.position;
      const originalWhiteSpace = titleElement.style.whiteSpace;
      
      titleElement.style.display = 'block';
      titleElement.style.visibility = 'hidden';
      titleElement.style.position = 'absolute';
      titleElement.style.whiteSpace = 'nowrap';
      
      const titleWidth = titleElement.scrollWidth;
      
      // Reset styles
      titleElement.style.display = originalDisplay;
      titleElement.style.visibility = originalVisibility;
      titleElement.style.position = originalPosition;
      titleElement.style.whiteSpace = originalWhiteSpace;
      
      // Hide title if it would overflow
      setShowTitle(titleWidth <= availableWidth);
    };

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkTitleWidth, 100);
    window.addEventListener('resize', checkTitleWidth);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkTitleWidth);
    };
  }, [isAuthenticated, language, theme]); // Re-check when these change as they affect nav width

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-50">
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            {APP_LOGO && (
              <div className="bg-white p-1.5 rounded flex-shrink-0">
                <img
                  src={APP_LOGO}
                  alt={APP_TITLE}
                  className="h-10 object-contain"
                />
              </div>
            )}
            <h1 
              ref={titleRef}
              className={`text-2xl font-bold text-gray-900 dark:text-white hidden sm:block whitespace-nowrap ${
                showTitle ? '' : 'hidden'
              }`}
            >
              {APP_TITLE}
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div ref={navRef} className="hidden sm:flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/system-config">
              <Button variant="ghost" size="sm" className="gap-2">
                <Cog className="w-4 h-4" />
                {t('header.config')}
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowLogin(true)}>
              <LogIn className="w-4 h-4" />
              {t('auth.login') || 'Login'}
            </Button>
          )}
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
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2"
              title={t('auth.logout') || 'Logout'}
            >
              <LogOut className="w-4 h-4" />
              <span>{t('auth.logout') || 'Logout'}</span>
            </Button>
          )}
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
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              title={t('auth.logout') || 'Logout'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
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
                {isAuthenticated ? (
                  <Link href="/system-config">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <Cog className="w-4 h-4" />
                      {t('header.config')}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setOpen(false);
                      setShowLogin(true);
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    {t('auth.login') || 'Login'}
                  </Button>
                )}
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
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </header>
  );
}

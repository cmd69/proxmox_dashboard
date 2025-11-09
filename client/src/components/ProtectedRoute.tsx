import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { LoginDialog } from './LoginDialog';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLogin(true);
    }
  }, [isAuthenticated, isLoading]);

  const handleLoginClose = (open: boolean) => {
    setShowLogin(open);
    if (!open && !isAuthenticated) {
      // If login dialog closed without authentication, redirect to home
      setLocation('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginDialog open={showLogin} onOpenChange={handleLoginClose} />;
  }

  return <>{children}</>;
}


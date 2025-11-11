/**
 * Logger utility - Centralized logging with environment-aware levels
 * Follows DRY principle and provides consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment(): boolean {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment() && level === 'debug') {
      return false;
    }
    return true;
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log('[INFO]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]): void {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  }
}

// Export singleton instance
export const logger = new Logger();


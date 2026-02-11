// Error Logging Utility
// Logs errors to console and optionally to external service

interface ErrorLog {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  errorType: string;
}

class ErrorLogger {
  private isDevelopment = import.meta.env.DEV;
  private logToConsole = true;
  private logToService = false; // Can be enabled to log to external service

  logError(error: Error | unknown, context?: { component?: string; userId?: string }) {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      component: context?.component,
      userId: context?.userId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    };

    // Always log to console in development
    if (this.isDevelopment && this.logToConsole) {
      console.error('Error Logged:', errorLog);
    }

    // In production, you can send to external service
    if (!this.isDevelopment && this.logToService) {
      this.sendToService(errorLog);
    }

    // Store in localStorage for debugging (last 10 errors)
    if (typeof window !== 'undefined') {
      try {
        const storedErrors = JSON.parse(
          localStorage.getItem('error_logs') || '[]'
        ) as ErrorLog[];
        storedErrors.unshift(errorLog);
        const recentErrors = storedErrors.slice(0, 10);
        localStorage.setItem('error_logs', JSON.stringify(recentErrors));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  private async sendToService(errorLog: ErrorLog) {
    // Example: Send to external logging service
    // You can integrate with services like Sentry, LogRocket, etc.
    try {
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });
    } catch (e) {
      console.error('Failed to send error log:', e);
    }
  }

  getStoredErrors(): ErrorLog[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]') as ErrorLog[];
    } catch {
      return [];
    }
  }

  clearStoredErrors() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_logs');
    }
  }
}

export const errorLogger = new ErrorLogger();


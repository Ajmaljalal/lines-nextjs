import { NextRequest } from 'next/server';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  requestId?: string;
  userId?: string;
  endpoint?: string;
}

class ServerLogger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  private log(level: LogLevel, message: string, data?: any, context?: {
    requestId?: string;
    userId?: string;
    endpoint?: string;
  }) {
    if (level > this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...context
    };

    // In development, log to console with pretty formatting
    if (process.env.NODE_ENV === 'development') {
      const levelName = LogLevel[level];
      const color = this.getLogColor(level);
      console.log(
        `${color}[${entry.timestamp}] ${levelName}: ${message}${'\x1b[0m'}`,
        data ? data : ''
      );
    } else {
      // In production, you might want to send logs to a service like DataDog, LogRocket, etc.
      console.log(JSON.stringify(entry));
    }
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR: return '\x1b[31m'; // Red
      case LogLevel.WARN: return '\x1b[33m';  // Yellow
      case LogLevel.INFO: return '\x1b[36m';  // Cyan
      case LogLevel.DEBUG: return '\x1b[35m'; // Magenta
      default: return '\x1b[0m';              // Reset
    }
  }

  error(message: string, data?: any, context?: { requestId?: string; userId?: string; endpoint?: string }) {
    this.log(LogLevel.ERROR, message, data, context);
  }

  warn(message: string, data?: any, context?: { requestId?: string; userId?: string; endpoint?: string }) {
    this.log(LogLevel.WARN, message, data, context);
  }

  info(message: string, data?: any, context?: { requestId?: string; userId?: string; endpoint?: string }) {
    this.log(LogLevel.INFO, message, data, context);
  }

  debug(message: string, data?: any, context?: { requestId?: string; userId?: string; endpoint?: string }) {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Create a logger with request context
   */
  withRequest(req: NextRequest, userId?: string) {
    const requestId = req.headers.get('x-request-id') ||
      req.headers.get('x-trace-id') ||
      Math.random().toString(36).substring(7);
    const endpoint = `${req.method} ${req.nextUrl.pathname}`;

    return {
      error: (message: string, data?: any) => this.error(message, data, { requestId, userId, endpoint }),
      warn: (message: string, data?: any) => this.warn(message, data, { requestId, userId, endpoint }),
      info: (message: string, data?: any) => this.info(message, data, { requestId, userId, endpoint }),
      debug: (message: string, data?: any) => this.debug(message, data, { requestId, userId, endpoint })
    };
  }
}

// Export singleton instance
export const logger = new ServerLogger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

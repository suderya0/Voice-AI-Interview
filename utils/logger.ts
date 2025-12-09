type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, metadata?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(metadata && { metadata }),
    };
  }

  private log(level: LogLevel, message: string, metadata?: any): void {
    const logEntry = this.formatMessage(level, message, metadata);

    if (this.isDevelopment) {
      // Pretty print in development
      const colors: Record<LogLevel, string> = {
        info: '\x1b[36m', // Cyan
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';

      console.log(
        `${colors[level]}[${logEntry.timestamp}] ${level.toUpperCase()}${reset}: ${message}`,
        metadata ? JSON.stringify(metadata, null, 2) : ''
      );
    } else {
      // JSON format for production (better for log aggregation)
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, metadata?: any): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: any): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: any): void {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata?: any): void {
    if (this.isDevelopment) {
      this.log('debug', message, metadata);
    }
  }
}

export const logger = new Logger();


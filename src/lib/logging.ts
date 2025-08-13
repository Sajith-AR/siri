import { NextRequest } from "next/server";

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  status?: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  async log(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    // Add to in-memory store
    this.logs.push(logEntry);
    
    // Trim logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with colors
    this.consoleLog(logEntry);

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      await this.sendToExternalLogger(logEntry);
    }
  }

  private consoleLog(entry: LogEntry): void {
    const colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[90m',   // Gray
      reset: '\x1b[0m'
    };

    const color = colors[entry.level];
    const reset = colors.reset;
    
    console.log(
      `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
      entry.metadata ? JSON.stringify(entry.metadata, null, 2) : ''
    );
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // Implement external logging service integration
    // Examples: DataDog, LogRocket, Sentry, etc.
    try {
      // Example: Send to webhook or logging service
      // await fetch('https://logs.example.com/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  getLogs(filters?: {
    level?: string;
    startTime?: string;
    endTime?: string;
    userId?: string;
    endpoint?: string;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      
      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!);
      }
      
      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!);
      }
      
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      
      if (filters.endpoint) {
        filteredLogs = filteredLogs.filter(log => log.endpoint === filters.endpoint);
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  getStats(): {
    totalLogs: number;
    errorCount: number;
    warnCount: number;
    avgResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  } {
    const errorCount = this.logs.filter(log => log.level === 'error').length;
    const warnCount = this.logs.filter(log => log.level === 'warn').length;
    
    const responseTimes = this.logs
      .filter(log => log.duration !== undefined)
      .map(log => log.duration!);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const endpointCounts = new Map<string, number>();
    this.logs.forEach(log => {
      if (log.endpoint) {
        endpointCounts.set(log.endpoint, (endpointCounts.get(log.endpoint) || 0) + 1);
      }
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: this.logs.length,
      errorCount,
      warnCount,
      avgResponseTime: Math.round(avgResponseTime),
      topEndpoints
    };
  }
}

const logger = new Logger();

export async function logRequest(
  req: NextRequest,
  type: 'incoming' | 'success' | 'error',
  metadata?: Record<string, any>
): Promise<void> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
            req.headers.get('x-real-ip') || 
            'unknown';
  
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const endpoint = new URL(req.url).pathname;

  const baseMetadata = {
    endpoint,
    method: req.method,
    ip,
    userAgent: userAgent.slice(0, 100), // Truncate long user agents
    ...metadata
  };

  switch (type) {
    case 'incoming':
      await logger.log({
        level: 'info',
        message: `${req.method} ${endpoint}`,
        metadata: baseMetadata
      });
      break;
      
    case 'success':
      await logger.log({
        level: 'info',
        message: `${req.method} ${endpoint} - Success`,
        metadata: baseMetadata,
        duration: metadata?.duration,
        status: metadata?.status
      });
      break;
      
    case 'error':
      await logger.log({
        level: 'error',
        message: `${req.method} ${endpoint} - Error: ${metadata?.error || 'Unknown error'}`,
        metadata: baseMetadata,
        duration: metadata?.duration
      });
      break;
  }
}

export { logger };

// Health check logging
export async function logHealthCheck(
  service: string,
  status: 'healthy' | 'unhealthy',
  responseTime?: number,
  error?: string
): Promise<void> {
  await logger.log({
    level: status === 'healthy' ? 'info' : 'error',
    message: `Health check: ${service} - ${status}`,
    metadata: {
      service,
      status,
      responseTime,
      error
    }
  });
}

// Security event logging
export async function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
): Promise<void> {
  await logger.log({
    level: severity === 'critical' || severity === 'high' ? 'error' : 'warn',
    message: `Security event: ${event}`,
    metadata: {
      event,
      severity,
      ...details
    }
  });
}
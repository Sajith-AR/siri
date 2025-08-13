import { logger, logHealthCheck } from "./logging";

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthStatus[];
  uptime: number;
  version: string;
  timestamp: string;
}

class HealthMonitor {
  private checks: Map<string, () => Promise<HealthStatus>> = new Map();
  private lastResults: Map<string, HealthStatus> = new Map();
  private startTime = Date.now();

  registerCheck(name: string, checkFn: () => Promise<HealthStatus>): void {
    this.checks.set(name, checkFn);
  }

  async runCheck(serviceName: string): Promise<HealthStatus> {
    const checkFn = this.checks.get(serviceName);
    if (!checkFn) {
      throw new Error(`No health check registered for service: ${serviceName}`);
    }

    try {
      const result = await checkFn();
      this.lastResults.set(serviceName, result);
      
      await logHealthCheck(
        serviceName,
        result.status === 'healthy' ? 'healthy' : 'unhealthy',
        result.responseTime,
        result.error
      );
      
      return result;
    } catch (error) {
      const errorResult: HealthStatus = {
        service: serviceName,
        status: 'unhealthy',
        responseTime: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.lastResults.set(serviceName, errorResult);
      await logHealthCheck(serviceName, 'unhealthy', 0, errorResult.error);
      
      return errorResult;
    }
  }

  async runAllChecks(): Promise<SystemHealth> {
    const results = await Promise.all(
      Array.from(this.checks.keys()).map(service => this.runCheck(service))
    );

    const overall = this.determineOverallHealth(results);
    const uptime = Date.now() - this.startTime;

    return {
      overall,
      services: results,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  private determineOverallHealth(services: HealthStatus[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return unhealthyCount > services.length / 2 ? 'unhealthy' : 'degraded';
    }

    if (degradedCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  getLastResult(serviceName: string): HealthStatus | undefined {
    return this.lastResults.get(serviceName);
  }

  getAllLastResults(): HealthStatus[] {
    return Array.from(this.lastResults.values());
  }
}

export const healthMonitor = new HealthMonitor();

// Register default health checks
healthMonitor.registerCheck('api', async (): Promise<HealthStatus> => {
  const start = Date.now();
  
  try {
    // Basic API health check
    const responseTime = Date.now() - start;
    
    return {
      service: 'api',
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString(),
      details: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  } catch (error) {
    return {
      service: 'api',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

healthMonitor.registerCheck('gemini', async (): Promise<HealthStatus> => {
  const start = Date.now();
  
  try {
    const { hasGemini } = await import('./env');
    
    if (!hasGemini) {
      return {
        service: 'gemini',
        status: 'degraded',
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: { configured: false }
      };
    }

    // Test Gemini API with a simple request
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const { env } = await import('./env');
    
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    await model.generateContent("Health check test");
    
    return {
      service: 'gemini',
      status: 'healthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { configured: true, model: 'gemini-1.5-flash' }
    };
  } catch (error) {
    return {
      service: 'gemini',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

healthMonitor.registerCheck('openai', async (): Promise<HealthStatus> => {
  const start = Date.now();
  
  try {
    const { hasOpenAI } = await import('./env');
    
    if (!hasOpenAI) {
      return {
        service: 'openai',
        status: 'degraded',
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: { configured: false }
      };
    }

    // Test OpenAI API
    const OpenAI = (await import('openai')).default;
    const { env } = await import('./env');
    
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    
    await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Health check" }],
      max_tokens: 5
    });
    
    return {
      service: 'openai',
      status: 'healthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { configured: true, model: 'gpt-4o-mini' }
    };
  } catch (error) {
    return {
      service: 'openai',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

healthMonitor.registerCheck('mongodb', async (): Promise<HealthStatus> => {
  const start = Date.now();
  
  try {
    const { checkDatabaseHealth } = await import('./mongodb');
    const dbHealth = await checkDatabaseHealth();
    
    return {
      service: 'mongodb',
      status: dbHealth.status,
      responseTime: dbHealth.responseTime,
      timestamp: new Date().toISOString(),
      details: dbHealth.details
    };
  } catch (error) {
    return {
      service: 'mongodb',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

healthMonitor.registerCheck('memory', async (): Promise<HealthStatus> => {
  const start = Date.now();
  
  try {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const memoryUsagePercent = (usedMem / totalMem) * 100;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (memoryUsagePercent > 90) {
      status = 'unhealthy';
    } else if (memoryUsagePercent > 75) {
      status = 'degraded';
    }
    
    return {
      service: 'memory',
      status,
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: {
        heapUsed: Math.round(usedMem / 1024 / 1024) + ' MB',
        heapTotal: Math.round(totalMem / 1024 / 1024) + ' MB',
        usagePercent: Math.round(memoryUsagePercent) + '%',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      }
    };
  } catch (error) {
    return {
      service: 'memory',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private maxSamples = 1000;

  recordMetric(name: string, value: number): void {
    let samples = this.metrics.get(name) || [];
    samples.push(value);
    
    // Keep only recent samples
    if (samples.length > this.maxSamples) {
      samples = samples.slice(-this.maxSamples);
    }
    
    this.metrics.set(name, samples);
  }

  getMetricStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count,
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();
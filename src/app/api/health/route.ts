import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { healthMonitor, performanceMonitor } from "@/lib/healthMonitor";
import { logger } from "@/lib/logging";
import { cache } from "@/lib/cache";

export const GET = withMiddleware(
  async ({ req }) => {
    try {
      const url = new URL(req.url);
      const detailed = url.searchParams.get('detailed') === 'true';
      const service = url.searchParams.get('service');

      if (service) {
        // Get health status for specific service
        const result = await healthMonitor.runCheck(service);
        return NextResponse.json(result);
      }

      if (detailed) {
        // Comprehensive health check
        const systemHealth = await healthMonitor.runAllChecks();
        const performanceMetrics = performanceMonitor.getAllMetrics();
        const cacheStats = cache.getStats();
        const logStats = logger.getStats();

        return NextResponse.json({
          ...systemHealth,
          performance: performanceMetrics,
          cache: cacheStats,
          logging: logStats,
          system: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime()
          }
        });
      }

      // Basic health check
      const systemHealth = await healthMonitor.runAllChecks();
      return NextResponse.json(systemHealth);

    } catch (error) {
      console.error("Health check error:", error);
      return NextResponse.json(
        {
          overall: 'unhealthy',
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 60, windowMs: 60000 } // 60 requests per minute
  }
);

// Health check endpoint for load balancers
export const HEAD = withMiddleware(
  async () => {
    try {
      const systemHealth = await healthMonitor.runAllChecks();
      
      if (systemHealth.overall === 'healthy') {
        return new NextResponse(null, { status: 200 });
      } else if (systemHealth.overall === 'degraded') {
        return new NextResponse(null, { status: 200 }); // Still accepting traffic
      } else {
        return new NextResponse(null, { status: 503 }); // Service unavailable
      }
    } catch (error) {
      return new NextResponse(null, { status: 503 });
    }
  }
);
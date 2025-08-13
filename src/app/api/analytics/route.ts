import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { db } from "@/lib/database";
import { performanceMonitor } from "@/lib/healthMonitor";
import { logger } from "@/lib/logging";
import { cache } from "@/lib/cache";

export const GET = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const url = new URL(req.url);
      const timeframe = url.searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d, 90d
      const detailed = url.searchParams.get('detailed') === 'true';
      
      // Check cache first
      const cacheKey = `analytics:${timeframe}:${detailed}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Get basic statistics
      const patientStats = await db.getPatientStats();
      const healthRecordStats = await db.getHealthRecordStats();
      const performanceMetrics = performanceMonitor.getAllMetrics();
      const logStats = logger.getStats();
      
      // Calculate time-based metrics
      const timeBasedMetrics = await calculateTimeBasedMetrics(timeframe);
      
      const analytics = {
        overview: {
          totalPatients: patientStats.totalPatients,
          totalHealthRecords: healthRecordStats.totalRecords,
          newPatientsThisMonth: patientStats.newPatientsThisMonth,
          recordsThisWeek: healthRecordStats.recordsThisWeek,
          averageConfidence: healthRecordStats.averageConfidence,
          systemUptime: process.uptime()
        },
        
        demographics: {
          averageAge: patientStats.averageAge,
          genderDistribution: patientStats.genderDistribution
        },
        
        healthRecords: {
          byType: healthRecordStats.recordsByType,
          confidenceDistribution: calculateConfidenceDistribution(healthRecordStats),
          trendsOverTime: timeBasedMetrics.recordTrends
        },
        
        performance: {
          apiResponseTimes: {
            symptomAnalysis: performanceMetrics.symptom_analysis_total_time || null,
            aiAssistant: performanceMetrics.ai_assistant_total_time || null,
            patientOperations: performanceMetrics.patient_get_time || null
          },
          errorRates: {
            symptomAnalysisErrors: performanceMetrics.symptom_analysis_errors?.count || 0,
            aiAssistantErrors: performanceMetrics.ai_assistant_errors?.count || 0,
            totalErrors: logStats.errorCount
          },
          cacheHitRates: {
            symptomAnalysis: calculateCacheHitRate('symptom_analysis'),
            aiAssistant: calculateCacheHitRate('ai_assistant')
          }
        },
        
        usage: {
          topEndpoints: logStats.topEndpoints,
          requestsOverTime: timeBasedMetrics.requestTrends,
          peakUsageHours: calculatePeakUsageHours()
        },
        
        health: {
          systemHealth: 'healthy', // This would come from health monitor
          serviceAvailability: calculateServiceAvailability(),
          alertsActive: 0 // This would come from alerting system
        }
      };
      
      // Add detailed metrics if requested
      if (detailed) {
        analytics.detailed = {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          detailedPerformanceMetrics: performanceMetrics,
          recentLogs: logger.getLogs({ startTime: getTimeframeStart(timeframe) }),
          databaseStats: await getDatabaseStats()
        };
      }
      
      // Cache the results
      const cacheTime = timeframe === '1d' ? 300000 : 600000; // 5-10 minutes
      cache.set(cacheKey, analytics, cacheTime, ['analytics']);
      
      performanceMonitor.recordMetric('analytics_generation_time', Date.now() - startTime);
      
      return NextResponse.json({
        ...analytics,
        metadata: {
          timeframe,
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          cached: false
        }
      });
      
    } catch (error) {
      performanceMonitor.recordMetric('analytics_errors', 1);
      console.error("Analytics generation error:", error);
      
      return NextResponse.json(
        {
          error: "Failed to generate analytics",
          code: "ANALYTICS_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 30, windowMs: 60000 }
  }
);

// Helper functions
async function calculateTimeBasedMetrics(timeframe: string) {
  const startDate = getTimeframeStart(timeframe);
  const now = new Date();
  
  // This would typically query a time-series database
  // For now, we'll simulate the data
  const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const recordTrends = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10, // Simulated data
      types: {
        symptom_check: Math.floor(Math.random() * 20) + 5,
        ai_consultation: Math.floor(Math.random() * 15) + 3,
        vital_signs: Math.floor(Math.random() * 10) + 2
      }
    };
  });
  
  const requestTrends = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 1000) + 200,
      errors: Math.floor(Math.random() * 20) + 1
    };
  });
  
  return {
    recordTrends,
    requestTrends
  };
}

function calculateConfidenceDistribution(healthRecordStats: any) {
  // Simulate confidence distribution
  return {
    high: Math.floor(Math.random() * 40) + 40, // 40-80%
    medium: Math.floor(Math.random() * 30) + 15, // 15-45%
    low: Math.floor(Math.random() * 15) + 5 // 5-20%
  };
}

function calculateCacheHitRate(service: string): number {
  // This would calculate actual cache hit rates
  // For now, return simulated data
  const hitRates = {
    symptom_analysis: 0.75,
    ai_assistant: 0.68,
    patient_operations: 0.82
  };
  
  return hitRates[service as keyof typeof hitRates] || 0.5;
}

function calculatePeakUsageHours(): Array<{ hour: number; requests: number }> {
  // Simulate peak usage hours (typically business hours)
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    requests: hour >= 8 && hour <= 18 
      ? Math.floor(Math.random() * 200) + 100 
      : Math.floor(Math.random() * 50) + 10
  }));
}

function calculateServiceAvailability(): Record<string, number> {
  // This would calculate actual service availability
  return {
    api: 99.9,
    gemini: 98.5,
    openai: 99.2,
    database: 99.8
  };
}

async function getDatabaseStats() {
  const data = await db.exportData();
  
  return {
    totalRecords: data.patients.length + data.healthRecords.length + data.appointments.length + data.doctors.length,
    collections: {
      patients: data.patients.length,
      healthRecords: data.healthRecords.length,
      appointments: data.appointments.length,
      doctors: data.doctors.length
    },
    dataSize: JSON.stringify(data).length, // Approximate size in bytes
    oldestRecord: Math.min(
      ...data.patients.map(p => new Date(p.createdAt).getTime()),
      ...data.healthRecords.map(r => new Date(r.timestamp).getTime())
    ),
    newestRecord: Math.max(
      ...data.patients.map(p => new Date(p.updatedAt).getTime()),
      ...data.healthRecords.map(r => new Date(r.timestamp).getTime())
    )
  };
}

function getTimeframeStart(timeframe: string): Date {
  const now = new Date();
  
  switch (timeframe) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}
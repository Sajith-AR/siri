import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const vitalsSchema = z.object({
  heartRate: z.number().optional(),
  bloodPressure: z.object({
    systolic: z.number(),
    diastolic: z.number()
  }).optional(),
  temperature: z.number().optional(),
  respiratoryRate: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  patientId: z.string().optional()
});

const validateVitals = createValidator(vitalsSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateVitals(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { patientId, ...vitals } = validation.data!;

      // Use AI service for comprehensive vital signs analysis
      const analysis = await aiService.analyzeVitals(vitals, patientId);

      performanceMonitor.recordMetric('vitals_analysis_success', 1);

      return NextResponse.json({
        ...analysis,
        vitalsProvided: Object.keys(vitals).length,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('vitals_analysis_errors', 1);
      console.error("Vitals analysis API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to analyze vital signs",
          message: "Our vital signs analysis service is temporarily unavailable.",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 20, windowMs: 60000 }
  }
);
import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  patientAge: z.number().optional(),
  patientWeight: z.number().optional(),
  allergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  patientId: z.string().optional()
});

const validateMedication = createValidator(medicationSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateMedication(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { patientId, ...medicationData } = validation.data!;

      // Use AI service for comprehensive medication analysis
      const analysis = await aiService.analyzeMedication(medicationData, patientId);

      performanceMonitor.recordMetric('medication_analysis_success', 1);

      return NextResponse.json({
        ...analysis,
        medicationName: medicationData.name,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('medication_analysis_errors', 1);
      console.error("Medication analysis API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to analyze medication",
          message: "Our medication analysis service is temporarily unavailable.",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 10, windowMs: 60000 }
  }
);
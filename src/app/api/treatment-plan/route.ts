import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const treatmentSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  patientProfile: z.object({
    age: z.number(),
    gender: z.enum(['male', 'female', 'other']),
    weight: z.number().optional(),
    height: z.number().optional(),
    medicalHistory: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    lifestyle: z.object({
      smoking: z.boolean().optional(),
      alcohol: z.enum(['none', 'light', 'moderate', 'heavy']).optional(),
      exercise: z.enum(['none', 'light', 'moderate', 'heavy']).optional()
    }).optional()
  }),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  patientId: z.string().optional()
});

const validateTreatment = createValidator(treatmentSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateTreatment(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { diagnosis, patientProfile, severity, patientId } = validation.data!;

      // Use AI service for treatment plan generation
      const treatmentPlan = await aiService.generateTreatmentPlan(diagnosis, patientProfile, patientId);

      performanceMonitor.recordMetric('treatment_plan_success', 1);

      return NextResponse.json({
        ...treatmentPlan,
        diagnosis,
        severity: severity || 'moderate',
        patientAge: patientProfile.age,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        },
        disclaimer: "This treatment plan is AI-generated for informational purposes only. Always consult with qualified healthcare professionals for actual treatment decisions."
      });

    } catch (error) {
      performanceMonitor.recordMetric('treatment_plan_errors', 1);
      console.error("Treatment plan API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to generate treatment plan",
          message: "Our treatment planning service is temporarily unavailable.",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 5, windowMs: 60000 } // Lower limit for treatment plans
  }
);
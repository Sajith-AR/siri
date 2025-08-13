import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const wellnessSchema = z.object({
  goals: z.array(z.string()).min(1, "At least one health goal is required"),
  currentHealth: z.object({
    age: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
    medicalConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    lifestyle: z.object({
      smoking: z.boolean().optional(),
      alcohol: z.enum(['none', 'light', 'moderate', 'heavy']).optional(),
      sleep: z.number().optional(),
      stress: z.enum(['low', 'medium', 'high']).optional()
    }).optional()
  }),
  patientId: z.string().optional()
});

const validateWellness = createValidator(wellnessSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateWellness(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { goals, currentHealth, patientId } = validation.data!;

      // Use AI service for wellness plan generation
      const plan = await aiService.generateWellnessPlan(goals, currentHealth, patientId);

      performanceMonitor.recordMetric('wellness_plan_success', 1);

      return NextResponse.json({
        ...plan,
        goalsCount: goals.length,
        planType: 'comprehensive',
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('wellness_plan_errors', 1);
      console.error("Wellness plan API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to generate wellness plan",
          message: "Our wellness planning service is temporarily unavailable.",
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
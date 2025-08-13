import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const educationSchema = z.object({
  topic: z.string().min(1, "Health topic is required"),
  patientProfile: z.object({
    age: z.number().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    medicalHistory: z.array(z.string()).optional(),
    currentConditions: z.array(z.string()).optional(),
    riskFactors: z.array(z.string()).optional()
  }).optional(),
  educationLevel: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  language: z.string().optional(),
  patientId: z.string().optional()
});

const validateEducation = createValidator(educationSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateEducation(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { topic, patientProfile, educationLevel, language, patientId } = validation.data!;

      // Use AI service for health education generation
      const education = await aiService.generateHealthEducation(topic, patientProfile, patientId);

      performanceMonitor.recordMetric('health_education_success', 1);

      return NextResponse.json({
        ...education,
        topic,
        educationLevel: educationLevel || 'intermediate',
        language: language || 'en',
        personalized: !!patientProfile,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('health_education_errors', 1);
      console.error("Health education API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to generate health education content",
          message: "Our health education service is temporarily unavailable.",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 15, windowMs: 60000 }
  }
);
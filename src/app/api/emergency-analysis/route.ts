import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const emergencySchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
  vitals: z.object({
    heartRate: z.number().optional(),
    bloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number()
    }).optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional()
  }).optional(),
  patientId: z.string().optional(),
  location: z.string().optional()
});

const validateEmergency = createValidator(emergencySchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateEmergency(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { symptoms, vitals, patientId, location } = validation.data!;

      // Use AI service for emergency analysis
      const analysis = await aiService.analyzeEmergency(symptoms, vitals, patientId);

      performanceMonitor.recordMetric('emergency_analysis_success', 1);

      // Add emergency contact information based on location
      const emergencyContacts = getEmergencyContacts(location);

      return NextResponse.json({
        ...analysis,
        emergencyContacts,
        symptomsAnalyzed: symptoms.length,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced',
          priority: 'HIGH'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('emergency_analysis_errors', 1);
      console.error("Emergency analysis API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to analyze emergency situation",
          message: "If this is a medical emergency, please call emergency services immediately.",
          emergencyNumbers: {
            us: "911",
            uk: "999",
            eu: "112"
          },
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 50, windowMs: 60000 } // Higher limit for emergencies
  }
);

function getEmergencyContacts(location?: string) {
  const defaultContacts = {
    emergency: "911",
    poison: "1-800-222-1222",
    suicide: "988"
  };

  // Add location-specific emergency numbers
  if (location?.toLowerCase().includes('uk')) {
    return {
      emergency: "999",
      nhs: "111",
      poison: "111"
    };
  }

  if (location?.toLowerCase().includes('canada')) {
    return {
      emergency: "911",
      poison: "1-844-764-7669",
      mental: "1-833-456-4566"
    };
  }

  return defaultContacts;
}
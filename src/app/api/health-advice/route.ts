import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const { age, symptoms, medicalHistory, currentMedications, lifestyle, patientId } = body;

      const patientData = {
        age: age ? parseInt(age) : undefined,
        symptoms: symptoms || [],
        medicalHistory: medicalHistory || [],
        currentMedications: currentMedications || [],
        lifestyle: lifestyle || {}
      };

      // Use comprehensive AI service for health advice
      const advice = await aiService.generateHealthAdvice(patientData, patientId);

      performanceMonitor.recordMetric('health_advice_success', 1);

      return NextResponse.json({
        ...advice,
        provider: "Gemini AI Enhanced",
        timestamp: new Date().toISOString(),
        patientProfile: {
          age: patientData.age,
          hasSymptoms: patientData.symptoms.length > 0,
          hasMedicalHistory: patientData.medicalHistory.length > 0,
          takingMedications: patientData.currentMedications.length > 0
        },
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('health_advice_errors', 1);
      console.error("Health advice API error:", error);
      return NextResponse.json(
        { 
          error: "Failed to generate health advice", 
          message: "Our health advice service is temporarily unavailable. Please try again.",
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
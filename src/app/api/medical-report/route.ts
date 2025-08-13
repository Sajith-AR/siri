import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";
import { createValidator } from "@/lib/validation";
import { z } from "zod";

const reportSchema = z.object({
  patientData: z.object({
    id: z.string(),
    name: z.string(),
    age: z.number(),
    gender: z.enum(['male', 'female', 'other']),
    medicalHistory: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional()
  }),
  testResults: z.object({
    labResults: z.record(z.any()).optional(),
    vitalSigns: z.object({
      heartRate: z.number().optional(),
      bloodPressure: z.object({
        systolic: z.number(),
        diastolic: z.number()
      }).optional(),
      temperature: z.number().optional(),
      respiratoryRate: z.number().optional(),
      oxygenSaturation: z.number().optional()
    }).optional(),
    imagingResults: z.array(z.string()).optional(),
    symptoms: z.array(z.string()).optional()
  }),
  reportType: z.enum(['comprehensive', 'summary', 'specialist']).optional(),
  doctorId: z.string().optional()
});

const validateReport = createValidator(reportSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateReport(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      const { patientData, testResults, reportType, doctorId } = validation.data!;

      // Use AI service for medical report generation
      const report = await aiService.generateMedicalReport(patientData, testResults, patientData.id);

      performanceMonitor.recordMetric('medical_report_success', 1);

      return NextResponse.json({
        ...report,
        reportId: `RPT_${Date.now()}_${patientData.id}`,
        reportType: reportType || 'comprehensive',
        generatedBy: 'Gemini AI Enhanced',
        generatedFor: {
          patientId: patientData.id,
          patientName: patientData.name,
          doctorId: doctorId || null
        },
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('medical_report_errors', 1);
      console.error("Medical report API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to generate medical report",
          message: "Our medical report generation service is temporarily unavailable.",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 5, windowMs: 60000 } // Lower limit for reports
  }
);
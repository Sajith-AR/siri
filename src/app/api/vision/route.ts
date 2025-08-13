import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiService } from "@/lib/aiService";
import { performanceMonitor } from "@/lib/healthMonitor";

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const data = await req.formData();
      const file = data.get("image") as File | null;
      const patientId = data.get("patientId") as string | null;

      if (!file) {
        return NextResponse.json({ error: "Missing image file" }, { status: 400 });
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      // Use comprehensive AI service for image analysis
      const analysis = await aiService.analyzeImage(base64, file.type, patientId || undefined);

      performanceMonitor.recordMetric('image_analysis_success', 1);

      return NextResponse.json({
        ...analysis,
        provider: "Gemini AI Enhanced",
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          version: '3.0',
          aiProvider: 'Gemini AI Enhanced'
        }
      });

    } catch (error) {
      performanceMonitor.recordMetric('image_analysis_errors', 1);
      console.error("Vision API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to analyze image",
          message: "Our image analysis service is temporarily unavailable. Please try again or consult a healthcare professional.",
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
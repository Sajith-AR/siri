import { NextResponse } from "next/server";
import { env, hasGemini, hasOpenAI } from "@/lib/env";
import { analyzeImage } from "@/lib/gemini";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("image") as File | null;

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

    // Try Gemini AI first (primary)
    if (hasGemini) {
      try {
        const analysis = await analyzeImage(base64, file.type);
        return NextResponse.json({
          ...analysis,
          provider: "Gemini AI",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Gemini vision analysis failed:", error);
        // Fall through to OpenAI backup
      }
    }

    // Fallback to OpenAI Vision
    if (hasOpenAI) {
      try {
        const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this medical image and provide observations. Focus on visible symptoms, conditions, colors, textures, and any concerning features. Provide observations only, not diagnoses. Respond with JSON format: {\"findings\": [\"observation1\", \"observation2\"], \"severity\": \"low|medium|high\", \"recommendations\": [\"rec1\", \"rec2\"], \"disclaimer\": \"disclaimer text\"}"
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${file.type};base64,${base64}` }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No analysis available");

        // Try to parse as JSON, fallback to simple format
        try {
          const parsed = JSON.parse(content);
          return NextResponse.json({
            ...parsed,
            provider: "OpenAI GPT-4 Vision",
            timestamp: new Date().toISOString()
          });
        } catch {
          // Fallback to simple format
          return NextResponse.json({
            findings: [content],
            severity: "medium",
            recommendations: ["Consult a healthcare professional for proper evaluation"],
            disclaimer: "This is an AI analysis for informational purposes only.",
            provider: "OpenAI GPT-4 Vision",
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("OpenAI vision analysis failed:", error);
        // Fall through to basic response
      }
    }

    // Basic fallback response
    return NextResponse.json({
      findings: ["Image uploaded successfully but AI analysis is not available"],
      severity: "unknown",
      recommendations: [
        "Please consult a healthcare professional for proper image evaluation",
        "Consider visiting a dermatologist or relevant specialist"
      ],
      disclaimer: "AI image analysis is currently unavailable. Please seek professional medical advice.",
      provider: "Basic Response",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Vision API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image. Please try again." },
      { status: 500 }
    );
  }
}
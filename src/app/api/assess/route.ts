import { NextResponse } from "next/server";
import { env, hasGemini, hasOpenAI } from "@/lib/env";
import { analyzeSymptoms } from "@/lib/gemini";
import OpenAI from "openai";
import { getReferences } from "@/lib/medicalReferences";

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    const text: string = (input || "").trim();

    if (!text) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
    }

    // Try Gemini AI first (primary)
    if (hasGemini) {
      try {
        const analysis = await analyzeSymptoms(text);
        const refs = getReferences((analysis.conditions ?? []).map((c: any) => c.name));
        
        return NextResponse.json({
          ...analysis,
          references: refs,
          provider: "Gemini AI",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Gemini analysis failed:", error);
        // Fall through to OpenAI backup
      }
    }

    // Fallback to OpenAI
    if (hasOpenAI) {
      try {
        const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a medical AI assistant. Analyze symptoms and respond with JSON containing: risk (low/medium/high), conditions (array with name and confidence), nextSteps (array), urgency (boolean), explanation (string)."
            },
            {
              role: "user",
              content: `Analyze these symptoms: "${text}"`
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("No content from OpenAI");
        
        const parsed = JSON.parse(content);
        const refs = getReferences((parsed.conditions ?? []).map((c: any) => c.name));
        
        return NextResponse.json({
          ...parsed,
          references: refs,
          provider: "OpenAI GPT-4",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("OpenAI analysis failed:", error);
        // Fall through to heuristic
      }
    }

    // Fallback heuristic analysis
    const lowerText = text.toLowerCase();
    let risk: "low" | "medium" | "high" = "low";
    
    // High risk keywords
    if (lowerText.includes("chest pain") || lowerText.includes("shortness of breath") || 
        lowerText.includes("severe") || lowerText.includes("difficulty breathing") ||
        lowerText.includes("unconscious") || lowerText.includes("bleeding")) {
      risk = "high";
    }
    // Medium risk keywords
    else if (lowerText.includes("fever") || lowerText.includes("vomit") || 
             lowerText.includes("dizziness") || lowerText.includes("pain")) {
      risk = "medium";
    }

    const conditions = [
      { 
        name: risk === "high" ? "Possible serious condition" : 
              risk === "medium" ? "Viral infection" : "Common cold", 
        confidence: risk === "high" ? 0.7 : risk === "medium" ? 0.6 : 0.5 
      },
      { name: "General malaise", confidence: 0.3 }
    ];

    const nextSteps = risk === "high"
      ? ["Seek immediate medical care", "Call emergency services if severe", "Do not delay treatment"]
      : risk === "medium"
      ? ["Rest and stay hydrated", "Monitor symptoms closely", "Contact healthcare provider if worsening"]
      : ["Home care with rest and fluids", "Monitor for 24-48 hours", "Seek care if symptoms persist"];

    const references = getReferences(conditions.map((c) => c.name));
    
    return NextResponse.json({
      risk,
      conditions,
      nextSteps,
      urgency: risk === "high",
      explanation: "Basic symptom analysis based on keyword matching. For accurate diagnosis, please consult a healthcare professional.",
      references,
      provider: "Heuristic Analysis",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Assessment API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms. Please try again." },
      { status: 500 }
    );
  }
}



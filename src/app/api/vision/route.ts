import { NextResponse } from "next/server";
import { env, hasOpenAI } from "@/lib/env";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "Missing image" }, { status: 400 });

  if (!hasOpenAI) {
    return NextResponse.json({ error: "Vision analysis not configured" }, { status: 503 });
  }

  try {
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this medical image and provide findings. Return only medical observations, not diagnoses." },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } }
          ]
        }
      ],
      max_tokens: 300
    });

    const findings = response.choices[0]?.message?.content || "No analysis available";
    return NextResponse.json({ findings: [findings] });
  } catch (error) {
    console.error("Vision analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}



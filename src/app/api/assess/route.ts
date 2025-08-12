import { NextResponse } from "next/server";
import { env, hasOpenAI } from "@/lib/env";
import OpenAI from "openai";
import { getReferences } from "@/lib/medicalReferences";

export async function POST(req: Request) {
  const { input } = await req.json();
  const text: string = (input || "").toLowerCase();

  if (hasOpenAI) {
    try {
      const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const prompt = `User symptom description: "${text}"\nReturn JSON with keys risk(one of low,medium,high), conditions(array of {name,confidence 0-1}), nextSteps(array of short strings).`;
      const res = await client.responses.create({
        model: "gpt-4o-mini",
        input: prompt,
        temperature: 0.2,
      });
      const asTextHolder = res as unknown as { output_text?: string };
      const content = asTextHolder.output_text || "";
      if (!content) throw new Error("No content from model");
      const parsed = JSON.parse(content) as {
        risk?: string;
        conditions?: Array<{ name: string; confidence?: number }>;
        nextSteps?: string[];
      };
      const refs = getReferences((parsed.conditions ?? []).map((c) => c.name));
      return NextResponse.json({ ...parsed, references: refs, explain: "AI reasoning with clinical guidelines summary." });
    } catch {
      // fall through to heuristic
    }
  }

  // Fallback heuristic
  let risk: "low" | "medium" | "high" = "low";
  if (text.includes("chest pain") || text.includes("shortness of breath") || text.includes("severe")) risk = "high";
  else if (text.includes("fever") || text.includes("vomit") || text.includes("dizziness")) risk = "medium";

  const conditions = [
    { name: risk === "high" ? "Possible cardiac issue" : risk === "medium" ? "Viral infection" : "Common cold", confidence: risk === "high" ? 0.7 : risk === "medium" ? 0.6 : 0.5 },
    { name: "Dehydration", confidence: 0.3 },
  ];
  const nextSteps =
    risk === "high"
      ? ["Seek immediate care.", "Call emergency services."]
      : risk === "medium"
      ? ["Hydrate and rest.", "Consider contacting a clinician if symptoms persist."]
      : ["Home care: fluids, rest.", "Monitor symptoms for 24-48 hours."];
  const references = getReferences(conditions.map((c) => c.name));
  return NextResponse.json({ risk, conditions, nextSteps, references, explain: "Rule-based triage based on symptom keywords." });
}



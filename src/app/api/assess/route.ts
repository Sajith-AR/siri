import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { input } = await req.json();
  const text: string = (input || "").toLowerCase();

  // Naive triage heuristic for demo purposes only
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

  return NextResponse.json({ risk, conditions, nextSteps });
}



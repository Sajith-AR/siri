import { NextResponse } from "next/server";
// Placeholder implementation to avoid build-time SDK typing issues.

export const runtime = "edge";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "Missing image" }, { status: 400 });

  // In production, call a vision model here. For now, return demo findings.
  return NextResponse.json({ findings: ["Possible rash", "Redness"], note: "Demo vision output" });
}



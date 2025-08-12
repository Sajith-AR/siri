import { NextResponse } from "next/server";
import twilio from "twilio";
import { env, hasTwilio } from "@/lib/env";

export async function POST(req: Request) {
  const { phone, text, time } = await req.json();
  if (!phone || !text) return NextResponse.json({ error: "Missing phone or text" }, { status: 400 });

  if (!hasTwilio) {
    return NextResponse.json({ ok: true, message: "Twilio not configured; simulated send." });
  }

  try {
    const client = twilio(env.TWILIO_SID!, env.TWILIO_AUTH_TOKEN!);
    const from = env.TWILIO_FROM;
    const service = env.TWILIO_MESSAGING_SERVICE_SID;
    const res = await client.messages.create({ to: phone, from: from || undefined, messagingServiceSid: service || undefined, body: text });
    return NextResponse.json({ ok: true, sid: res.sid, scheduled: time || null });
  } catch {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}



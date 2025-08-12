import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import { env, hasTwilio } from "@/lib/env";

export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (hasTwilio) {
    try {
      const client = twilio(env.TWILIO_SID!, env.TWILIO_AUTH_TOKEN!);
      const from = env.TWILIO_FROM;
      const service = env.TWILIO_MESSAGING_SERVICE_SID;
      await client.messages.create({
        to: phone,
        from: from || undefined,
        messagingServiceSid: service || undefined,
        body: `Your login code is ${otp}`,
      });
    } catch {
      return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
  }

  // Sign a short-lived token containing the otp to validate later
  const token = jwt.sign({ phone, otp }, env.JWT_SECRET, { expiresIn: "5m" });
  return NextResponse.json({ token });
}



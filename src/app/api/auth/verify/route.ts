import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const { token, code } = await req.json();
  if (!token || !code) return NextResponse.json({ error: "Missing data" }, { status: 400 });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { phone: string; otp: string };
    if (payload.otp !== code) return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    // Issue a session token
    const session = jwt.sign({ phone: payload.phone }, env.JWT_SECRET, { expiresIn: "1d" });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Invalid/expired token" }, { status: 401 });
  }
}



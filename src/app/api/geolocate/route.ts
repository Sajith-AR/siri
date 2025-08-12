import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder: client should use navigator.geolocation when available.
  // This endpoint can be enhanced to reverse-geocode IP if needed.
  return NextResponse.json({ ok: true });
}



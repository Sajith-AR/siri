import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  // In a real implementation, you'd use a geocoding service
  // For now, return a basic response
  return NextResponse.json({ 
    location: `${lat}, ${lng}`,
    city: "Location detected",
    country: "Unknown"
  });
}



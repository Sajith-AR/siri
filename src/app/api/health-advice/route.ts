import { NextResponse } from "next/server";
import { hasGemini } from "@/lib/env";
import { generateHealthAdvice } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { age, symptoms, medicalHistory, currentMedications, lifestyle } = body;

    if (!hasGemini) {
      return NextResponse.json({ 
        error: "Health advice service not configured" 
      }, { status: 503 });
    }

    const patientData = {
      age: age ? parseInt(age) : undefined,
      symptoms: symptoms || [],
      medicalHistory: medicalHistory || [],
      currentMedications: currentMedications || [],
      lifestyle: lifestyle || {}
    };

    const advice = await generateHealthAdvice(patientData);

    return NextResponse.json({
      ...advice,
      provider: "Gemini AI",
      timestamp: new Date().toISOString(),
      patientProfile: {
        age: patientData.age,
        hasSymptoms: patientData.symptoms.length > 0,
        hasMedicalHistory: patientData.medicalHistory.length > 0,
        takingMedications: patientData.currentMedications.length > 0
      }
    });

  } catch (error) {
    console.error("Health advice API error:", error);
    return NextResponse.json(
      { error: "Failed to generate health advice. Please try again." },
      { status: 500 }
    );
  }
}
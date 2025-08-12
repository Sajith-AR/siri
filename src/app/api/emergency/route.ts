import { NextResponse } from "next/server";
import { env, hasGemini } from "@/lib/env";

type EmergencyInfo = {
  number: string;
  name: string;
  language: string;
};

type EmergencyPhrases = {
  medical: string;
  location: string;
  symptoms: string;
  conscious: string;
  unconscious: string;
  bleeding?: string;
  chest_pain?: string;
  difficulty_breathing?: string;
};

// Global emergency numbers database
const EMERGENCY_NUMBERS: Record<string, EmergencyInfo> = {
  'US': { number: '911', name: 'Emergency Services', language: 'en' },
  'CA': { number: '911', name: 'Emergency Services', language: 'en' },
  'GB': { number: '999', name: 'Emergency Services', language: 'en' },
  'DE': { number: '112', name: 'Notruf', language: 'de' },
  'FR': { number: '112', name: 'Services d\'urgence', language: 'fr' },
  'IN': { number: '108', name: 'आपातकालीन सेवाएं', language: 'hi' },
  'LK': { number: '119', name: 'හදිසි සේවා', language: 'si' },
  'DEFAULT': { number: '112', name: 'Emergency Services', language: 'en' }
};

const EMERGENCY_PHRASES: Record<string, EmergencyPhrases> = {
  en: {
    medical: "Medical emergency. I need an ambulance.",
    location: "My location is:",
    symptoms: "Patient symptoms:",
    conscious: "Patient is conscious and breathing",
    unconscious: "Patient is unconscious",
    bleeding: "Severe bleeding present",
    chest_pain: "Patient has chest pain",
    difficulty_breathing: "Patient has difficulty breathing"
  },
  hi: {
    medical: "चिकित्सा आपातकाल। मुझे एम्बुलेंस चाहिए।",
    location: "मेरा स्थान है:",
    symptoms: "रोगी के लक्षण:",
    conscious: "रोगी होश में है और सांस ले रहा है",
    unconscious: "रोगी बेहोश है"
  },
  si: {
    medical: "වෛද්‍ය හදිසි අවස්ථාවක්. මට ගිලන් රථයක් අවශ්‍යයි.",
    location: "මගේ ස්ථානය:",
    symptoms: "රෝගියාගේ රෝග ලක්ෂණ:",
    conscious: "රෝගියා සිහියෙන් සිටී",
    unconscious: "රෝගියා සිහිසුන්ව සිටී"
  }
};

export async function POST(req: Request) {
  try {
    const { latitude, longitude, symptoms, severity, patientInfo, language = 'en' } = await req.json();

    const country = getCountryFromCoords(latitude, longitude);
    const emergencyInfo = EMERGENCY_NUMBERS[country] || EMERGENCY_NUMBERS.DEFAULT;
    
    const phrases = EMERGENCY_PHRASES[language] || EMERGENCY_PHRASES.en;
    const emergencyScript = generateEmergencyScript(phrases, symptoms, patientInfo, latitude, longitude);
    
    const nearbyHospitals = findNearbyHospitals(latitude, longitude);
    const riskLevel = calculateEmergencyRisk(symptoms, severity);

    return NextResponse.json({
      emergency: {
        number: emergencyInfo.number,
        name: emergencyInfo.name,
        country,
        riskLevel,
        script: emergencyScript,
        location: { latitude, longitude }
      },
      hospitals: nearbyHospitals,
      instructions: generateEmergencyInstructions(riskLevel, language),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Emergency API error:", error);
    return NextResponse.json({ error: "Emergency service unavailable" }, { status: 500 });
  }
}

function getCountryFromCoords(lat: number, lng: number): string {
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return 'US';
  if (lat >= 41 && lat <= 51 && lng >= -10 && lng <= 2) return 'GB';
  if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) return 'IN';
  if (lat >= 5 && lat <= 10 && lng >= 79 && lng <= 82) return 'LK';
  return 'DEFAULT';
}

function generateEmergencyScript(phrases: EmergencyPhrases, symptoms: string[], patientInfo: any, lat: number, lng: number): string {
  let script = phrases.medical + "\n\n";
  script += phrases.location + ` ${lat.toFixed(6)}, ${lng.toFixed(6)}\n\n`;
  
  if (symptoms && symptoms.length > 0) {
    script += phrases.symptoms + "\n";
    symptoms.forEach(symptom => {
      const phraseKey = symptom as keyof EmergencyPhrases;
      script += "- " + (phrases[phraseKey] || symptom) + "\n";
    });
  }
  
  return script;
}

function findNearbyHospitals(lat: number, lng: number) {
  return [
    {
      name: "City General Hospital",
      distance: "0.8 km",
      phone: "+1-555-0123",
      specialties: ["Emergency", "Trauma"],
      waitTime: "15 min"
    },
    {
      name: "Regional Medical Center", 
      distance: "2.1 km",
      phone: "+1-555-0456",
      specialties: ["Emergency", "Surgery"],
      waitTime: "25 min"
    }
  ];
}

function calculateEmergencyRisk(symptoms: string[], severity: string): string {
  const highRiskSymptoms = ['chest_pain', 'difficulty_breathing', 'unconscious', 'bleeding'];
  const hasHighRisk = symptoms?.some(s => highRiskSymptoms.includes(s));
  
  if (severity === 'critical' || hasHighRisk) return 'critical';
  if (severity === 'high') return 'high';
  return 'moderate';
}

function generateEmergencyInstructions(riskLevel: string, language: string) {
  const instructions: Record<string, Record<string, string[]>> = {
    en: {
      critical: [
        "🚨 CALL EMERGENCY SERVICES IMMEDIATELY",
        "📍 Share your exact location",
        "🫁 Check if patient is breathing",
        "🩸 Apply pressure to bleeding wounds"
      ],
      high: [
        "📞 Call emergency services now",
        "📍 Provide clear location details",
        "👁️ Monitor patient closely"
      ],
      moderate: [
        "📞 Consider calling emergency services",
        "📍 Have location ready",
        "👁️ Monitor symptoms"
      ]
    }
  };
  
  return instructions[language]?.[riskLevel] || instructions.en.critical;
}
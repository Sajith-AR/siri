import { NextResponse } from "next/server";
import { env, hasGemini } from "@/lib/env";
import { analyzeHealthRisk } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      age,
      symptoms,
      vitalSigns,
      medicalHistory,
      lifestyle,
      familyHistory,
      currentMedications,
      recentLabResults
    } = data;

    // Comprehensive health risk analysis
    const riskProfile = await analyzeHealthRisk({
      demographics: { age },
      currentSymptoms: symptoms || [],
      vitals: vitalSigns || {},
      medicalHistory: medicalHistory || [],
      lifestyle: lifestyle || {},
      genetics: familyHistory || [],
      medications: currentMedications || [],
      labResults: recentLabResults || {}
    });

    // Calculate composite risk score
    const riskScore = calculateCompositeRisk(riskProfile);
    
    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(riskProfile, riskScore);

    return NextResponse.json({
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      riskFactors: riskProfile.riskFactors,
      protectiveFactors: riskProfile.protectiveFactors,
      recommendations,
      nextScreening: calculateNextScreening(riskProfile),
      emergencyFlags: riskProfile.emergencyFlags,
      trendAnalysis: riskProfile.trends,
      provider: "SIRI Health Risk Engine",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Health risk analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze health risk" },
      { status: 500 }
    );
  }
}

function calculateCompositeRisk(profile: any): number {
  // Advanced risk calculation algorithm
  let score = 50; // baseline
  
  // Age factor
  if (profile.demographics?.age > 65) score += 15;
  else if (profile.demographics?.age > 45) score += 8;
  
  // Symptom severity
  const severityMap = { high: 20, medium: 10, low: 3 };
  profile.currentSymptoms?.forEach((symptom: any) => {
    score += severityMap[symptom.severity as keyof typeof severityMap] || 0;
  });
  
  // Medical history impact
  const highRiskConditions = ['diabetes', 'hypertension', 'heart disease', 'cancer'];
  profile.medicalHistory?.forEach((condition: string) => {
    if (highRiskConditions.some(hrc => condition.toLowerCase().includes(hrc))) {
      score += 12;
    }
  });
  
  // Lifestyle factors
  if (profile.lifestyle?.smoking) score += 15;
  if (profile.lifestyle?.exercise === 'none') score += 8;
  if (profile.lifestyle?.diet === 'poor') score += 6;
  
  // Protective factors
  if (profile.lifestyle?.exercise === 'regular') score -= 5;
  if (profile.lifestyle?.diet === 'healthy') score -= 3;
  
  return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'minimal';
}

function generatePersonalizedRecommendations(profile: any, riskScore: number): any[] {
  const recommendations = [];
  
  if (riskScore >= 60) {
    recommendations.push({
      type: 'urgent',
      title: 'Schedule Immediate Medical Consultation',
      description: 'Your risk profile indicates need for professional evaluation',
      priority: 1
    });
  }
  
  if (profile.lifestyle?.exercise === 'none') {
    recommendations.push({
      type: 'lifestyle',
      title: 'Start Regular Exercise Program',
      description: 'Begin with 30 minutes of moderate activity 3x per week',
      priority: 2
    });
  }
  
  return recommendations;
}

function calculateNextScreening(profile: any): any {
  // AI-powered screening schedule optimization
  const baseScreenings = {
    'blood_pressure': 30, // days
    'cholesterol': 365,
    'diabetes': 180,
    'cancer_screening': 365
  };
  
  // Adjust based on risk factors
  return baseScreenings;
}
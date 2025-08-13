import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { symptomCheckRequestSchema, createValidator } from "@/lib/validation";
import { performanceMonitor } from "@/lib/healthMonitor";
import { aiService } from "@/lib/aiService";
import { getReferences } from "@/lib/medicalReferences";

const validateSymptomCheck = createValidator(symptomCheckRequestSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateSymptomCheck(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validation.errors,
            code: "VALIDATION_ERROR"
          },
          { status: 400 }
        );
      }

      const { input, patientId, severity } = validation.data!;
      const text = input.trim();

      // Use comprehensive AI service for symptom analysis
      const analysis = await aiService.analyzeSymptoms(text, patientId);
      
      // Get medical references
      const references = getReferences(
        (analysis.conditions ?? []).map((c: any) => c.name)
      );

      const result = {
        ...analysis,
        references,
        severity: severity || 'unknown',
        metadata: {
          processingTime: Date.now() - startTime,
          analysisVersion: '3.0',
          patientId: patientId || null,
          aiProvider: 'Gemini AI Enhanced'
        },
        timestamp: new Date().toISOString()
      };
      
      // Record performance metrics
      performanceMonitor.recordMetric('symptom_analysis_total_time', Date.now() - startTime);
      performanceMonitor.recordMetric('symptom_analysis_success', 1);

      return NextResponse.json(result);

    } catch (error) {
      performanceMonitor.recordMetric('symptom_analysis_errors', 1);
      console.error("Enhanced assessment API error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to analyze symptoms", 
          message: "Our medical analysis service is temporarily unavailable. Please try again or consult a healthcare provider.",
          code: "ANALYSIS_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 20, windowMs: 60000 }, // 20 requests per minute
    validateInput: (data) => validateSymptomCheck(data)
  }
);

async function performHeuristicAnalysis(text: string, severity?: string): Promise<any> {
  const lowerText = text.toLowerCase();
  
  // Enhanced keyword analysis with medical terminology
  const criticalKeywords = [
    'chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding',
    'difficulty breathing', 'shortness of breath', 'can\'t breathe'
  ];
  
  const highRiskKeywords = [
    'severe pain', 'high fever', 'vomiting blood', 'severe headache',
    'confusion', 'seizure', 'allergic reaction'
  ];
  
  const mediumRiskKeywords = [
    'fever', 'vomiting', 'diarrhea', 'pain', 'headache', 'dizziness',
    'nausea', 'fatigue', 'weakness'
  ];

  let risk: "low" | "medium" | "high" | "critical" = "low";
  let urgency = false;
  
  if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
    risk = "critical";
    urgency = true;
  } else if (highRiskKeywords.some(keyword => lowerText.includes(keyword)) || severity === 'high') {
    risk = "high";
    urgency = true;
  } else if (mediumRiskKeywords.some(keyword => lowerText.includes(keyword)) || severity === 'medium') {
    risk = "medium";
  }

  // Generate conditions based on symptoms
  const conditions = generateConditionsFromSymptoms(lowerText, risk);
  
  // Generate next steps based on risk level
  const nextSteps = generateNextSteps(risk, urgency);
  
  // Generate red flags
  const redFlags = generateRedFlags(lowerText, risk);

  return {
    risk,
    conditions,
    nextSteps,
    urgency,
    explanation: generateExplanation(risk, conditions),
    redFlags,
    followUpRecommendations: generateFollowUpRecommendations(risk)
  };
}

function generateConditionsFromSymptoms(text: string, risk: string): any[] {
  const conditions = [];
  
  if (text.includes('fever') || text.includes('temperature')) {
    conditions.push({
      name: 'Viral Infection',
      confidence: 0.7,
      description: 'Common viral illness with fever',
      icd10Code: 'B34.9'
    });
  }
  
  if (text.includes('headache')) {
    conditions.push({
      name: risk === 'high' ? 'Severe Headache Disorder' : 'Tension Headache',
      confidence: risk === 'high' ? 0.6 : 0.8,
      description: 'Head pain requiring evaluation',
      icd10Code: 'G44.1'
    });
  }
  
  if (text.includes('chest pain')) {
    conditions.push({
      name: 'Chest Pain Syndrome',
      confidence: 0.5,
      description: 'Chest discomfort requiring immediate evaluation',
      icd10Code: 'R06.02'
    });
  }
  
  // Default condition if no specific symptoms identified
  if (conditions.length === 0) {
    conditions.push({
      name: 'General Malaise',
      confidence: 0.4,
      description: 'Non-specific symptoms requiring monitoring',
      icd10Code: 'R53'
    });
  }
  
  return conditions;
}

function generateNextSteps(risk: string, urgency: boolean): string[] {
  if (risk === 'critical' || urgency) {
    return [
      "🚨 Seek immediate emergency medical care",
      "Call emergency services (911) if symptoms are severe",
      "Do not drive yourself to the hospital",
      "Have someone stay with you until help arrives"
    ];
  }
  
  if (risk === 'high') {
    return [
      "Contact your healthcare provider immediately",
      "Consider urgent care if primary care unavailable",
      "Monitor symptoms closely",
      "Seek emergency care if symptoms worsen"
    ];
  }
  
  if (risk === 'medium') {
    return [
      "Schedule appointment with healthcare provider within 24-48 hours",
      "Rest and stay hydrated",
      "Monitor symptoms and track changes",
      "Take over-the-counter medications as appropriate"
    ];
  }
  
  return [
    "Monitor symptoms for 24-48 hours",
    "Rest and maintain good hydration",
    "Contact healthcare provider if symptoms persist or worsen",
    "Practice good self-care and hygiene"
  ];
}

function generateRedFlags(text: string, risk: string): string[] {
  const redFlags = [];
  
  if (text.includes('chest pain')) {
    redFlags.push("Chest pain with shortness of breath");
    redFlags.push("Chest pain radiating to arm or jaw");
  }
  
  if (text.includes('headache')) {
    redFlags.push("Sudden severe headache");
    redFlags.push("Headache with vision changes");
  }
  
  if (risk === 'critical' || risk === 'high') {
    redFlags.push("Difficulty breathing or shortness of breath");
    redFlags.push("Loss of consciousness or confusion");
    redFlags.push("Severe or worsening pain");
  }
  
  return redFlags;
}

function generateFollowUpRecommendations(risk: string): any {
  const baseRecommendations = {
    low: { timeline: "1-2 weeks", action: "Monitor symptoms" },
    medium: { timeline: "3-5 days", action: "Follow up with healthcare provider" },
    high: { timeline: "24-48 hours", action: "Urgent medical evaluation" },
    critical: { timeline: "Immediate", action: "Emergency medical care" }
  };
  
  return baseRecommendations[risk as keyof typeof baseRecommendations] || baseRecommendations.low;
}

function generateExplanation(risk: string, conditions: any[]): string {
  const conditionNames = conditions.map(c => c.name).join(', ');
  
  return `Based on the symptoms described, the analysis suggests possible ${conditionNames}. ` +
         `This assessment indicates a ${risk} risk level. ` +
         `Please note that this is an AI-powered analysis for informational purposes only and ` +
         `should not replace professional medical evaluation and diagnosis.`;
}

async function enhanceAnalysis(analysis: any, originalText: string, patientId?: string): Promise<any> {
  // Add symptom severity scoring
  analysis.severityScore = calculateSeverityScore(analysis.risk, analysis.conditions);
  
  // Add triage category
  analysis.triageCategory = determineTriageCategory(analysis.risk, analysis.urgency);
  
  // Add patient-specific enhancements if patientId provided
  if (patientId) {
    // In a real system, this would fetch patient history
    analysis.patientContext = {
      hasHistory: false,
      riskFactors: [],
      medications: []
    };
  }
  
  return analysis;
}

function calculateSeverityScore(risk: string, conditions: any[]): number {
  const riskScores = { low: 1, medium: 3, high: 7, critical: 10 };
  const baseScore = riskScores[risk as keyof typeof riskScores] || 1;
  
  const conditionScore = conditions.reduce((sum, condition) => {
    return sum + (condition.confidence * 2);
  }, 0);
  
  return Math.min(10, baseScore + conditionScore);
}

function determineTriageCategory(risk: string, urgency: boolean): string {
  if (risk === 'critical' || urgency) return 'Emergency';
  if (risk === 'high') return 'Urgent';
  if (risk === 'medium') return 'Semi-urgent';
  return 'Non-urgent';
}

function calculateConfidence(analysis: any, provider: string): number {
  const providerConfidence = {
    'Gemini AI': 0.9,
    'OpenAI GPT-4': 0.85,
    'Enhanced Heuristic Analysis': 0.6
  };
  
  const baseConfidence = providerConfidence[provider as keyof typeof providerConfidence] || 0.5;
  const conditionConfidence = analysis.conditions?.length > 0 
    ? analysis.conditions.reduce((sum: number, c: any) => sum + c.confidence, 0) / analysis.conditions.length
    : 0.5;
  
  return Math.round((baseConfidence * 0.7 + conditionConfidence * 0.3) * 100);
}



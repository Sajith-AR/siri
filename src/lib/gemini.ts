import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, hasGemini } from "./env";
import { logger } from "./logging";

let genAI: GoogleGenerativeAI | null = null;

if (hasGemini) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
}

// Enhanced error handling and response parsing
export async function generateWithGemini(prompt: string, imagePart?: any): Promise<any> {
  if (!genAI) {
    throw new Error("Gemini AI not configured. Please set GEMINI_API_KEY in environment variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const parts = imagePart ? [prompt, imagePart] : [prompt];
    
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    
    logger.info("Gemini API response received", { promptLength: prompt.length });
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, return the raw text
    return { response: text };
  } catch (error) {
    logger.error("Gemini API error", { error: error.message });
    throw error;
  }
}

export async function analyzeSymptoms(symptoms: string) {
  const prompt = `
You are a medical AI assistant. Analyze the following symptoms and provide a structured response.

Symptoms: "${symptoms}"

Please respond with a JSON object containing:
1. "risk" - one of: "low", "medium", "high"
2. "conditions" - array of possible conditions with confidence scores (0-1)
3. "nextSteps" - array of recommended next steps
4. "urgency" - boolean indicating if immediate medical attention is needed
5. "explanation" - brief explanation of the assessment

Important: This is for informational purposes only and not a substitute for professional medical advice.

Example format:
{
  "risk": "medium",
  "conditions": [
    {"name": "Common Cold", "confidence": 0.7},
    {"name": "Flu", "confidence": 0.5}
  ],
  "nextSteps": [
    "Rest and stay hydrated",
    "Monitor symptoms for 24-48 hours",
    "Consult a doctor if symptoms worsen"
  ],
  "urgency": false,
  "explanation": "Based on the symptoms, this appears to be a common viral infection."
}
`;

  return await generateWithGemini(prompt);
}

export async function analyzeImage(imageBase64: string, mimeType: string) {
  const prompt = `
Analyze this medical image and provide observations. Focus on:
1. Visible symptoms or conditions
2. Color, texture, and appearance
3. Any concerning features
4. General assessment

Important: Provide observations only, not diagnoses. This is for informational purposes.

Respond with a JSON object:
{
  "findings": ["observation 1", "observation 2"],
  "severity": "low|medium|high",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "disclaimer": "This is an AI analysis for informational purposes only. Consult a healthcare professional for proper diagnosis."
}
`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  };

  return await generateWithGemini(prompt, imagePart);
}

export async function generateHealthAdvice(patientData: {
  age?: number;
  symptoms?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
}) {
  const prompt = `
As a medical AI assistant, provide personalized health advice based on the following patient information:

Age: ${patientData.age || "Not specified"}
Current Symptoms: ${patientData.symptoms?.join(", ") || "None reported"}
Medical History: ${patientData.medicalHistory?.join(", ") || "None reported"}
Current Medications: ${patientData.currentMedications?.join(", ") || "None reported"}

Please provide:
1. General health recommendations
2. Lifestyle suggestions
3. Preventive measures
4. When to seek medical attention

Respond with a JSON object:
{
  "recommendations": ["recommendation 1", "recommendation 2"],
  "lifestyle": ["lifestyle tip 1", "lifestyle tip 2"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "warnings": ["warning 1", "warning 2"],
  "disclaimer": "This advice is for informational purposes only. Always consult with healthcare professionals for medical decisions."
}
`;

  return await generateWithGemini(prompt);
}

export async function analyzeHealthRisk(healthData: {
  demographics?: { age?: number };
  currentSymptoms?: string[];
  vitals?: any;
  medicalHistory?: string[];
  lifestyle?: any;
  genetics?: string[];
  medications?: string[];
  labResults?: any;
}) {
  const prompt = `
As an advanced medical AI, analyze the following comprehensive health data and provide a detailed risk assessment:

Demographics: Age ${healthData.demographics?.age || "Unknown"}
Current Symptoms: ${healthData.currentSymptoms?.join(", ") || "None"}
Vital Signs: ${JSON.stringify(healthData.vitals || {})}
Medical History: ${healthData.medicalHistory?.join(", ") || "None"}
Lifestyle Factors: ${JSON.stringify(healthData.lifestyle || {})}
Family History: ${healthData.genetics?.join(", ") || "None"}
Current Medications: ${healthData.medications?.join(", ") || "None"}
Recent Lab Results: ${JSON.stringify(healthData.labResults || {})}

Provide a comprehensive health risk analysis with:
1. Risk factors identified
2. Protective factors present
3. Emergency flags (if any)
4. Health trends analysis
5. Personalized recommendations

Respond with a JSON object:
{
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "protectiveFactors": ["protective factor 1", "protective factor 2"],
  "emergencyFlags": ["emergency flag 1"],
  "trends": {
    "cardiovascular": "improving",
    "metabolic": "stable",
    "mental": "declining"
  },
  "overallRisk": "moderate",
  "recommendations": [
    {
      "category": "lifestyle",
      "priority": "high",
      "action": "specific recommendation"
    }
  ]
}
`;

  return await generateWithGemini(prompt);
}

// New comprehensive healthcare AI functions

export async function generateMedicalReport(patientData: any, testResults: any) {
  const prompt = `
Generate a comprehensive medical report based on the following data:

Patient Information: ${JSON.stringify(patientData)}
Test Results: ${JSON.stringify(testResults)}

Create a structured medical report with:
1. Patient summary
2. Test results interpretation
3. Clinical findings
4. Recommendations
5. Follow-up plan

Respond with a JSON object:
{
  "patientSummary": "Brief patient overview",
  "testInterpretation": ["finding 1", "finding 2"],
  "clinicalFindings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "followUp": {
    "timeframe": "2 weeks",
    "actions": ["action 1", "action 2"]
  },
  "severity": "low|medium|high",
  "disclaimer": "Medical disclaimer"
}
`;

  return await generateWithGemini(prompt);
}

export async function analyzeVitalSigns(vitals: {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}) {
  const prompt = `
Analyze the following vital signs and provide medical assessment:

Heart Rate: ${vitals.heartRate || "Not provided"} bpm
Blood Pressure: ${vitals.bloodPressure ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}` : "Not provided"} mmHg
Temperature: ${vitals.temperature || "Not provided"}°F
Respiratory Rate: ${vitals.respiratoryRate || "Not provided"} breaths/min
Oxygen Saturation: ${vitals.oxygenSaturation || "Not provided"}%
Weight: ${vitals.weight || "Not provided"} lbs
Height: ${vitals.height || "Not provided"} inches

Provide analysis with:
1. Normal/abnormal ranges
2. Clinical significance
3. Potential concerns
4. Recommendations

Respond with a JSON object:
{
  "analysis": {
    "heartRate": {"status": "normal|abnormal", "note": "explanation"},
    "bloodPressure": {"status": "normal|abnormal", "note": "explanation"},
    "temperature": {"status": "normal|abnormal", "note": "explanation"},
    "respiratoryRate": {"status": "normal|abnormal", "note": "explanation"},
    "oxygenSaturation": {"status": "normal|abnormal", "note": "explanation"}
  },
  "overallAssessment": "Overall health status",
  "concerns": ["concern 1", "concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "urgency": "low|medium|high"
}
`;

  return await generateWithGemini(prompt);
}

export async function generateTreatmentPlan(diagnosis: string, patientProfile: any) {
  const prompt = `
Create a comprehensive treatment plan for:

Diagnosis: ${diagnosis}
Patient Profile: ${JSON.stringify(patientProfile)}

Generate a detailed treatment plan including:
1. Primary treatment approach
2. Medications (if applicable)
3. Lifestyle modifications
4. Monitoring requirements
5. Expected outcomes
6. Alternative treatments

Respond with a JSON object:
{
  "primaryTreatment": {
    "approach": "treatment approach",
    "duration": "expected duration",
    "steps": ["step 1", "step 2"]
  },
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage info",
      "frequency": "frequency",
      "duration": "duration"
    }
  ],
  "lifestyle": ["modification 1", "modification 2"],
  "monitoring": {
    "frequency": "monitoring frequency",
    "parameters": ["parameter 1", "parameter 2"]
  },
  "expectedOutcomes": ["outcome 1", "outcome 2"],
  "alternatives": ["alternative 1", "alternative 2"],
  "warnings": ["warning 1", "warning 2"]
}
`;

  return await generateWithGemini(prompt);
}

export async function analyzeMedication(medicationData: {
  name: string;
  dosage?: string;
  frequency?: string;
  patientAge?: number;
  patientWeight?: number;
  allergies?: string[];
  currentMedications?: string[];
}) {
  const prompt = `
Analyze the following medication for safety and interactions:

Medication: ${medicationData.name}
Dosage: ${medicationData.dosage || "Not specified"}
Frequency: ${medicationData.frequency || "Not specified"}
Patient Age: ${medicationData.patientAge || "Not specified"}
Patient Weight: ${medicationData.patientWeight || "Not specified"} lbs
Known Allergies: ${medicationData.allergies?.join(", ") || "None"}
Current Medications: ${medicationData.currentMedications?.join(", ") || "None"}

Provide analysis including:
1. Drug information
2. Dosage appropriateness
3. Potential interactions
4. Side effects
5. Contraindications
6. Monitoring requirements

Respond with a JSON object:
{
  "drugInfo": {
    "category": "drug category",
    "mechanism": "how it works",
    "indications": ["indication 1", "indication 2"]
  },
  "dosageAnalysis": {
    "appropriate": true,
    "notes": "dosage notes"
  },
  "interactions": [
    {
      "drug": "interacting drug",
      "severity": "mild|moderate|severe",
      "description": "interaction description"
    }
  ],
  "sideEffects": {
    "common": ["side effect 1", "side effect 2"],
    "serious": ["serious effect 1", "serious effect 2"]
  },
  "contraindications": ["contraindication 1", "contraindication 2"],
  "monitoring": ["monitoring requirement 1", "monitoring requirement 2"],
  "warnings": ["warning 1", "warning 2"]
}
`;

  return await generateWithGemini(prompt);
}

export async function generateHealthEducation(topic: string, patientProfile?: any) {
  const prompt = `
Create educational content about: ${topic}

Patient Profile: ${JSON.stringify(patientProfile || {})}

Generate comprehensive health education including:
1. Overview of the condition/topic
2. Causes and risk factors
3. Symptoms to watch for
4. Prevention strategies
5. Treatment options
6. When to seek medical help
7. Lifestyle recommendations

Respond with a JSON object:
{
  "overview": "Clear explanation of the topic",
  "causes": ["cause 1", "cause 2"],
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "symptoms": ["symptom 1", "symptom 2"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "treatments": ["treatment option 1", "treatment option 2"],
  "seekHelp": ["when to see doctor 1", "when to see doctor 2"],
  "lifestyle": ["lifestyle tip 1", "lifestyle tip 2"],
  "resources": ["resource 1", "resource 2"]
}
`;

  return await generateWithGemini(prompt);
}

export async function analyzeEmergencySymptoms(symptoms: string[], vitals?: any) {
  const prompt = `
EMERGENCY MEDICAL ANALYSIS - Analyze the following symptoms for urgency:

Symptoms: ${symptoms.join(", ")}
Vital Signs: ${JSON.stringify(vitals || {})}

Provide immediate emergency assessment:
1. Urgency level (1-10)
2. Potential emergency conditions
3. Immediate actions required
4. Emergency room recommendation
5. Life-threatening indicators

Respond with a JSON object:
{
  "urgencyLevel": 8,
  "emergencyConditions": ["condition 1", "condition 2"],
  "immediateActions": ["action 1", "action 2"],
  "erRecommendation": true,
  "lifeThreatening": true,
  "callEmergency": true,
  "timeframe": "immediate|within 1 hour|within 24 hours",
  "warnings": ["warning 1", "warning 2"],
  "disclaimer": "This is an AI assessment. Call emergency services immediately if life-threatening."
}
`;

  return await generateWithGemini(prompt);
}

export async function generateWellnessPlan(goals: string[], currentHealth: any) {
  const prompt = `
Create a personalized wellness plan based on:

Health Goals: ${goals.join(", ")}
Current Health Status: ${JSON.stringify(currentHealth)}

Generate a comprehensive wellness plan including:
1. Goal-specific recommendations
2. Exercise plan
3. Nutrition guidance
4. Mental health support
5. Progress tracking
6. Timeline and milestones

Respond with a JSON object:
{
  "goals": [
    {
      "goal": "goal name",
      "plan": "specific plan",
      "timeline": "expected timeline"
    }
  ],
  "exercise": {
    "type": "exercise type",
    "frequency": "frequency",
    "duration": "duration",
    "progression": "how to progress"
  },
  "nutrition": {
    "guidelines": ["guideline 1", "guideline 2"],
    "foods": {
      "include": ["food 1", "food 2"],
      "limit": ["food 1", "food 2"]
    }
  },
  "mentalHealth": ["tip 1", "tip 2"],
  "tracking": ["metric 1", "metric 2"],
  "milestones": [
    {
      "timeframe": "1 month",
      "targets": ["target 1", "target 2"]
    }
  ]
}
`;

  return await generateWithGemini(prompt);
}
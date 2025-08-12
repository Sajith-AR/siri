import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, hasGemini } from "./env";

let genAI: GoogleGenerativeAI | null = null;

if (hasGemini) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
}

export async function analyzeSymptoms(symptoms: string) {
  if (!genAI) {
    throw new Error("Gemini AI not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}

export async function analyzeImage(imageBase64: string, mimeType: string) {
  if (!genAI) {
    throw new Error("Gemini AI not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini image analysis error:", error);
    throw error;
  }
}

export async function generateHealthAdvice(patientData: {
  age?: number;
  symptoms?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
}) {
  if (!genAI) {
    throw new Error("Gemini AI not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini health advice error:", error);
    throw error;
  }
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
  if (!genAI) {
    throw new Error("Gemini AI not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini health risk analysis error:", error);
    throw error;
  }
}
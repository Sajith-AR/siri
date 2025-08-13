import * as gemini from './gemini';
import { logger } from './logging';
import { cache } from './cache';

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Symptom Analysis
  async analyzeSymptoms(symptoms: string, patientId?: string) {
    const cacheKey = `symptoms:${Buffer.from(symptoms).toString('base64')}`;
    
    try {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached symptom analysis');
        return cached;
      }

      const result = await gemini.analyzeSymptoms(symptoms);
      
      // Cache for 1 hour
      cache.set(cacheKey, result, 3600);
      
      logger.info('Symptom analysis completed', { patientId, symptomsLength: symptoms.length });
      return result;
    } catch (error) {
      logger.error('Symptom analysis failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Image Analysis
  async analyzeImage(imageBase64: string, mimeType: string, patientId?: string) {
    try {
      const result = await gemini.analyzeImage(imageBase64, mimeType);
      logger.info('Image analysis completed', { patientId, mimeType });
      return result;
    } catch (error) {
      logger.error('Image analysis failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Health Risk Assessment
  async assessHealthRisk(healthData: any, patientId?: string) {
    const cacheKey = `risk:${patientId}:${Date.now()}`;
    
    try {
      const result = await gemini.analyzeHealthRisk(healthData);
      
      // Cache for 24 hours
      cache.set(cacheKey, result, 86400);
      
      logger.info('Health risk assessment completed', { patientId });
      return result;
    } catch (error) {
      logger.error('Health risk assessment failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Vital Signs Analysis
  async analyzeVitals(vitals: any, patientId?: string) {
    try {
      const result = await gemini.analyzeVitalSigns(vitals);
      logger.info('Vital signs analysis completed', { patientId });
      return result;
    } catch (error) {
      logger.error('Vital signs analysis failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Treatment Planning
  async generateTreatmentPlan(diagnosis: string, patientProfile: any, patientId?: string) {
    try {
      const result = await gemini.generateTreatmentPlan(diagnosis, patientProfile);
      logger.info('Treatment plan generated', { patientId, diagnosis });
      return result;
    } catch (error) {
      logger.error('Treatment plan generation failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Medication Analysis
  async analyzeMedication(medicationData: any, patientId?: string) {
    const cacheKey = `medication:${medicationData.name}:${patientId}`;
    
    try {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached medication analysis');
        return cached;
      }

      const result = await gemini.analyzeMedication(medicationData);
      
      // Cache for 12 hours
      cache.set(cacheKey, result, 43200);
      
      logger.info('Medication analysis completed', { patientId, medication: medicationData.name });
      return result;
    } catch (error) {
      logger.error('Medication analysis failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Health Education
  async generateHealthEducation(topic: string, patientProfile?: any, patientId?: string) {
    const cacheKey = `education:${topic}`;
    
    try {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached health education');
        return cached;
      }

      const result = await gemini.generateHealthEducation(topic, patientProfile);
      
      // Cache for 7 days
      cache.set(cacheKey, result, 604800);
      
      logger.info('Health education generated', { patientId, topic });
      return result;
    } catch (error) {
      logger.error('Health education generation failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Emergency Analysis
  async analyzeEmergency(symptoms: string[], vitals?: any, patientId?: string) {
    try {
      const result = await gemini.analyzeEmergencySymptoms(symptoms, vitals);
      logger.warn('Emergency analysis completed', { 
        patientId, 
        urgencyLevel: result.urgencyLevel,
        callEmergency: result.callEmergency 
      });
      return result;
    } catch (error) {
      logger.error('Emergency analysis failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Wellness Planning
  async generateWellnessPlan(goals: string[], currentHealth: any, patientId?: string) {
    try {
      const result = await gemini.generateWellnessPlan(goals, currentHealth);
      logger.info('Wellness plan generated', { patientId, goals: goals.length });
      return result;
    } catch (error) {
      logger.error('Wellness plan generation failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Medical Report Generation
  async generateMedicalReport(patientData: any, testResults: any, patientId?: string) {
    try {
      const result = await gemini.generateMedicalReport(patientData, testResults);
      logger.info('Medical report generated', { patientId });
      return result;
    } catch (error) {
      logger.error('Medical report generation failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Health Advice
  async generateHealthAdvice(patientData: any, patientId?: string) {
    const cacheKey = `advice:${patientId}:${JSON.stringify(patientData).slice(0, 50)}`;
    
    try {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached health advice');
        return cached;
      }

      const result = await gemini.generateHealthAdvice(patientData);
      
      // Cache for 6 hours
      cache.set(cacheKey, result, 21600);
      
      logger.info('Health advice generated', { patientId });
      return result;
    } catch (error) {
      logger.error('Health advice generation failed', { error: error.message, patientId });
      throw error;
    }
  }

  // Chat/Conversation AI
  async processHealthChat(message: string, context?: any, patientId?: string) {
    try {
      const contextData = context || {};
      const conversationHistory = contextData.context || [];
      const patientHistory = contextData.patientHistory || {};

      const prompt = `
You are SIRI, an advanced healthcare AI assistant. Respond to the following patient message in a helpful, empathetic, and medically appropriate way.

Patient Message: "${message}"
Conversation History: ${JSON.stringify(conversationHistory.slice(-3))}
Patient History: ${JSON.stringify(patientHistory)}

Provide a helpful response that:
1. Addresses the patient's concern with empathy
2. Provides relevant, accurate health information
3. Suggests appropriate next steps
4. Maintains professional boundaries
5. Includes appropriate disclaimers
6. References previous conversation if relevant

Respond with a JSON object:
{
  "content": "Your helpful and empathetic response to the patient",
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "urgency": "low|medium|high",
  "followUp": "recommended follow-up action",
  "riskAssessment": "low|medium|high",
  "emergencyFlags": ["any emergency indicators"],
  "confidence": 85,
  "sources": ["Medical knowledge base", "Clinical guidelines"],
  "disclaimer": "This information is for educational purposes only and should not replace professional medical advice."
}
`;

      const result = await gemini.generateWithGemini(prompt);
      logger.info('Health chat processed', { patientId, messageLength: message.length });
      return result;
    } catch (error) {
      logger.error('Health chat processing failed', { error: error.message, patientId });
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
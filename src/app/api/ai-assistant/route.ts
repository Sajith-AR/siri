import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { aiAssistantRequestSchema, createValidator } from "@/lib/validation";
import { medicalCache, hashObject } from "@/lib/cache";
import { performanceMonitor } from "@/lib/healthMonitor";
import { env, hasGemini, hasOpenAI } from "@/lib/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const validateAIRequest = createValidator(aiAssistantRequestSchema);

export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validateAIRequest(body);
      
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

      const { message, context, patientHistory } = validation.data!;

      // Check cache for similar conversations
      const contextHash = hashObject({ message, context: context?.slice(-3) });
      const cacheKey = `ai:${contextHash}`;
      const cached = medicalCache.get(cacheKey);
      
      if (cached) {
        performanceMonitor.recordMetric('ai_assistant_cache_hit', Date.now() - startTime);
        return NextResponse.json({
          ...cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Build comprehensive context for AI
      const systemPrompt = buildEnhancedSystemPrompt(patientHistory, context, message);
    
      let response: any = null;
      let provider = "Unknown";

      // Try Gemini AI first
      if (hasGemini) {
        try {
          response = await getEnhancedGeminiResponse(systemPrompt, message, context);
          provider = "Gemini AI";
          performanceMonitor.recordMetric('gemini_assistant_response_time', Date.now() - startTime);
        } catch (error) {
          console.error("Gemini AI assistant failed:", error);
          performanceMonitor.recordMetric('gemini_assistant_failures', 1);
        }
      }

      // Fallback to OpenAI
      if (!response && hasOpenAI) {
        try {
          response = await getEnhancedOpenAIResponse(systemPrompt, message, context);
          provider = "OpenAI GPT-4";
          performanceMonitor.recordMetric('openai_assistant_response_time', Date.now() - startTime);
        } catch (error) {
          console.error("OpenAI assistant failed:", error);
          performanceMonitor.recordMetric('openai_assistant_failures', 1);
        }
      }

      // Enhanced fallback response
      if (!response) {
        response = await generateEnhancedFallbackResponse(message, context, patientHistory);
        provider = "Enhanced Fallback Assistant";
      }

      // Enhance response with additional metadata
      const enhancedResponse = {
        ...response,
        provider,
        conversationId: generateConversationId(context),
        sentiment: analyzeSentiment(message),
        urgencyLevel: assessUrgency(message, response),
        followUpSuggestions: generateFollowUpSuggestions(message, response),
        metadata: {
          processingTime: Date.now() - startTime,
          modelVersion: '2.0',
          contextLength: context?.length || 0
        },
        timestamp: new Date().toISOString()
      };

      // Cache the response
      medicalCache.cacheAIResponse(cacheKey, enhancedResponse);
      
      // Record performance metrics
      performanceMonitor.recordMetric('ai_assistant_total_time', Date.now() - startTime);
      performanceMonitor.recordMetric('ai_assistant_success', 1);

      return NextResponse.json(enhancedResponse);

    } catch (error) {
      performanceMonitor.recordMetric('ai_assistant_errors', 1);
      console.error("Enhanced AI Assistant API error:", error);
      
      return NextResponse.json(
        { 
          error: "AI assistant temporarily unavailable",
          message: "Our AI health assistant is experiencing technical difficulties. Please try again or contact support.",
          code: "AI_SERVICE_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 30, windowMs: 60000 }, // 30 requests per minute
    validateInput: (data) => validateAIRequest(data)
  }
);

function buildEnhancedSystemPrompt(patientHistory: any, context: any[], currentMessage: string): string {
  let prompt = `You are SIRI, an advanced AI health assistant with memory and personalization capabilities. 

CORE CAPABILITIES:
- Remember patient history and preferences
- Provide personalized health advice
- Analyze symptoms with medical knowledge
- Offer medication guidance
- Suggest wellness recommendations
- Recognize emergency situations

PATIENT CONTEXT:`;

  if (patientHistory?.previousSymptoms?.length > 0) {
    prompt += `\nPrevious symptoms: ${patientHistory.previousSymptoms.map((s: any) => s.text).join(', ')}`;
  }

  if (patientHistory?.lastAssessment) {
    prompt += `\nLast assessment: ${JSON.stringify(patientHistory.lastAssessment)}`;
  }

  if (patientHistory?.preferences) {
    prompt += `\nPatient preferences: ${JSON.stringify(patientHistory.preferences)}`;
  }

  prompt += `

CONVERSATION HISTORY:
${context.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

RESPONSE GUIDELINES:
- Be empathetic and supportive
- Provide actionable advice
- Include confidence levels
- Suggest relevant follow-up actions
- Always include medical disclaimers when appropriate
- Remember and reference previous conversations
- Personalize responses based on patient history

EMERGENCY DETECTION:
If you detect emergency symptoms (chest pain, difficulty breathing, loss of consciousness, severe bleeding), immediately recommend calling emergency services.

Respond in a helpful, caring tone while maintaining medical accuracy.`;

  return prompt;
}

async function getGeminiResponse(systemPrompt: string, message: string, context: any[]) {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fullPrompt = `${systemPrompt}

Current message: "${message}"

Please respond with a JSON object containing:
{
  "content": "Your helpful response",
  "confidence": 85,
  "sources": ["Medical knowledge base", "Patient history"],
  "actionItems": ["Specific action 1", "Specific action 2"]
}`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse Gemini JSON response");
  }

  // Fallback response format
  return {
    content: text,
    confidence: 80,
    sources: ["Gemini AI Medical Knowledge"],
    actionItems: extractActionItems(text)
  };
}

async function getOpenAIResponse(systemPrompt: string, message: string, context: any[]) {
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...context.slice(-5), // Last 5 messages for context
    { role: "user", content: message }
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  try {
    return JSON.parse(content);
  } catch (error) {
    return {
      content: content,
      confidence: 75,
      sources: ["OpenAI Medical Knowledge"],
      actionItems: extractActionItems(content)
    };
  }
}

function generateBasicResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    return "I understand you're experiencing pain. Can you describe the location, intensity (1-10), and duration? If the pain is severe or sudden, please consider seeking immediate medical attention.";
  }
  
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return "Fever can indicate your body is fighting an infection. Monitor your temperature, stay hydrated, and rest. If fever exceeds 103°F (39.4°C) or persists for more than 3 days, consult a healthcare provider.";
  }
  
  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
    return "I can help with general medication information, but always consult your healthcare provider or pharmacist for specific medication advice. Never stop or change medications without professional guidance.";
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
    return "🚨 If this is a medical emergency, please call your local emergency number immediately (911 in US, 999 in UK, 112 in EU). For urgent but non-emergency situations, contact your healthcare provider or visit an urgent care center.";
  }
  
  return "I'm here to help with your health questions. Can you provide more specific details about your symptoms or concerns? Remember, I provide general information and cannot replace professional medical advice.";
}

function extractActionItems(text: string): string[] {
  const actionItems = [];
  
  if (text.toLowerCase().includes('doctor') || text.toLowerCase().includes('physician')) {
    actionItems.push("Schedule appointment with healthcare provider");
  }
  
  if (text.toLowerCase().includes('monitor') || text.toLowerCase().includes('track')) {
    actionItems.push("Monitor and track symptoms");
  }
  
  if (text.toLowerCase().includes('rest') || text.toLowerCase().includes('sleep')) {
    actionItems.push("Get adequate rest and sleep");
  }
  
  if (text.toLowerCase().includes('hydrat') || text.toLowerCase().includes('water')) {
    actionItems.push("Stay well hydrated");
  }
  
  return actionItems.length > 0 ? actionItems : ["Follow up if symptoms persist"];
}
/
/ Enhanced AI response functions
async function getEnhancedGeminiResponse(systemPrompt: string, message: string, context: any[]) {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fullPrompt = `${systemPrompt}

Current message: "${message}"

Please respond with a comprehensive JSON object containing:
{
  "content": "Your empathetic and helpful response",
  "confidence": 85,
  "sources": ["Medical knowledge base", "Patient history", "Clinical guidelines"],
  "actionItems": ["Specific action 1", "Specific action 2"],
  "medicalDisclaimer": "Important medical disclaimer",
  "riskAssessment": "low|medium|high",
  "followUpQuestions": ["Question 1", "Question 2"],
  "emergencyFlags": ["Any emergency indicators"]
}`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse Gemini JSON response");
  }

  // Fallback response format
  return {
    content: text,
    confidence: 80,
    sources: ["Gemini AI Medical Knowledge"],
    actionItems: extractActionItems(text),
    medicalDisclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
    riskAssessment: assessRiskFromText(text),
    followUpQuestions: generateFollowUpQuestions(message),
    emergencyFlags: detectEmergencyFlags(message)
  };
}

async function getEnhancedOpenAIResponse(systemPrompt: string, message: string, context: any[]) {
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...context.slice(-5), // Last 5 messages for context
    { role: "user", content: message }
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  try {
    return JSON.parse(content);
  } catch (error) {
    return {
      content: content,
      confidence: 75,
      sources: ["OpenAI Medical Knowledge"],
      actionItems: extractActionItems(content),
      medicalDisclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
      riskAssessment: assessRiskFromText(content),
      followUpQuestions: generateFollowUpQuestions(message),
      emergencyFlags: detectEmergencyFlags(message)
    };
  }
}

async function generateEnhancedFallbackResponse(message: string, context: any[], patientHistory: any) {
  const lowerMessage = message.toLowerCase();
  let content = "";
  let riskAssessment = "low";
  let actionItems: string[] = [];
  let emergencyFlags: string[] = [];
  
  // Emergency detection
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || 
      lowerMessage.includes('chest pain') || lowerMessage.includes('can\'t breathe')) {
    riskAssessment = "high";
    emergencyFlags.push("Potential emergency situation detected");
    content = "🚨 I detect this may be an emergency situation. If you're experiencing severe symptoms, please call your local emergency number immediately (911 in US, 999 in UK, 112 in EU). For urgent but non-emergency situations, contact your healthcare provider or visit an urgent care center.";
    actionItems = ["Call emergency services immediately", "Do not delay seeking medical care", "Have someone stay with you"];
  }
  // Pain-related queries
  else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    riskAssessment = "medium";
    content = "I understand you're experiencing pain. Pain is your body's way of signaling that something needs attention. Can you describe the location, intensity (1-10 scale), and how long you've been experiencing it? If the pain is severe, sudden, or accompanied by other concerning symptoms, please consider seeking medical attention.";
    actionItems = ["Monitor pain levels", "Apply appropriate pain management techniques", "Consult healthcare provider if pain persists"];
  }
  // Medication queries
  else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('drug')) {
    content = "I can provide general information about medications, but it's crucial to consult with your healthcare provider or pharmacist for specific medication advice. Never stop, start, or change medications without professional guidance. Always inform your healthcare team about all medications and supplements you're taking.";
    actionItems = ["Consult healthcare provider for medication advice", "Keep updated medication list", "Report any side effects"];
  }
  // Mental health support
  else if (lowerMessage.includes('depressed') || lowerMessage.includes('anxious') || lowerMessage.includes('stress')) {
    riskAssessment = "medium";
    content = "Thank you for sharing your feelings with me. Mental health is just as important as physical health. It's completely normal to experience stress, anxiety, or low moods sometimes. However, if these feelings persist or interfere with your daily life, professional support can be very helpful.";
    actionItems = ["Consider speaking with a mental health professional", "Practice stress-reduction techniques", "Maintain social connections"];
  }
  // General health inquiry
  else {
    content = "I'm here to help with your health questions and provide general health information. While I can offer guidance based on medical knowledge, I cannot replace professional medical advice, diagnosis, or treatment. For specific health concerns, always consult with qualified healthcare professionals.";
    actionItems = ["Consult healthcare provider for specific concerns", "Maintain regular health checkups", "Practice preventive health measures"];
  }

  return {
    content,
    confidence: 65,
    sources: ["SIRI Health Database", "Medical Guidelines"],
    actionItems,
    medicalDisclaimer: "This information is provided for educational purposes only and should not replace professional medical advice, diagnosis, or treatment.",
    riskAssessment,
    followUpQuestions: generateFollowUpQuestions(message),
    emergencyFlags
  };
}

function generateConversationId(context: any[]): string {
  const contextString = JSON.stringify(context?.slice(-3) || []);
  return `conv_${Date.now()}_${Buffer.from(contextString).toString('base64').slice(0, 8)}`;
}

function analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' | 'concerned' {
  const lowerMessage = message.toLowerCase();
  
  const concernedWords = ['pain', 'hurt', 'worried', 'scared', 'emergency', 'help', 'urgent'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worse', 'can\'t', 'unable'];
  const positiveWords = ['better', 'good', 'improving', 'thank', 'helpful'];
  
  if (concernedWords.some(word => lowerMessage.includes(word))) return 'concerned';
  if (negativeWords.some(word => lowerMessage.includes(word))) return 'negative';
  if (positiveWords.some(word => lowerMessage.includes(word))) return 'positive';
  
  return 'neutral';
}

function assessUrgency(message: string, response: any): 'low' | 'medium' | 'high' {
  const lowerMessage = message.toLowerCase();
  const urgentKeywords = ['emergency', 'urgent', 'severe', 'chest pain', 'can\'t breathe', 'bleeding'];
  
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) return 'high';
  if (response.riskAssessment === 'high') return 'high';
  if (response.riskAssessment === 'medium') return 'medium';
  
  return 'low';
}

function generateFollowUpSuggestions(message: string, response: any): string[] {
  const suggestions = [];
  
  if (response.riskAssessment === 'high') {
    suggestions.push("Would you like help finding emergency services in your area?");
    suggestions.push("Do you have someone who can assist you right now?");
  } else if (response.riskAssessment === 'medium') {
    suggestions.push("Would you like information about when to seek medical care?");
    suggestions.push("Can I help you understand your symptoms better?");
  } else {
    suggestions.push("Would you like tips for maintaining good health?");
    suggestions.push("Do you have other health questions I can help with?");
  }
  
  return suggestions;
}

function assessRiskFromText(text: string): 'low' | 'medium' | 'high' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('emergency') || lowerText.includes('immediate') || lowerText.includes('urgent')) {
    return 'high';
  }
  
  if (lowerText.includes('concern') || lowerText.includes('monitor') || lowerText.includes('follow up')) {
    return 'medium';
  }
  
  return 'low';
}

function generateFollowUpQuestions(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const questions = [];
  
  if (lowerMessage.includes('pain')) {
    questions.push("Can you describe the intensity of your pain on a scale of 1-10?");
    questions.push("How long have you been experiencing this pain?");
  }
  
  if (lowerMessage.includes('fever')) {
    questions.push("Have you taken your temperature recently?");
    questions.push("Are you experiencing any other symptoms along with the fever?");
  }
  
  if (lowerMessage.includes('medication')) {
    questions.push("Are you currently taking any other medications?");
    questions.push("Have you experienced any side effects?");
  }
  
  if (questions.length === 0) {
    questions.push("Can you provide more details about your symptoms?");
    questions.push("How long have you been experiencing these concerns?");
  }
  
  return questions.slice(0, 3); // Limit to 3 questions
}

function detectEmergencyFlags(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const flags = [];
  
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'difficulty breathing',
    'unconscious', 'severe bleeding', 'allergic reaction', 'overdose'
  ];
  
  emergencyKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      flags.push(`Potential emergency: ${keyword}`);
    }
  });
  
  return flags;
}
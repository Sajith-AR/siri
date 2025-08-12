import { NextResponse } from "next/server";
import { env, hasGemini, hasOpenAI } from "@/lib/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { message, context, patientHistory } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Build comprehensive context for AI
    const systemPrompt = buildSystemPrompt(patientHistory, context);
    
    // Try Gemini AI first
    if (hasGemini) {
      try {
        const response = await getGeminiResponse(systemPrompt, message, context);
        return NextResponse.json({
          response: response.content,
          confidence: response.confidence,
          sources: response.sources,
          actionItems: response.actionItems,
          provider: "Gemini AI",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Gemini AI assistant failed:", error);
      }
    }

    // Fallback to OpenAI
    if (hasOpenAI) {
      try {
        const response = await getOpenAIResponse(systemPrompt, message, context);
        return NextResponse.json({
          response: response.content,
          confidence: response.confidence,
          sources: response.sources,
          actionItems: response.actionItems,
          provider: "OpenAI GPT-4",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("OpenAI assistant failed:", error);
      }
    }

    // Basic fallback response
    return NextResponse.json({
      response: generateBasicResponse(message),
      confidence: 60,
      sources: ["SIRI Health Database"],
      actionItems: ["Consult with healthcare provider", "Monitor symptoms"],
      provider: "Basic Assistant",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json(
      { error: "AI assistant temporarily unavailable" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(patientHistory: any, context: any[]): string {
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
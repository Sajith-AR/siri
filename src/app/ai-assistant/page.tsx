"use client";

import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

type Message = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    actionItems?: string[];
  };
};

export default function AIAssistantPage() {
  const { t } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hello! I'm your AI Health Assistant. I remember our previous conversations and can help you with health questions, symptom tracking, medication reminders, and wellness advice. How can I assist you today?",
      timestamp: new Date(),
      metadata: {
        confidence: 100,
        actionItems: ["Ask about symptoms", "Track health metrics", "Get wellness tips"]
      }
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load conversation history
    const saved = localStorage.getItem('ai-assistant-history');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(prev => [...prev, ...parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))]);
    }
  }, []);

  const saveMessage = (message: Message) => {
    const history = JSON.parse(localStorage.getItem('ai-assistant-history') || '[]');
    history.push(message);
    localStorage.setItem('ai-assistant-history', JSON.stringify(history.slice(-50))); // Keep last 50 messages
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage);
    setInput("");
    setIsTyping(true);

    try {
      // Get conversation context
      const context = messages.slice(-10).map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context,
          patientHistory: getPatientHistory()
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          confidence: data.confidence,
          sources: data.sources,
          actionItems: data.actionItems
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      saveMessage(assistantMessage);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const getPatientHistory = () => {
    // Get patient context from localStorage
    return {
      previousSymptoms: JSON.parse(localStorage.getItem('symptom.history') || '[]'),
      lastAssessment: JSON.parse(localStorage.getItem('lastAssessment') || 'null'),
      preferences: JSON.parse(localStorage.getItem('patient-preferences') || '{}')
    };
  };

  const quickActions = [
    { icon: "🤒", text: "I have symptoms", action: "I'm experiencing some symptoms and would like guidance" },
    { icon: "💊", text: "Medication help", action: "I need help with my medications" },
    { icon: "📊", text: "Health tracking", action: "I want to track my health metrics" },
    { icon: "🏃‍♀️", text: "Wellness tips", action: "Give me personalized wellness recommendations" },
    { icon: "🚨", text: "Emergency guidance", action: "I think this might be an emergency situation" },
    { icon: "📅", text: "Appointment help", action: "Help me with scheduling or preparing for appointments" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 text-sm font-semibold text-indigo-800 border border-indigo-200 mb-4">
            <span className="animate-pulse">🤖</span>
            AI Health Assistant with Memory
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Your Personal Health AI
          </h1>
          
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Intelligent health assistant that remembers your history, learns your preferences, and provides personalized medical guidance 24/7
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-xl overflow-hidden">
              
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-indigo-50/30 to-purple-50/30">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                        : 'bg-white border-2 border-indigo-200 text-gray-800 shadow-sm'
                    }`}>
                      <div className="text-sm leading-relaxed">{message.content}</div>
                      
                      {message.metadata && (
                        <div className="mt-3 space-y-2">
                          {message.metadata.confidence && (
                            <div className="flex items-center gap-2 text-xs opacity-75">
                              <span>🎯</span>
                              <span>Confidence: {message.metadata.confidence}%</span>
                            </div>
                          )}
                          
                          {message.metadata.actionItems && (
                            <div className="space-y-1">
                              {message.metadata.actionItems.map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setInput(item)}
                                  className="block w-full text-left text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-200 transition-colors"
                                >
                                  💡 {item}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-50 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border-2 border-indigo-200 px-6 py-4 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-indigo-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <div className="p-6 bg-white border-t-2 border-indigo-100">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask me anything about your health..."
                      className="w-full px-6 py-4 rounded-2xl border-2 border-indigo-200 focus:border-indigo-400 focus:outline-none text-lg bg-gradient-to-r from-indigo-50/50 to-purple-50/50"
                    />
                    
                    {isListening && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                  >
                    🎤
                  </button>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                ⚡ Quick Actions
              </h3>
              
              <div className="space-y-3">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(action.action)}
                    className="w-full text-left p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                      <span className="font-medium text-gray-700 group-hover:text-purple-700">{action.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* AI Capabilities */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                🧠 AI Capabilities
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span>Remembers conversation history</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span>Learns your health patterns</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span>Provides personalized advice</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span>24/7 availability</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span>Medical knowledge base</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
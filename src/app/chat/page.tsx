"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  author: "me" | "doctor" | "nurse" | "system";
  text: string;
  timestamp: Date;
  type?: "text" | "image" | "file";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      author: "system", 
      text: "Welcome to HealthChat! You're connected to our medical support team.", 
      timestamp: new Date(Date.now() - 300000),
      type: "text"
    },
    { 
      id: 2, 
      author: "doctor", 
      text: "Hello! I'm Dr. Sarah Johnson. How are you feeling today? Please describe any symptoms or concerns you have.", 
      timestamp: new Date(Date.now() - 240000),
      type: "text"
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    setTimeout(async () => {
      const responses = [
        "Thank you for sharing that information. Can you tell me more about when these symptoms started?",
        "I understand your concern. Based on what you've described, I'd recommend monitoring these symptoms closely.",
        "That's helpful information. Have you experienced anything like this before?",
        "I see. Let me ask a few more questions to better understand your situation.",
        "Based on your symptoms, I'd suggest scheduling an in-person consultation for a thorough examination."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const doctorMessage = {
        id: Date.now(),
        author: "doctor" as const,
        text: randomResponse,
        timestamp: new Date(),
        type: "text" as const
      };
      
      setMessages(prev => [...prev, doctorMessage]);
      
      // Save to patient data manager
      try {
        const { PatientDataManager } = await import("@/lib/patientData");
        const dataManager = PatientDataManager.getInstance();
        dataManager.addMessage({
          senderId: 'dr-johnson',
          senderName: 'Dr. Johnson',
          senderType: 'doctor',
          content: randomResponse,
          timestamp: new Date().toISOString(),
          read: true
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
      
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const send = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      author: "me" as const,
      text: input.trim(),
      timestamp: new Date(),
      type: "text" as const
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to patient data manager
    try {
      const { PatientDataManager } = await import("@/lib/patientData");
      const dataManager = PatientDataManager.getInstance();
      const patient = dataManager.getPatient();
      dataManager.addMessage({
        senderId: patient.id,
        senderName: patient.name,
        senderType: 'patient',
        content: input.trim(),
        timestamp: new Date().toISOString(),
        read: true
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
    
    simulateResponse(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAuthorInfo = (author: string) => {
    switch (author) {
      case "doctor":
        return { name: "Dr. Johnson", avatar: "👩‍⚕️", color: "text-blue-600" };
      case "nurse":
        return { name: "Nurse Mary", avatar: "👩‍⚕️", color: "text-green-600" };
      case "system":
        return { name: "System", avatar: "🏥", color: "text-gray-600" };
      default:
        return { name: "You", avatar: "👤", color: "text-cyan-600" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-t-3xl border-2 border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">💬</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Chat</h1>
                <p className="text-gray-600">Secure messaging with healthcare providers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="bg-white border-x-2 border-gray-200 h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => {
            const authorInfo = getAuthorInfo(message.author);
            const isMe = message.author === "me";
            
            return (
              <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-3`}>
                {!isMe && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center text-lg border-2 border-blue-200">
                      {authorInfo.avatar}
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[70%] ${isMe ? "order-1" : ""}`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${authorInfo.color}`}>
                        {authorInfo.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-3 ${
                    isMe 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                      : message.author === "system"
                      ? "bg-gray-100 text-gray-700 border border-gray-200"
                      : "bg-blue-50 text-gray-800 border border-blue-200"
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  
                  {isMe && (
                    <div className="text-right mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
                
                {isMe && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 flex items-center justify-center text-lg border-2 border-cyan-200">
                      👤
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center text-lg border-2 border-blue-200">
                👩‍⚕️
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-3xl border-2 border-gray-200 p-6 shadow-lg">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                className="w-full rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-cyan-500 focus:bg-white focus:outline-none resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={send}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-lg">📤</span>
                <span className="ml-2">Send</span>
              </button>
              
              <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-2xl text-sm hover:bg-gray-200 transition-colors">
                📎 Attach
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>🔒 End-to-end encrypted</span>
              <span>📱 Available 24/7</span>
            </div>
            <span>Response time: Usually within 5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}



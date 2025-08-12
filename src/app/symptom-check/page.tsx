"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import ConsentModal from "@/components/ConsentModal";

type HistoryItem = { id: number; text: string; ts: number };

// Minimal typing for browser SpeechRecognition API (cross-vendor)
type SpeechConstructor = new () => SpeechRecognition;
type WindowWithSpeech = Window & {
  webkitSpeechRecognition?: SpeechConstructor;
  SpeechRecognition?: SpeechConstructor;
};
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  abort: () => void;
  onresult: (e: SpeechRecognitionEvent) => void;
  onend: () => void;
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  0: { transcript: string };
}

export default function SymptomCheckPage() {
  const { t, lowBandwidth } = useSettings();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("symptom.history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!listening) return;
    const w = window as WindowWithSpeech;
    const SR: SpeechConstructor | undefined = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) return;
    const rec: SpeechRecognition = new SR();
    rec.lang = "en-US"; // could map by locale
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    return () => rec.abort();
  }, [listening]);

  const saveHistory = (entry: string) => {
    const item = { id: Date.now(), text: entry, ts: Date.now() };
    const next = [item, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem("symptom.history", JSON.stringify(next));
  };

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      saveHistory(text.trim());
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text.trim(), lowBandwidth }),
      });
      const data = await res.json();
      
      // Save to localStorage for immediate access
      localStorage.setItem("lastAssessment", JSON.stringify(data));
      
      // Save to patient data manager for integration
      const { PatientDataManager } = await import("@/lib/patientData");
      const dataManager = PatientDataManager.getInstance();
      dataManager.addAssessment({
        date: new Date().toISOString(),
        symptoms: text.trim().split(',').map(s => s.trim()),
        riskLevel: data.risk || 'low',
        conditions: data.conditions || [],
        recommendations: data.nextSteps || [],
        urgency: data.urgency || false,
        aiProvider: data.provider || 'Gemini AI',
        followUpRequired: data.risk === 'high' || data.urgency
      });
      
      router.push("/symptom-results");
    } catch (error) {
      alert("Error analyzing symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <ConsentModal />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-6 py-3 text-sm font-semibold text-blue-800 border border-blue-200">
            <span className="animate-pulse">🤖</span>
            Powered by Google Gemini AI
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
            AI-Powered Symptom Checker
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Describe your symptoms and get <span className="text-cyan-600 font-semibold">instant AI analysis</span> with 
            <span className="text-blue-600 font-semibold"> medical references</span> and 
            <span className="text-emerald-600 font-semibold"> personalized recommendations</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-700 font-medium">Real-time AI Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-gray-700 font-medium">Medical References</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              <span className="text-gray-700 font-medium">Voice Input Support</span>
            </div>
          </div>
        </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Input Section */}
        <div className="lg:col-span-2 space-y-10">
          {/* Symptom Input */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white rounded-3xl border-2 border-gray-200 p-10 shadow-xl">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    💬 {t("symptomInput") || "Describe Your Symptoms"}
                  </h2>
                  {listening && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="font-medium">🎤 Listening...</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Example: I have had a fever for 3 days, dry cough, and sore throat. I feel tired and have body aches. The fever comes and goes, and I've been taking paracetamol."
                    rows={10}
                    className="w-full rounded-2xl border-2 border-gray-300 bg-white p-8 text-lg text-gray-900 focus:border-teal-500 focus:bg-white focus:shadow-lg transition-all resize-none placeholder:text-gray-500"
                    style={{ backgroundColor: '#ffffff !important', color: '#1f2937 !important' }}
                  />
                  
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>💡</span>
                    <span>Be as detailed as possible for better AI analysis. Include duration, severity, and any patterns you've noticed.</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setListening(true)}
                    disabled={listening || loading}
                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 text-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <span className="text-xl">{listening ? "🎤" : "🎙️"}</span>
                    {listening ? "Listening..." : "Voice Input"}
                  </button>
                  
                  <button
                    onClick={() => {
                      try {
                        recognitionRef.current?.abort();
                      } catch {}
                      setListening(false);
                    }}
                    disabled={!listening}
                    className="inline-flex items-center gap-3 rounded-2xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all"
                  >
                    <span className="text-xl">⏹</span>
                    Stop Recording
                  </button>
                  
                  <button
                    onClick={submit}
                    disabled={!text.trim() || loading}
                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white px-10 py-4 text-lg font-bold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    <span className="text-xl">{loading ? "🔄" : "🚀"}</span>
                    {loading ? "Analyzing with AI..." : "Analyze Symptoms"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Analysis */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl transform -rotate-1"></div>
            <div className="relative bg-white rounded-3xl border-2 border-purple-200 p-10 shadow-xl">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-purple-700 flex items-center justify-center gap-3">
                    📸 Medical Image Analysis
                  </h3>
                  <p className="text-purple-600 text-xl leading-relaxed max-w-2xl mx-auto">
                    Upload a medical image for AI-powered visual analysis. Our Gemini AI can analyze 
                    <span className="font-semibold"> rashes, wounds, skin conditions</span>, and other visible symptoms.
                  </p>
                </div>
                
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = (e.target as HTMLFormElement).image as HTMLInputElement;
                    if (!f.files || !f.files[0]) return;
                    setImageAnalyzing(true);
                    try {
                      const fd = new FormData();
                      fd.append("image", f.files[0]);
                      const res = await fetch("/api/vision", { method: "POST", body: fd });
                      const out = await res.json();
                      if (out.error) {
                        alert("❌ Error: " + out.error);
                      } else {
                        const findings = Array.isArray(out.findings) ? out.findings.join("\n• ") : out.findings;
                        alert(`🔍 AI Vision Analysis Results:\n\n• ${findings}\n\n⚠️ ${out.disclaimer || "This is for informational purposes only. Consult a healthcare professional."}`);
                      }
                    } catch (error) {
                      alert("❌ Error analyzing image. Please try again.");
                    } finally {
                      setImageAnalyzing(false);
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors">
                    <input 
                      name="image" 
                      type="file" 
                      accept="image/*" 
                      className="block w-full text-lg file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 file:font-semibold file:shadow-lg file:cursor-pointer"
                    />
                    <p className="mt-4 text-sm text-purple-600">
                      Supported formats: JPG, PNG, WebP • Max size: 10MB
                    </p>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={imageAnalyzing}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    <span className="text-2xl mr-3">{imageAnalyzing ? "🔄" : "🔍"}</span>
                    {imageAnalyzing ? "Analyzing with AI..." : "Analyze Medical Image"}
                  </button>
                </form>
                
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="text-sm text-purple-700">
                      <p className="font-semibold mb-2">Important Disclaimer:</p>
                      <p>This AI analysis is for informational purposes only and should not replace professional medical diagnosis. Always consult with a qualified healthcare provider for proper medical evaluation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-10">
          {/* Quick Symptoms */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Quick Symptoms
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { symptom: "Fever", icon: "🌡️", desc: "High temperature" },
                { symptom: "Cough", icon: "😷", desc: "Dry or wet cough" },
                { symptom: "Headache", icon: "🤕", desc: "Head pain" },
                { symptom: "Nausea", icon: "🤢", desc: "Feeling sick" },
                { symptom: "Fatigue", icon: "😴", desc: "Extreme tiredness" },
                { symptom: "Chest Pain", icon: "💔", desc: "Chest discomfort" }
              ].map(({ symptom, icon, desc }) => (
                <button
                  key={symptom}
                  onClick={() => setText(prev => prev ? `${prev}, ${symptom.toLowerCase()}` : symptom.toLowerCase())}
                  className="group text-left bg-white border-2 border-emerald-300 rounded-2xl p-4 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{symptom}</div>
                      <div className="text-sm text-gray-600">{desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Recent History
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No previous assessments</p>
                <p className="text-sm text-gray-400 mt-2">Your symptom history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 3).map((h) => (
                  <div 
                    key={h.id} 
                    className="group bg-white rounded-2xl border-2 border-blue-200 p-5 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all"
                    onClick={() => setText(h.text)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-blue-600">
                        {new Date(h.ts).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-blue-600">
                        Click to reuse
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{h.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Notice */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border-2 border-red-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-3">
              <span className="text-3xl animate-pulse">🚨</span>
              Emergency?
            </h3>
            <p className="text-red-600 mb-6 text-lg leading-relaxed">
              If you're experiencing <strong>severe symptoms</strong> like chest pain, difficulty breathing, 
              or loss of consciousness, call emergency services immediately.
            </p>
            <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl px-6 py-4 text-lg font-bold hover:from-red-700 hover:to-red-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
              <span className="text-xl mr-3">📞</span>
              Emergency Call
            </button>
            <div className="mt-4 text-center">
              <p className="text-sm text-red-600">
                🌍 <strong>Global Emergency Numbers:</strong> 911 (US), 999 (UK), 112 (EU)
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
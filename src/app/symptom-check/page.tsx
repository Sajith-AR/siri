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
      localStorage.setItem("lastAssessment", JSON.stringify(data));
      router.push("/symptom-results");
    } catch (error) {
      alert("Error analyzing symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-12">
      <ConsentModal />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          🤖 AI-Powered Symptom Checker
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Describe your symptoms and get instant AI analysis with medical references
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Input Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Symptom Input */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                💬 {t("symptomInput") || "Describe your symptoms"}
                {listening && <span className="text-red-500 animate-pulse text-lg">🎤 Listening...</span>}
              </h2>
              
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Example: I have had a fever for 3 days, dry cough, and sore throat. I feel tired and have body aches."
                rows={8}
                className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 p-6 text-base focus:border-blue-500 focus:bg-white transition-all resize-none"
              />
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setListening(true)}
                  disabled={listening || loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-100 text-blue-700 px-6 py-3 font-medium hover:bg-blue-200 disabled:opacity-50 transition-all"
                >
                  🎤 {listening ? "Listening..." : "Voice Input"}
                </button>
                
                <button
                  onClick={() => {
                    try {
                      recognitionRef.current?.abort();
                    } catch {}
                    setListening(false);
                  }}
                  disabled={!listening}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 px-6 py-3 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  ⏹ Stop
                </button>
                
                <button
                  onClick={submit}
                  disabled={!text.trim() || loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-3 font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg transition-all"
                >
                  {loading ? "🔄 Analyzing..." : "🚀 Analyze Symptoms"}
                </button>
              </div>
            </div>
          </div>

          {/* Image Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-purple-700 flex items-center gap-3">
                📸 Medical Image Analysis
              </h3>
              <p className="text-purple-600 text-lg">
                Upload a medical image for AI-powered visual analysis (rashes, wounds, skin conditions, etc.)
              </p>
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
                      alert("Error: " + out.error);
                    } else {
                      alert("🔍 AI Analysis Results:\n\n" + (out.findings?.join("\n") || "No specific findings detected"));
                    }
                  } catch (error) {
                    alert("Error analyzing image. Please try again.");
                  } finally {
                    setImageAnalyzing(false);
                  }
                }}
                className="space-y-4"
              >
                <input 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  className="block w-full text-base file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:font-medium"
                />
                <button 
                  type="submit"
                  disabled={imageAnalyzing}
                  className="rounded-xl bg-purple-600 text-white px-6 py-3 font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                  {imageAnalyzing ? "🔄 Analyzing..." : "🔍 Analyze Image"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Symptoms */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="text-xl font-bold text-emerald-700 mb-4">⚡ Quick Symptoms</h3>
            <div className="grid grid-cols-1 gap-3">
              {["Fever", "Cough", "Headache", "Nausea", "Fatigue", "Chest Pain"].map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => setText(prev => prev ? `${prev}, ${symptom.toLowerCase()}` : symptom.toLowerCase())}
                  className="text-left bg-white border border-emerald-300 rounded-lg px-4 py-3 hover:bg-emerald-100 transition-all font-medium"
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4">📋 Recent History</h3>
            {history.length === 0 ? (
              <p className="text-gray-500">No previous assessments</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((h) => (
                  <div 
                    key={h.id} 
                    className="bg-white rounded-lg border p-4 cursor-pointer hover:bg-gray-100 transition-all"
                    onClick={() => setText(h.text)}
                  >
                    <div className="text-sm text-gray-500 mb-2">{new Date(h.ts).toLocaleDateString()}</div>
                    <div className="text-sm line-clamp-3">{h.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Notice */}
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
            <h3 className="text-xl font-bold text-red-700 mb-3">🚨 Emergency?</h3>
            <p className="text-red-600 mb-4">
              If you're experiencing severe symptoms, call emergency services immediately.
            </p>
            <button className="w-full bg-red-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-red-700 transition-all">
              📞 Emergency Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



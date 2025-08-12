"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

type Result = {
  risk: "low" | "medium" | "high";
  conditions: { name: string; confidence: number }[];
  nextSteps: string[];
  references?: { title: string; url: string }[];
  explain?: string;
  urgency?: boolean;
  provider?: string;
  timestamp?: string;
};

export default function SymptomResultsPage() {
  const { t } = useSettings();
  const [data, setData] = useState<Result | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("lastAssessment");
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900">No Results Found</h1>
          <p className="text-gray-600">You haven't completed a symptom assessment yet.</p>
          <Link
            href="/symptom-check"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-xl">🤖</span>
            Start Symptom Check
          </Link>
        </div>
      </div>
    );
  }

  const getRiskInfo = (risk: string) => {
    switch (risk) {
      case "high":
        return {
          color: "from-red-500 to-red-600",
          bgColor: "from-red-50 to-red-100",
          borderColor: "border-red-200",
          icon: "🚨",
          message: "High Priority - Seek immediate medical attention"
        };
      case "medium":
        return {
          color: "from-yellow-500 to-orange-500",
          bgColor: "from-yellow-50 to-orange-100",
          borderColor: "border-yellow-200",
          icon: "⚠️",
          message: "Moderate Priority - Consider consulting a healthcare provider"
        };
      default:
        return {
          color: "from-green-500 to-emerald-500",
          bgColor: "from-green-50 to-emerald-100",
          borderColor: "border-green-200",
          icon: "✅",
          message: "Low Priority - Monitor symptoms and practice self-care"
        };
    }
  };

  const riskInfo = getRiskInfo(data.risk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-5xl">{riskInfo.icon}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your Health Assessment Results
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your symptoms, here's what our AI analysis found. Remember, this is for informational purposes only.
          </p>
        </div>

        {/* Risk Level Card */}
        <div className={`bg-gradient-to-r ${riskInfo.bgColor} border-2 ${riskInfo.borderColor} rounded-3xl p-8 shadow-xl`}>
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${riskInfo.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
              <span className="text-2xl">{riskInfo.icon}</span>
              Risk Level: {data.risk.toUpperCase()}
            </div>
            <p className="text-lg font-semibold text-gray-800">{riskInfo.message}</p>
            {data.urgency && (
              <div className="bg-red-100 border border-red-300 rounded-2xl p-4 text-red-800">
                <p className="font-bold">⚠️ URGENT: This assessment indicates you should seek immediate medical care.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Possible Conditions */}
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              🔍 Possible Conditions
            </h3>
            <div className="space-y-4">
              {data.conditions.map((condition, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{condition.name}</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round(condition.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${condition.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            {data.explain && (
              <div className="mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">💡 AI Explanation</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{data.explain}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              📋 Recommended Actions
            </h3>
            <div className="space-y-3">
              {data.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                  <div className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* References */}
        {data.references && data.references.length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              📚 Medical References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {ref.title}
                      </p>
                      <p className="text-sm text-gray-600">Click to read more</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What would you like to do next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/appointments/new"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 rounded-2xl hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <div className="font-bold text-lg">Book Appointment</div>
              <div className="text-sm opacity-90">Schedule with a doctor</div>
            </Link>
            
            <Link
              href="/chat"
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 rounded-2xl hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💬</div>
              <div className="font-bold text-lg">Chat with Doctor</div>
              <div className="text-sm opacity-90">Get immediate advice</div>
            </Link>
            
            <Link
              href="/symptom-check"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔄</div>
              <div className="font-bold text-lg">New Assessment</div>
              <div className="text-sm opacity-90">Check other symptoms</div>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">⚠️</span>
            <h4 className="text-xl font-bold text-yellow-800">Important Medical Disclaimer</h4>
          </div>
          <p className="text-yellow-700 leading-relaxed">
            This AI assessment is for informational purposes only and should not replace professional medical diagnosis or treatment. 
            Always consult with qualified healthcare providers for medical advice, diagnosis, or treatment decisions.
          </p>
          {data.provider && (
            <p className="text-sm text-yellow-600 mt-3">
              Analysis powered by {data.provider} • Generated on {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown date'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



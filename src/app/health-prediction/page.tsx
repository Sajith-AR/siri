"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

type HealthTrend = {
  metric: string;
  current: number;
  predicted: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
  timeframe: string;
};

type RiskPrediction = {
  condition: string;
  risk: number;
  factors: string[];
  prevention: string[];
  timeline: string;
};

export default function HealthPredictionPage() {
  const { t } = useSettings();
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState({
    age: 28,
    gender: 'female',
    lifestyle: {
      exercise: 'moderate',
      diet: 'balanced',
      sleep: 7,
      stress: 'moderate',
      smoking: false,
      alcohol: 'occasional'
    },
    vitals: {
      heartRate: 72,
      bloodPressure: '120/80',
      weight: 65,
      height: 165
    },
    medicalHistory: ['asthma'],
    familyHistory: ['diabetes', 'hypertension']
  });

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthData)
      });
      
      const data = await response.json();
      
      // Simulate advanced AI predictions
      const mockPredictions = {
        overallHealthScore: 87,
        trends: [
          {
            metric: 'Cardiovascular Health',
            current: 85,
            predicted: 88,
            trend: 'improving' as const,
            confidence: 92,
            timeframe: '6 months'
          },
          {
            metric: 'Metabolic Health',
            current: 78,
            predicted: 82,
            trend: 'improving' as const,
            confidence: 88,
            timeframe: '3 months'
          },
          {
            metric: 'Mental Wellness',
            current: 75,
            predicted: 80,
            trend: 'improving' as const,
            confidence: 85,
            timeframe: '2 months'
          },
          {
            metric: 'Immune System',
            current: 82,
            predicted: 79,
            trend: 'stable' as const,
            confidence: 78,
            timeframe: '4 months'
          }
        ],
        riskPredictions: [
          {
            condition: 'Type 2 Diabetes',
            risk: 15,
            factors: ['Family history', 'Age', 'Lifestyle'],
            prevention: ['Regular exercise', 'Balanced diet', 'Weight management'],
            timeline: '10-15 years'
          },
          {
            condition: 'Hypertension',
            risk: 22,
            factors: ['Family history', 'Stress levels', 'Diet'],
            prevention: ['Reduce sodium', 'Stress management', 'Regular monitoring'],
            timeline: '5-10 years'
          },
          {
            condition: 'Cardiovascular Disease',
            risk: 8,
            factors: ['Current health status', 'Exercise habits'],
            prevention: ['Continue exercise', 'Heart-healthy diet', 'Regular checkups'],
            timeline: '15-20 years'
          }
        ],
        recommendations: [
          {
            category: 'Exercise',
            current: 'Moderate activity 3x/week',
            recommended: 'Increase to 4x/week with strength training',
            impact: '+5% cardiovascular health',
            priority: 'high'
          },
          {
            category: 'Nutrition',
            current: 'Balanced diet',
            recommended: 'Add more omega-3 rich foods',
            impact: '+3% metabolic health',
            priority: 'medium'
          },
          {
            category: 'Sleep',
            current: '7 hours average',
            recommended: 'Maintain 7-8 hours consistently',
            impact: '+4% mental wellness',
            priority: 'high'
          }
        ],
        nextScreenings: [
          { test: 'Blood glucose', due: '6 months', reason: 'Family diabetes history' },
          { test: 'Blood pressure', due: '3 months', reason: 'Preventive monitoring' },
          { test: 'Cholesterol panel', due: '12 months', reason: 'Routine screening' }
        ]
      };
      
      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePredictions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-3 text-sm font-semibold text-emerald-800 border border-emerald-200">
            <span className="animate-pulse">🔮</span>
            AI-Powered Health Prediction Engine
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Future Health Insights
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Advanced AI analyzes your health data to predict future trends, identify risks, and provide 
            <span className="text-emerald-600 font-semibold"> personalized prevention strategies</span> 
            for optimal long-term wellness.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-4 bg-white rounded-3xl px-8 py-6 shadow-xl border border-emerald-200">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="text-xl font-semibold text-emerald-700">AI Analyzing Your Health Data...</span>
            </div>
          </div>
        ) : predictions && (
          <div className="space-y-12">
            
            {/* Overall Health Score */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl transform rotate-1"></div>
              <div className="relative bg-white rounded-3xl border-2 border-emerald-200 p-10 shadow-xl">
                <div className="text-center space-y-6">
                  <h2 className="text-4xl font-bold text-emerald-700 flex items-center justify-center gap-3">
                    🎯 Overall Health Score
                  </h2>
                  
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#healthGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${predictions.overallHealthScore * 2.51} 251`}
                        strokeLinecap="round"
                        className="transition-all duration-2000"
                      />
                      <defs>
                        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-emerald-600">{predictions.overallHealthScore}</div>
                        <div className="text-sm text-emerald-700">Excellent</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your health score indicates excellent overall wellness with strong potential for continued improvement through targeted lifestyle optimizations.
                  </p>
                </div>
              </div>
            </div>

            {/* Health Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl border-2 border-teal-200 p-8 shadow-xl">
                <h3 className="text-3xl font-bold text-teal-700 mb-6 flex items-center gap-3">
                  📈 Health Trends
                </h3>
                
                <div className="space-y-6">
                  {predictions.trends.map((trend: HealthTrend, idx: number) => (
                    <div key={idx} className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-teal-700">{trend.metric}</h4>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          trend.trend === 'improving' ? 'bg-green-100 text-green-700' :
                          trend.trend === 'stable' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {trend.trend === 'improving' ? '📈 Improving' :
                           trend.trend === 'stable' ? '➡️ Stable' : '📉 Declining'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-teal-600 mb-1">Current</div>
                          <div className="text-2xl font-bold text-teal-700">{trend.current}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-teal-600 mb-1">Predicted ({trend.timeframe})</div>
                          <div className="text-2xl font-bold text-teal-700">{trend.predicted}%</div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${trend.predicted}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-sm text-teal-600">
                        AI Confidence: {trend.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Predictions */}
              <div className="bg-white rounded-3xl border-2 border-orange-200 p-8 shadow-xl">
                <h3 className="text-3xl font-bold text-orange-700 mb-6 flex items-center gap-3">
                  ⚠️ Risk Predictions
                </h3>
                
                <div className="space-y-6">
                  {predictions.riskPredictions.map((risk: RiskPrediction, idx: number) => (
                    <div key={idx} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-orange-700">{risk.condition}</h4>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          risk.risk < 15 ? 'bg-green-100 text-green-700' :
                          risk.risk < 30 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {risk.risk}% Risk
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-orange-600 mb-2">Timeline: {risk.timeline}</div>
                        <div className="bg-orange-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              risk.risk < 15 ? 'bg-green-500' :
                              risk.risk < 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${risk.risk}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-semibold text-orange-700 mb-1">Risk Factors:</div>
                          <div className="flex flex-wrap gap-2">
                            {risk.factors.map((factor, i) => (
                              <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-semibold text-green-700 mb-1">Prevention:</div>
                          <div className="flex flex-wrap gap-2">
                            {risk.prevention.map((prev, i) => (
                              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                                {prev}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 p-10 shadow-xl">
              <h3 className="text-4xl font-bold text-purple-700 mb-8 text-center flex items-center justify-center gap-3">
                💡 AI-Powered Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {predictions.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {rec.category === 'Exercise' ? '🏃‍♀️' :
                         rec.category === 'Nutrition' ? '🥗' : '😴'}
                      </div>
                      
                      <h4 className="text-xl font-bold text-purple-700">{rec.category}</h4>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="text-gray-600 mb-1">Current:</div>
                          <div className="font-medium">{rec.current}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-600 mb-1">Recommended:</div>
                          <div className="font-medium text-purple-700">{rec.recommended}</div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="text-purple-700 font-semibold">Expected Impact:</div>
                          <div className="text-purple-600">{rec.impact}</div>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Screenings */}
            <div className="bg-white rounded-3xl border-2 border-indigo-200 p-8 shadow-xl">
              <h3 className="text-3xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
                📅 Recommended Screenings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {predictions.nextScreenings.map((screening: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                    <div className="text-center space-y-3">
                      <div className="text-3xl">🔬</div>
                      <h4 className="text-xl font-bold text-indigo-700">{screening.test}</h4>
                      <div className="text-lg font-semibold text-indigo-600">Due in {screening.due}</div>
                      <div className="text-sm text-indigo-600 bg-indigo-100 rounded-lg p-3">
                        {screening.reason}
                      </div>
                      <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all">
                        Schedule Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
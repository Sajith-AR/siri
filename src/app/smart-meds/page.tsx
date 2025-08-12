"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  purpose: string;
  sideEffects: string[];
  interactions: string[];
  adherence: number;
  nextDose: string;
};

export default function SmartMedsPage() {
  const { t } = useSettings();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    purpose: ''
  });
  const [interactions, setInteractions] = useState<any[]>([]);
  const [adherenceScore, setAdherenceScore] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load mock medication data
    const mockMeds: Medication[] = [
      {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2024-01-15',
        prescribedBy: 'Dr. Sarah Smith',
        purpose: 'Blood pressure control',
        sideEffects: ['Dry cough', 'Dizziness', 'Fatigue'],
        interactions: ['NSAIDs', 'Potassium supplements'],
        adherence: 95,
        nextDose: '2024-12-09T08:00:00'
      },
      {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2024-02-01',
        prescribedBy: 'Dr. Michael Johnson',
        purpose: 'Diabetes management',
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        interactions: ['Alcohol', 'Contrast dye'],
        adherence: 88,
        nextDose: '2024-12-09T12:00:00'
      },
      {
        id: '3',
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily (evening)',
        startDate: '2024-03-10',
        prescribedBy: 'Dr. Sarah Smith',
        purpose: 'Cholesterol management',
        sideEffects: ['Muscle pain', 'Liver enzyme elevation'],
        interactions: ['Grapefruit juice', 'Certain antibiotics'],
        adherence: 92,
        nextDose: '2024-12-09T20:00:00'
      }
    ];
    
    setMedications(mockMeds);
    setAdherenceScore(Math.round(mockMeds.reduce((acc, med) => acc + med.adherence, 0) / mockMeds.length));
    
    // Check for interactions
    checkInteractions(mockMeds);
  }, []);

  const checkInteractions = async (meds: Medication[]) => {
    // Simulate AI-powered interaction checking
    const potentialInteractions = [
      {
        medications: ['Lisinopril', 'NSAIDs'],
        severity: 'moderate',
        description: 'NSAIDs may reduce the effectiveness of Lisinopril and increase blood pressure',
        recommendation: 'Monitor blood pressure closely if taking NSAIDs. Consider acetaminophen for pain relief.'
      },
      {
        medications: ['Metformin', 'Alcohol'],
        severity: 'high',
        description: 'Alcohol increases risk of lactic acidosis when combined with Metformin',
        recommendation: 'Limit alcohol consumption. Avoid binge drinking completely.'
      }
    ];
    
    setInteractions(potentialInteractions);
  };

  const addMedication = async () => {
    if (!newMed.name || !newMed.dosage) return;
    
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: 'Self-added',
      purpose: newMed.purpose,
      sideEffects: [],
      interactions: [],
      adherence: 100,
      nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const updatedMeds = [...medications, medication];
    setMedications(updatedMeds);
    checkInteractions(updatedMeds);
    
    setNewMed({ name: '', dosage: '', frequency: '', purpose: '' });
    setShowAddForm(false);
  };

  const markTaken = (medId: string) => {
    setMedications(prev => prev.map(med => 
      med.id === medId 
        ? { ...med, nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
        : med
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 text-sm font-semibold text-blue-800 border border-blue-200">
            <span className="animate-pulse">💊</span>
            AI-Powered Medication Management
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Smart Medication Hub
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Intelligent medication tracking with <span className="text-blue-600 font-semibold">AI-powered interaction checking</span>, 
            <span className="text-indigo-600 font-semibold"> smart reminders</span>, and 
            <span className="text-purple-600 font-semibold"> adherence optimization</span>.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-6 shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-4xl">📊</div>
              <div className="text-3xl font-bold text-green-600">{adherenceScore}%</div>
              <div className="text-green-700 font-semibold">Adherence Score</div>
              <div className="text-sm text-green-600">Excellent compliance</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-6 shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-4xl">💊</div>
              <div className="text-3xl font-bold text-blue-600">{medications.length}</div>
              <div className="text-blue-700 font-semibold">Active Medications</div>
              <div className="text-sm text-blue-600">Currently tracking</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border-2 border-orange-200 p-6 shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <div className="text-3xl font-bold text-orange-600">{interactions.length}</div>
              <div className="text-orange-700 font-semibold">Interactions</div>
              <div className="text-sm text-orange-600">Potential risks detected</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 p-6 shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-4xl">⏰</div>
              <div className="text-3xl font-bold text-purple-600">3</div>
              <div className="text-purple-700 font-semibold">Due Today</div>
              <div className="text-sm text-purple-600">Upcoming doses</div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Current Medications */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border-2 border-blue-200 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-3">
                  💊 Current Medications
                </h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-6 py-3 font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  + Add Medication
                </button>
              </div>
              
              <div className="space-y-6">
                {medications.map((med) => (
                  <div key={med.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-blue-700">{med.name}</h3>
                        <div className="text-blue-600">
                          <span className="font-semibold">{med.dosage}</span> • {med.frequency}
                        </div>
                        <div className="text-sm text-blue-600">
                          Prescribed by {med.prescribedBy} for {med.purpose}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          med.adherence >= 90 ? 'bg-green-100 text-green-700' :
                          med.adherence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {med.adherence}% Adherence
                        </div>
                        
                        <div className="text-sm text-blue-600">
                          Next: {new Date(med.nextDose).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-semibold text-blue-700 mb-2">Common Side Effects:</div>
                        <div className="flex flex-wrap gap-2">
                          {med.sideEffects.map((effect, idx) => (
                            <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold text-blue-700 mb-2">Known Interactions:</div>
                        <div className="flex flex-wrap gap-2">
                          {med.interactions.map((interaction, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                              {interaction}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => markTaken(med.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-6 py-2 font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                      >
                        ✓ Mark Taken
                      </button>
                      <button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl px-6 py-2 font-semibold hover:from-gray-600 hover:to-gray-700 transition-all">
                        Skip Dose
                      </button>
                      <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-6 py-2 font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all">
                        Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drug Interactions */}
            {interactions.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border-2 border-red-200 p-8 shadow-xl">
                <h2 className="text-3xl font-bold text-red-700 mb-6 flex items-center gap-3">
                  ⚠️ Drug Interactions Alert
                </h2>
                
                <div className="space-y-6">
                  {interactions.map((interaction, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-red-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-red-700 mb-2">
                            {interaction.medications.join(' + ')}
                          </h3>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            interaction.severity === 'high' ? 'bg-red-100 text-red-700' :
                            interaction.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {interaction.severity.toUpperCase()} RISK
                          </div>
                        </div>
                        
                        <div className="text-4xl">
                          {interaction.severity === 'high' ? '🚨' : 
                           interaction.severity === 'moderate' ? '⚠️' : '⚡'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-semibold text-red-700 mb-1">Description:</div>
                          <div className="text-red-600">{interaction.description}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-semibold text-green-700 mb-1">AI Recommendation:</div>
                          <div className="text-green-600 bg-green-50 rounded-lg p-3">
                            {interaction.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Today's Schedule */}
            <div className="bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                📅 Today's Schedule
              </h3>
              
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <div>
                      <div className="font-semibold text-purple-700">{med.name}</div>
                      <div className="text-sm text-purple-600">{med.dosage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-700">
                        {new Date(med.nextDose).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-purple-600">Next dose</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border-2 border-indigo-200 p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
                🤖 AI Insights
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">💡</span>
                    <span className="font-semibold text-indigo-700">Optimization Tip</span>
                  </div>
                  <div className="text-sm text-indigo-600">
                    Taking Atorvastatin with dinner may reduce muscle pain side effects.
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">📊</span>
                    <span className="font-semibold text-indigo-700">Adherence Pattern</span>
                  </div>
                  <div className="text-sm text-indigo-600">
                    You're most consistent with morning medications. Consider moving evening doses earlier.
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">🔔</span>
                    <span className="font-semibold text-indigo-700">Smart Reminder</span>
                  </div>
                  <div className="text-sm text-indigo-600">
                    Lab work due in 2 weeks for Metformin monitoring. Schedule appointment now.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Medication Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-blue-700 mb-6">Add New Medication</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Medication name"
                  value={newMed.name}
                  onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Dosage (e.g., 10mg)"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Frequency (e.g., Once daily)"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Purpose (e.g., Blood pressure)"
                  value={newMed.purpose}
                  onChange={(e) => setNewMed(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                />
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={addMedication}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-6 py-3 font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Add Medication
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OfflineHealthStorage, NetworkManager } from "@/lib/offlineStorage";

type EmergencyContact = {
  name: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'ambulance' | 'police' | 'fire';
  distance: string;
  available24h: boolean;
  languages: string[];
};

type LocationData = {
  state: string;
  district: string;
  emergencyContacts: EmergencyContact[];
  nearestFacilities: {
    hospital: string;
    clinic: string;
    pharmacy: string;
  };
  transportOptions: string[];
};

export default function RuralEmergencyPage() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [emergencyType, setEmergencyType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const networkManager = NetworkManager.getInstance();
    setIsOnline(networkManager.getOnlineStatus());
    
    const handleStatusChange = (online: boolean) => setIsOnline(online);
    networkManager.addStatusListener(handleStatusChange);
    
    return () => networkManager.removeStatusListener(handleStatusChange);
  }, []);

  useEffect(() => {
    getCurrentLocation();
    loadEmergencyData();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          getLocationBasedEmergencyInfo(position);
        },
        (error) => {
          console.error('Location error:', error);
          // Load default emergency info for India
          loadDefaultEmergencyInfo();
        }
      );
    } else {
      loadDefaultEmergencyInfo();
    }
  };

  const getLocationBasedEmergencyInfo = async (position: GeolocationPosition) => {
    try {
      // In a real app, you'd use reverse geocoding API
      // For demo, we'll simulate based on coordinates
      const mockLocationData: LocationData = {
        state: "Karnataka",
        district: "Bangalore Rural",
        emergencyContacts: [
          {
            name: "District Hospital Bangalore Rural",
            phone: "080-27832000",
            type: 'hospital',
            distance: "12 km",
            available24h: true,
            languages: ["English", "Kannada", "Hindi"]
          },
          {
            name: "Primary Health Centre Devanahalli",
            phone: "080-27832100",
            type: 'clinic',
            distance: "5 km",
            available24h: false,
            languages: ["Kannada", "English"]
          },
          {
            name: "108 Ambulance Service",
            phone: "108",
            type: 'ambulance',
            distance: "Available",
            available24h: true,
            languages: ["Kannada", "English", "Hindi", "Tamil", "Telugu"]
          },
          {
            name: "Police Station Devanahalli",
            phone: "080-27832200",
            type: 'police',
            distance: "3 km",
            available24h: true,
            languages: ["Kannada", "English"]
          }
        ],
        nearestFacilities: {
          hospital: "District Hospital - 12 km",
          clinic: "PHC Devanahalli - 5 km",
          pharmacy: "Jan Aushadhi Store - 2 km"
        },
        transportOptions: [
          "108 Ambulance (Free)",
          "Private Ambulance",
          "Auto Rickshaw",
          "Village Transport"
        ]
      };

      setLocationData(mockLocationData);
      
      // Store offline for future use
      const storage = OfflineHealthStorage.getInstance();
      await storage.storeEmergencyInfo(
        `${position.coords.latitude},${position.coords.longitude}`,
        mockLocationData
      );
    } catch (error) {
      console.error('Error getting location data:', error);
      loadDefaultEmergencyInfo();
    }
  };

  const loadDefaultEmergencyInfo = () => {
    const defaultData: LocationData = {
      state: "India",
      district: "Rural Area",
      emergencyContacts: [
        {
          name: "National Emergency Helpline",
          phone: "112",
          type: 'ambulance',
          distance: "Available",
          available24h: true,
          languages: ["Hindi", "English", "Regional Languages"]
        },
        {
          name: "Medical Emergency",
          phone: "108",
          type: 'ambulance',
          distance: "Available",
          available24h: true,
          languages: ["Hindi", "English", "Regional Languages"]
        },
        {
          name: "Police Emergency",
          phone: "100",
          type: 'police',
          distance: "Available",
          available24h: true,
          languages: ["Hindi", "English", "Regional Languages"]
        },
        {
          name: "Fire Emergency",
          phone: "101",
          type: 'fire',
          distance: "Available",
          available24h: true,
          languages: ["Hindi", "English", "Regional Languages"]
        }
      ],
      nearestFacilities: {
        hospital: "Contact 108 for nearest hospital",
        clinic: "Contact local PHC",
        pharmacy: "Contact local medical store"
      },
      transportOptions: [
        "108 Ambulance (Free)",
        "102 Ambulance (Pregnant women & infants)",
        "Local Transport"
      ]
    };

    setLocationData(defaultData);
  };

  const loadEmergencyData = async () => {
    if (!isOnline) {
      // Load from offline storage
      const storage = OfflineHealthStorage.getInstance();
      try {
        const offlineData = await storage.getEmergencyInfo('default');
        if (offlineData) {
          setLocationData(offlineData);
        }
      } catch (error) {
        console.error('Error loading offline emergency data:', error);
      }
    }
  };

  const makeEmergencyCall = (phone: string, name: string) => {
    if (confirm(`Call ${name} at ${phone}?`)) {
      window.location.href = `tel:${phone}`;
    }
  };

  const sendEmergencySMS = (phone: string, type: string) => {
    const message = `EMERGENCY: Need ${type} assistance. Location: ${location ? `${location.coords.latitude},${location.coords.longitude}` : 'Unknown'}. Please help.`;
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  };

  const getEmergencyTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'clinic': return '🩺';
      case 'ambulance': return '🚑';
      case 'police': return '👮';
      case 'fire': return '🚒';
      default: return '📞';
    }
  };

  const getEmergencyTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'from-blue-500 to-blue-600';
      case 'clinic': return 'from-green-500 to-green-600';
      case 'ambulance': return 'from-red-500 to-red-600';
      case 'police': return 'from-indigo-500 to-indigo-600';
      case 'fire': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border-2 border-red-200 p-8 shadow-xl">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-pulse">🚨</div>
            <h1 className="text-4xl font-bold text-red-700">Rural Emergency Services</h1>
            <p className="text-xl text-red-600 max-w-3xl mx-auto">
              Quick access to emergency services in rural areas. Works offline and provides local emergency contacts.
            </p>
            
            {/* Connection Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="font-medium">
                {isOnline ? 'Online - Live Data' : 'Offline - Cached Data'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Emergency Actions */}
        <div className="bg-white rounded-3xl border-2 border-red-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">🚨 Quick Emergency Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => makeEmergencyCall('112', 'National Emergency')}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="text-4xl mb-3">📞</div>
              <div className="font-bold text-lg">Call 112</div>
              <div className="text-sm opacity-90">National Emergency</div>
            </button>
            
            <button
              onClick={() => makeEmergencyCall('108', 'Medical Emergency')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="text-4xl mb-3">🚑</div>
              <div className="font-bold text-lg">Call 108</div>
              <div className="text-sm opacity-90">Medical Emergency</div>
            </button>
            
            <button
              onClick={() => sendEmergencySMS('108', 'medical')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-2xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="text-4xl mb-3">💬</div>
              <div className="font-bold text-lg">Send SMS</div>
              <div className="text-sm opacity-90">Emergency Text</div>
            </button>
            
            <Link
              href="/symptom-check"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-2xl hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="text-4xl mb-3">🤖</div>
              <div className="font-bold text-lg">AI Check</div>
              <div className="text-sm opacity-90">Symptom Analysis</div>
            </Link>
          </div>
        </div>

        {/* Location Info */}
        {locationData && (
          <div className="bg-white rounded-3xl border-2 border-blue-200 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
              📍 Your Location Services
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-700 mb-2">📍 Location</h3>
                <p className="text-blue-600">{locationData.state}</p>
                <p className="text-blue-600">{locationData.district}</p>
              </div>
              
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-green-700 mb-2">🏥 Nearest Hospital</h3>
                <p className="text-green-600">{locationData.nearestFacilities.hospital}</p>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="font-bold text-purple-700 mb-2">🩺 Nearest Clinic</h3>
                <p className="text-purple-600">{locationData.nearestFacilities.clinic}</p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">📞 Emergency Contacts</h3>
            <div className="grid gap-4">
              {locationData.emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getEmergencyTypeIcon(contact.type)}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{contact.name}</h4>
                        <p className="text-gray-600">{contact.phone}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">📍 {contact.distance}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            contact.available24h ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {contact.available24h ? '24/7 Available' : 'Limited Hours'}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {contact.languages.map((lang, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => makeEmergencyCall(contact.phone, contact.name)}
                        className={`bg-gradient-to-r ${getEmergencyTypeColor(contact.type)} text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all`}
                      >
                        📞 Call
                      </button>
                      <button
                        onClick={() => sendEmergencySMS(contact.phone, contact.type)}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        💬 SMS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport Options */}
        {locationData && (
          <div className="bg-white rounded-3xl border-2 border-green-200 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-3">
              🚗 Transport Options
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locationData.transportOptions.map((option, index) => (
                <div key={index} className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-center gap-3">
                  <div className="text-2xl">🚗</div>
                  <div>
                    <div className="font-semibold text-green-700">{option}</div>
                    {option.includes('108') && (
                      <div className="text-sm text-green-600">Free government ambulance service</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Instructions */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-3xl border-2 border-orange-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">📱 Offline Emergency Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-orange-700 mb-4">🔴 Critical Emergency</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">1</span>
                  <span>Call 112 (National Emergency)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">2</span>
                  <span>Call 108 (Medical Emergency)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">3</span>
                  <span>Share your location clearly</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">4</span>
                  <span>Stay on the line for instructions</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-orange-700 mb-4">🟡 Non-Critical Issues</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">1</span>
                  <span>Use AI Symptom Checker</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">2</span>
                  <span>Contact nearest PHC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">3</span>
                  <span>Visit local medical store</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">4</span>
                  <span>Schedule appointment when online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">⚡ Quick Health Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/symptom-check"
              className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 p-6 rounded-2xl hover:shadow-lg transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="font-bold text-gray-900 mb-2">AI Health Check</h3>
              <p className="text-gray-600 text-sm">Get instant symptom analysis</p>
            </Link>
            
            <Link
              href="/vitals-scan"
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6 rounded-2xl hover:shadow-lg transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">Vitals Scan</h3>
              <p className="text-gray-600 text-sm">Monitor your health at home</p>
            </Link>
            
            <Link
              href="/health-library"
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl hover:shadow-lg transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📚</div>
              <h3 className="font-bold text-gray-900 mb-2">Health Education</h3>
              <p className="text-gray-600 text-sm">Learn about health topics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
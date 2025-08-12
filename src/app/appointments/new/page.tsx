"use client";

import { useState } from "react";
import Link from "next/link";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  avatar: string;
  nextAvailable: string;
  price: string;
};

export default function NewAppointmentPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [visitType, setVisitType] = useState<string>("video");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [step, setStep] = useState<number>(1);

  const doctors: Doctor[] = [
    {
      id: "dr-smith",
      name: "Dr. Sarah Smith",
      specialty: "General Medicine",
      rating: 4.9,
      experience: "15 years",
      avatar: "👩‍⚕️",
      nextAvailable: "Today 2:00 PM",
      price: "$75"
    },
    {
      id: "dr-lee",
      name: "Dr. Michael Lee",
      specialty: "Cardiology",
      rating: 4.8,
      experience: "12 years",
      avatar: "👨‍⚕️",
      nextAvailable: "Tomorrow 10:00 AM",
      price: "$120"
    },
    {
      id: "dr-patel",
      name: "Dr. Priya Patel",
      specialty: "Dermatology",
      rating: 4.9,
      experience: "10 years",
      avatar: "👩‍⚕️",
      nextAvailable: "Today 4:30 PM",
      price: "$95"
    },
    {
      id: "dr-johnson",
      name: "Dr. Robert Johnson",
      specialty: "Pediatrics",
      rating: 4.7,
      experience: "18 years",
      avatar: "👨‍⚕️",
      nextAvailable: "Tomorrow 9:00 AM",
      price: "$85"
    }
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);
      if (!selectedDoctorData) return;
      
      // Save to patient data manager
      const { PatientDataManager } = await import("@/lib/patientData");
      const dataManager = PatientDataManager.getInstance();
      
      dataManager.addAppointment({
        doctorId: selectedDoctor,
        doctorName: selectedDoctorData.name,
        specialty: selectedDoctorData.specialty,
        date: selectedDate,
        time: selectedTime,
        type: visitType as 'video' | 'in-person' | 'phone',
        status: 'scheduled',
        reason: reason,
        cost: parseInt(selectedDoctorData.price.replace('$', ''))
      });
      
      // Also save a confirmation message
      dataManager.addMessage({
        senderId: 'system',
        senderName: 'HealthCare System',
        senderType: 'system',
        content: `Your appointment with ${selectedDoctorData.name} has been confirmed for ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}. You will receive a reminder 24 hours before your appointment.`,
        timestamp: new Date().toISOString(),
        read: false
      });
      
      alert("Appointment booked successfully! You will receive a confirmation email shortly.");
      
      // Redirect to appointments page
      window.location.href = '/appointments';
    } catch (error) {
      alert("Error booking appointment. Please try again.");
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="text-5xl">📅</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Book Your Appointment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our qualified healthcare providers and schedule your consultation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-xl overflow-hidden">
          
          {/* Step 1: Choose Doctor */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                👩‍⚕️ Choose Your Doctor
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedDoctor === doctor.id
                        ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{doctor.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                        <p className="text-cyan-600 font-medium">{doctor.specialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>⭐ {doctor.rating}</span>
                          <span>📅 {doctor.experience}</span>
                          <span className="font-semibold text-green-600">{doctor.price}</span>
                        </div>
                        <div className="mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                          Next: {doctor.nextAvailable}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedDoctor}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Date & Time */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                🗓️ Select Date & Time
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Visit Type */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Visit Type</label>
                    <div className="space-y-3">
                      {[
                        { value: "video", label: "Video Call", icon: "📹", desc: "Online consultation" },
                        { value: "in-person", label: "In-Person", icon: "🏥", desc: "Visit clinic" },
                        { value: "phone", label: "Phone Call", icon: "📞", desc: "Audio consultation" }
                      ].map((type) => (
                        <div
                          key={type.value}
                          onClick={() => setVisitType(type.value)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            visitType === type.value
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{type.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{type.label}</div>
                              <div className="text-sm text-gray-600">{type.desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      className="w-full rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-lg focus:border-cyan-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Available Times</label>
                  <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-xl border-2 font-medium transition-all ${
                          selectedTime === time
                            ? 'border-cyan-500 bg-cyan-500 text-white'
                            : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                📝 Appointment Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Reason for Visit
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe your symptoms, concerns, or the reason for this appointment..."
                    className="w-full rounded-2xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-lg focus:border-cyan-500 focus:bg-white focus:outline-none resize-none"
                    rows={6}
                    required
                  />
                </div>

                {/* Appointment Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Appointment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-semibold">
                        {doctors.find(d => d.id === selectedDoctor)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty:</span>
                      <span className="font-semibold">
                        {doctors.find(d => d.id === selectedDoctor)?.specialty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold capitalize">{visitType.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {doctors.find(d => d.id === selectedDoctor)?.price}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    🎉 Book Appointment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help booking your appointment?</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/chat"
              className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors"
            >
              💬 Chat Support
            </Link>
            <Link
              href="/help"
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              ❓ Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PatientDataManager, Appointment } from "@/lib/patientData";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataManager = PatientDataManager.getInstance();
    const patient = dataManager.getPatient();
    setAppointments(patient.appointments);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹';
      case 'in-person': return '🏥';
      case 'phone': return '📞';
      default: return '📅';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading appointments...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                📅 My Appointments
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Manage your upcoming and past healthcare visits
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link
                href="/appointments/new"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-xl mr-3">➕</span>
                New Appointment
              </Link>
              <Link
                href="/patient"
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                <span className="text-xl mr-3">🏠</span>
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                🔜 Upcoming Appointments
              </h2>
              
              <div className="grid gap-6">
                {appointments
                  .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
                  .map((appointment) => (
                    <div key={appointment.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{getTypeIcon(appointment.type)}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{appointment.doctorName}</h3>
                            <p className="text-blue-600 font-medium">{appointment.specialty}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                📅 {new Date(appointment.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                ⏰ {appointment.time}
                              </span>
                              <span className="flex items-center gap-1">
                                💰 ${appointment.cost}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-2">{appointment.reason}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(appointment.status)}`}>
                            {appointment.status.toUpperCase()}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={`/call/${appointment.id}`}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                            >
                              Join Call
                            </Link>
                            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-all">
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Past Appointments */}
            {appointments.filter(apt => apt.status === 'completed' || new Date(apt.date) < new Date()).length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  📋 Past Appointments
                </h2>
                
                <div className="grid gap-4">
                  {appointments
                    .filter(apt => apt.status === 'completed' || new Date(apt.date) < new Date())
                    .slice(0, 5)
                    .map((appointment) => (
                      <div key={appointment.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{getTypeIcon(appointment.type)}</div>
                            <div>
                              <h3 className="font-bold text-gray-900">{appointment.doctorName}</h3>
                              <p className="text-gray-600">{appointment.specialty}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(appointment.status)}`}>
                              {appointment.status.toUpperCase()}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">${appointment.cost}</p>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Visit Notes:</h4>
                            <p className="text-gray-700">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-12 shadow-xl text-center">
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Appointments Yet</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              You haven't scheduled any appointments yet. Book your first consultation with one of our qualified healthcare providers.
            </p>
            <Link
              href="/appointments/new"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all text-xl"
            >
              <span className="text-2xl mr-3">🩺</span>
              Schedule Your First Appointment
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-emerald-700 mb-6 text-center">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/symptom-check"
              className="bg-white p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
              <h4 className="font-bold text-gray-900 mb-2">Symptom Check</h4>
              <p className="text-gray-600 text-sm">Get AI analysis before your appointment</p>
            </Link>
            
            <Link
              href="/chat"
              className="bg-white p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💬</div>
              <h4 className="font-bold text-gray-900 mb-2">Message Doctor</h4>
              <p className="text-gray-600 text-sm">Ask questions between visits</p>
            </Link>
            
            <Link
              href="/vitals-scan"
              className="bg-white p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📱</div>
              <h4 className="font-bold text-gray-900 mb-2">Vitals Scan</h4>
              <p className="text-gray-600 text-sm">Monitor your health at home</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



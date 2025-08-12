"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function PatientDashboardPage() {
  const [healthScore, setHealthScore] = useState(0);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    // Animate health score
    const timer = setTimeout(() => setHealthScore(87), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">👋 Welcome back, Sarah!</h1>
          <p className="text-xl text-gray-600">Here's your health overview for today</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-3 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all">
              🔔
            </button>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-medium">
                {notifications}
              </span>
            )}
          </div>
          <Link href="/symptom-check" className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
            🤖 Quick Check
          </Link>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl border border-emerald-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-emerald-700">🎯 Health Score</h3>
            <p className="text-emerald-600 text-lg">Based on your recent activities and checkups</p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-5xl font-bold text-emerald-600 mb-2">{healthScore}%</div>
            <div className="text-lg text-emerald-700 font-medium">Excellent</div>
          </div>
        </div>
        <div className="mt-6 bg-emerald-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="📅" title="Next appointment" value="Today, 2:00 PM" hint="Video with Dr. Smith" color="blue" />
        <StatCard icon="💬" title="Unread messages" value="2" hint="From care team" color="purple" />
        <StatCard icon="💊" title="Prescriptions" value="3 active" hint="Next refill: Aug 25" color="emerald" />
        <StatCard icon="🏃‍♀️" title="Steps today" value="8,432" hint="Goal: 10,000" color="orange" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              📊 Health Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                <div className="text-3xl font-bold text-red-600 mb-2">120/80</div>
                <div className="text-sm text-red-700 mb-1">Blood Pressure</div>
                <div className="text-sm text-green-600 font-medium">Normal ✓</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">72</div>
                <div className="text-sm text-blue-700 mb-1">Heart Rate</div>
                <div className="text-sm text-green-600 font-medium">Good ✓</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">98.6°F</div>
                <div className="text-sm text-purple-700 mb-1">Temperature</div>
                <div className="text-sm text-green-600 font-medium">Normal ✓</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">💬 Recent Messages</h3>
            <div className="space-y-4">
              <MessageItem 
                sender="Dr. Smith" 
                message="Your test results look great! See you at our appointment today." 
                time="2 hours ago"
                unread={true}
              />
              <MessageItem 
                sender="Nurse Johnson" 
                message="Please remember to take your medication with food." 
                time="1 day ago"
                unread={true}
              />
              <MessageItem 
                sender="Lab Results" 
                message="Your blood work is complete and available to view." 
                time="3 days ago"
                unread={false}
              />
            </div>
            <Link href="/chat" className="block mt-6 text-center text-blue-600 hover:text-blue-700 font-semibold text-lg">
              View all messages →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-gray-900">⚡ Quick Actions</h3>
            <div className="space-y-4">
              <ActionButton href="/appointments/new" icon="📅" text="Book Appointment" />
              <ActionButton href="/chat" icon="💬" text="Message Doctor" />
              <ActionButton href="/records" icon="📋" text="View Records" />
              <ActionButton href="/reminders" icon="💊" text="Medication Reminders" />
              <ActionButton href="/call" icon="📞" text="Emergency Call" color="red" />
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-gray-900">📋 Upcoming</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">Video Consultation</div>
                  <div className="text-gray-600">Today, 2:00 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">Medication Refill</div>
                  <div className="text-gray-600">Aug 25</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">Lab Results</div>
                  <div className="text-gray-600">Aug 30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, hint, color }: { 
  icon: string; 
  title: string; 
  value: string; 
  hint?: string; 
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
  };

  return (
    <div className={`rounded-2xl border p-6 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} hover:scale-105 transition-all cursor-pointer shadow-sm`}>
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-sm opacity-80 mb-2">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-sm opacity-70 mt-2">{hint}</p>}
    </div>
  );
}

function MessageItem({ sender, message, time, unread }: {
  sender: string;
  message: string;
  time: string;
  unread: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border-l-4 ${unread ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900">{sender}</span>
        <span className="text-sm text-gray-500">{time}</span>
      </div>
      <p className="text-gray-700 leading-relaxed">{message}</p>
      {unread && <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">New</span>}
    </div>
  );
}

function ActionButton({ href, icon, text, color = "blue" }: {
  href: string;
  icon: string;
  text: string;
  color?: string;
}) {
  const colorClass = color === "red" ? "hover:bg-red-50 hover:text-red-700 border-red-200" : "hover:bg-blue-50 hover:text-blue-700 border-gray-200";
  
  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${colorClass} hover:shadow-sm`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-gray-900">{text}</span>
    </Link>
  );
}



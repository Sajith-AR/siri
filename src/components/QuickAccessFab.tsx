"use client";

import { useState } from "react";
import Link from "next/link";

export default function QuickAccessFab() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { href: "/symptom-check", icon: "🤖", label: "Symptom Check", color: "bg-cyan-500 hover:bg-cyan-600" },
    { href: "/vitals-scan", icon: "📱", label: "Vitals Scan", color: "bg-purple-500 hover:bg-purple-600" },
    { href: "/ai-assistant", icon: "🧠", label: "AI Assistant", color: "bg-indigo-500 hover:bg-indigo-600" },
    { href: "/patient", icon: "📊", label: "Dashboard", color: "bg-emerald-500 hover:bg-emerald-600" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Action Buttons */}
      <div className={`flex flex-col gap-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {quickActions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center gap-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="font-medium text-sm whitespace-nowrap">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${isOpen ? 'rotate-45' : ''}`}
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {isOpen ? '✕' : '⚡'}
        </span>
      </button>
    </div>
  );
}
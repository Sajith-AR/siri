"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import WellnessTips from "@/components/WellnessTips";

export default function Home() {
  const { t } = useSettings();
  const [stats, setStats] = useState({ patients: 0, consultations: 0, satisfaction: 0 });

  useEffect(() => {
    // Animate stats on load
    const timer = setTimeout(() => {
      setStats({ patients: 25000, consultations: 18500, satisfaction: 99 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* Hero Section */}
        <section className="text-center space-y-12 animate-fadeInUp">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 text-sm font-bold text-teal-700 border-2 border-teal-200 shadow-lg">
              <span className="text-lg">🏥</span>
              Next-Generation Healthcare Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("landingTitle") || "Health Made Simple"}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Experience the future of healthcare with AI-powered diagnostics, real-time health monitoring, 
              and personalized care - all in one beautiful, intuitive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/symptom-check"
                className="group bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                Get Started Free
              </Link>
              <Link
                href="/patient"
                className="group bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-teal-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <span className="text-2xl">📊</span>
                View Dashboard
              </Link>
            </div>
          </div>
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pt-8">
            <Link
              href="/symptom-check"
              className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 group-hover:animate-bounce">🤖</div>
                <div className="font-bold text-xl text-gray-900 mb-2">AI Symptom Check</div>
                <div className="text-gray-600 text-sm">Instant AI-powered health analysis</div>
              </div>
            </Link>
            
            <Link
              href="/vitals-scan"
              className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 group-hover:animate-pulse">📱</div>
                <div className="font-bold text-xl text-gray-900 mb-2">Vitals Scan</div>
                <div className="text-gray-600 text-sm">Camera-based vital monitoring</div>
              </div>
            </Link>
            
            <Link
              href="/ai-assistant"
              className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 group-hover:animate-bounce">🧠</div>
                <div className="font-bold text-xl text-gray-900 mb-2">AI Assistant</div>
                <div className="text-gray-600 text-sm">Personal health companion</div>
              </div>
            </Link>
            
            <Link
              href="/patient"
              className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 group-hover:animate-pulse">📊</div>
                <div className="font-bold text-xl text-gray-900 mb-2">Health Dashboard</div>
                <div className="text-gray-600 text-sm">Complete health overview</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 rounded-3xl transform rotate-1 opacity-50"></div>
          <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="text-6xl font-black text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stats.patients.toLocaleString()}+
                </div>
                <div className="text-2xl text-gray-800 font-bold mb-2">Lives Transformed</div>
                <div className="text-gray-600">Through AI-powered personalized care</div>
              </div>
              <div className="text-center group">
                <div className="text-6xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stats.consultations.toLocaleString()}+
                </div>
                <div className="text-2xl text-gray-800 font-bold mb-2">Smart Assessments</div>
                <div className="text-gray-600">Instant AI health evaluations</div>
              </div>
              <div className="text-center group">
                <div className="text-6xl font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stats.satisfaction}%
                </div>
                <div className="text-2xl text-gray-800 font-bold mb-2">Satisfaction Rate</div>
                <div className="text-gray-600">Trusted by healthcare professionals</div>
              </div>
            </div>
          </div>
        </section>

        {/* All Features Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              🌟 <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">All Features</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for comprehensive health management in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Features */}
            <FeatureCard
              icon="🤖"
              title="AI Symptom Checker"
              description="Get instant AI-powered analysis of your symptoms with medical references and recommendations."
              href="/symptom-check"
              color="cyan"
              isPrimary={true}
            />
            <FeatureCard
              icon="📱"
              title="Camera Vitals Scan"
              description="Monitor your vital signs using just your phone's camera - no additional devices needed."
              href="/vitals-scan"
              color="purple"
              isPrimary={true}
            />
            <FeatureCard
              icon="🧠"
              title="AI Health Assistant"
              description="Your personal AI health companion that remembers your history and provides personalized advice."
              href="/ai-assistant"
              color="indigo"
              isPrimary={true}
            />
            
            {/* Secondary Features */}
            <FeatureCard
              icon="🔮"
              title="Health Predictions"
              description="AI-powered insights into your future health risks and personalized prevention strategies."
              href="/health-prediction"
              color="emerald"
            />
            <FeatureCard
              icon="💊"
              title="Smart Medications"
              description="Intelligent medication management with interaction checking and adherence tracking."
              href="/smart-meds"
              color="blue"
            />
            <FeatureCard
              icon="📊"
              title="Health Dashboard"
              description="Complete overview of your health data, trends, and personalized insights in one place."
              href="/patient"
              color="green"
            />
            
            {/* Additional Features */}
            <FeatureCard
              icon="🚨"
              title="Rural Emergency"
              description="Location-based emergency services for rural areas. Works offline with local emergency contacts."
              href="/rural-emergency"
              color="red"
            />
            <FeatureCard
              icon="📚"
              title="Health Education"
              description="Essential health information in local languages. Available offline for rural communities."
              href="/rural-health-education"
              color="orange"
            />
            <FeatureCard
              icon="💬"
              title="Health Chat"
              description="Secure messaging and communication tools for healthcare coordination and support."
              href="/chat"
              color="pink"
            />
          </div>
        </section>

        {/* Health Benefits Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  💙 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Why Choose Our Platform</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Experience healthcare that adapts to your needs with <strong>personalized insights</strong>, 
                  comprehensive health tracking, and intelligent recommendations that help you live healthier.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="text-4xl">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900">Personalized Care</h3>
                  <p className="text-gray-600">Tailored health recommendations based on your unique health profile and lifestyle</p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900">Privacy First</h3>
                  <p className="text-gray-600">Your health data is encrypted and secure, with complete control over your information</p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl">⚡</div>
                  <h3 className="text-xl font-bold text-gray-900">Instant Insights</h3>
                  <p className="text-gray-600">Get immediate health assessments and recommendations whenever you need them</p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl">🌍</div>
                  <h3 className="text-xl font-bold text-gray-900">Global Access</h3>
                  <p className="text-gray-600">Access your health information and tools from anywhere in the world</p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl">📱</div>
                  <h3 className="text-xl font-bold text-gray-900">Mobile Friendly</h3>
                  <p className="text-gray-600">Seamless experience across all devices with responsive design</p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl">🤝</div>
                  <h3 className="text-xl font-bold text-gray-900">Expert Support</h3>
                  <p className="text-gray-600">Backed by medical knowledge and continuous learning algorithms</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
                <div className="flex items-center justify-center gap-4 text-green-800">
                  <span className="text-3xl">💚</span>
                  <span className="text-xl font-bold">Trusted by Thousands • Clinically Informed • Always Improving</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Menu */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border-2 border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ⚡ <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Quick Actions</span>
            </h2>
            <p className="text-gray-600">Get started with these popular features</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/symptom-check" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
              <div className="font-semibold text-gray-900 group-hover:text-cyan-600">Check Symptoms</div>
            </Link>
            <Link href="/vitals-scan" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📱</div>
              <div className="font-semibold text-gray-900 group-hover:text-purple-600">Scan Vitals</div>
            </Link>
            <Link href="/ai-assistant" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🧠</div>
              <div className="font-semibold text-gray-900 group-hover:text-indigo-600">Ask AI</div>
            </Link>
            <Link href="/patient" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-center">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <div className="font-semibold text-gray-900 group-hover:text-emerald-600">Dashboard</div>
            </Link>
          </div>
        </section>

        {/* Daily Wellness Tips */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              💡 <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Daily Wellness Tips</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Small daily habits that make a big difference in your health and wellbeing
            </p>
          </div>
          <WellnessTips />
        </section>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  href: string;
  color: string;
  isPrimary?: boolean;
};

function FeatureCard({ icon, title, description, href, color, isPrimary = false }: FeatureCardProps) {
  const colorClasses = {
    cyan: "from-cyan-50 to-cyan-100 border-cyan-200 group-hover:border-cyan-300 group-hover:shadow-cyan-200/50",
    blue: "from-blue-50 to-blue-100 border-blue-200 group-hover:border-blue-300 group-hover:shadow-blue-200/50",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200 group-hover:border-emerald-300 group-hover:shadow-emerald-200/50",
    purple: "from-purple-50 to-purple-100 border-purple-200 group-hover:border-purple-300 group-hover:shadow-purple-200/50",
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 group-hover:border-indigo-300 group-hover:shadow-indigo-200/50",
    pink: "from-pink-50 to-pink-100 border-pink-200 group-hover:border-pink-300 group-hover:shadow-pink-200/50",
    red: "from-red-50 to-red-100 border-red-200 group-hover:border-red-300 group-hover:shadow-red-200/50",
    green: "from-green-50 to-green-100 border-green-200 group-hover:border-green-300 group-hover:shadow-green-200/50",
    orange: "from-orange-50 to-orange-100 border-orange-200 group-hover:border-orange-300 group-hover:shadow-orange-200/50"
  };

  const primaryBadge = isPrimary ? (
    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
      ⭐ Popular
    </div>
  ) : null;

  return (
    <Link href={href} className="group block relative">
      {primaryBadge}
      <div className={`h-full rounded-2xl border-2 bg-gradient-to-br p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${colorClasses[color as keyof typeof colorClasses]} ${isPrimary ? 'ring-2 ring-yellow-200' : ''}`}>
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-cyan-600 transition-colors">{title}</h3>
        <p className="text-gray-700 leading-relaxed text-sm mb-4">{description}</p>
        <div className="inline-flex items-center text-cyan-600 font-semibold group-hover:text-cyan-700 text-sm">
          Try now →
        </div>
      </div>
    </Link>
  );
}

function TechBadge({ name, color }: { name: string; color: string }) {
  return (
    <div className={`px-4 py-3 rounded-xl text-sm font-bold text-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${color}`}>
      {name}
    </div>
  );
}

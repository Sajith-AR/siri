"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import TopBarControls from "@/components/TopBarControls";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/symptom-check", label: "Symptom Check" },
  { href: "/vitals-scan", label: "Vitals Scan" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/health-prediction", label: "Health Insights" },
  { href: "/smart-meds", label: "Smart Meds" },
  { href: "/patient", label: "Dashboard" },
  { href: "/rural-emergency", label: "Rural Emergency" },
  { href: "/rural-health-education", label: "Health Education" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-2xl">🏥</div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {t("appTitle") || "HealthCare"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-cyan-600"
                  }`}
                >
                  {(() => {
                    switch (item.label) {
                      case "Home": return "🏠 Home";
                      case "Symptom Check": return "🤖 Symptoms";
                      case "Vitals Scan": return "📱 Vitals";
                      case "AI Assistant": return "🧠 Assistant";
                      case "Health Insights": return "🔮 Insights";
                      case "Smart Meds": return "💊 Meds";
                      case "Dashboard": return "📊 Dashboard";
                      case "Rural Emergency": return "🚨 Emergency";
                      case "Health Education": return "📚 Education";
                      default: return item.label;
                    }
                  })()}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <TopBarControls />
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/help"
                className="px-3 py-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors"
              >
                Help
              </Link>
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-cyan-600 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-6 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current mt-1 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current mt-1 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {(() => {
                      switch (item.label) {
                        case "Home": return "🏠 Home";
                        case "Symptom Check": return "🤖 AI Symptom Check";
                        case "Vitals Scan": return "📱 Vitals Scan";
                        case "AI Assistant": return "🧠 AI Assistant";
                        case "Health Insights": return "🔮 Health Insights";
                        case "Smart Meds": return "💊 Smart Medications";
                        case "Dashboard": return "📊 Health Dashboard";
                        case "Rural Emergency": return "🚨 Rural Emergency";
                        case "Health Education": return "📚 Health Education";
                        default: return item.label;
                      }
                    })()}
                  </Link>
                );
              })}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Help & Support
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}



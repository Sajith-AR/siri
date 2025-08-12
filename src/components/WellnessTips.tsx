"use client";

import { useState, useEffect } from "react";

type WellnessTip = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
};

const wellnessTips: WellnessTip[] = [
  {
    id: "hydration",
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain optimal body function and energy levels.",
    icon: "💧",
    category: "Nutrition"
  },
  {
    id: "movement",
    title: "Move Every Hour",
    description: "Take a 2-minute walk or stretch break every hour to improve circulation and reduce stiffness.",
    icon: "🚶‍♀️",
    category: "Fitness"
  },
  {
    id: "sleep",
    title: "Prioritize Sleep",
    description: "Aim for 7-9 hours of quality sleep each night to support immune function and mental clarity.",
    icon: "😴",
    category: "Rest"
  },
  {
    id: "mindfulness",
    title: "Practice Mindfulness",
    description: "Spend 5 minutes daily in meditation or deep breathing to reduce stress and improve focus.",
    icon: "🧘‍♂️",
    category: "Mental Health"
  },
  {
    id: "nutrition",
    title: "Eat Colorfully",
    description: "Include fruits and vegetables of different colors in your meals for diverse nutrients.",
    icon: "🌈",
    category: "Nutrition"
  },
  {
    id: "sunlight",
    title: "Get Natural Light",
    description: "Spend 15-20 minutes in natural sunlight daily to boost vitamin D and regulate sleep cycles.",
    icon: "☀️",
    category: "Wellness"
  }
];

export default function WellnessTips() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % wellnessTips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const tip = wellnessTips[currentTip];

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="text-4xl animate-pulse">{tip.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-emerald-700">{tip.title}</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
              {tip.category}
            </span>
          </div>
          <p className="text-emerald-600 leading-relaxed">{tip.description}</p>
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="flex gap-2 mt-4 justify-center">
        {wellnessTips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTip(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentTip ? 'bg-emerald-500' : 'bg-emerald-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
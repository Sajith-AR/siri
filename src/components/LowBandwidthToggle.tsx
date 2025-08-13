"use client";

import { useSettings } from "@/context/SettingsContext";

export default function LowBandwidthToggle() {
  const { lowBandwidth, setLowBandwidth, t } = useSettings();

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer group" title={t("lowBandwidth")}> 
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={lowBandwidth}
          onChange={(e) => setLowBandwidth(e.target.checked)}
        />
        <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
          lowBandwidth ? 'bg-teal-500' : 'bg-gray-300'
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            lowBandwidth ? 'translate-x-6' : 'translate-x-0.5'
          } translate-y-0.5`}></div>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
        📶 {t("lowBandwidth") || "Low Bandwidth"}
      </span>
    </label>
  );
}



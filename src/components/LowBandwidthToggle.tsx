"use client";

import { useSettings } from "@/context/SettingsContext";

export default function LowBandwidthToggle() {
  const { lowBandwidth, setLowBandwidth, t } = useSettings();

  return (
    <label className="inline-flex items-center gap-2 text-sm" title={t("lowBandwidth")}> 
      <input
        type="checkbox"
        className="size-4"
        checked={lowBandwidth}
        onChange={(e) => setLowBandwidth(e.target.checked)}
      />
      <span>{t("lowBandwidth")}</span>
    </label>
  );
}



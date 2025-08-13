"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import LowBandwidthToggle from "@/components/LowBandwidthToggle";

export default function TopBarControls() {
  return (
    <div className="flex items-center gap-3">
      <LanguageSwitcher />
      <LowBandwidthToggle />
    </div>
  );
}



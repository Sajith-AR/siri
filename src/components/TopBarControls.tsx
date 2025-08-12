"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import TextSizeToggle from "@/components/TextSizeToggle";
import LowBandwidthToggle from "@/components/LowBandwidthToggle";

export default function TopBarControls() {
  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      <ThemeToggle />
      <TextSizeToggle />
      <LowBandwidthToggle />
    </div>
  );
}



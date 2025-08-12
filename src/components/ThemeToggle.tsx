"use client";

import { useSettings } from "@/context/SettingsContext";

export default function ThemeToggle() {
  const { theme, setTheme, t } = useSettings();

  const cycle = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "hc" : "light");
  };

  const label = theme === "light" ? t("light") : theme === "dark" ? t("dark") : t("highContrast");

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex items-center rounded-md border border-foreground/20 px-2.5 py-1.5 text-sm hover:bg-foreground/5"
      aria-label={t("theme")}
      title={t("theme")}
    >
      {label}
    </button>
  );
}



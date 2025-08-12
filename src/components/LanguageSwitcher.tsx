"use client";

import { useSettings } from "@/context/SettingsContext";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useSettings();

  return (
    <label className="inline-flex items-center gap-2 text-sm" aria-label={t("language")}> 
      <span className="hidden lg:inline text-foreground/70">{t("language")}:</span>
      <select
        className="rounded-md border border-foreground/20 bg-transparent px-2 py-1 text-sm"
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        aria-labelledby={t("language")}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="si">සිංහල</option>
      </select>
    </label>
  );
}



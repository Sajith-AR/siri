"use client";

import { useSettings } from "@/context/SettingsContext";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useSettings();

  return (
    <div className="inline-flex items-center gap-2" aria-label={t("language")}> 
      <span className="hidden lg:inline text-gray-600 text-sm font-medium">🌐</span>
      <select
        className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-teal-300 focus:border-teal-500 focus:outline-none transition-all shadow-sm"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        aria-labelledby={t("language")}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="si">සිංහල</option>
      </select>
    </div>
  );
}



"use client";

import { useSettings } from "@/context/SettingsContext";

export default function EmergencyButton() {
  const { t } = useSettings();
  return (
    <a
      href="tel:112"
      className="fixed right-3 bottom-3 z-40 inline-flex items-center gap-2 rounded-full bg-red-600 text-white px-4 py-2 shadow-lg hover:opacity-90"
      aria-label={t("emergency") || "Emergency"}
      title={t("emergency") || "Emergency"}
    >
      ⚠️ {t("emergency") || "Emergency"}
    </a>
  );
}



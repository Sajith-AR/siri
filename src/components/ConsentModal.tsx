"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";

const STORAGE_KEY = "consent.symptom";

export default function ConsentModal() {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const has = localStorage.getItem(STORAGE_KEY) === "1";
    if (!has) setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">{t("consentTitle") || "Consent"}</h3>
        <p className="text-sm text-foreground/80">
          {t("consentBody") ||
            "We use your input to provide guidance. This is not a substitute for professional medical advice. By continuing, you consent to processing your data as described in our Privacy Policy."}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <a href="/disclaimer" className="text-sm underline">{t("disclaimer") || "Disclaimer"}</a>
          <button onClick={accept} className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium">
            {t("accept") || "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}



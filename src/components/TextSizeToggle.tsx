"use client";

import { useSettings } from "@/context/SettingsContext";

export default function TextSizeToggle() {
  const { textScale, setTextScale, t } = useSettings();

  const next = () => {
    setTextScale(textScale === "normal" ? "large" : textScale === "large" ? "xlarge" : "normal");
  };

  const label = textScale === "normal" ? t("normal") : textScale === "large" ? t("large") : t("xlarge");

  return (
    <button
      type="button"
      onClick={next}
      className="inline-flex items-center rounded-md border border-foreground/20 px-2.5 py-1.5 text-sm hover:bg-foreground/5"
      aria-label={t("textSize")}
      title={t("textSize")}
    >
      Aa {label}
    </button>
  );
}



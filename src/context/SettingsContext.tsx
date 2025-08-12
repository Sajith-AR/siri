"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations, type Locale } from "@/i18n/translations";

type Theme = "light" | "dark" | "hc";
type TextScale = "normal" | "large" | "xlarge";

type SettingsContextValue = {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => string;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;

  lowBandwidth: boolean;
  setLowBandwidth: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEYS = {
  locale: "tm.locale",
  theme: "tm.theme",
  textScale: "tm.textScale",
  lowBandwidth: "tm.lowBandwidth",
} as const;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>((typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEYS.locale) as Locale)) || "en");
  const [theme, setThemeState] = useState<Theme>((typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEYS.theme) as Theme)) || "light");
  const [textScale, setTextScaleState] = useState<TextScale>((typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEYS.textScale) as TextScale)) || "normal");
  const [lowBandwidth, setLowBandwidthState] = useState<boolean>((typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.lowBandwidth) === "1") || false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.locale, locale);
  }, [locale]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark", "theme-hc");
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.textScale, textScale);
    const body = document.body;
    body.classList.remove("textscale-normal", "textscale-large", "textscale-xlarge");
    body.classList.add(`textscale-${textScale}`);
  }, [textScale]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.lowBandwidth, lowBandwidth ? "1" : "0");
    const body = document.body;
    body.classList.toggle("lowbandwidth", lowBandwidth);
  }, [lowBandwidth]);

  const setLocale = useCallback((loc: Locale) => setLocaleState(loc), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const setTextScale = useCallback((s: TextScale) => setTextScaleState(s), []);
  const setLowBandwidth = useCallback((v: boolean) => setLowBandwidthState(v), []);

  const t = useCallback(
    (key: string) => {
      const dict = translations[locale] || translations.en;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [locale]
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ locale, setLocale, t, theme, setTheme, textScale, setTextScale, lowBandwidth, setLowBandwidth }),
    [locale, setLocale, t, theme, setTheme, textScale, setTextScale, lowBandwidth, setLowBandwidth]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}



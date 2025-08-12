"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import ConsentModal from "@/components/ConsentModal";

type HistoryItem = { id: number; text: string; ts: number };

export default function SymptomCheckPage() {
  const { t, lowBandwidth } = useSettings();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("symptom.history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!listening) return;
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US"; // could map by locale
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    return () => rec.abort();
  }, [listening]);

  const saveHistory = (entry: string) => {
    const item = { id: Date.now(), text: entry, ts: Date.now() };
    const next = [item, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem("symptom.history", JSON.stringify(next));
  };

  const submit = async () => {
    if (!text.trim()) return;
    saveHistory(text.trim());
    const res = await fetch("/api/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text.trim(), lowBandwidth }),
    });
    const data = await res.json();
    localStorage.setItem("lastAssessment", JSON.stringify(data));
    router.push("/symptom-results");
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <ConsentModal />
      <div className="md:col-span-2">
        <h2 className="text-2xl font-semibold">{t("symptomInput") || "Describe your symptoms"}</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., fever for 3 days, cough, sore throat"
          rows={6}
          className="mt-3 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3 text-sm"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setListening(true)}
            disabled={listening}
            className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm hover:bg-[color:var(--color-muted)] disabled:opacity-50"
          >
            🎤 {t("speak") || "Speak"}
          </button>
          <button
            onClick={() => {
              try {
                recognitionRef.current?.abort();
              } catch {}
              setListening(false);
            }}
            className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm hover:bg-[color:var(--color-muted)]"
          >
            ⏹ {t("stop") || "Stop"}
          </button>
          <button
            onClick={submit}
            className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            {t("submit") || "Submit"}
          </button>
        </div>
      </div>
      <aside className="space-y-3">
        <h3 className="font-semibold">{t("history") || "History"}</h3>
        <ul className="space-y-2 text-sm">
          {history.map((h) => (
            <li key={h.id} className="rounded-md border border-[color:var(--color-border)] p-2 line-clamp-3">
              {new Date(h.ts).toLocaleString()}: {h.text}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}



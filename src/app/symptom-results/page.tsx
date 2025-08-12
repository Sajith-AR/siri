"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

type Result = {
  risk: "low" | "medium" | "high";
  conditions: { name: string; confidence: number }[];
  nextSteps: string[];
  references?: { title: string; url: string }[];
  explain?: string;
};

export default function SymptomResultsPage() {
  const { t } = useSettings();
  const [data, setData] = useState<Result | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("lastAssessment");
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) return <p className="text-sm text-foreground/70">No results. Try the symptom check.</p>;

  const riskColor =
    data.risk === "high" ? "bg-red-600 text-white" : data.risk === "medium" ? "bg-yellow-500 text-black" : "bg-emerald-500 text-white";

  return (
    <div className="space-y-6">
      <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${riskColor}`}>
        {t("risk") || "Risk"}: {data.risk.toUpperCase()}
      </div>
      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
        <h3 className="font-semibold mb-2">{t("possibleCauses") || "Possible causes"}</h3>
        <ul className="space-y-1 text-sm">
          {data.conditions.map((c, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{c.name}</span>
              <span className="text-foreground/70">{Math.round(c.confidence * 100)}%</span>
            </li>
          ))}
        </ul>
        {data.explain && (
          <p className="mt-3 text-xs text-foreground/70">Why: {data.explain}</p>
        )}
        {data.references && data.references.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium">References</p>
            <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
              {data.references.map((r, i) => (
                <li key={i}>
                  <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
        <h3 className="font-semibold mb-2">{t("nextSteps") || "Next steps"}</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {data.nextSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link href="/providers" className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm hover:bg-[color:var(--color-muted)]">
          {t("providers") || "Find providers"}
        </Link>
        <Link href="/appointments/new" className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90">
          {t("connectDoctor") || "Connect to doctor"}
        </Link>
      </div>
    </div>
  );
}



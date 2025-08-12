"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  const { t } = useSettings();
  return (
    <div className="flex flex-col gap-10">
      <section className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-r from-[color:var(--color-primary)] to-emerald-500 bg-clip-text text-transparent">
          {t("landingTitle")}
        </h1>
        <p className="mt-3 text-base text-foreground/80 max-w-2xl">{t("landingSubtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
          <Link
            href="/appointments/new"
            className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 shadow"
          >
            {t("bookAppointment")}
          </Link>
          <Link
            href="/patient"
            className="inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]/60 px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-muted)]"
          >
            {t("patientDashboard")}
          </Link>
          <Link
            href="/doctor"
            className="inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]/60 px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-muted)]"
          >
            {t("doctorDashboard")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          title="Appointments"
          description="Browse availability and instantly schedule virtual or in-person visits."
        />
        <FeatureCard
          title="Messaging"
          description="Securely chat with your care team and get timely answers."
        />
        <FeatureCard
          title="Records"
          description="View prescriptions, lab results, and visit summaries."
        />
      </section>
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5 hover:bg-[color:var(--color-muted)] transition-colors">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{description}</p>
    </div>
  );
}

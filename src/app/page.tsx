import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Quality care from anywhere
        </h1>
        <p className="mt-3 text-base text-foreground/80 max-w-2xl">
          Book appointments, chat with your clinician, access medical records,
          and join secure video visits — all in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
          <Link
            href="/appointments/new"
            className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Book an appointment
          </Link>
          <Link
            href="/patient"
            className="inline-flex items-center rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            Patient dashboard
          </Link>
          <Link
            href="/doctor"
            className="inline-flex items-center rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            Doctor dashboard
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
    <div className="rounded-xl border border-foreground/10 p-5 hover:border-foreground/20 transition-colors">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{description}</p>
    </div>
  );
}

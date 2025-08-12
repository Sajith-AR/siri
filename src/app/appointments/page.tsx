import Link from "next/link";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Appointments</h2>
        <p className="text-foreground/70 text-sm mt-1">
          Manage upcoming and past visits.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/appointments/new"
          className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          New appointment
        </Link>
        <Link
          href="/patient"
          className="inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]/60 px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-muted)]"
        >
          Go to dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] divide-y">
        {[1, 2, 3].map((id) => (
          <div key={id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Consultation with Dr. Smith</p>
              <p className="text-sm text-foreground/70">Aug 20, 10:00 AM · Video</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/call/${id}`}
                className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm hover:bg-[color:var(--color-muted)]"
              >
                Join call
              </Link>
              <Link
                href={`/appointments/${id}`}
                className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-3 py-1.5 text-sm hover:opacity-90"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



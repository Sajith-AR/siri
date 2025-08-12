export default function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Patient dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Next appointment" value="Aug 20, 10:00 AM" hint="Video with Dr. Smith" />
        <Card title="Unread messages" value="2" hint="From care team" />
        <Card title="Prescriptions" value="3 active" hint="Last refill: Jul 28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-foreground/10 p-4">
          <h3 className="font-semibold">Recent messages</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex justify-between"><span>Dr. Smith</span><span className="text-foreground/70">See you tomorrow!</span></li>
            <li className="flex justify-between"><span>Nurse Lee</span><span className="text-foreground/70">Please review prep</span></li>
          </ul>
        </div>
        <div className="rounded-xl border border-foreground/10 p-4">
          <h3 className="font-semibold">Recent records</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li>CBC - Normal</li>
            <li>Prescription - Amoxicillin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-foreground/10 p-4">
      <p className="text-sm text-foreground/70">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint ? <p className="text-xs text-foreground/60 mt-1">{hint}</p> : null}
    </div>
  );
}



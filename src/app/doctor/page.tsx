export default function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Clinician dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Today’s visits" value="5" hint="2 video • 3 in-person" />
        <Card title="Awaiting replies" value="4" hint="Patient messages" />
        <Card title="Pending signatures" value="2" hint="Lab orders" />
      </div>

      <div className="rounded-xl border border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-left">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Type</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t border-foreground/10">
                <td className="p-3">{9 + i}:00</td>
                <td className="p-3">Patient {i}</td>
                <td className="p-3">Video</td>
                <td className="p-3">
                  <button className="rounded-md border border-foreground/20 px-3 py-1.5 hover:bg-foreground/5">Chart</button>
                  <button className="ml-2 rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90">Join</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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



export default function ProvidersPage() {
  const items = [
    { name: "City Clinic", address: "123 Main St", phone: "+911234567890" },
    { name: "Rural Health Center", address: "Village Road", phone: "+911112223334" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Nearby healthcare providers</h2>
      <p className="text-sm text-foreground/70">Use maps to get directions or call directly.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((p) => (
          <div key={p.name} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-foreground/70">{p.address}</p>
            <div className="mt-2 flex gap-2">
              <a className="rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm hover:bg-[color:var(--color-muted)]" href={`https://www.google.com/maps/search/${encodeURIComponent(p.name + " " + p.address)}`} target="_blank">Open in Maps</a>
              <a className="rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-3 py-1.5 text-sm" href={`tel:${p.phone}`}>Call</a>
            </div>
          </div>
        ))}
      </div>
      <a className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm hover:bg-[color:var(--color-muted)]" href="https://www.google.com/maps/search/hospital+near+me" target="_blank">Search hospitals near me</a>
    </div>
  );
}



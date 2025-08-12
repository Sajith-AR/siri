export default function LibraryPage() {
  const articles = [
    { title: "Fever: What to know", summary: "When to rest at home and when to see a doctor." },
    { title: "Dehydration: Signs and prevention", summary: "Tips to stay hydrated in hot climates." },
    { title: "Cough & Cold: Home care", summary: "Simple steps to relieve symptoms." },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Health library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((a) => (
          <article key={a.title} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-foreground/70 mt-1">{a.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}



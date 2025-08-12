export default async function CallRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Video visit</h2>
      <p className="text-foreground/70 text-sm">Room: {id}</p>

      <div className="aspect-video w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)]/60 grid place-items-center text-sm text-foreground/60">
        Video placeholder
      </div>

      <div className="flex items-center gap-2">
        <button className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90">
          Mute
        </button>
        <button className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-muted)]">
          Camera
        </button>
        <button className="inline-flex items-center rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-muted)]">
          Share
        </button>
        <button className="ml-auto inline-flex items-center rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
          End call
        </button>
      </div>
    </div>
  );
}



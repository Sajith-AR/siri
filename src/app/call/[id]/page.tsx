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

      <div className="aspect-video w-full rounded-xl border border-foreground/10 bg-foreground/5 grid place-items-center text-sm text-foreground/60">
        Video placeholder
      </div>

      <div className="flex items-center gap-2">
        <button className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">
          Mute
        </button>
        <button className="inline-flex items-center rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5">
          Camera
        </button>
        <button className="inline-flex items-center rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5">
          Share
        </button>
        <button className="ml-auto inline-flex items-center rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
          End call
        </button>
      </div>
    </div>
  );
}



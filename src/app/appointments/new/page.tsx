export default function NewAppointmentPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Book an appointment</h2>
        <p className="text-foreground/70 text-sm mt-1">
          Pick a clinician, date, and time.
        </p>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm">Clinician</label>
            <select className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm">
              <option>Dr. Smith</option>
              <option>Dr. Lee</option>
              <option>Dr. Patel</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Visit type</label>
            <select className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm">
              <option>Video</option>
              <option>In-person</option>
              <option>Phone</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm">Date</label>
            <input type="date" className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Time</label>
            <input type="time" className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Reason for visit</label>
          <textarea className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm" rows={4} />
        </div>

        <button type="submit" className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">
          Submit
        </button>
      </form>
    </div>
  );
}



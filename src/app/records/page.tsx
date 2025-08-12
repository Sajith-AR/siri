export default function RecordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Medical records</h2>
        <p className="text-foreground/70 text-sm mt-1">
          Prescriptions, lab results, and documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["CBC - Normal", "Lipid Panel - Borderline", "Prescription - Amoxicillin"].map(
          (title, idx) => (
            <div key={idx} className="rounded-xl border border-foreground/10 p-4">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-foreground/70 mt-1">PDF · 2 pages</p>
              <div className="mt-3 flex gap-2">
                <button className="inline-flex items-center rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5">
                  View
                </button>
                <button className="inline-flex items-center rounded-md bg-foreground text-background px-3 py-1.5 text-sm hover:opacity-90">
                  Download
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}



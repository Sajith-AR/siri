"use client";

import { useEffect, useState } from "react";

type Reminder = { id: number; text: string; time: string };

export default function RemindersPage() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("reminders");
    if (raw) setItems(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(items));
  }, [items]);

  const add = () => {
    if (!text || !time) return;
    setItems([{ id: Date.now(), text, time }, ...items]);
    setText("");
    setTime("");
  };

  const remove = (id: number) => setItems(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-2xl font-semibold">Medicine reminders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Medication" className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2 text-sm" />
        <input value={time} onChange={(e) => setTime(e.target.value)} type="time" className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2 text-sm" />
        <button onClick={add} className="rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-3 py-2 text-sm">Add</button>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2">
            <span>{i.text} · {i.time}</span>
            <button onClick={() => remove(i.id)} className="text-red-600 hover:underline">Delete</button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-foreground/70">Tip: We can add SMS/WhatsApp reminders if you connect your phone number later.</p>
    </div>
  );
}



"use client";

import { useState } from "react";

type Message = {
  id: number;
  author: "me" | "clinician";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, author: "clinician", text: "Hello! How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: "me", text: input.trim() },
    ]);
    setInput("");
  };

  return (
    <div className="grid grid-rows-[1fr_auto] h-[70vh] max-w-3xl">
      <div className="space-y-3 overflow-y-auto pr-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.author === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm ${m.author === "me" ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]" : "border border-[color:var(--color-border)] bg-[color:var(--color-card)]"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
        />
        <button
          onClick={send}
          className="inline-flex items-center rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Send
        </button>
      </div>
    </div>
  );
}



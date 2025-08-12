"use client";

import { useState } from "react";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [session, setSession] = useState("");

  const sendOtp = async () => {
    const res = await fetch("/api/auth/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    const data = await res.json();
    setToken(data.token || "");
  };

  const verify = async () => {
    const res = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, code }) });
    const data = await res.json();
    setSession(data.session || "");
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h2 className="text-2xl font-semibold">Sign in with OTP</h2>
      <div className="space-y-1">
        <label className="text-sm">Phone number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91xxxxxxxxxx" className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2 text-sm" />
      </div>
      <button onClick={sendOtp} className="w-full rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90">Send code</button>

      <div className="grid grid-cols-2 gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2 text-sm" />
        <button onClick={verify} className="rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm hover:bg-[color:var(--color-muted)]">Verify</button>
      </div>
      {session && <p className="text-xs text-emerald-600">Logged in (demo). Session: {session.slice(0, 12)}...</p>}
      {!process.env.NEXT_PUBLIC_HAS_TWILIO && (
        <p className="text-xs text-foreground/70">Note: SMS sending is simulated unless Twilio env vars are configured.</p>
      )}
    </div>
  );
}



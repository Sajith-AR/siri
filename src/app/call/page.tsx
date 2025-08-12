"use client";

import Link from "next/link";
import { useState } from "react";

export default function CallPage() {
  const [roomId, setRoomId] = useState("");

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8);
    setRoomId(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Video Calls</h1>
        <p className="text-foreground/70 mt-2">Start or join a secure video consultation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6">
          <h3 className="text-lg font-semibold mb-4">Start New Call</h3>
          <div className="space-y-3">
            <button 
              onClick={generateRoomId}
              className="w-full rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Generate Room ID
            </button>
            {roomId && (
              <div className="space-y-2">
                <p className="text-sm text-foreground/70">Room ID: <span className="font-mono">{roomId}</span></p>
                <Link 
                  href={`/call/${roomId}`}
                  className="block w-full text-center rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-muted)]"
                >
                  Join Room
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6">
          <h3 className="text-lg font-semibold mb-4">Join Existing Call</h3>
          <div className="space-y-3">
            <input 
              type="text"
              placeholder="Enter room ID"
              className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-2 text-sm"
              onChange={(e) => setRoomId(e.target.value)}
            />
            <Link 
              href={roomId ? `/call/${roomId}` : '#'}
              className={`block w-full text-center rounded-md px-4 py-2 text-sm font-medium ${
                roomId 
                  ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:opacity-90' 
                  : 'bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] cursor-not-allowed'
              }`}
            >
              Join Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
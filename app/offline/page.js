"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-white"
      style={{ background: "#0a0f1e" }}
    >
      <img
        src="/logo192.png"
        alt="Eyes In The Sky"
        width={96}
        height={96}
        className="mb-8 opacity-90"
      />

      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/40 border border-blue-500/30">
        <WifiOff className="w-8 h-8 text-blue-400" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3 text-center">
        You&apos;re offline
      </h1>

      <p className="text-blue-200/70 text-center max-w-sm leading-relaxed mb-10">
        Eyes In The Sky needs a connection to show live data. Check back when
        you&apos;re connected.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors text-sm font-semibold tracking-wide"
      >
        Try again
      </button>
    </div>
  );
}

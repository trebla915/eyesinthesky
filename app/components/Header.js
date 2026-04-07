"use client";
import React from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  return (
    <header className="w-full p-6 lg:p-8 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Dashboard Logo" className="h-16 md:h-20 lg:h-24 w-auto object-contain shrink-0" />
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Eyes In The Sky</h1>
          <p className="text-sm text-white/60">El Paso live city dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="hidden md:flex items-center gap-2 text-xs text-white/70">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.7)]" />
          Live
        </div>
      </div>
    </header>
  );
}

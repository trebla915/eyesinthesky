"use client";
import { useState } from "react";
import { Bell, BellOff, BellRing, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationBell() {
  const { permission, requestPermission } = useNotifications();
  const [showHelp, setShowHelp] = useState(false);

  if (permission === "granted") {
    return (
      <div
        className="flex items-center gap-2 text-xs text-emerald-400"
        title="Desktop notifications enabled"
      >
        <BellRing className="w-4 h-4" />
        <span className="hidden sm:inline">Alerts on</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowHelp((v) => !v)}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
        >
          <BellOff className="w-4 h-4" />
          <span className="hidden sm:inline">Blocked — fix it</span>
        </button>

        {showHelp && (
          <div className="absolute right-0 top-7 z-50 w-72 rounded-lg border border-white/10 bg-gray-900 p-4 shadow-xl text-xs text-white/80 leading-relaxed">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 text-white/40 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="font-semibold text-white mb-2">How to unblock notifications</p>
            <p className="mb-2 text-white/60">Your browser blocked notifications for this site. To fix it:</p>
            <ol className="space-y-1.5 list-decimal list-inside text-white/70">
              <li>Click the <span className="text-white font-medium">lock icon</span> (🔒) in the address bar</li>
              <li>Find <span className="text-white font-medium">Notifications</span></li>
              <li>Change it to <span className="text-emerald-400 font-medium">Allow</span></li>
              <li>Reload the page</li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
      title="Enable desktop notifications for new alerts"
    >
      <Bell className="w-4 h-4" />
      <span className="hidden sm:inline">Enable alerts</span>
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

const DISMISSED_KEY = "notif-banner-dismissed";

export default function NotificationPermissionBanner() {
  const { permission, requestPermission } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if browser hasn't been asked yet and user hasn't dismissed
    if (
      permission === "default" &&
      typeof localStorage !== "undefined" &&
      !localStorage.getItem(DISMISSED_KEY)
    ) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [permission]);

  const handleEnable = async () => {
    await requestPermission();
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="notif-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-40 bg-blue-900/90 backdrop-blur-sm border-b border-blue-500/30 px-4 py-2"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Bell className="w-4 h-4 text-blue-300 flex-shrink-0" />

            <p className="flex-1 text-sm text-blue-100 leading-snug">
              Enable notifications to get alerted when new 911 incidents are
              reported
            </p>

            <button
              onClick={handleEnable}
              className="flex-shrink-0 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors text-xs font-semibold text-white"
            >
              Enable
            </button>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification banner"
              className="flex-shrink-0 p-1 rounded-md text-blue-300 hover:text-white hover:bg-blue-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

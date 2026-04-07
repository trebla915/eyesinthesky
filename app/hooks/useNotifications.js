"use client";
import { useState, useEffect, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback((title, body, options = {}) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return null;
    try {
      const n = new Notification(title, { body, icon: "/logo.png", ...options });
      setTimeout(() => n.close(), 8000);
      return n;
    } catch {
      return null;
    }
  }, []);

  return { permission, requestPermission, notify };
}

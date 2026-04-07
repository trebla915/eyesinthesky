"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";

const IncidentsContext = createContext({
  incidents: [],
  isLoading: true,
  error: null,
  newIncidentIds: new Set(),
});

export function IncidentsProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { notify } = useNotifications();

  const seenIdsRef = useRef(new Set());
  const bootstrappedRef = useRef(false);
  const [newIncidentIds, setNewIncidentIds] = useState(new Set());
  const currentIncidentsRef = useRef([]);
  const consecutiveEmptyRef = useRef(0);

  useEffect(() => {
    // Bootstrap once with REST so UI shows incidents even if SSE is delayed
    (async () => {
      try {
        const r = await fetch('/api/incidents', { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) {
            setIncidents(data);
            currentIncidentsRef.current = data;
            // Seed seen IDs from REST so first SSE tick doesn't spam notifications
            data.forEach((i) => { if (i.id) seenIdsRef.current.add(i.id); });
            bootstrappedRef.current = true;
            setIsLoading(false);
          }
        }
      } catch (_) {
        // ignore; SSE will attempt updates
      }
    })();

    const es = new EventSource("/api/incidents/stream");

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Only update from SSE when an incidents array is provided.
        if (!Array.isArray(payload?.incidents) && !Array.isArray(payload)) {
          setIsLoading(false);
          return;
        }
        const list = Array.isArray(payload?.incidents) ? payload.incidents : payload;

        // Avoid wiping UI on transient empties; require 2 consecutive empties
        if (Array.isArray(list) && list.length === 0) {
          consecutiveEmptyRef.current += 1;
          if (currentIncidentsRef.current.length > 0 && consecutiveEmptyRef.current < 2) {
            setIsLoading(false);
            return;
          }
        } else {
          consecutiveEmptyRef.current = 0;
        }

        const incomingIds = new Set(list.map((i) => i.id).filter(Boolean));
        const newOnes = new Set();

        for (const id of incomingIds) {
          if (!seenIdsRef.current.has(id)) {
            newOnes.add(id);
            seenIdsRef.current.add(id);
          }
        }

        // Avoid re-render if nothing changed
        const prevJson = JSON.stringify(currentIncidentsRef.current);
        const nextJson = JSON.stringify(list);
        if (prevJson !== nextJson) {
          setIncidents(list);
          currentIncidentsRef.current = list;
        }
        setNewIncidentIds(newOnes);
        setIsLoading(false);

        if (newOnes.size > 0) {
          setTimeout(() => setNewIncidentIds(new Set()), 2500);

          // Fire desktop notifications — only after the REST bootstrap has seeded seen IDs
          if (bootstrappedRef.current) {
            const newIncidents = list.filter((i) => newOnes.has(i.id));
            const toNotify = newIncidents.slice(0, 3);
            toNotify.forEach((incident) => {
              notify(
                `🚨 ${incident.callType || "Incident"}`,
                incident.locationText || "El Paso, TX",
                { tag: incident.id, silent: false }
              );
            });
            if (newIncidents.length > 3) {
              notify(
                `🚨 +${newIncidents.length - 3} more incidents`,
                "El Paso, TX",
                { tag: "incidents-overflow" }
              );
            }
          }
        }
      } catch (e) {
        // Ignore parsing errors but record once
        setError((prev) => prev ?? new Error("Malformed incident payload"));
        setIsLoading(false);
      }
    };

    es.onerror = (e) => {
      setError(new Error("Live connection lost"));
      // Do not force loading state if we already bootstrapped from REST
      setIsLoading((prev) => (prev ? false : prev));
    };

    return () => {
      es.close();
    };
  }, []);

  const value = useMemo(() => ({ incidents, isLoading, error, newIncidentIds }), [incidents, isLoading, error, newIncidentIds]);
  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>;
}

export function useIncidents() {
  return useContext(IncidentsContext);
}



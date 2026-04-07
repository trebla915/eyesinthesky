"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, ScrollArea, Badge } from "../ui/Card";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../hooks/useNotifications";

export default function BaseWidget({
  title,
  subtitle,
  icon: Icon,
  apiEndpoint,
  children,
  className = "",
  maxItems = 10,
  refreshInterval = 60000, // 1 minute default
  glowType = "",
  notifyConfig = null, // { getItemId, getTitle, getBody }
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { notify } = useNotifications();
  const seenIdsRef = useRef(null); // null = not yet seeded

  const fetchData = async () => {
    if (!apiEndpoint) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());

      // Desktop notifications for new items (poll-based widgets)
      if (notifyConfig?.getItemId && Array.isArray(result)) {
        if (seenIdsRef.current === null) {
          // First fetch — seed IDs without notifying
          seenIdsRef.current = new Set(result.map(notifyConfig.getItemId).filter(Boolean));
        } else {
          const newItems = result.filter((item) => {
            const id = notifyConfig.getItemId(item);
            return id && !seenIdsRef.current.has(id);
          });
          newItems.forEach((item) => seenIdsRef.current.add(notifyConfig.getItemId(item)));
          const toNotify = newItems.slice(0, 3);
          toNotify.forEach((item) => {
            notify(
              notifyConfig.getTitle(item),
              notifyConfig.getBody(item),
              { tag: String(notifyConfig.getItemId(item)) }
            );
          });
          if (newItems.length > 3) {
            notify(`+${newItems.length - 3} more in ${title}`, "El Paso dashboard");
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching ${title} data:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [apiEndpoint, refreshInterval]);

  const formatLastUpdated = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className={`h-[500px] flex flex-col relative ${className}`} glowType={glowType}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-white/80 flex-shrink-0" />}
          <CardTitle className="flex-1 min-w-0 truncate">{title}</CardTitle>
          {subtitle && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {subtitle}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size="lg" />
                <span className="text-white/60">Loading {title.toLowerCase()}...</span>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className="text-red-300 mb-2">⚠️</div>
                <p className="text-red-300 text-sm">Failed to load {title.toLowerCase()}</p>
                <p className="text-red-300/70 text-xs mt-1">{error.message}</p>
                <button
                  onClick={fetchData}
                  className="mt-3 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ScrollArea className="h-full">
                {children(data, maxItems)}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      {/* Updated time overlay at bottom center */}
      {lastUpdated && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/90 border border-white/30">
          Updated {formatLastUpdated(lastUpdated)}
        </div>
      )}
    </Card>
  );
}

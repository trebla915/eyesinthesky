"use client";

import React, { useState } from "react";
import BaseWidget from "./BaseWidget";
import { Badge, StatusIndicator } from "../ui/Card";
import { Search, ExternalLink, Clock, Newspaper, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRefreshInterval, API_ENDPOINTS } from "../../../lib/config";

export default function GoogleAlertsWidget({ className = "" }) {
  const apiEndpoint = API_ENDPOINTS.googleAlerts();

  const renderGoogleAlertsContent = (alerts) => {
    if (!alerts || alerts.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No Google Alerts</p>
            <p className="text-gray-400 text-sm mt-1">No recent mentions of El Paso</p>
          </div>
        </div>
      );
    }

    // Check if we have a processing indicator
    if (alerts.length === 1 && alerts[0].isProcessing) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3"></div>
            <p className="text-blue-300">Processing Google Alerts...</p>
            <p className="text-blue-400 text-sm mt-1">Fetching latest El Paso mentions</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 pr-2">
        {alerts.map((alert, index) => (
          <GoogleAlertCard key={alert.id || index} alert={alert} />
        ))}
      </div>
    );
  };

  return (
    <BaseWidget
      title="Google Alerts"
      subtitle="El Paso"
      icon={Search}
      apiEndpoint={apiEndpoint}
      className={className}
      refreshInterval={getRefreshInterval("googleAlerts")}
      notifyConfig={{
        getItemId: (i) => i.id || i.url,
        getTitle: (i) => `📰 ${i.title || "Google Alert"}`,
        getBody: (i) => i.description || i.source || "El Paso",
      }}
    >
      {renderGoogleAlertsContent}
    </BaseWidget>
  );
}

function GoogleAlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);

  const getCategoryColor = (category) => {
    if (!category) return "default";
    const cat = category.toLowerCase();
    if (cat.includes('safety') || cat.includes('police') || cat.includes('emergency')) return "danger";
    if (cat.includes('education') || cat.includes('school')) return "warning";
    if (cat.includes('health') || cat.includes('medical')) return "default";
    return "secondary";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const diff = Date.now() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch { return ""; }
  };

  const formatFullTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      });
    } catch { return ""; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-white/10 bg-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
    >
      {/* Clickable header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-3 focus:outline-none"
      >
        <Newspaper className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug line-clamp-2 mb-1.5">
            {alert.title || "No title available"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getCategoryColor(alert.category)} className="text-xs">
              {alert.category || "General"}
            </Badge>
            {alert.source && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                <Tag className="w-3 h-3" />
                {alert.source}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-blue-400 ml-auto">
              <Clock className="w-3 h-3" />
              {formatTimestamp(alert.publishedAt)}
            </span>
          </div>
        </div>
        <div className="text-white/40 flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
              {alert.description && (
                <p className="text-sm text-white/80 leading-relaxed">{alert.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{formatFullTimestamp(alert.publishedAt)}</span>
                {alert.url && alert.url !== '#' && (
                  <a
                    href={alert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Read full article
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

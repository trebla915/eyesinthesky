"use client";

import React from "react";
import BaseWidget from "./BaseWidget";
import { Badge, StatusIndicator } from "../ui/Card";
import { Search, ExternalLink, Clock, Newspaper, Tag, User } from "lucide-react";
import { motion } from "framer-motion";
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
  const getCategoryColor = (category) => {
    if (!category) return "default";
    
    const cat = category.toLowerCase();
    if (cat.includes('government') || cat.includes('politics')) return "secondary";
    if (cat.includes('safety') || cat.includes('police') || cat.includes('emergency')) return "danger";
    if (cat.includes('education') || cat.includes('school')) return "warning";
    if (cat.includes('health') || cat.includes('medical')) return "default";
    return "secondary";
  };

  const getRelevanceColor = (relevance) => {
    switch (relevance?.toLowerCase()) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-gray-400';
      default:
        return 'text-white/60';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Time not available";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (error) {
      return "Time not available";
    }
  };

  const formatFullTimestamp = (timestamp) => {
    if (!timestamp) return "Time not available";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Time not available";
    }
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-white/10 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and Category */}
          <div className="flex items-start gap-2 mb-3">
            <div className="text-white/60">
              <Newspaper className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white leading-tight mb-1 line-clamp-2">
                {alert.title || "No title available"}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getCategoryColor(alert.category)} className="text-xs">
                  {alert.category || "General"}
                </Badge>
                {alert.relevance && (
                  <span className={`text-xs ${getRelevanceColor(alert.relevance)}`}>
                    {alert.relevance.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {alert.description && (
            <div className="text-sm text-white/80 mb-3 leading-relaxed">
              {truncateText(alert.description)}
            </div>
          )}
          
          {/* Source and Time */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 font-medium">{formatTimestamp(alert.publishedAt)}</span>
              </div>
              {alert.source && (
                <div className="text-white/60 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{alert.source}</span>
                </div>
              )}
            </div>
            {alert.url && (
              <a
                href={alert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Read</span>
              </a>
            )}
          </div>
          
          {/* Author and Full Timestamp */}
          <div className="mt-2 flex items-center justify-between text-xs text-white/40">
            <div>
              {alert.author && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{alert.author}</span>
                </div>
              )}
            </div>
            <div>
              {formatFullTimestamp(alert.publishedAt)}
            </div>
          </div>
        </div>
        
        <StatusIndicator status="active" />
      </div>
    </motion.div>
  );
}

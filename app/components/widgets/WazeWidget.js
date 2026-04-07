"use client";

import React from "react";
import BaseWidget from "./BaseWidget";
import { Badge, StatusIndicator } from "../ui/Card";
import { Navigation, MapPin, Clock, AlertTriangle, Car, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { getRefreshInterval, API_ENDPOINTS } from "../../../lib/config";

export default function WazeWidget({ className = "" }) {
  const apiEndpoint = API_ENDPOINTS.waze();

  const renderWazeContent = (alerts) => {
    if (!alerts || alerts.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No Waze alerts</p>
            <p className="text-gray-400 text-sm mt-1">All clear on the roads</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 pr-2">
        {alerts.map((alert, index) => (
          <WazeAlertCard key={alert.id || index} alert={alert} />
        ))}
      </div>
    );
  };

  return (
    <BaseWidget
      title="Waze Alerts"
      subtitle="Live"
      icon={Navigation}
      apiEndpoint={apiEndpoint}
      className={className}
      refreshInterval={getRefreshInterval("waze")}
      notifyConfig={{
        getItemId: (i) => i.id,
        getTitle: (i) => `🚗 Waze: ${i.type || "Alert"}`,
        getBody: (i) => i.location || i.address || "El Paso, TX",
      }}
    >
      {renderWazeContent}
    </BaseWidget>
  );
}

function WazeAlertCard({ alert }) {
  const getAlertTypeColor = (type, subtype) => {
    if (!type) return "default";
    
    const alertType = type.toLowerCase();
    const alertSubtype = subtype ? subtype.toLowerCase() : '';
    
    // Police/Enforcement alerts
    if (alertType.includes('police') || alertType.includes('cop') || 
        alertSubtype.includes('police') || alertSubtype.includes('cop')) {
      return "danger";
    }
    
    // Traffic/Hazard alerts
    if (alertType.includes('traffic') || alertType.includes('jam') || 
        alertType.includes('hazard') || alertSubtype.includes('traffic')) {
      return "warning";
    }
    
    // Road closure/construction
    if (alertType.includes('closure') || alertType.includes('construction') ||
        alertSubtype.includes('closure') || alertSubtype.includes('construction')) {
      return "secondary";
    }
    
    // Accident alerts
    if (alertType.includes('accident') || alertType.includes('crash') ||
        alertSubtype.includes('accident') || alertSubtype.includes('crash')) {
      return "danger";
    }
    
    return "default";
  };

  const getAlertIcon = (type, subtype) => {
    const alertType = type ? type.toLowerCase() : '';
    const alertSubtype = subtype ? subtype.toLowerCase() : '';
    
    if (alertType.includes('police') || alertSubtype.includes('police')) {
      return <Shield className="w-4 h-4" />;
    }
    if (alertType.includes('traffic') || alertType.includes('jam')) {
      return <Car className="w-4 h-4" />;
    }
    if (alertType.includes('accident') || alertType.includes('crash')) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Navigation className="w-4 h-4" />;
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

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-white/60';
    }
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
          <div className="flex items-center gap-2 mb-2">
            <div className="text-white/60">
              {getAlertIcon(alert.type, alert.subtype)}
            </div>
            <Badge variant={getAlertTypeColor(alert.type, alert.subtype)} className="text-xs">
              {alert.type || "Alert"}
            </Badge>
            {alert.subtype && (
              <Badge variant="secondary" className="text-xs">
                {alert.subtype}
              </Badge>
            )}
            {alert.severity && (
              <span className={`text-xs ${getSeverityColor(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Location - Prominent Display */}
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm font-medium text-white leading-relaxed">
              {alert.location || alert.address || "Location not available"}
            </div>
          </div>
          
          {/* Description */}
          {alert.description && (
            <div className="text-sm text-white/80 mb-3">
              {alert.description}
            </div>
          )}
          
          {/* Time and Details Row */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                <Clock className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 font-medium">{formatTimestamp(alert.timestamp)}</span>
              </div>
              {alert.reportBy && (
                <div className="text-white/60">
                  by {alert.reportBy}
                </div>
              )}
            </div>
            {alert.reliability && (
              <div className="text-white/50 bg-white/5 px-2 py-1 rounded">
                {Math.round(alert.reliability * 100)}% reliable
              </div>
            )}
          </div>
          
          {/* Full Timestamp on Hover */}
          <div className="mt-2 text-xs text-white/40">
            {formatFullTimestamp(alert.timestamp)}
          </div>
        </div>
        
        <StatusIndicator status="active" />
      </div>
    </motion.div>
  );
}

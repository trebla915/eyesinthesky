"use client";

import React from "react";
import BaseWidget from "./BaseWidget";
import { Badge, StatusIndicator } from "../ui/Card";
import { Siren, MapPin, Clock, Car, Flame, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { getRefreshInterval, API_ENDPOINTS } from "../../../lib/config";

export default function IncidentsWidget({ className = "" }) {
  const renderContent = (incidents) => {
    if (!incidents || incidents.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Siren className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No active incidents</p>
            <p className="text-gray-400 text-sm mt-1">All clear in El Paso</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 pr-2">
        {incidents.map((incident, index) => (
          <IncidentCard key={incident.id || index} incident={incident} />
        ))}
      </div>
    );
  };

  return (
    <BaseWidget
      title="Active Incidents"
      subtitle="Live"
      icon={Siren}
      apiEndpoint={API_ENDPOINTS.incidents()}
      className={className}
      refreshInterval={getRefreshInterval("incidents")}
    >
      {renderContent}
    </BaseWidget>
  );
}

function IncidentCard({ incident }) {
  const type = (incident.callType || "").toUpperCase();

  const getBadgeVariant = () => {
    if (type.includes("FIRE") || type.includes("STRUCTURE")) return "danger";
    if (type.includes("MEDICAL") || type.includes("EMS")) return "warning";
    if (type.includes("TRAFFIC") || type.includes("ACCIDENT") || type.includes("MVA") || type.includes("COLLISION")) return "danger";
    if (type.includes("POLICE") || type.includes("ASSAULT") || type.includes("SHOOTING")) return "danger";
    if (type.includes("MUTUAL AID") || type === "MA") return "danger";
    return "secondary";
  };

  const getIcon = () => {
    if (type.includes("FIRE") || type.includes("STRUCTURE")) return <Flame className="w-4 h-4" />;
    if (type.includes("TRAFFIC") || type.includes("ACCIDENT") || type.includes("MVA")) return <Car className="w-4 h-4" />;
    if (type.includes("POLICE") || type.includes("ASSAULT") || type.includes("MUTUAL")) return <Shield className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getResponseColor = (r) => {
    const v = (r || "").toUpperCase();
    if (v === "FIRE") return "text-orange-400";
    if (v === "POLICE") return "text-blue-400";
    if (v === "EMS") return "text-green-400";
    return "text-white/60";
  };

  const getStatusColor = (s) => {
    const v = (s || "").toUpperCase();
    if (v === "RECEIVED") return "text-yellow-400";
    if (v === "DISPATCHED" || v === "EN ROUTE") return "text-blue-400";
    if (v === "ON SCENE") return "text-red-400";
    if (v === "CLEARED") return "text-green-400";
    return "text-white/60";
  };

  const sourceLabel = incident.source || "Unknown";
  const sourceColor =
    sourceLabel.includes("911") ? "text-red-300 border-red-500/30 bg-red-900/20"
    : sourceLabel.includes("Waze") ? "text-blue-300 border-blue-500/30 bg-blue-900/20"
    : "text-white/50 border-white/10 bg-white/5";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-white/10 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Type + source row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="text-white/60">{getIcon()}</div>
            <Badge variant={getBadgeVariant()} className="text-xs">
              {incident.callType || "UNKNOWN"}
            </Badge>
            {incident.response && (
              <span className={`text-xs font-semibold ${getResponseColor(incident.response)}`}>
                {incident.response}
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ml-auto ${sourceColor}`}>
              {sourceLabel}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            {incident.mapUrl ? (
              <a
                href={incident.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white/90 hover:text-blue-300 transition-colors leading-snug"
              >
                {incident.locationText || "Location not available"}
              </a>
            ) : (
              <span className="text-sm font-medium text-white/90 leading-snug">
                {incident.locationText || "Location not available"}
              </span>
            )}
          </div>

          {/* Time + status */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
              <Clock className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 font-medium">{incident.datetimeStr || "—"}</span>
            </div>
            {incident.status && (
              <span className={`font-semibold ${getStatusColor(incident.status)}`}>
                {incident.status}
              </span>
            )}
          </div>
        </div>

        <StatusIndicator status="active" />
      </div>
    </motion.div>
  );
}

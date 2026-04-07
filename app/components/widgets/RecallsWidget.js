"use client";

import React from "react";
import BaseWidget from "./BaseWidget";
import { Badge, StatusIndicator } from "../ui/Card";
import { AlertCircle, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { formatRecallDate } from "../../../lib/recalls";
import { getRefreshInterval, API_ENDPOINTS } from "../../../lib/config";

export default function RecallsWidget({ className = "" }) {
  const apiEndpoint = API_ENDPOINTS.recalls();

  const renderRecallsContent = (recalls) => {
    if (!recalls || recalls.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-300">No active recalls affecting Texas</p>
            <p className="text-gray-400 text-sm mt-1">All food products are safe</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 pr-2">
        {recalls.map((recall, index) => (
          <RecallCard key={recall.id || index} recall={recall} />
        ))}
      </div>
    );
  };

  return (
    <BaseWidget
      title="Food Recalls & Alerts"
      subtitle="Texas"
      icon={AlertCircle}
      apiEndpoint={apiEndpoint}
      className={className}
      refreshInterval={getRefreshInterval("recalls")}
    >
      {renderRecallsContent}
    </BaseWidget>
  );
}

function RecallCard({ recall }) {
  const getClassificationColor = (classification) => {
    if (!classification) return "default";
    
    const type = classification.toLowerCase();
    if (type.includes("class i") || type.includes("public health")) return "danger";
    if (type.includes("class ii")) return "warning";
    if (type.includes("class iii")) return "default";
    return "secondary";
  };

  const getSourceColor = (source) => {
    if (source === "USDA") return "warning";
    if (source === "FDA") return "default";
    return "secondary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`border border-white/10 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors ${
        recall.isNew ? "new-item-highlight" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={getSourceColor(recall.source)} className="text-xs">
              {recall.source}
            </Badge>
            {recall.isNew && (
              <Badge variant="danger" className="text-xs">
                NEW
              </Badge>
            )}
            <Badge variant={getClassificationColor(recall.classification)} className="text-xs">
              {recall.classification}
            </Badge>
          </div>
          
          <div className="text-sm text-white/90 leading-relaxed mb-3 line-clamp-2">
            {recall.product}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Calendar className="w-3 h-3" />
            <span>{formatRecallDate(recall.date)}</span>
            {recall.distribution && (
              <>
                <span className="text-white/40">•</span>
                <span>{recall.distribution}</span>
              </>
            )}
          </div>
        </div>
        
        <StatusIndicator status="danger" />
      </div>
    </motion.div>
  );
}

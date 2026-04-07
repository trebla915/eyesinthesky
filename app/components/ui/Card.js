import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

export function Card({ children, className = "", glowType = "", ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative z-20",
        "rounded-2xl",
        "glass-card",
        "text-white",
        "transition-all duration-300",
        "hover:scale-[1.02]",
        glowType && `widget-glow ${glowType}`,
        className
      )}
      {...props}
    >
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h2 className={cn("text-2xl font-bold tracking-tight", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default", className = "", ...props }) {
  const variants = {
    default: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
    secondary: "bg-gray-500/20 text-gray-300 border-gray-500/30"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ScrollArea({ children, className = "", maxHeight = "400px", ...props }) {
  return (
    <div
      className={cn(
        "overflow-y-auto widget-scroll",
        className
      )}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  );
}

export function LoadingSkeleton({ className = "", ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-white/20 rounded", className)}
      {...props}
    />
  );
}

export function StatusIndicator({ status = "active", className = "", ...props }) {
  const statusColors = {
    active: "bg-green-400 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]",
    warning: "bg-yellow-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.7)]",
    danger: "bg-red-400 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]",
    inactive: "bg-gray-400 shadow-[0_0_8px_2px_rgba(156,163,175,0.7)]"
  };

  return (
    <span
      className={cn(
        "inline-flex h-2.5 w-2.5 rounded-full",
        statusColors[status],
        className
      )}
      {...props}
    />
  );
}

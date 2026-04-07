"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import WeatherWidget from "./widgets/WeatherWidget";
import IncidentsWidget from "./widgets/IncidentsWidget";
import RedditWidget from "./widgets/RedditWidget";
import RecallsWidget from "./widgets/RecallsWidget";
import WazeWidget from "./widgets/WazeWidget";
import GoogleAlertsWidget from "./widgets/GoogleAlertsWidget";
import { DASHBOARD_CONFIG } from "../../lib/config";
import NotificationPermissionBanner from "./NotificationPermissionBanner";

export default function DashboardLayout() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: DASHBOARD_CONFIG.animations.staggerDelay,
        delayChildren: DASHBOARD_CONFIG.animations.initialDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DASHBOARD_CONFIG.animations.duration,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <NotificationPermissionBanner />
      <Header />
      
      <main className="relative z-10 flex flex-col items-center px-6 py-12 lg:px-12 flex-grow w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl w-full"
        >
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Top Row - Main Widgets */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <WeatherWidget glowType="weather-glow" />
            </motion.div>
            
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <IncidentsWidget glowType="incidents-glow" />
            </motion.div>
            
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <RedditWidget glowType="reddit-glow" />
            </motion.div>
          </div>

          {/* Bottom Row - Secondary Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <RecallsWidget glowType="recalls-glow" />
            </motion.div>
            
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <GoogleAlertsWidget glowType="google-alerts-glow" />
            </motion.div>
            
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <WazeWidget glowType="waze-glow" />
            </motion.div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}

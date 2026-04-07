"use client";

import React from "react";
import BaseWidget from "./BaseWidget";
import { Badge, StatusIndicator } from "../ui/Card";
import { Cloud, Thermometer, Droplets, Wind, Sunrise, Sunset } from "lucide-react";
import { motion } from "framer-motion";
import { getWidgetConfig, getRefreshInterval, API_ENDPOINTS } from "../../../lib/config";

export default function WeatherWidget({ 
  city, 
  units,
  className = "" 
}) {
  const config = getWidgetConfig("weather");
  const finalCity = city || config.city;
  const finalUnits = units || config.units;
  const apiEndpoint = API_ENDPOINTS.weather(finalCity, finalUnits);

  const renderWeatherContent = (weatherData) => {
    if (!weatherData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-300">No weather data available</p>
        </div>
      );
    }

    const { name, temperature, feelsLike, humidity, description, icon, windSpeed, windDeg, sunrise, sunset } = weatherData;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Main Weather Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {icon && (
              <img 
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`} 
                alt={description} 
                className="w-16 h-16"
              />
            )}
            <div>
              <div className="text-4xl font-bold">
                {Math.round(temperature)}°{units === "imperial" ? "F" : "C"}
              </div>
              <div className="text-lg text-white/80 capitalize">{description}</div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {name}
          </Badge>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <WeatherDetail
            icon={<Thermometer className="w-4 h-4" />}
            label="Feels Like"
            value={`${Math.round(feelsLike)}°`}
          />
          <WeatherDetail
            icon={<Droplets className="w-4 h-4" />}
            label="Humidity"
            value={`${humidity}%`}
          />
          <WeatherDetail
            icon={<Wind className="w-4 h-4" />}
            label="Wind"
            value={`${windSpeed} mph`}
          />
          <WeatherDetail
            icon={<StatusIndicator status="active" />}
            label="Direction"
            value={`${windDeg}°`}
          />
        </div>

        {/* Sunrise/Sunset */}
        <div className="border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <WeatherDetail
              icon={<Sunrise className="w-4 h-4 text-yellow-400" />}
              label="Sunrise"
              value={sunrise}
            />
            <WeatherDetail
              icon={<Sunset className="w-4 h-4 text-orange-400" />}
              label="Sunset"
              value={sunset}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <BaseWidget
      title="Weather"
      subtitle={finalCity}
      icon={Cloud}
      apiEndpoint={apiEndpoint}
      className={className}
      refreshInterval={getRefreshInterval("weather")}
    >
      {renderWeatherContent}
    </BaseWidget>
  );
}

function WeatherDetail({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
    >
      <div className="text-white/60">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/60 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </motion.div>
  );
}

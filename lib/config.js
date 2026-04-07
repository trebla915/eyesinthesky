// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  // Widget refresh intervals (in milliseconds)
  refreshIntervals: {
    incidents: 30000,    // 30 seconds
    weather: 300000,     // 5 minutes
    reddit: 300000,      // 5 minutes
    recalls: 300000,     // 5 minutes
    govFeed: 600000,     // 10 minutes
    waze: 60000,         // 1 minute
    googleAlerts: 300000, // 5 minutes
  },

  // Widget configurations
  widgets: {
    weather: {
      city: "El Paso",
      units: "imperial",
      maxItems: 10,
    },
    incidents: {
      maxItems: 10,
    },
    reddit: {
      subreddit: "ElPaso",
      limit: 5,
      maxItems: 10,
    },
    recalls: {
      maxItems: 10,
    },
    govFeed: {
      maxItems: 10,
    },
    waze: {
      maxItems: 10,
    },
    googleAlerts: {
      maxItems: 10,
    },
  },

  // Layout configuration
  layout: {
    maxWidth: "7xl",
    padding: {
      mobile: "px-4 py-8",
      desktop: "lg:px-8",
    },
    gridGap: "gap-6",
    cardHeight: "h-[500px]",
  },

  // Animation configuration
  animations: {
    staggerDelay: 0.1,
    initialDelay: 0.2,
    duration: 0.5,
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  weather: (city, units) => `/api/weather?city=${encodeURIComponent(city)}&units=${encodeURIComponent(units)}`,
  incidents: () => `/api/incidents`,
  reddit: (subreddit, limit) => `/api/reddit?sub=${encodeURIComponent(subreddit)}&limit=${limit}`,
  recalls: () => `/api/recalls`,
  govFeed: () => `/api/gov-feed`, // Assuming this exists or will be created
  waze: () => `/api/waze?t=${Date.now()}`,
  googleAlerts: () => `/api/google-alerts?t=${Date.now()}`,
};

// Utility function to get widget config
export function getWidgetConfig(widgetName) {
  return DASHBOARD_CONFIG.widgets[widgetName] || {};
}

// Utility function to get refresh interval
export function getRefreshInterval(widgetName) {
  return DASHBOARD_CONFIG.refreshIntervals[widgetName] || 300000; // Default 5 minutes
}




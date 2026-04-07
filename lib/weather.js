export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function requireWeatherApiKey() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENWEATHER_API_KEY');
  return apiKey;
}

export function buildWeatherUrl({ city, units }) {
  const apiKey = requireWeatherApiKey();
  return `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${encodeURIComponent(units)}&appid=${encodeURIComponent(apiKey)}`;
}

export function mapWeatherResponse(data, city) {
  const main = data?.main || {};
  const weather0 = Array.isArray(data?.weather) && data.weather[0] ? data.weather[0] : {};
  const wind = data?.wind || {};
  const sys = data?.sys || {};
  return {
    name: data?.name || city,
    temperature: main.temp,
    feelsLike: main.feels_like,
    humidity: main.humidity,
    description: weather0.description,
    icon: weather0.icon,
    windSpeed: wind.speed,
    windDeg: wind.deg,
    sunrise: sys.sunrise ? new Date(sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '',
    sunset: sys.sunset ? new Date(sys.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '',
  };
}

export async function fetchWeatherOnce({ city, units }) {
  const url = buildWeatherUrl({ city, units });
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Upstream error: ${response.status}`);
  const data = await response.json();
  return mapWeatherResponse(data, city);
}



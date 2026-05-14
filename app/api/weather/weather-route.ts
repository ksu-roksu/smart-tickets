// app/api/weather/route.ts
// Open-Meteo — бесплатно, без API ключа, 10k запросов/день
// https://api.open-meteo.com

import { NextRequest, NextResponse } from 'next/server';

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'Алматы':   { lat: 43.238, lon: 76.945 },
  'Астана':   { lat: 51.180, lon: 71.446 },
  'Шымкент':  { lat: 42.317, lon: 69.595 },
  'Актау':    { lat: 43.652, lon: 51.198 },
  'Атырау':   { lat: 47.117, lon: 51.921 },
  'Актобе':   { lat: 50.300, lon: 57.153 },
  'Павлодар': { lat: 52.285, lon: 76.940 },
  'Тараз':    { lat: 42.900, lon: 71.380 },
};

// WMO weather code → emoji + description
function wmoToEmoji(code: number): { icon: string; condition: string } {
  if (code === 0)                  return { icon: '☀️', condition: 'clear' };
  if (code === 1)                  return { icon: '🌤', condition: 'mostly_clear' };
  if (code === 2)                  return { icon: '⛅', condition: 'partly_cloudy' };
  if (code === 3)                  return { icon: '☁️', condition: 'overcast' };
  if (code >= 45 && code <= 48)   return { icon: '🌫', condition: 'fog' };
  if (code >= 51 && code <= 55)   return { icon: '🌦', condition: 'drizzle' };
  if (code >= 56 && code <= 57)   return { icon: '🌧', condition: 'freezing_drizzle' };
  if (code >= 61 && code <= 65)   return { icon: '🌧', condition: 'rain' };
  if (code >= 66 && code <= 67)   return { icon: '🌧', condition: 'freezing_rain' };
  if (code >= 71 && code <= 77)   return { icon: '❄️', condition: 'snow' };
  if (code >= 80 && code <= 82)   return { icon: '🌦', condition: 'showers' };
  if (code >= 85 && code <= 86)   return { icon: '🌨', condition: 'snow_showers' };
  if (code >= 95 && code <= 99)   return { icon: '⛈', condition: 'thunderstorm' };
  return { icon: '🌡', condition: 'unknown' };
}

function isGoodOutdoor(temp: number, condition: string): boolean {
  const bad = ['rain', 'freezing', 'snow', 'thunderstorm', 'showers', 'fog'];
  return temp >= 10 && !bad.some(b => condition.includes(b));
}

export type WeatherData = {
  temp: number;
  condition: string;
  icon: string;
  windSpeed: number;
  isGoodOutdoor: boolean;
};

// In-memory cache, 30 минут
const cache = new Map<string, { data: WeatherData; ts: number }>();
const TTL = 30 * 60 * 1000;

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? 'Алматы';
  const coords = CITY_COORDS[city] ?? CITY_COORDS['Алматы'];

  const cached = cache.get(city);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(coords.lat));
    url.searchParams.set('longitude', String(coords.lon));
    url.searchParams.set('current_weather', 'true');
    url.searchParams.set('wind_speed_unit', 'ms'); // м/с

    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

    const json = await res.json();
    const cw = json.current_weather;
    const { icon, condition } = wmoToEmoji(cw.weathercode);

    const data: WeatherData = {
      temp:          Math.round(cw.temperature),
      condition,
      icon,
      windSpeed:     Math.round(cw.windspeed),
      isGoodOutdoor: isGoodOutdoor(cw.temperature, condition),
    };

    cache.set(city, { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Weather error:', err);
    // Fallback если Open-Meteo недоступен
    const fallback: WeatherData = {
      temp: 20, condition: 'clear', icon: '☀️', windSpeed: 2, isGoodOutdoor: true,
    };
    return NextResponse.json(fallback);
  }
}
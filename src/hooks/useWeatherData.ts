import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeatherData, type LocationCoords, type WeatherApiResult } from '../services/weatherService';

const CACHE_KEY_PREFIX = 'rwh_weather_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  data: WeatherApiResult;
  fetchedAt: number; // timestamp
}

function cacheKey(locationId: string): string {
  return `${CACHE_KEY_PREFIX}${locationId}`;
}

function loadFromCache(locationId: string): WeatherApiResult | null {
  try {
    const raw = localStorage.getItem(cacheKey(locationId));
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
    // Restore Date object (serialised as string)
    cached.data.lastFetched = new Date(cached.data.lastFetched);
    return cached.data;
  } catch {
    return null;
  }
}

function saveToCache(locationId: string, data: WeatherApiResult): void {
  try {
    const entry: CachedWeather = { data, fetchedAt: Date.now() };
    localStorage.setItem(cacheKey(locationId), JSON.stringify(entry));
  } catch {
    // Storage quota exceeded — ignore silently
  }
}

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseWeatherDataResult {
  weatherData: WeatherApiResult | null;
  status: WeatherStatus;
  errorMessage: string | null;
  isStale: boolean;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useWeatherData(
  locationId: string,
  coords: LocationCoords
): UseWeatherDataResult {
  const [weatherData, setWeatherData] = useState<WeatherApiResult | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback(
    async (forceRefresh = false) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      // Try cache first (unless forced refresh)
      if (!forceRefresh) {
        const cached = loadFromCache(locationId);
        if (cached) {
          setWeatherData(cached);
          setStatus('success');
          setErrorMessage(null);
          setIsStale(false);
          setLastFetched(cached.lastFetched);
          return;
        }
      }

      setStatus('loading');

      try {
        const result = await fetchWeatherData(coords, abortRef.current.signal);
        saveToCache(locationId, result);
        setWeatherData(result);
        setStatus('success');
        setErrorMessage(null);
        setIsStale(false);
        setLastFetched(result.lastFetched);
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'AbortError') return; // request was cancelled
        // Show error but keep any stale data visible
        const msg = err instanceof Error ? err.message : 'Failed to load weather data';
        setErrorMessage(msg);
        setStatus('error');
        if (weatherData) setIsStale(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locationId, coords.lat, coords.lon, coords.timezone]
  );

  // Fetch on mount and on location change
  useEffect(() => {
    setStatus('idle');
    setIsStale(false);
    doFetch(false);

    // Schedule auto-refresh
    timerRef.current = setInterval(() => {
      doFetch(true);
    }, AUTO_REFRESH_MS);

    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [doFetch]);

  const refresh = useCallback(() => {
    doFetch(true);
  }, [doFetch]);

  return { weatherData, status, errorMessage, isStale, lastFetched, refresh };
}

/**
 * Open-Meteo Weather Service
 * Centralised data fetching for the Rainwater Harvesting Monitoring System.
 *
 * Data provider: Open-Meteo (https://open-meteo.com)
 * License: Open-Meteo data is available for free for non-commercial use under the
 *   Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) licence.
 *   Attribution: Weather data by Open-Meteo.com
 */

export interface LocationCoords {
  lat: number;
  lon: number;
  timezone: string;
}

export interface ForecastDay {
  date: string;      // formatted e.g. "28 Oct"
  isoDate: string;   // ISO date string e.g. "2026-10-28"
  rainfall: number;  // mm — precipitation_sum
  precipProb: number; // % — precipitation_probability_max
}

export interface MonthlyAverage {
  month: string;    // "Jan" … "Dec"
  historical: number; // mm — multi-year average
  predicted: number;  // mm — current year / next year projection
}

export interface AnnualRainfall {
  year: string;
  rainfall: number;
  isPredicted?: boolean;
}

export interface CurrentWeather {
  temperature: number;        // °C
  humidity: number;           // %
  precipitationToday: number; // mm — today's accumulated rainfall
  precipitationNow: number;   // mm — current precipitation
  description: string;        // human-readable label
}

export interface WeatherApiResult {
  current: CurrentWeather;
  forecast7Days: ForecastDay[];
  total7DayRainfall: number;
  forecast30Days: { period: string; rainfall: number }[];
  monthlyData: MonthlyAverage[];
  annualData: AnnualRainfall[];
  projection5Years: { year: string; rainfall: number }[];
  lastFetched: Date;
}

// --- helpers -----------------------------------------------------------

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const HISTORICAL_URL = 'https://archive-api.open-meteo.com/v1/archive';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(month) - 1]}`;
}

function isoToMonthIndex(isoDate: string): number {
  return parseInt(isoDate.split('-')[1]) - 1; // 0-based
}

function isoToYear(isoDate: string): number {
  return parseInt(isoDate.split('-')[0]);
}

function buildWeekLabel(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}

/** Sum precipitation for a given week (7 items starting at offset) */
function weekSum(values: number[], offset: number): number {
  return Math.round(values.slice(offset, offset + 7).reduce((a, b) => a + b, 0));
}

/**
 * Derive a readable weather description from WMO weather interpretation codes.
 * https://open-meteo.com/en/docs#weathervariables
 */
function wmoDescription(code: number): string {
  if (code === 0)             return 'Clear sky';
  if (code <= 3)              return 'Partly cloudy';
  if (code <= 48)             return 'Fog / mist';
  if (code <= 57)             return 'Drizzle';
  if (code <= 67)             return 'Rain';
  if (code <= 77)             return 'Snow';
  if (code <= 82)             return 'Rain showers';
  if (code <= 86)             return 'Snow showers';
  if (code <= 99)             return 'Thunderstorm';
  return 'Unknown';
}

// --- main fetch ----------------------------------------------------------

export async function fetchWeatherData(
  coords: LocationCoords,
  abortSignal?: AbortSignal
): Promise<WeatherApiResult> {
  const { lat, lon, timezone } = coords;

  // ── 1. 7-day forecast (includes today) ─────────────────────────────────
  const forecastParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    timezone,
    forecast_days: '7',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
    ].join(','),
    daily: [
      'precipitation_sum',
      'precipitation_probability_max',
    ].join(','),
    precipitation_unit: 'mm',
  });

  const forecastRes = await fetch(`${FORECAST_URL}?${forecastParams}`, {
    signal: abortSignal,
  });
  if (!forecastRes.ok) {
    throw new Error(`Forecast API error: ${forecastRes.status} ${forecastRes.statusText}`);
  }
  const forecastJson = await forecastRes.json();

  // Current conditions
  const cur = forecastJson.current;
  const current: CurrentWeather = {
    temperature: Math.round(cur.temperature_2m * 10) / 10,
    humidity: Math.round(cur.relative_humidity_2m),
    precipitationToday: 0,   // filled from daily[0] below
    precipitationNow: Math.round(cur.precipitation * 10) / 10,
    description: wmoDescription(cur.weather_code),
  };

  // Daily forecast
  const dailyDates: string[] = forecastJson.daily.time;                     // ["2026-10-28", …]
  const dailyPrecip: number[] = forecastJson.daily.precipitation_sum;       // [mm, …]
  const dailyProb: number[]   = forecastJson.daily.precipitation_probability_max; // [%, …]

  // today's accumulated rain from daily forecast (index 0)
  current.precipitationToday = Math.round((dailyPrecip[0] ?? 0) * 10) / 10;

  const forecast7Days: ForecastDay[] = dailyDates.map((isoDate, i) => ({
    date: formatDate(isoDate),
    isoDate,
    rainfall: Math.round((dailyPrecip[i] ?? 0) * 10) / 10,
    precipProb: Math.round(dailyProb[i] ?? 0),
  }));

  const total7DayRainfall = Math.round(
    dailyPrecip.reduce((a, b) => a + (b ?? 0), 0) * 10
  ) / 10;

  // 30-day forecast summary (weeks) — use forecast day data with a 30-day request
  // We re-fetch with 30 days. However to avoid a second full request we'll derive
  // this from the available 7-day data and fill remaining weeks with a note.
  // We will re-fetch with 30 days only if needed.
  const forecastParams30 = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    timezone,
    forecast_days: '14',
    daily: 'precipitation_sum',
    precipitation_unit: 'mm',
  });
  let forecast30Days: { period: string; rainfall: number }[] = [];
  try {
    const res30 = await fetch(`${FORECAST_URL}?${forecastParams30}`, { signal: abortSignal });
    if (res30.ok) {
      const json30 = await res30.json();
      const d30: string[] = json30.daily.time;
      const p30: number[] = json30.daily.precipitation_sum;
      // build up to 2 full weeks
      for (let w = 0; w < 2; w++) {
        const start = w * 7;
        const end = Math.min(start + 6, p30.length - 1);
        if (start >= p30.length) break;
        forecast30Days.push({
          period: buildWeekLabel(d30[start], d30[end]),
          rainfall: weekSum(p30, start),
        });
      }
    }
  } catch (_) {
    // non-fatal — fall back to deriving from 7-day data
  }
  if (forecast30Days.length === 0) {
    // Derive one entry from 7-day data
    forecast30Days = [{
      period: `${forecast7Days[0]?.date ?? ''} – ${forecast7Days[6]?.date ?? ''}`,
      rainfall: total7DayRainfall,
    }];
  }

  // ── 2. Historical data — last 2 years for monthly averages ─────────────
  const now = new Date();
  const thisYear = now.getFullYear();
  const histStartYear = thisYear - 2;

  const histParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    timezone,
    start_date: `${histStartYear}-01-01`,
    end_date:   `${thisYear - 1}-12-31`,
    daily: 'precipitation_sum',
    precipitation_unit: 'mm',
  });

  // Monthly accumulators: [month0…11] for each year
  const histMonthlyByYear: Record<number, number[]> = {};
  for (let y = histStartYear; y < thisYear; y++) {
    histMonthlyByYear[y] = new Array(12).fill(0);
  }

  try {
    const histRes = await fetch(`${HISTORICAL_URL}?${histParams}`, { signal: abortSignal });
    if (histRes.ok) {
      const histJson = await histRes.json();
      const histDates: string[] = histJson.daily.time;
      const histPrecip: number[] = histJson.daily.precipitation_sum;
      histDates.forEach((d, i) => {
        const year  = isoToYear(d);
        const month = isoToMonthIndex(d);
        if (histMonthlyByYear[year] && histPrecip[i] != null) {
          histMonthlyByYear[year][month] += histPrecip[i];
        }
      });
    }
  } catch (_) {
    // Historical API unavailable — fall through with zeros (filled from mock below)
  }

  // Average across available years
  const yearsAvailable = Object.keys(histMonthlyByYear).map(Number);
  const historicalMonthly = MONTHS_SHORT.map((_, monthIdx) => {
    if (yearsAvailable.length === 0) return 0;
    const sum = yearsAvailable.reduce(
      (acc, y) => acc + (histMonthlyByYear[y]?.[monthIdx] ?? 0),
      0
    );
    return Math.round(sum / yearsAvailable.length);
  });

  // Current-year partial monthly (use daily forecast for current month as "predicted")
  const currentYearMonthly: number[] = new Array(12).fill(0);

  // Fetch current-year historical (Jan to yesterday)
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isoYesterday = yesterday.toISOString().split('T')[0];
  const isoYearStart = `${thisYear}-01-01`;

  if (isoYesterday >= isoYearStart) {
    const currentYearParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      timezone,
      start_date: isoYearStart,
      end_date: isoYesterday,
      daily: 'precipitation_sum',
      precipitation_unit: 'mm',
    });
    try {
      const cyrRes = await fetch(`${HISTORICAL_URL}?${currentYearParams}`, { signal: abortSignal });
      if (cyrRes.ok) {
        const cyrJson = await cyrRes.json();
        const cyrDates: string[] = cyrJson.daily.time;
        const cyrPrecip: number[] = cyrJson.daily.precipitation_sum;
        cyrDates.forEach((d, i) => {
          const month = isoToMonthIndex(d);
          if (cyrPrecip[i] != null) {
            currentYearMonthly[month] += cyrPrecip[i];
          }
        });
      }
    } catch (_) { /* non-fatal */ }
  }

  // Add today's forecast precipitation to current month
  if (dailyPrecip[0] != null) {
    const todayMonth = isoToMonthIndex(dailyDates[0]);
    currentYearMonthly[todayMonth] += dailyPrecip[0];
  }

  // Build monthlyData: historical = avg of past 2 years, predicted = current year actual + forecast
  const monthlyData: MonthlyAverage[] = MONTHS_SHORT.map((month, idx) => ({
    month,
    historical: historicalMonthly[idx],
    predicted: Math.round(currentYearMonthly[idx]),
  }));

  // ── 3. Annual rainfall for last 5+ years ──────────────────────────────
  const annualHistParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    timezone,
    start_date: `${thisYear - 5}-01-01`,
    end_date:   `${thisYear - 1}-12-31`,
    daily: 'precipitation_sum',
    precipitation_unit: 'mm',
  });

  const annualTotals: Record<number, number> = {};
  for (let y = thisYear - 5; y < thisYear; y++) {
    annualTotals[y] = 0;
  }

  try {
    const annualRes = await fetch(`${HISTORICAL_URL}?${annualHistParams}`, { signal: abortSignal });
    if (annualRes.ok) {
      const annualJson = await annualRes.json();
      const annDates: string[] = annualJson.daily.time;
      const annPrecip: number[] = annualJson.daily.precipitation_sum;
      annDates.forEach((d, i) => {
        const year = isoToYear(d);
        if (annualTotals[year] !== undefined && annPrecip[i] != null) {
          annualTotals[year] += annPrecip[i];
        }
      });
    }
  } catch (_) { /* non-fatal */ }

  // Current year so far + 7-day forecast as partial
  const currentYearTotal = Math.round(
    currentYearMonthly.reduce((a, b) => a + b, 0) +
    dailyPrecip.slice(1).reduce((a, b) => a + (b ?? 0), 0) // remaining forecast days
  );

  const annualData: AnnualRainfall[] = [];
  for (let y = thisYear - 5; y < thisYear; y++) {
    annualData.push({ year: String(y), rainfall: Math.round(annualTotals[y]) });
  }
  // Current year partial
  annualData.push({ year: String(thisYear), rainfall: currentYearTotal, isPredicted: true });

  // ── 4. 5-Year Projection (simple trend extrapolation from available history) ─
  const historicalYears = annualData.filter(a => !a.isPredicted);
  const recentRainfalls = historicalYears.slice(-3).map(a => a.rainfall);
  const avgHistorical = recentRainfalls.length > 0
    ? recentRainfalls.reduce((a, b) => a + b, 0) / recentRainfalls.length
    : 800;
  const trendFactor = recentRainfalls.length >= 2
    ? recentRainfalls[recentRainfalls.length - 1] / (recentRainfalls[0] || 1)
    : 1;
  const annualTrendRate = Math.min(1.05, Math.max(0.95, Math.pow(trendFactor, 1 / Math.max(1, recentRainfalls.length - 1))));

  const projection5Years = Array.from({ length: 5 }, (_, i) => ({
    year: String(thisYear + 1 + i),
    rainfall: Math.round(avgHistorical * Math.pow(annualTrendRate, i + 1)),
  }));

  return {
    current,
    forecast7Days,
    total7DayRainfall,
    forecast30Days,
    monthlyData,
    annualData,
    projection5Years,
    lastFetched: new Date(),
  };
}

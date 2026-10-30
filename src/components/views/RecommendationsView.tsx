import React, { useState } from 'react';
import {
  ShieldCheck,
  CloudRain,
  Droplet,
  Info,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Database,
  CheckCircle2,
  Loader2,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecommendationsView: React.FC = () => {
  const {
    selectedLocation,
    tankPercentage,
    currentStorage,
    tankCapacity,
    waterAvailableDays,
    roofArea,
    runoffCoefficient,
    setActiveView,
    weatherData,
    weatherStatus,
    weatherIsStale,
    liveTotal7DayRainfall,
    weatherError,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const isLoading = weatherStatus === 'loading' || weatherStatus === 'idle';

  // ── Dynamically build recommendations from live weather data ─────────
  type RecType = 'warning' | 'info' | 'success' | 'danger';
  interface Rec {
    id: string;
    category: string;
    type: RecType;
    icon: React.ReactNode;
    bg: string;
    title: string;
    description: string;
    actionText: string;
    action: () => void;
  }

  const buildRecommendations = (): Rec[] => {
    const rain7 = liveTotal7DayRainfall;
    const forecastCollection = Math.round(rain7 * roofArea * runoffCoefficient);
    const forecastTankLevel = Math.min(tankCapacity, currentStorage + forecastCollection);
    const forecastTankPct = Math.round((forecastTankLevel / tankCapacity) * 100);

    const recs: Rec[] = [];

    // ── 1. Forecast-based rainfall alert ─────────────────────────────
    if (!weatherData && !isLoading) {
      recs.push({
        id: 'rec-no-data',
        category: 'forecast',
        type: 'warning',
        icon: <WifiOff className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-50/80 border-amber-200',
        title: 'Live Weather Data Unavailable',
        description: `Could not retrieve live forecast for ${selectedLocation.name}. ${weatherError ? `Error: ${weatherError}` : 'Check your internet connection.'} Showing data based on last known values.`,
        actionText: 'Refresh Weather Data',
        action: () => window.location.reload(),
      });
    } else if (rain7 === 0) {
      recs.push({
        id: 'rec-no-rain',
        category: 'forecast',
        type: 'warning',
        icon: <CloudRain className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-50/80 border-amber-200',
        title: 'No Rainfall Expected This Week',
        description: `The 7-day forecast for ${selectedLocation.name} shows 0 mm of precipitation. Current tank storage is ${tankPercentage}% (${currentStorage.toLocaleString()} L), providing approximately ${waterAvailableDays} days of supply. Conserve stored water and minimise non-essential usage.`,
        actionText: 'Check Tank Status',
        action: () => setActiveView('storage'),
      });
    } else if (rain7 >= 80) {
      recs.push({
        id: 'rec-heavy-rain',
        category: 'forecast',
        type: 'info',
        icon: <CloudRain className="w-5 h-5 text-blue-600" />,
        bg: 'bg-blue-50/80 border-blue-200',
        title: `Heavy Rainfall Expected — ${rain7} mm Over 7 Days`,
        description: `Significant rainfall (${rain7} mm) is forecast for ${selectedLocation.name} over the next 7 days. Estimated additional collection: ~${forecastCollection.toLocaleString()} L. Ensure gutters and first-flush diverters are clear before the rain arrives.`,
        actionText: 'View Forecast Details',
        action: () => setActiveView('forecast'),
      });
    } else {
      recs.push({
        id: 'rec-moderate-rain',
        category: 'forecast',
        type: 'info',
        icon: <CloudRain className="w-5 h-5 text-sky-600" />,
        bg: 'bg-sky-50/80 border-sky-200',
        title: `Moderate Rainfall Expected — ${rain7} mm Over 7 Days`,
        description: `${rain7} mm of rainfall is forecast for ${selectedLocation.name} this week. Estimated additional collection: ~${forecastCollection.toLocaleString()} L. System is in good standing.`,
        actionText: 'Open Forecast View',
        action: () => setActiveView('forecast'),
      });
    }

    // ── 2. Tank / storage recommendations ────────────────────────────
    if (forecastTankPct >= 90) {
      recs.push({
        id: 'rec-overflow',
        category: 'storage',
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-50/80 border-amber-200',
        title: 'Overflow Risk Detected',
        description: `With expected rainfall of ${rain7} mm, your tank could reach ~${forecastTankPct}% capacity (${forecastTankLevel.toLocaleString()} L / ${tankCapacity.toLocaleString()} L). Consider increasing water use for non-potable purposes or routing excess to a percolation pit to avoid overflow waste.`,
        actionText: 'View Storage Simulation',
        action: () => setActiveView('storage'),
      });
    } else if (tankPercentage < 30 && rain7 < 10) {
      recs.push({
        id: 'rec-low-storage',
        category: 'storage',
        type: 'danger',
        icon: <Database className="w-5 h-5 text-rose-600" />,
        bg: 'bg-rose-50/80 border-rose-200',
        title: 'Critical: Low Storage &amp; Minimal Forecast',
        description: `Tank is at only ${tankPercentage}% (${currentStorage.toLocaleString()} L) with ${waterAvailableDays} days of supply remaining. Minimal rainfall (${rain7} mm) is forecast. Implement strict water rationing and consider alternative supply options immediately.`,
        actionText: 'Open Storage Dashboard',
        action: () => setActiveView('storage'),
      });
    } else {
      recs.push({
        id: 'rec-utilise',
        category: 'storage',
        type: 'info',
        icon: <Droplet className="w-5 h-5 text-blue-600 fill-blue-400/30" />,
        bg: 'bg-blue-50/80 border-blue-200',
        title: 'Non-Potable Water Utilization Opportunity',
        description: `Current storage: ${tankPercentage}% (${currentStorage.toLocaleString()} L) — ${waterAvailableDays} days of supply. Use stored rainwater for gardening, vehicle washing, and floor cleaning to conserve municipal supply.`,
        actionText: 'View Water Usage Details',
        action: () => setActiveView('storage'),
      });
    }

    // ── 3. Maintenance ───────────────────────────────────────────────
    recs.push({
      id: 'rec-maintenance',
      category: 'maintenance',
      type: 'success',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-200',
      title: 'Pre-Rain Catchment Maintenance Check',
      description: 'Clean roof gutters, remove debris, and flush the first-flush diverter pipe before the next major rainfall event to ensure optimal water quality and maximum collection efficiency.',
      actionText: 'Run Water Calculator Test',
      action: () => setActiveView('calculator'),
    });

    // ── 4. Long-term trend recommendation ────────────────────────────
    const annualData = weatherData?.annualData ?? selectedLocation.annualData;
    if (annualData.length >= 2) {
      const last2 = annualData.slice(-2);
      const delta = last2[0].rainfall > 0
        ? Math.round(((last2[1].rainfall - last2[0].rainfall) / last2[0].rainfall) * 100)
        : 0;
      const label = last2[1].isPredicted ? 'Projected' : 'Observed';

      recs.push({
        id: 'rec-trend',
        category: 'conservation',
        type: delta >= 0 ? 'success' : 'warning',
        icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
        bg: delta >= 0 ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200',
        title: delta >= 0 ? 'Positive Annual Rainfall Trend' : 'Declining Annual Rainfall Trend',
        description: `${label} annual rainfall for ${new Date().getFullYear()} is ${last2[1].rainfall.toLocaleString()} mm — ${Math.abs(delta)}% ${delta >= 0 ? 'above' : 'below'} the previous year (${last2[0].rainfall.toLocaleString()} mm). ${delta >= 0 ? 'This is a good year to maximise storage before dry months.' : 'Plan for lower collection this year and optimise water usage.'}`,
        actionText: 'Open Analytics Dashboard',
        action: () => setActiveView('analytics'),
      });
    } else {
      recs.push({
        id: 'rec-recharge',
        category: 'conservation',
        type: 'info',
        icon: <Info className="w-5 h-5 text-indigo-600" />,
        bg: 'bg-indigo-50/80 border-indigo-200',
        title: 'Long-Term Groundwater Recharge Potential',
        description: 'Surplus harvested water can be redirected to a percolation pit to improve local water table levels during dry months.',
        actionText: 'Open Analytics Dashboard',
        action: () => setActiveView('analytics'),
      });
    }

    // ── 5. Calculator CTA ─────────────────────────────────────────────
    if (weatherData) {
      recs.push({
        id: 'rec-calculator',
        category: 'forecast',
        type: 'success',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        bg: 'bg-emerald-50/80 border-emerald-200',
        title: 'Live Data Connected — Run Your Scenario',
        description: `Your system is connected to Open-Meteo live weather data for ${selectedLocation.name}. Try the Water Calculator with the 7-day forecast total (${rain7} mm) to estimate precise collection for your roof area.`,
        actionText: 'Open Water Calculator',
        action: () => setActiveView('calculator'),
      });
    }

    return recs;
  };

  const recommendationsList = isLoading
    ? [
        {
          id: 'loading',
          category: 'forecast',
          type: 'info' as RecType,
          icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
          bg: 'bg-blue-50/80 border-blue-200',
          title: 'Fetching Live Weather Data…',
          description: `Retrieving real-time forecast and historical data for ${selectedLocation.name} from Open-Meteo. Recommendations will update automatically once data is ready.`,
          actionText: 'View Forecast Details',
          action: () => setActiveView('forecast'),
        },
      ]
    : buildRecommendations();

  const filtered = activeCategory === 'all'
    ? recommendationsList
    : recommendationsList.filter(r => r.category === activeCategory);

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Intelligent Advisory Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900">Smart Rainwater Recommendations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Actionable guidance synthesized from{' '}
            {weatherData
              ? <strong>live Open-Meteo weather data</strong>
              : <span>storage status and consumption metrics</span>}
            {' '}for {selectedLocation.name}, {selectedLocation.state}.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
          {['all', 'forecast', 'storage', 'maintenance', 'conservation'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                activeCategory === cat ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Recommendations' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stale data warning */}
      {weatherIsStale && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
          Recommendations are based on cached weather data. Live conditions may differ.
        </div>
      )}

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-semibold">
            No recommendations in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border ${item.bg} shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              <button
                onClick={item.action}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs shadow-2xs shrink-0 flex items-center justify-center gap-2 transition-all self-start md:self-auto"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Attribution */}
      {weatherData && (
        <p className="text-[10px] text-slate-400 text-right font-medium">
          Weather data by{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
            Open-Meteo.com
          </a>{' '}
          — free for non-commercial use (CC BY-NC 4.0)
        </p>
      )}
    </div>
  );
};

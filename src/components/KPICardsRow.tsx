import React from 'react';
import {
  CloudRain,
  TrendingUp,
  Droplet,
  Trash2,
  Database,
  Calendar,
  Clock,
  BarChart2,
  Loader2,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const KPICardsRow: React.FC = () => {
  const {
    expectedCollection,
    currentStorage,
    tankCapacity,
    tankPercentage,
    waterAvailableDays,
    weatherStatus,
    weatherIsStale,
    liveRainfallToday,
    liveTotal7DayRainfall,
    roofArea,
    runoffCoefficient,
  } = useApp();

  const isLoading = weatherStatus === 'loading' || weatherStatus === 'idle';
  const showLive   = weatherStatus === 'success' || weatherIsStale;

  // Rainfall intensity label
  function rainfallLabel(mm: number): string {
    if (mm === 0)   return 'No rainfall expected';
    if (mm < 20)    return 'Light rainfall expected';
    if (mm < 60)    return 'Moderate rainfall expected';
    if (mm < 120)   return 'Heavy rainfall expected';
    return 'Very heavy rainfall expected';
  }

  // Collection label for KPI card
  const collectionNote = `${roofArea} m² × ${runoffCoefficient} coefficient`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-8">
      {/* CARD 1: Rainfall Today */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Rainfall Today</div>
            {isLoading ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-slate-400">Loading…</span>
              </div>
            ) : (
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {liveRainfallToday} mm
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          {weatherIsStale && <WifiOff className="w-3 h-3 text-amber-500" />}
          <span className={weatherIsStale ? 'text-amber-600' : 'text-slate-500'}>
            {showLive ? 'Daily accumulated rainfall' : 'Fetching live data…'}
          </span>
        </div>
      </div>

      {/* CARD 2: Predicted Rainfall (Next 7 Days) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Predicted Rainfall</div>
              <div className="text-[10px] text-slate-400 font-medium">(Next 7 Days)</div>
            </div>
          </div>
          <BarChart2 className="w-5 h-5 text-blue-500" />
        </div>
        {isLoading ? (
          <div className="flex items-center gap-1.5 mt-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-slate-400">Loading…</span>
          </div>
        ) : (
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {liveTotal7DayRainfall} mm
          </div>
        )}
        <div className="mt-1 text-xs text-slate-500 font-medium">
          {showLive ? rainfallLabel(liveTotal7DayRainfall) : 'Fetching forecast…'}
        </div>
      </div>

      {/* CARD 3: Expected Collection */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Droplet className="w-5 h-5 fill-blue-500/20" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Expected Collection</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {expectedCollection.toLocaleString()} L
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400 font-medium">
          {collectionNote}
        </div>
      </div>

      {/* CARD 4: Estimated Tank Level */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Est. Tank Level</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {currentStorage.toLocaleString()} / {tankCapacity.toLocaleString()} L
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${tankPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{tankPercentage}%</span>
        </div>
        <div className="mt-1.5 text-xs text-slate-400 font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Simulated estimate
        </div>
      </div>

      {/* CARD 5: Water Available For */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Water Available For</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {waterAvailableDays} days
              </div>
            </div>
          </div>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-3 text-xs text-slate-400 font-medium">
          Based on current usage
        </div>
      </div>
    </div>
  );
};

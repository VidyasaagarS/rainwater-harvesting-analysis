import React from 'react';
import {
  CloudRain,
  TrendingUp,
  Droplet,
  Trash2,
  Database,
  Calendar,
  Clock,
  BarChart2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const KPICardsRow: React.FC = () => {
  const {
    selectedLocation,
    expectedCollection,
    currentStorage,
    tankCapacity,
    tankPercentage,
    waterAvailableDays
  } = useApp();

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
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {selectedLocation.rainfallToday} mm
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{selectedLocation.trendPercent}%</span>
          <span className="text-slate-400 font-normal ml-0.5">Compared to yesterday</span>
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
        <div className="text-xl font-extrabold text-slate-900 mt-2">
          {selectedLocation.predicted7Days} mm
        </div>
        <div className="mt-1 text-xs text-slate-500 font-medium">
          Moderate rainfall expected
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
          Based on your roof area
        </div>
      </div>

      {/* CARD 4: Estimated Tank Level */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Estimated Tank Level</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {currentStorage.toLocaleString()} / {tankCapacity.toLocaleString()} L
            </div>
          </div>
        </div>
        {/* Progress Bar matching reference image */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${tankPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{tankPercentage}%</span>
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

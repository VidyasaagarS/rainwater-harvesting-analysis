import React from 'react';
import {
  Database,
  Info,
  ArrowDown,
  ArrowUp,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { TankGraphic } from '../3d/TankGraphic';

export const StorageUsageView: React.FC = () => {
  const {
    currentStorage,
    setCurrentStorage,
    tankCapacity,
    tankPercentage,
    remainingCapacity,
    dailyWaterRequirement,
    waterAvailableDays,
    showToast
  } = useApp();

  // Storage history timeline data
  const storageTimeline = [
    { day: 'Mon', storage: 2800, collection: 400, usage: 550 },
    { day: 'Tue', storage: 3100, collection: 850, usage: 550 },
    { day: 'Wed', storage: 3400, collection: 900, usage: 600 },
    { day: 'Thu', storage: 3250, collection: 450, usage: 600 },
    { day: 'Fri (Today)', storage: currentStorage, collection: 620, usage: dailyWaterRequirement },
    { day: 'Sat (Pred)', storage: Math.min(tankCapacity, currentStorage + 800 - 600), collection: 800, usage: 600 },
    { day: 'Sun (Pred)', storage: Math.min(tankCapacity, currentStorage + 1200 - 600), collection: 1200, usage: 600 },
  ];

  const usageBreakdown = [
    { name: 'Sanitation & Bathing', value: 240, color: '#2563eb' },
    { name: 'Washing & Cleaning', value: 150, color: '#38bdf8' },
    { name: 'Gardening & Outdoor', value: 120, color: '#10b981' },
    { name: 'Drinking & Cooking', value: 90, color: '#f59e0b' },
  ];

  const handleLogWaterUsage = () => {
    const newStorage = Math.max(0, currentStorage - 50);
    setCurrentStorage(newStorage);
    showToast('Logged 50 L water consumption. Updated estimated tank level.');
  };

  const handleLogRainfallCollection = () => {
    const newStorage = Math.min(tankCapacity, currentStorage + 250);
    setCurrentStorage(newStorage);
    showToast('Added 250 L harvested rainwater into virtual tank.');
  };

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Disclaimer Banner for Virtual Software Model */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <span className="font-bold">Software-Simulated Storage System:</span> This module calculates virtual tank storage using predicted rainfall runoff minus household consumption estimates. Physical IoT hardware sensors are not required.
        </div>
      </div>

      {/* Main Row: Tank Storage & Usage Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tank Graphic Display */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Virtual Storage Tank Status</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              {tankPercentage}% Capacity
            </span>
          </div>

          <TankGraphic
            percentage={tankPercentage}
            currentStorage={currentStorage}
            capacity={tankCapacity}
            remaining={remainingCapacity}
          />
        </div>

        {/* Consumption Simulation & Controls */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-blue-600" /> Storage Simulation Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Daily Water Requirement</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{dailyWaterRequirement} L/day</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Days of Storage Available</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{waterAvailableDays} Days</div>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 block">
              Simulate Water Usage / Collection Event
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleLogWaterUsage}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
              >
                <ArrowDown className="w-4 h-4 text-red-500" /> Deduct 50L Usage
              </button>

              <button
                onClick={handleLogRainfallCollection}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 border border-blue-200 transition-colors"
              >
                <ArrowUp className="w-4 h-4 text-emerald-500" /> Add +250L Harvested Rain
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Breakdown & Storage Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">7-Day Tank Storage & Flow Projection</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: any) => [`${val} L`, 'Storage Level']} />
                <Area type="monotone" dataKey="storage" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorStorage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Estimated Consumption Breakdown</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {usageBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} L/day`, 'Usage']} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

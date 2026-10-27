import React, { useState } from 'react';
import {
  CloudRain,
  TrendingUp,
  Zap,
  Percent,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const ForecastView: React.FC = () => {
  const { selectedLocation } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '30days' | 'monthly' | '5years'>('7days');

  // Calculated Stats
  const forecast7 = selectedLocation.forecast7Days;
  const maxRain = Math.max(...forecast7.map(d => d.rainfall));
  const avgRain = (forecast7.reduce((acc, curr) => acc + curr.rainfall, 0) / forecast7.length).toFixed(1);

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> ML Time-Series Rainfall Forecast
            </div>
            <h1 className="text-2xl font-black text-white">Rainfall Forecast & Predictive Modeling</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time statistical rainfall predictions for {selectedLocation.name}, {selectedLocation.state} generated using historical weather datasets and predictive time-series models.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-xs text-slate-300 font-medium">Confidence Score</div>
              <div className="text-xl font-black text-emerald-400">94.2%</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-xs text-slate-300 font-medium">Primary Model</div>
              <div className="text-sm font-bold text-sky-300">XGBoost + ARIMA</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row for Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Highest Predicted (7D)</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{maxRain} mm</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Peak expected on Day 5
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Average Daily Rain</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{avgRain} mm/day</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">
            Consistent precipitation pattern
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Rainfall Probability</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">78%</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-600">
            High chance of rain this week
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Seasonal Trend</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">+12.4%</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            Above 10-year historical average
          </div>
        </div>
      </div>

      {/* Interactive Forecast Chart Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Precipitation Forecast Analysis</h2>
            <p className="text-xs text-slate-500">Select period to inspect historical comparison and future projections</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setSelectedTimeframe('7days')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTimeframe === '7days' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Detailed
            </button>
            <button
              onClick={() => setSelectedTimeframe('30days')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTimeframe === '30days' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30-Day Summary
            </button>
            <button
              onClick={() => setSelectedTimeframe('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTimeframe === 'monthly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Pattern
            </button>
            <button
              onClick={() => setSelectedTimeframe('5years')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTimeframe === '5years' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5-Year Projection
            </button>
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedTimeframe === '7days' ? (
              <AreaChart data={selectedLocation.forecast7Days} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: any) => [`${val} mm`, 'Rainfall']} />
                <Area type="monotone" dataKey="rainfall" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorRain)" />
              </AreaChart>
            ) : selectedTimeframe === 'monthly' ? (
              <BarChart data={selectedLocation.monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="historical" name="Historical Avg" fill="#7dd3fc" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" name="Predicted" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={selectedLocation.projection5Years} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis label={{ value: 'Annual Rain (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="rainfall" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

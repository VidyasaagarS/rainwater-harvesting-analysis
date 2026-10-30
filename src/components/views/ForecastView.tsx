import React, { useState } from 'react';
import {
  CloudRain,
  TrendingUp,
  Zap,
  Percent,
  Compass,
  ArrowUpRight,
  Loader2,
  WifiOff,
  Info,
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
  Line,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const ForecastView: React.FC = () => {
  const {
    selectedLocation,
    weatherData,
    weatherStatus,
    weatherIsStale,
  } = useApp();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '30days' | 'monthly' | '5years'>('7days');

  const isLoading = weatherStatus === 'loading' || weatherStatus === 'idle';

  // Resolve data: live → fallback
  const forecast7 = weatherData?.forecast7Days
    ? weatherData.forecast7Days.map(d => ({ date: d.date, rainfall: d.rainfall, precipProb: d.precipProb }))
    : selectedLocation.forecast7Days.map(d => ({ ...d, precipProb: 0 }));

  const monthlyData  = weatherData?.monthlyData  ?? selectedLocation.monthlyData;
  const projection5Y = weatherData?.projection5Years ?? selectedLocation.projection5Years;
  const forecast30   = weatherData?.forecast30Days ?? selectedLocation.forecast30Days;

  // KPI derivations from the 7-day data
  const maxRain = forecast7.length > 0 ? Math.max(...forecast7.map(d => d.rainfall)) : 0;
  const maxRainDay = forecast7.find(d => d.rainfall === maxRain);
  const avgRain = forecast7.length > 0
    ? (forecast7.reduce((acc, d) => acc + d.rainfall, 0) / forecast7.length).toFixed(1)
    : '0.0';
  const avgPrecipProb = forecast7.length > 0
    ? Math.round(forecast7.reduce((acc, d) => acc + (d.precipProb ?? 0), 0) / forecast7.length)
    : 0;

  // Seasonal trend: compare avg of last 3 months vs historical
  const seasonalTrend = (() => {
    const recent = monthlyData.slice(-3);
    if (recent.length === 0) return 0;
    const histSum = recent.reduce((a, b) => a + b.historical, 0);
    const predSum = recent.reduce((a, b) => a + b.predicted, 0);
    if (histSum === 0) return 0;
    return Math.round(((predSum - histSum) / histSum) * 100);
  })();

  // 30-day chart data
  const chart30Data = forecast30.map(item => ({ name: item.period, rainfall: item.rainfall }));

  // Source label
  const dataSourceLabel = weatherData
    ? `Live · Open-Meteo${weatherIsStale ? ' (cached)' : ''}`
    : 'Sample data — live fetch pending';

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              {weatherData ? 'Live · Open-Meteo Weather Data' : 'Statistical Rainfall Forecast'}
            </div>
            <h1 className="text-2xl font-black text-white">Rainfall Forecast &amp; Predictive Modeling</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {weatherData
                ? `Real-time weather forecast for ${selectedLocation.name}, ${selectedLocation.state} — sourced from Open-Meteo historical archive and forecast API.`
                : `Statistical rainfall predictions for ${selectedLocation.name}, ${selectedLocation.state} using historical weather datasets.`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-xs text-slate-300 font-medium">7-Day Total</div>
              <div className="text-xl font-black text-emerald-400">
                {isLoading ? '…' : `${forecast7.reduce((a, d) => a + d.rainfall, 0).toFixed(1)} mm`}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-xs text-slate-300 font-medium">Data Source</div>
              <div className="text-sm font-bold text-sky-300">
                {weatherData ? 'Open-Meteo' : 'Sample Data'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row for Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak rainfall */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Peak Rainfall (7D)</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Loading…</span></div>
              ) : (
                <div className="text-xl font-black text-slate-900 mt-0.5">{maxRain} mm</div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {maxRainDay ? `Expected on ${maxRainDay.date}` : 'Peak day'}
          </div>
        </div>

        {/* Average daily */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Average Daily Rain</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Loading…</span></div>
              ) : (
                <div className="text-xl font-black text-slate-900 mt-0.5">{avgRain} mm/day</div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">
            {weatherData ? '7-day live forecast average' : 'Sample data estimate'}
          </div>
        </div>

        {/* Precipitation probability */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Avg Rain Probability</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Loading…</span></div>
              ) : (
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {weatherData ? `${avgPrecipProb}%` : 'N/A'}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-600">
            {avgPrecipProb >= 60 ? 'High chance of rain this week'
              : avgPrecipProb >= 30 ? 'Moderate rain probability'
              : weatherData ? 'Low rain probability this week'
              : 'Live data needed'}
          </div>
        </div>

        {/* Seasonal trend */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Seasonal Trend</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Loading…</span></div>
              ) : (
                <div className={`text-xl font-black mt-0.5 ${seasonalTrend >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {seasonalTrend >= 0 ? '+' : ''}{seasonalTrend}%
                </div>
              )}
            </div>
          </div>
          <div className={`mt-2 text-xs font-semibold ${seasonalTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {weatherData
              ? `vs. historical average (recent 3 months)`
              : 'Estimated seasonal comparison'}
          </div>
        </div>
      </div>

      {/* Data source notice when using stale/sample data */}
      {weatherIsStale && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <WifiOff className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          Showing cached weather data — last fetched at {weatherData?.lastFetched ? new Date(weatherData.lastFetched).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'unknown'}. Data may be up to 30 minutes old.
        </div>
      )}

      {!weatherData && !isLoading && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          Weather data unavailable — showing sample data. Check your internet connection and use the Refresh button in the header.
        </div>
      )}

      {/* Interactive Forecast Chart Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Precipitation Forecast Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {dataSourceLabel} · Select period to inspect historical patterns and future projections
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto flex-wrap">
            {(['7days', '30days', 'monthly', '5years'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeframe === tf ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf === '7days' ? '7-Day Detailed' : tf === '30days' ? '14-Day Summary' : tf === 'monthly' ? 'Monthly Pattern' : '5-Year Projection'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div className="h-80 w-full">
          {isLoading && selectedTimeframe === '7days' ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Loading live forecast from Open-Meteo…</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {selectedTimeframe === '7days' ? (
                <AreaChart data={forecast7} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: unknown, name: unknown) => [
                    `${val} ${name === 'precipProb' ? '%' : 'mm'}`,
                    name === 'precipProb' ? 'Rain Probability' : 'Rainfall'
                  ]} />
                  {weatherData && (
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} formatter={(v) => v === 'precipProb' ? 'Rain Probability (%)' : 'Rainfall (mm)'} />
                  )}
                  <Area type="monotone" dataKey="rainfall" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorRain)" />
                  {weatherData && (
                    <Area type="monotone" dataKey="precipProb" stroke="#f59e0b" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                  )}
                </AreaChart>
              ) : selectedTimeframe === '30days' ? (
                <BarChart data={chart30Data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: unknown) => [`${val} mm`, 'Rainfall']} />
                  <Bar dataKey="rainfall" name="Weekly Rainfall" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              ) : selectedTimeframe === 'monthly' ? (
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: unknown, name: unknown) => [`${val} mm`, name === 'historical' ? 'Historical Avg' : 'This Year']} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }} formatter={(v) => v === 'historical' ? 'Historical Average' : 'This Year (Actual)'} />
                  <Bar dataKey="historical" fill="#7dd3fc" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="predicted" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              ) : (
                <LineChart data={projection5Y} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis label={{ value: 'Annual Rain (mm)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: unknown) => [`${val} mm`, 'Projected Annual Rainfall']} />
                  <Line type="monotone" dataKey="rainfall" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Attribution */}
        <p className="text-[10px] text-slate-400 mt-3 text-right font-medium">
          Weather data by{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
            Open-Meteo.com
          </a>{' '}
          — free for non-commercial use (CC BY-NC 4.0)
        </p>
      </div>
    </div>
  );
};

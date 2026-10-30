import React from 'react';
import {
  CloudRain,
  BarChart3,
  Droplet,
  Database,
  TrendingUp,
  Users,
  Lightbulb,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Loader2,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  LabelList
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { TankGraphic } from '../3d/TankGraphic';

export const DashboardView: React.FC = () => {
  const {
    selectedLocation,
    roofArea,
    predictedRainfallForCalc,
    runoffCoefficient,
    expectedCollection,
    currentStorage,
    tankCapacity,
    tankPercentage,
    remainingCapacity,
    dailyWaterRequirement,
    waterAvailableDays,
    forecastTab,
    setForecastTab,
    setActiveView,
    // Live weather
    weatherData,
    weatherStatus,
    weatherIsStale,
    liveTotal7DayRainfall,
  } = useApp();

  const isLoading = weatherStatus === 'loading' || weatherStatus === 'idle';

  // Resolve chart data: prefer live data, fall back to location mock
  const liveMonthlyData = weatherData?.monthlyData ?? selectedLocation.monthlyData;
  const liveAnnualData  = weatherData?.annualData  ?? selectedLocation.annualData;
  const liveProjection  = weatherData?.projection5Years ?? selectedLocation.projection5Years;
  const liveForecast7   = weatherData?.forecast7Days
    ? weatherData.forecast7Days.map(d => ({ date: d.date, rainfall: d.rainfall }))
    : selectedLocation.forecast7Days;
  const liveForecast30  = weatherData?.forecast30Days ?? selectedLocation.forecast30Days;

  const forecastTabs = [
    'Next 7 Days',
    'Next 30 Days',
    'This Year',
    'Next Year',
    '5 Year Projection',
  ];

  // Get dynamic chart data based on active tab
  const getForecastChartData = () => {
    switch (forecastTab) {
      case 'Next 30 Days':
        return liveForecast30.map(item => ({
          name: item.period,
          rainfall: item.rainfall,
        }));
      case 'This Year':
        return liveMonthlyData.map(item => ({
          name: item.month,
          rainfall: item.predicted,
        }));
      case 'Next Year':
        // Conservative +5% projection over this year
        return liveMonthlyData.map(item => ({
          name: item.month,
          rainfall: Math.round(item.predicted * 1.05),
        }));
      case '5 Year Projection':
        return liveProjection.map(item => ({
          name: item.year,
          rainfall: item.rainfall,
        }));
      case 'Next 7 Days':
      default:
        return liveForecast7.map(item => ({
          name: item.date,
          rainfall: item.rainfall,
        }));
    }
  };

  const currentForecastData = getForecastChartData();

  // ── Dynamic Quick Insights ───────────────────────────────────────────
  type InsightType = 'emerald' | 'amber' | 'blue';

  interface Insight {
    type: InsightType;
    icon: React.ReactNode;
    title: string;
    body: string;
  }

  const buildInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (isLoading) {
      insights.push({
        type: 'blue',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        title: 'Fetching Live Weather Data',
        body: 'Please wait while we retrieve real-time forecast information from Open-Meteo.',
      });
      return insights;
    }

    const rain7 = liveTotal7DayRainfall;
    const collectionForecast = Math.round(rain7 * roofArea * runoffCoefficient);
    const forecastTankLevel = Math.min(tankCapacity, currentStorage + collectionForecast);
    const forecastTankPct = Math.round((forecastTankLevel / tankCapacity) * 100);

    // Insight 1: Rainfall forecast
    if (rain7 === 0) {
      insights.push({
        type: 'amber',
        icon: <WifiOff className="w-4 h-4" />,
        title: 'No Rainfall Expected This Week',
        body: 'No precipitation is forecast for the next 7 days. Conserve stored water carefully.',
      });
    } else if (rain7 < 20) {
      insights.push({
        type: 'blue',
        icon: <CloudRain className="w-4 h-4" />,
        title: 'Light Rainfall This Week',
        body: `${rain7} mm total forecast. Estimated collection: ~${collectionForecast.toLocaleString()} L over 7 days.`,
      });
    } else {
      insights.push({
        type: 'emerald',
        icon: <CloudRain className="w-4 h-4" />,
        title: rain7 >= 80 ? 'Heavy Rainfall Expected' : 'Moderate Rainfall Expected',
        body: `${rain7} mm total forecast over 7 days. Estimated collection: ~${collectionForecast.toLocaleString()} L.`,
      });
    }

    // Insight 2: Tank capacity alert
    if (forecastTankPct >= 90) {
      insights.push({
        type: 'amber',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Tank Overflow Risk Detected',
        body: `Forecast rainfall could fill tank to ~${forecastTankPct}%. Consider using stored water or preparing overflow routing.`,
      });
    } else if (tankPercentage < 30 && rain7 < 10) {
      insights.push({
        type: 'amber',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Low Storage & Minimal Forecast',
        body: `Tank is at ${tankPercentage}% with little rain expected. Monitor usage closely; ${waterAvailableDays} days of supply remaining.`,
      });
    } else {
      insights.push({
        type: 'blue',
        icon: <Database className="w-4 h-4" />,
        title: 'Tank Conditions Stable',
        body: `Current storage: ${tankPercentage}% (${currentStorage.toLocaleString()} L). Remaining capacity: ${remainingCapacity.toLocaleString()} L.`,
      });
    }

    // Insight 3: Annual trend (from live data if available)
    const annualData = liveAnnualData;
    if (annualData.length >= 2) {
      const lastTwo = annualData.slice(-2);
      const prev = lastTwo[0].rainfall;
      const curr = lastTwo[1].rainfall;
      const delta = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
      const label = lastTwo[1].isPredicted ? 'Projected' : 'Observed';
      if (delta >= 0) {
        insights.push({
          type: 'emerald',
          icon: <TrendingUp className="w-4 h-4" />,
          title: 'Positive Annual Rainfall Trend',
          body: `${label} rainfall (${curr.toLocaleString()} mm) is ${Math.abs(delta)}% ${delta >= 0 ? 'above' : 'below'} the previous year.`,
        });
      } else {
        insights.push({
          type: 'amber',
          icon: <TrendingUp className="w-4 h-4" />,
          title: 'Declining Annual Rainfall Trend',
          body: `${label} rainfall (${curr.toLocaleString()} mm) is ${Math.abs(delta)}% below the previous year. Harvest efficiently.`,
        });
      }
    } else {
      insights.push({
        type: 'blue',
        icon: <CheckCircle2 className="w-4 h-4" />,
        title: 'Harvesting System Active',
        body: 'Your rainwater harvesting system is configured and monitoring live weather conditions.',
      });
    }

    return insights;
  };

  const insights = buildInsights();

  const insightStyles: Record<InsightType, { wrapper: string; icon: string; title: string; body: string }> = {
    emerald: {
      wrapper: 'bg-emerald-50/80 border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-700',
      title: 'text-emerald-900',
      body: 'text-emerald-700',
    },
    amber: {
      wrapper: 'bg-amber-50/80 border-amber-200',
      icon: 'bg-amber-100 text-amber-700',
      title: 'text-amber-900',
      body: 'text-amber-700',
    },
    blue: {
      wrapper: 'bg-blue-50/80 border-blue-200',
      icon: 'bg-blue-100 text-blue-700',
      title: 'text-blue-900',
      body: 'text-blue-700',
    },
  };

  const forecastTabLabel = () => {
    switch (forecastTab) {
      case 'Next 7 Days':   return weatherData ? '7-day live forecast · Open-Meteo' : '7-day forecast (sample data)';
      case 'Next 30 Days':  return weatherData ? '14-day live forecast · extended estimate' : '30-day estimate (sample data)';
      case 'This Year':     return weatherData ? 'Historical actual + current-year data' : 'Historical average (sample data)';
      case 'Next Year':     return 'Projection (+5% trend applied)';
      case '5 Year Projection': return weatherData ? 'Trend extrapolation from historical data' : '5-year projection (sample data)';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* MIDDLE ROW 1: Rainfall Forecast & Monthly Rainfall Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rainfall Forecast Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Rainfall Forecast</h2>
                {weatherData && (
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                    {forecastTabLabel()}
                    {weatherIsStale && <span className="text-amber-500 ml-1">(cached)</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              {forecastTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setForecastTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    forecastTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Forecast Bar Chart */}
          <div className="h-64 w-full mt-2">
            {isLoading && forecastTab === 'Next 7 Days' ? (
              <div className="h-full flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Loading forecast…</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentForecastData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 15, style: { fill: '#64748b', fontSize: 11, fontWeight: 500 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(val: unknown) => [`${val} mm`, 'Rainfall']}
                  />
                  <Bar dataKey="rainfall" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    <LabelList dataKey="rainfall" position="top" style={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Rainfall Prediction Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Rainfall</h2>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                {weatherData
                  ? 'Historical avg (past 2 yrs) vs. current-year actual'
                  : 'Historical average vs. estimated (sample data)'}
              </p>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="h-64 w-full mt-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Loading historical data…</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveMonthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 20, style: { fill: '#64748b', fontSize: 11, fontWeight: 500 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(val: unknown, nameKey: unknown) => [
                      `${val} mm`,
                      nameKey === 'historical' ? 'Historical Average' : 'Current Year'
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                    formatter={(value) => (value === 'historical' ? 'Historical Avg' : 'This Year')}
                  />
                  <Bar dataKey="historical" fill="#7dd3fc" radius={[3, 3, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="predicted" fill="#1d4ed8" radius={[3, 3, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW 2: Estimated Water Collection & Tank Storage Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Estimated Water Collection Box */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Droplet className="w-4 h-4 fill-blue-400/30" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Estimated Water Collection</h2>
            </div>
            
            <button
              onClick={() => setActiveView('calculator')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Open Water Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Formula Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center my-auto p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-500">Roof Area</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{roofArea} m²</div>
            </div>

            <div className="text-center font-extrabold text-slate-400 text-xl">×</div>

            <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-500">
                Rainfall Input
                {weatherData && <span className="text-blue-500 ml-0.5">*</span>}
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{predictedRainfallForCalc} mm</div>
            </div>

            <div className="text-center font-extrabold text-slate-400 text-xl">×</div>

            <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-500">Runoff Coeff.</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{runoffCoefficient}</div>
            </div>
          </div>
          {weatherData && (
            <p className="text-[10px] text-slate-400 mt-2 ml-1">
              * Set rainfall in the Calculator or update settings for a custom value.
            </p>
          )}

          {/* Result */}
          <div className="flex items-center justify-between gap-4 mt-4">
            <div className="text-2xl font-black text-slate-800 px-2">=</div>
            <div className="flex-1 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="text-sm font-bold text-emerald-800">Expected Collection</div>
              <div className="text-2xl font-black text-emerald-700">
                {expectedCollection.toLocaleString()} L
              </div>
            </div>
          </div>
        </div>

        {/* Tank Storage Status Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Tank Storage Status</h2>
          </div>

          <TankGraphic
            percentage={tankPercentage}
            currentStorage={currentStorage}
            capacity={tankCapacity}
            remaining={remainingCapacity}
          />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Annual Rainfall Comparison */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Annual Rainfall Comparison</h2>
              {weatherData && (
                <p className="text-[10px] text-slate-400 font-medium">Historical data · Open-Meteo Archive</p>
              )}
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Loading…</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveAnnualData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 25, style: { fill: '#64748b', fontSize: 10 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(val: unknown, _name: unknown, props: { payload?: { isPredicted?: boolean } }) => [
                      `${val} mm`,
                      props?.payload?.isPredicted ? 'Projected Rainfall' : 'Historical Rainfall'
                    ]}
                  />
                  <Bar dataKey="rainfall" radius={[5, 5, 0, 0]} maxBarSize={32}>
                    {liveAnnualData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPredicted ? '#34d399' : '#60a5fa'} />
                    ))}
                    <LabelList dataKey="rainfall" position="top" style={{ fill: '#1e293b', fontSize: 10, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400"></span> Historical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400"></span> Projected</span>
          </div>
        </div>

        {/* Water Usage & Availability */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Water Usage & Availability</h2>
          </div>

          <div className="space-y-4 my-auto">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-blue-500/30" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Daily Water Requirement</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {dailyWaterRequirement.toLocaleString()} L/day
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Current Storage (Est.)</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {currentStorage.toLocaleString()} L
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Estimated Availability</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {waterAvailableDays} days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights & Recommendations */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Quick Insights</h2>
            </div>
            <button
              onClick={() => setActiveView('recommendations')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            {insights.map((insight, i) => {
              const s = insightStyles[insight.type];
              return (
                <div key={i} className={`p-3 rounded-xl border ${s.wrapper} flex items-start gap-3`}>
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${s.icon}`}>
                    {insight.icon}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${s.title}`}>{insight.title}</div>
                    <div className={`text-[11px] mt-0.5 leading-relaxed font-medium ${s.body}`}>
                      {insight.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

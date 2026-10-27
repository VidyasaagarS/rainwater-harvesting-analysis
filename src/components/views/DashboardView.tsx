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
  ArrowRight
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
    setActiveView
  } = useApp();

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
        return selectedLocation.forecast30Days.map(item => ({
          name: item.period,
          rainfall: item.rainfall,
        }));
      case 'This Year':
        return selectedLocation.monthlyData.map(item => ({
          name: item.month,
          rainfall: item.predicted,
        }));
      case 'Next Year':
        return selectedLocation.monthlyData.map(item => ({
          name: item.month,
          rainfall: Math.round(item.predicted * 1.08),
        }));
      case '5 Year Projection':
        return selectedLocation.projection5Years.map(item => ({
          name: item.year,
          rainfall: item.rainfall,
        }));
      case 'Next 7 Days':
      default:
        return selectedLocation.forecast7Days.map(item => ({
          name: item.date,
          rainfall: item.rainfall,
        }));
    }
  };

  const currentForecastData = getForecastChartData();

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
              <h2 className="text-lg font-bold text-slate-900">Rainfall Forecast</h2>
            </div>

            {/* Filter Tabs matching reference screenshot */}
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentForecastData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 15, style: { fill: '#64748b', fontSize: 11, fontWeight: 500 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${val} mm`, 'Rainfall']}
                />
                <Bar dataKey="rainfall" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  <LabelList dataKey="rainfall" position="top" style={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Rainfall Prediction Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Rainfall Prediction</h2>
          </div>

          {/* Grouped Bar Chart */}
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedLocation.monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 20, style: { fill: '#64748b', fontSize: 11, fontWeight: 500 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(val: any, nameKey: any) => [
                    `${val} mm`,
                    nameKey === 'historical' ? 'Historical Average' : 'Predicted'
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                  formatter={(value) => (value === 'historical' ? 'Historical Average' : 'Predicted')}
                />
                <Bar dataKey="historical" fill="#7dd3fc" radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="predicted" fill="#1d4ed8" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
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

          {/* Visual Formula Layout matching reference image */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center my-auto p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-500">Roof Area</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{roofArea} m²</div>
            </div>

            <div className="text-center font-extrabold text-slate-400 text-xl">+</div>

            <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-500">Predicted Rainfall</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{predictedRainfallForCalc} mm</div>
            </div>

            <div className="text-center font-extrabold text-slate-400 text-xl">+</div>

            <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-500">Runoff Coefficient</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{runoffCoefficient}</div>
            </div>
          </div>

          {/* Formula Equal Sign & Highlighted Green Expected Collection Box */}
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
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Annual Rainfall Comparison</h2>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedLocation.annualData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 25, style: { fill: '#64748b', fontSize: 10 } }} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(val: any, _name: any, props: any) => [
                    `${val} mm`,
                    props.payload.isPredicted ? 'Predicted Rainfall' : 'Historical Rainfall'
                  ]}
                />
                <Bar dataKey="rainfall" radius={[5, 5, 0, 0]} maxBarSize={32}>
                  {selectedLocation.annualData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isPredicted ? '#34d399' : '#60a5fa'} />
                  ))}
                  <LabelList dataKey="rainfall" position="top" style={{ fill: '#1e293b', fontSize: 10, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400"></span> Historical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400"></span> Predicted</span>
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
                <div className="text-xs font-semibold text-slate-500">Current Storage</div>
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
              <h2 className="text-base font-bold text-slate-900">Quick Insights & Recommendations</h2>
            </div>
            <button
              onClick={() => setActiveView('recommendations')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">Moderate Rainfall Expected</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed font-medium">
                  Around 3,800 – 4,200 L of rainwater can be collected in the next 7 days.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">Tank will reach 90% capacity</div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed font-medium">
                  Consider utilizing stored water or ensure overflow arrangements.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                <Droplet className="w-4 h-4 fill-blue-500/30" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900">Good Year Ahead</div>
                <div className="text-[11px] text-blue-700 mt-0.5 leading-relaxed font-medium">
                  Annual rainfall is predicted to be 6% higher than last year.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

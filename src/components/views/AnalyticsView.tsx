import React from 'react';
import {
  BarChart3,
  Award,
  DollarSign,
  Droplet,
  Percent,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { roofArea, runoffCoefficient, annualRainfallMm, weatherData, weatherStatus, selectedLocation } = useApp();

  const isLoading = weatherStatus === 'loading' || weatherStatus === 'idle';

  // Use live annual rainfall from context (resolved from API or fallback)
  const annualRain = annualRainfallMm;
  const totalAnnualHarvestedL = Math.round(annualRain * roofArea * runoffCoefficient);
  const costSavingsINR = Math.round((totalAnnualHarvestedL / 1000) * 85);
  const co2OffsetKg = Math.round((totalAnnualHarvestedL / 1000) * 0.45);
  const harvestEfficiencyPct = Math.round(runoffCoefficient * 100);

  // Build harvesting efficiency data from live monthly data (if available)
  const monthlyData = weatherData?.monthlyData ?? selectedLocation.monthlyData;

  const harvestingEfficiency = monthlyData.map(m => {
    const potentialL = Math.round(m.predicted * roofArea * runoffCoefficient);
    const harvestedL = Math.round(potentialL * runoffCoefficient);
    return {
      month: m.month,
      potential: potentialL,
      harvested: harvestedL,
    };
  });

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Performance &amp; Impact Dashboard
          </div>
          <h1 className="text-2xl font-black text-slate-900">Harvesting &amp; Sustainability Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quantitative analysis of rainwater collected, municipal water offset, and financial savings.
          </p>
        </div>
        {weatherData && (
          <div className="text-xs text-slate-400 font-medium self-start md:self-auto">
            Annual rainfall: <span className="font-bold text-slate-700">{annualRain.toLocaleString()} mm</span>{' '}
            <span className="text-blue-500">(Open-Meteo historical data)</span>
          </div>
        )}
      </div>

      {/* 4 KPI Cards for Sustainability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annual water conserved */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-blue-400/30" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Annual Water Conserved</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Calculating…</span></div>
              ) : (
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {totalAnnualHarvestedL.toLocaleString()} L
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {weatherData ? `Based on ${annualRain} mm historical rainfall` : 'Replaces municipal grid water'}
          </div>
        </div>

        {/* Cost savings */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Est. Cost Savings</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Calculating…</span></div>
              ) : (
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  ₹{costSavingsINR.toLocaleString()} /yr
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            ₹85/kL standard water tariff
          </div>
        </div>

        {/* Harvesting efficiency */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Runoff Capture Rate</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{harvestEfficiencyPct}%</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-600">
            Configured runoff coefficient
          </div>
        </div>

        {/* CO2 offset */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Carbon Offset</div>
              {isLoading ? (
                <div className="flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Calculating…</span></div>
              ) : (
                <div className="text-xl font-black text-slate-900 mt-0.5">{co2OffsetKg} kg CO₂</div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            Reduced pumping energy (0.45 kg/kL)
          </div>
        </div>
      </div>

      {/* Harvesting Efficiency Comparison Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Monthly Harvest Potential vs Captured Volume</h2>
        <p className="text-xs text-slate-500 mb-4">
          {weatherData
            ? 'Comparing theoretical yield vs. captured volume based on live historical monthly rainfall (Open-Meteo)'
            : 'Comparing total theoretical rainfall runoff vs actual stored volume (sample data)'}
        </p>

        <div className="h-72 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading historical data from Open-Meteo…</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={harvestingEfficiency} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(val: unknown) => [`${(val as number)?.toLocaleString()} L`]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                />
                <Bar dataKey="potential" name="Theoretical Yield (L)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="harvested" name="Captured Harvest (L)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
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

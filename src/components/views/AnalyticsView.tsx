import React from 'react';
import {
  BarChart3,
  Award,
  DollarSign,
  Droplet,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { roofArea, runoffCoefficient } = useApp();

  // Sustainability analytics math
  const annualRain = 810; // mm
  const totalAnnualHarvestedL = Math.round(annualRain * roofArea * runoffCoefficient);
  const costSavingsINR = Math.round((totalAnnualHarvestedL / 1000) * 85);
  const co2OffsetKg = Math.round((totalAnnualHarvestedL / 1000) * 0.45);

  const harvestingEfficiency = [
    { month: 'Jan', potential: 1440, harvested: 1300 },
    { month: 'Feb', potential: 2160, harvested: 1950 },
    { month: 'Mar', potential: 1920, harvested: 1780 },
    { month: 'Apr', potential: 4200, harvested: 3850 },
    { month: 'May', potential: 5760, harvested: 5200 },
    { month: 'Jun', potential: 16200, harvested: 15100 },
    { month: 'Jul', potential: 26400, harvested: 24800 },
    { month: 'Aug', potential: 16800, harvested: 15600 },
    { month: 'Sep', potential: 13800, harvested: 12900 },
    { month: 'Oct', potential: 7200, harvested: 6700 },
    { month: 'Nov', potential: 3000, harvested: 2800 },
    { month: 'Dec', potential: 1800, harvested: 1650 },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Performance & Impact Dashboard
          </div>
          <h1 className="text-2xl font-black text-slate-900">Harvesting & Sustainability Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quantitative analysis of rainwater collected, municipal water offset, and financial savings.
          </p>
        </div>
      </div>

      {/* 4 KPI Cards for Sustainability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-blue-400/30" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Annual Water Conserved</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {totalAnnualHarvestedL.toLocaleString()} L
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Replaces municipal grid water
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Est. Cost Savings</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                ₹{costSavingsINR.toLocaleString()} /yr
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            Based on standard water tariffs
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Harvesting Efficiency</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">93.4%</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-600">
            Optimal runoff capture rate
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Carbon Offset</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{co2OffsetKg} kg CO₂</div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">
            Reduced pumping energy
          </div>
        </div>
      </div>

      {/* Harvesting Efficiency Comparison Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Monthly Harvest Potential vs Captured Volume</h2>
        <p className="text-xs text-slate-500 mb-4">Comparing total theoretical rainfall runoff vs actual stored volume</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={harvestingEfficiency} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(val: any) => [`${val?.toLocaleString()} L`]} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }} />
              <Bar dataKey="potential" name="Theoretical Yield (L)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="harvested" name="Captured Harvest (L)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

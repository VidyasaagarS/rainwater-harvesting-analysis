import React, { useState } from 'react';
import {
  ShieldCheck,
  CloudRain,
  Droplet,
  Info,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecommendationsView: React.FC = () => {
  const {
    selectedLocation,
    tankPercentage,
    currentStorage,
    tankCapacity,
    setActiveView
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const recommendationsList = [
    {
      id: 'rec-1',
      category: 'forecast',
      type: 'warning',
      icon: <CloudRain className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/80 border-amber-200',
      title: 'Heavy Rain Spell Incoming & Overflow Advisory',
      description: `Predicted 7-day rainfall for ${selectedLocation.name} is ${selectedLocation.predicted7Days} mm. Your tank is currently at ${tankPercentage}% capacity (${currentStorage} L / ${tankCapacity} L).`,
      actionText: 'Prepare Overflow Recharge Well',
      action: () => setActiveView('storage'),
    },
    {
      id: 'rec-2',
      category: 'storage',
      type: 'info',
      icon: <Droplet className="w-5 h-5 text-blue-600 fill-blue-400/30" />,
      bg: 'bg-blue-50/80 border-blue-200',
      title: 'Non-Potable Water Utilization Opportunity',
      description: 'High storage levels available. Utilize stored rainwater for gardening, vehicle washing, and floor cleaning to conserve municipal supply.',
      actionText: 'View Water Usage Details',
      action: () => setActiveView('storage'),
    },
    {
      id: 'rec-3',
      category: 'maintenance',
      type: 'success',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-200',
      title: 'Pre-Monsoon Catchment Maintenance Check',
      description: 'Clean roof gutters, remove debris, and flush the first-flush diverter pipe before the next major rainfall event to ensure optimal water quality.',
      actionText: 'Run Water Calculator Test',
      action: () => setActiveView('calculator'),
    },
    {
      id: 'rec-4',
      category: 'conservation',
      type: 'info',
      icon: <Info className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/80 border-indigo-200',
      title: 'Long-Term Groundwater Recharge Potential',
      description: 'Surplus harvested water can be redirected to a percolation pit to improve local water table levels during dry months.',
      actionText: 'Open Analytics Dashboard',
      action: () => setActiveView('analytics'),
    },
  ];

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
            Actionable environmental guidance synthesized from rainfall forecasts, storage status, and consumption metrics.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Recommendations
          </button>
          <button
            onClick={() => setActiveCategory('forecast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'forecast' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rainfall Alert
          </button>
          <button
            onClick={() => setActiveCategory('storage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'storage' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Storage Utilization
          </button>
          <button
            onClick={() => setActiveCategory('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'maintenance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maintenance
          </button>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => (
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
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  Save,
  MapPin,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    selectedLocation,
    setSelectedLocationId,
    locationsList
  } = useApp();

  const [form, setForm] = useState({
    locationId: selectedLocation.id,
    roofArea: settings.roofArea,
    tankCapacity: settings.tankCapacity,
    runoffCoefficient: settings.runoffCoefficient,
    roofType: settings.roofType,
    residentsCount: settings.residentsCount,
    dailyRequirementPerPerson: settings.dailyRequirementPerPerson,
    rainfallUnit: settings.rainfallUnit,
    volumeUnit: settings.volumeUnit,
    enableNotifications: settings.enableNotifications,
    autoUpdateStorage: settings.autoUpdateStorage,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLocationId(form.locationId);
    updateSettings({
      locationId: form.locationId,
      roofArea: form.roofArea,
      tankCapacity: form.tankCapacity,
      runoffCoefficient: form.runoffCoefficient,
      roofType: form.roofType,
      residentsCount: form.residentsCount,
      dailyRequirementPerPerson: form.dailyRequirementPerPerson,
      rainfallUnit: form.rainfallUnit,
      volumeUnit: form.volumeUnit,
      enableNotifications: form.enableNotifications,
      autoUpdateStorage: form.autoUpdateStorage,
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-slate-600" /> System Configuration
        </div>
        <h1 className="text-2xl font-black text-slate-900">Application & Facility Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your default catchment properties, storage tank capacity, units, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Location & Catchment Properties */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-blue-600" /> Location & Facility Setup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Monitoring Location
              </label>
              <select
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {locationsList.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}, {loc.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Roof Area (m²)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={form.roofArea}
                onChange={(e) => setForm({ ...form, roofArea: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Storage Tank Capacity (L)
              </label>
              <input
                type="number"
                min="500"
                max="100000"
                step="500"
                value={form.tankCapacity}
                onChange={(e) => setForm({ ...form, tankCapacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Runoff Coefficient (0.3 - 0.95)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.3"
                max="0.95"
                value={form.runoffCoefficient}
                onChange={(e) => setForm({ ...form, runoffCoefficient: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Water Demand & Consumption */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-emerald-600" /> Household Demand Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Number of Occupants
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.residentsCount}
                onChange={(e) => setForm({ ...form, residentsCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Daily Usage per Person (L/day)
              </label>
              <input
                type="number"
                min="20"
                max="1000"
                value={form.dailyRequirementPerPerson}
                onChange={(e) => setForm({ ...form, dailyRequirementPerPerson: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-98"
        >
          <Save className="w-5 h-5" /> Save Configuration
        </button>
      </form>
    </div>
  );
};

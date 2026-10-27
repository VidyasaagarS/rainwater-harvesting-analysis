import React, { useState } from 'react';
import {
  Calculator,
  RotateCcw,
  Droplet,
  Home,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const CalculatorView: React.FC = () => {
  const {
    roofArea: globalRoofArea,
    setRoofArea: setGlobalRoofArea,
    tankCapacity: globalTankCapacity,
    setTankCapacity: setGlobalTankCapacity,
    runoffCoefficient: globalRunoff,
    setRunoffCoefficient: setGlobalRunoff,
    predictedRainfallForCalc: globalRain,
    setPredictedRainfallForCalc: setGlobalRain,
    currentStorage,
    showToast,
    setActiveView
  } = useApp();

  const ROOF_TYPES = [
    { label: 'Concrete Tile / Flat Roof', coefficient: 0.8 },
    { label: 'Corrugated Metal Sheet', coefficient: 0.9 },
    { label: 'Asphalt Shingle', coefficient: 0.7 },
    { label: 'Glazed Clay Tile', coefficient: 0.85 },
    { label: 'Vegetated / Green Roof', coefficient: 0.5 },
  ];

  // Local Form State
  const [localRoofArea, setLocalRoofArea] = useState<number>(globalRoofArea);
  const [localRoofType, setLocalRoofType] = useState<string>('Concrete Tile / Flat Roof');
  const [localRunoff, setLocalRunoff] = useState<number>(globalRunoff);
  const [localRainfall, setLocalRainfall] = useState<number>(globalRain);
  const [localTankCap, setLocalTankCap] = useState<number>(globalTankCapacity);
  const [residents, setResidents] = useState<number>(4);
  const [usagePerPerson, setUsagePerPerson] = useState<number>(150);

  const handleRoofTypeChange = (typeName: string) => {
    setLocalRoofType(typeName);
    const found = ROOF_TYPES.find(r => r.label === typeName);
    if (found) {
      setLocalRunoff(found.coefficient);
    }
  };

  // Calculations
  const potentialHarvested = Math.round(localRainfall * localRoofArea * localRunoff);
  const totalWaterInTank = currentStorage + potentialHarvested;
  const tankFillPct = Math.min(100, Math.round((totalWaterInTank / localTankCap) * 100));
  const remainingCap = Math.max(0, localTankCap - totalWaterInTank);
  const overflowQty = Math.max(0, totalWaterInTank - localTankCap);

  const annualRainfallEst = 810;
  const annualCollectionEst = Math.round(annualRainfallEst * localRoofArea * localRunoff);

  const dailyRequirement = residents * usagePerPerson;
  const daysAvailable = dailyRequirement > 0 ? (totalWaterInTank / dailyRequirement).toFixed(1) : '0';

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalRoofArea(localRoofArea);
    setGlobalTankCapacity(localTankCap);
    setGlobalRunoff(localRunoff);
    setGlobalRain(localRainfall);
    
    // Trigger festive confetti celebrate effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast('Calculations updated and synced across dashboard!');
  };

  const handleReset = () => {
    setLocalRoofArea(150);
    setLocalRoofType('Concrete Tile / Flat Roof');
    setLocalRunoff(0.8);
    setLocalRainfall(80);
    setLocalTankCap(5000);
    setResidents(4);
    setUsagePerPerson(150);
    
    setGlobalRoofArea(150);
    setGlobalTankCapacity(5000);
    setGlobalRunoff(0.8);
    setGlobalRain(80);
    showToast('Calculator reset to default parameters');
  };

  return (
    <div className="space-y-6 px-4 sm:px-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" /> Interactive Yield Estimator
          </div>
          <h1 className="text-2xl font-black text-slate-900">Rainwater Harvest Potential Calculator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculate your roof's rainwater collection capacity using standard hydrology runoff formulas.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-bold transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> Reset Form
        </button>
      </div>

      {/* Main Grid: Inputs Form & Results Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS FORM */}
        <form onSubmit={handleCalculate} className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Home className="w-5 h-5 text-blue-600" /> Catchment & Facility Inputs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Roof Area (m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={localRoofArea}
                  onChange={(e) => setLocalRoofArea(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">m²</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Roof Surface Material
              </label>
              <select
                value={localRoofType}
                onChange={(e) => handleRoofTypeChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {ROOF_TYPES.map((rt) => (
                  <option key={rt.label} value={rt.label}>
                    {rt.label} (C = {rt.coefficient})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Runoff Coefficient (C)
                </label>
                <span className="text-xs font-extrabold text-blue-600">{localRunoff}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={localRunoff}
                onChange={(e) => setLocalRunoff(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>0.3 (Absorbent)</span>
                <span>0.95 (Impervious)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rainfall Event (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={localRainfall}
                  onChange={(e) => setLocalRainfall(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">mm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Storage Tank Capacity (L)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="500000"
                  step="500"
                  value={localTankCap}
                  onChange={(e) => setLocalTankCap(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">L</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Number of Residents
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={residents}
                onChange={(e) => setResidents(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5 text-amber-300" /> Calculate Collection Potential
          </button>
        </form>

        {/* RESULTS SUMMARY DISPLAY */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Droplet className="w-5 h-5 text-emerald-600 fill-emerald-500/20" /> Calculation Results
            </h2>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-2xl shadow-lg mt-4 relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Potential Water Collection
              </div>
              <div className="text-3xl font-black mt-1">
                {potentialHarvested.toLocaleString()} Litres
              </div>
              <div className="text-xs text-emerald-100 mt-2 font-medium">
                Formula: {localRainfall} mm &times; {localRoofArea} m² &times; {localRunoff}
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Tank Fill Level</span>
                <span className="text-sm font-extrabold text-slate-900">{tankFillPct}%</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Remaining Capacity</span>
                <span className="text-sm font-extrabold text-slate-900">{remainingCap.toLocaleString()} L</span>
              </div>

              {overflowQty > 0 && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Estimated Overflow
                  </span>
                  <span className="text-sm font-black text-amber-700">{overflowQty.toLocaleString()} L</span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Est. Annual Collection</span>
                <span className="text-sm font-extrabold text-blue-600">{annualCollectionEst.toLocaleString()} L/yr</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Water Available Duration</span>
                <span className="text-sm font-extrabold text-emerald-600">{daysAvailable} days</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
          >
            Apply to Main Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

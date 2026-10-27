import React, { createContext, useContext, useState } from 'react';
import type { LocationData, SystemSettings, ViewMode } from '../types';
import { LOCATIONS_DATA, DEFAULT_SETTINGS } from '../data/mockData';

interface AppContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  selectedLocation: LocationData;
  setSelectedLocationId: (id: string) => void;
  locationsList: LocationData[];
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  
  // Dynamic calculation metrics
  roofArea: number;
  setRoofArea: (val: number) => void;
  tankCapacity: number;
  setTankCapacity: (val: number) => void;
  runoffCoefficient: number;
  setRunoffCoefficient: (val: number) => void;
  predictedRainfallForCalc: number;
  setPredictedRainfallForCalc: (val: number) => void;
  currentStorage: number;
  setCurrentStorage: (val: number) => void;
  dailyWaterRequirement: number;
  setDailyWaterRequirement: (val: number) => void;

  // Calculated values
  expectedCollection: number; // L
  tankPercentage: number; // %
  remainingCapacity: number; // L
  waterAvailableDays: number; // Days

  // Dashboard forecast tab
  forecastTab: string;
  setForecastTab: (tab: string) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('rwh_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [selectedLocationId, setSelectedLocationIdState] = useState<string>(settings.locationId);
  
  const selectedLocation = LOCATIONS_DATA.find(l => l.id === selectedLocationId) || LOCATIONS_DATA[0];

  // Dynamic parameters
  const [roofArea, setRoofArea] = useState<number>(settings.roofArea);
  const [tankCapacity, setTankCapacity] = useState<number>(settings.tankCapacity);
  const [runoffCoefficient, setRunoffCoefficient] = useState<number>(settings.runoffCoefficient);
  const [predictedRainfallForCalc, setPredictedRainfallForCalc] = useState<number>(selectedLocation.predictedRainfallForCalc || 80);
  const [currentStorage, setCurrentStorage] = useState<number>(selectedLocation.currentStorage || 3250);
  const [dailyWaterRequirement, setDailyWaterRequirement] = useState<number>(selectedLocation.dailyWaterRequirement || 600);
  
  const [forecastTab, setForecastTab] = useState<string>('Next 7 Days');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync when location changes
  const setSelectedLocationId = (id: string) => {
    setSelectedLocationIdState(id);
    const loc = LOCATIONS_DATA.find(l => l.id === id);
    if (loc) {
      setPredictedRainfallForCalc(loc.predictedRainfallForCalc);
      setCurrentStorage(loc.currentStorage);
      setDailyWaterRequirement(loc.dailyWaterRequirement);
      showToast(`Location changed to ${loc.name}, ${loc.state}`);
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('rwh_settings', JSON.stringify(updated));
      return updated;
    });
    if (newSettings.roofArea !== undefined) setRoofArea(newSettings.roofArea);
    if (newSettings.tankCapacity !== undefined) setTankCapacity(newSettings.tankCapacity);
    if (newSettings.runoffCoefficient !== undefined) setRunoffCoefficient(newSettings.runoffCoefficient);
    showToast('Settings saved successfully!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Derived formulas
  const expectedCollection = Math.round(predictedRainfallForCalc * roofArea * runoffCoefficient);
  const tankPercentage = Math.min(100, Math.round((currentStorage / tankCapacity) * 100));
  const remainingCapacity = Math.max(0, tankCapacity - currentStorage);
  
  const waterAvailableDays = dailyWaterRequirement > 0 
    ? Number((currentStorage / dailyWaterRequirement).toFixed(1)) 
    : 0;

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedLocation,
        setSelectedLocationId,
        locationsList: LOCATIONS_DATA,
        settings,
        updateSettings,
        roofArea,
        setRoofArea,
        tankCapacity,
        setTankCapacity,
        runoffCoefficient,
        setRunoffCoefficient,
        predictedRainfallForCalc,
        setPredictedRainfallForCalc,
        currentStorage,
        setCurrentStorage,
        dailyWaterRequirement,
        setDailyWaterRequirement,
        expectedCollection,
        tankPercentage,
        remainingCapacity,
        waterAvailableDays,
        forecastTab,
        setForecastTab,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

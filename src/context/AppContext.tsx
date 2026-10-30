import React, { createContext, useContext, useState, useMemo } from 'react';
import type { LocationData, SystemSettings, ViewMode } from '../types';
import { LOCATIONS_DATA, DEFAULT_SETTINGS } from '../data/mockData';
import { useWeatherData, type UseWeatherDataResult } from '../hooks/useWeatherData';
import type { WeatherApiResult } from '../services/weatherService';

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

  // ── Live weather data ──────────────────────────────────────────────────
  weatherData: WeatherApiResult | null;
  weatherStatus: UseWeatherDataResult['status'];
  weatherError: string | null;
  weatherIsStale: boolean;
  weatherLastFetched: Date | null;
  refreshWeather: () => void;

  // Resolved values (live data when available, fallback to sample values)
  liveRainfallToday: number;      // mm
  liveTotal7DayRainfall: number;  // mm

  // Annual rainfall total for analytics (mm) — from historical API or mock
  annualRainfallMm: number;
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
  const [currentStorage, setCurrentStorage] = useState<number>(() => {
    // Persist tank level across page refreshes
    const saved = localStorage.getItem(`rwh_tank_${selectedLocationId}`);
    return saved ? Number(saved) : (selectedLocation.currentStorage || 3250);
  });
  const [dailyWaterRequirement, setDailyWaterRequirement] = useState<number>(selectedLocation.dailyWaterRequirement || 600);
  
  const [forecastTab, setForecastTab] = useState<string>('Next 7 Days');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Weather coords derived from selected location
  const weatherCoords = useMemo(() => ({
    lat: selectedLocation.lat,
    lon: selectedLocation.lon,
    timezone: selectedLocation.timezone,
  }), [selectedLocation.lat, selectedLocation.lon, selectedLocation.timezone]);

  // Live weather data hook
  const {
    weatherData,
    status: weatherStatus,
    errorMessage: weatherError,
    isStale: weatherIsStale,
    lastFetched: weatherLastFetched,
    refresh: refreshWeather,
  } = useWeatherData(selectedLocationId, weatherCoords);

  // Sync when location changes
  const setSelectedLocationId = (id: string) => {
    setSelectedLocationIdState(id);
    const loc = LOCATIONS_DATA.find(l => l.id === id);
    if (loc) {
      setPredictedRainfallForCalc(loc.predictedRainfallForCalc);
      // Load persisted tank level for new location
      const saved = localStorage.getItem(`rwh_tank_${id}`);
      setCurrentStorage(saved ? Number(saved) : loc.currentStorage);
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

  // Persist tank level on change
  const setCurrentStoragePersisted = (val: number) => {
    setCurrentStorage(val);
    localStorage.setItem(`rwh_tank_${selectedLocationId}`, String(val));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ── Resolved live vs. fallback values ────────────────────────────────

  // Rainfall today: use live daily[0] value, else fallback
  const liveRainfallToday = weatherData?.current.precipitationToday
    ?? selectedLocation.rainfallToday;

  // 7-day total from live data, else fallback
  const liveTotal7DayRainfall = weatherData?.total7DayRainfall
    ?? selectedLocation.predicted7Days;

  // Annual rainfall for analytics (sum of last full year, or most recent historical, or fallback)
  const annualRainfallMm = useMemo(() => {
    if (weatherData?.annualData && weatherData.annualData.length > 0) {
      // Use the most recent non-predicted year
      const hist = weatherData.annualData.filter(a => !a.isPredicted);
      if (hist.length > 0) return hist[hist.length - 1].rainfall;
    }
    // Fallback: last non-predicted entry in mock data
    const mockHist = selectedLocation.annualData.filter(a => !a.isPredicted);
    return mockHist.length > 0 ? mockHist[mockHist.length - 1].rainfall : 810;
  }, [weatherData, selectedLocation]);

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
        setCurrentStorage: setCurrentStoragePersisted,
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
        // Live weather
        weatherData,
        weatherStatus,
        weatherError,
        weatherIsStale,
        weatherLastFetched,
        refreshWeather,
        // Resolved values
        liveRainfallToday,
        liveTotal7DayRainfall,
        annualRainfallMm,
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

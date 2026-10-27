export type ViewMode = 
  | 'dashboard'
  | 'forecast'
  | 'calculator'
  | 'storage'
  | 'analytics'
  | 'recommendations'
  | 'settings';

export interface LocationData {
  id: string;
  name: string;
  state: string;
  rainfallToday: number; // mm
  predicted7Days: number; // mm
  trendPercent: number;
  expectedCollection: number; // L
  roofArea: number; // m2
  predictedRainfallForCalc: number; // mm
  runoffCoefficient: number;
  dailyWaterRequirement: number; // L/day
  currentStorage: number; // L
  tankCapacity: number; // L
  
  // Forecast 7 Days (mm)
  forecast7Days: { date: string; rainfall: number }[];

  // 30 Days Forecast summary
  forecast30Days: { period: string; rainfall: number }[];

  // Yearly monthly averages and predictions
  monthlyData: { month: string; historical: number; predicted: number }[];

  // Annual comparison data
  annualData: { year: string; rainfall: number; isPredicted?: boolean }[];

  // 5-Year Projection
  projection5Years: { year: string; rainfall: number }[];
}

export interface SystemSettings {
  locationId: string;
  roofArea: number; // m2
  tankCapacity: number; // L
  runoffCoefficient: number;
  roofType: string;
  residentsCount: number;
  dailyRequirementPerPerson: number; // L
  rainfallUnit: 'mm' | 'in';
  volumeUnit: 'L' | 'Gal';
  enableNotifications: boolean;
  autoUpdateStorage: boolean;
}

export interface RecommendationItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  iconName: 'rain' | 'warning' | 'water' | 'shield' | 'check';
  category: 'forecast' | 'storage' | 'maintenance' | 'conservation';
}

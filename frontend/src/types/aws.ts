export type AnomalyType = 
  | 'CLOUDBURST_RISK'
  | 'FLASH_FLOOD_PRECURSOR'
  | 'SENSOR_FREEZE'
  | 'PRECIP_GAUGE_BLOCKAGE'
  | 'PRESSURE_SPIKE'
  | 'BATTERY_DRAIN_FAULT'
  | 'WIND_GUST_EXTREME'
  | 'NORMAL';

export type StationStatus = 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE' | 'OFFLINE';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'UNASSIGNED' | 'TRIAGE' | 'ESCALATED' | 'RESOLVED';

export interface SHAPFeature {
  featureName: string;
  value: number;
  shapValue: number;
  unit: string;
}

export interface WeatherReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  rainfallRate: number;
  windSpeed: number;
  windDirection: number;
  solarRadiation: number;
  batteryVoltage: number;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  elevation: number;
  district: string;
  state: string;
  status: StationStatus;
  healthScore: number;
  lastSeen: string;
  currentReading: WeatherReading;
  activeAnomalyCount: number;
}

export interface AnomalyEvent {
  id: string;
  stationId: string;
  stationName: string;
  district: string;
  timestamp: string;
  type: AnomalyType;
  severity: AlertSeverity;
  confidenceScore: number;
  isMeteorologicalExtreme: boolean;
  shapFeatures: SHAPFeature[];
  description: string;
  recommendedAction: string;
  status: AlertStatus;
  assignedTo?: string;
}

export interface SystemMetrics {
  totalStations: number;
  activeStations: number;
  warningStations: number;
  criticalStations: number;
  activeAnomaliesCount: number;
  unresolvedAlertsCount: number;
  avgHealthScore: number;
  telemetryIngestionRate: number;
  modelAccuracyF1: number;
}

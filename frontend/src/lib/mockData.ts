import { Station, AnomalyEvent, SystemMetrics } from '../types/aws';

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'AWS-IND-01',
    name: 'Kedarnath High-Altitude AWS',
    code: 'AWS-KED-01',
    latitude: 30.7346,
    longitude: 79.0669,
    elevation: 3583,
    district: 'Rudraprayag',
    state: 'Uttarakhand',
    status: 'CRITICAL',
    healthScore: 74.5,
    lastSeen: 'Just now',
    currentReading: {
      timestamp: new Date().toISOString(),
      temperature: 4.2,
      humidity: 98,
      pressure: 685.2,
      rainfallRate: 112.4,
      windSpeed: 64.5,
      windDirection: 215,
      solarRadiation: 45,
      batteryVoltage: 12.1
    },
    activeAnomalyCount: 2
  },
  {
    id: 'AWS-IND-02',
    name: 'Mawsynram Station East',
    code: 'AWS-MAW-04',
    latitude: 25.2975,
    longitude: 91.5826,
    elevation: 1400,
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    status: 'WARNING',
    healthScore: 88.0,
    lastSeen: 'Just now',
    currentReading: {
      timestamp: new Date().toISOString(),
      temperature: 19.4,
      humidity: 99,
      pressure: 852.1,
      rainfallRate: 84.2,
      windSpeed: 28.1,
      windDirection: 140,
      solarRadiation: 80,
      batteryVoltage: 12.8
    },
    activeAnomalyCount: 1
  },
  {
    id: 'AWS-IND-03',
    name: 'Wayanad Ghat AWS',
    code: 'AWS-WAY-02',
    latitude: 11.6854,
    longitude: 76.132,
    elevation: 950,
    district: 'Wayanad',
    state: 'Kerala',
    status: 'CRITICAL',
    healthScore: 68.2,
    lastSeen: 'Just now',
    currentReading: {
      timestamp: new Date().toISOString(),
      temperature: 23.8,
      humidity: 96,
      pressure: 902.5,
      rainfallRate: 96.0,
      windSpeed: 42.0,
      windDirection: 270,
      solarRadiation: 110,
      batteryVoltage: 11.6
    },
    activeAnomalyCount: 2
  },
  {
    id: 'AWS-IND-04',
    name: 'Shimla Ridge Observatory',
    code: 'AWS-SHM-01',
    latitude: 31.1048,
    longitude: 77.1734,
    elevation: 2276,
    district: 'Shimla',
    state: 'Himachal Pradesh',
    status: 'ACTIVE',
    healthScore: 96.4,
    lastSeen: 'Just now',
    currentReading: {
      timestamp: new Date().toISOString(),
      temperature: 12.5,
      humidity: 78,
      pressure: 775.8,
      rainfallRate: 4.2,
      windSpeed: 14.8,
      windDirection: 180,
      solarRadiation: 420,
      batteryVoltage: 13.4
    },
    activeAnomalyCount: 0
  }
];

export const INITIAL_ANOMALIES: AnomalyEvent[] = [
  {
    id: 'ANOM-2026-8801',
    stationId: 'AWS-IND-01',
    stationName: 'Kedarnath High-Altitude AWS',
    district: 'Rudraprayag',
    timestamp: '2 mins ago',
    type: 'CLOUDBURST_RISK',
    severity: 'CRITICAL',
    confidenceScore: 0.97,
    isMeteorologicalExtreme: true,
    description: 'Cloudburst imminent: Intense microburst rain rate detected (112.4 mm/hr) with rapid pressure plunge (-4.8 hPa/15min).',
    recommendedAction: 'Trigger Evacuation Level 3 for Mandakini River Basin downstream settlements.',
    status: 'UNASSIGNED',
    shapFeatures: [
      { featureName: 'Rainfall Rate (10m)', value: 112.4, shapValue: +0.48, unit: 'mm/hr' },
      { featureName: 'Pressure Drop Rate', value: -4.8, shapValue: +0.28, unit: 'hPa/15m' },
      { featureName: 'Wind Gust Velocity', value: 64.5, shapValue: +0.12, unit: 'km/h' }
    ]
  },
  {
    id: 'ANOM-2026-8802',
    stationId: 'AWS-IND-03',
    stationName: 'Wayanad Ghat AWS',
    district: 'Wayanad',
    timestamp: '5 mins ago',
    type: 'FLASH_FLOOD_PRECURSOR',
    severity: 'CRITICAL',
    confidenceScore: 0.94,
    isMeteorologicalExtreme: true,
    description: 'Sustained severe precipitation (96.0 mm/hr) exceeding 3-hour soil saturation threshold.',
    recommendedAction: 'Issue landslide and river inundation red alert for Meppadi & Vythiri regions.',
    status: 'TRIAGE',
    assignedTo: 'Dr. A. Nair (Senior Hydrologist)',
    shapFeatures: [
      { featureName: 'Sustained Rain Volume', value: 245.0, shapValue: +0.52, unit: 'mm/3h' },
      { featureName: 'Rainfall Intensity', value: 96.0, shapValue: +0.26, unit: 'mm/hr' }
    ]
  }
];

export const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  totalStations: 248,
  activeStations: 236,
  warningStations: 8,
  criticalStations: 4,
  activeAnomaliesCount: 6,
  unresolvedAlertsCount: 3,
  avgHealthScore: 92.4,
  telemetryIngestionRate: 1840,
  modelAccuracyF1: 98.7
};

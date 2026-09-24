'use client';

import { useState, useEffect, useCallback } from 'react';
import { Station, AnomalyEvent, SystemMetrics, WeatherReading } from '../types/aws';
import { INITIAL_STATIONS, INITIAL_ANOMALIES, INITIAL_SYSTEM_METRICS } from '../lib/mockData';

export function useSocketStream() {
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(INITIAL_ANOMALIES);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM_METRICS);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastTickTime, setLastTickTime] = useState<string>('Just now');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-IND-01');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastTickTime(new Date().toLocaleTimeString());

      setStations((prevStations) =>
        prevStations.map((st) => {
          const tempDelta = (Math.random() - 0.5) * 0.2;
          const rainDelta = st.status === 'CRITICAL' ? (Math.random() - 0.4) * 2.0 : (Math.random() - 0.4) * 0.1;
          const windDelta = (Math.random() - 0.5) * 0.8;
          const pressureDelta = (Math.random() - 0.5) * 0.1;

          const updatedReading: WeatherReading = {
            ...st.currentReading,
            timestamp: new Date().toISOString(),
            temperature: parseFloat(Math.max(-10, Math.min(50, st.currentReading.temperature + tempDelta)).toFixed(1)),
            rainfallRate: parseFloat(Math.max(0, st.currentReading.rainfallRate + rainDelta).toFixed(1)),
            windSpeed: parseFloat(Math.max(0, st.currentReading.windSpeed + windDelta).toFixed(1)),
            pressure: parseFloat((st.currentReading.pressure + pressureDelta).toFixed(1))
          };

          return {
            ...st,
            currentReading: updatedReading
          };
        })
      );

      setMetrics((prev) => ({
        ...prev,
        telemetryIngestionRate: 1800 + Math.floor(Math.random() * 90)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAnomaly = useCallback((anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((anom) =>
        anom.id === anomalyId ? { ...anom, status: 'TRIAGE', assignedTo: 'Current Controller' } : anom
      )
    );
  }, []);

  const resolveAnomaly = useCallback((anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((anom) =>
        anom.id === anomalyId ? { ...anom, status: 'RESOLVED' } : anom
      )
    );
  }, []);

  const escalateAnomaly = useCallback((anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((anom) =>
        anom.id === anomalyId ? { ...anom, status: 'ESCALATED' } : anom
      )
    );
    setEmergencyMode(true);
  }, []);

  const injectSimulatedAnomaly = useCallback((type: string) => {
    const targetStation = stations[Math.floor(Math.random() * stations.length)];
    const newAnomaly: AnomalyEvent = {
      id: `ANOM-LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
      stationId: targetStation.id,
      stationName: targetStation.name,
      district: targetStation.district,
      timestamp: 'Just now',
      type: type as any,
      severity: 'CRITICAL',
      confidenceScore: 0.98,
      isMeteorologicalExtreme: true,
      description: `Simulated anomaly triggered: ${type.replace(/_/g, ' ')} detected on ${targetStation.name}.`,
      recommendedAction: 'Immediate triage required. Deploy emergency advisory.',
      status: 'UNASSIGNED',
      shapFeatures: [
        { featureName: 'Precipitation Spike Rate', value: 104.5, shapValue: +0.55, unit: 'mm/hr' },
        { featureName: 'Pressure Dip Delta', value: -5.2, shapValue: +0.31, unit: 'hPa' }
      ]
    };

    setAnomalies((prev) => [newAnomaly, ...prev]);
    setEmergencyMode(true);
  }, [stations]);

  return {
    stations,
    anomalies,
    metrics,
    isConnected,
    lastTickTime,
    soundEnabled,
    setSoundEnabled,
    emergencyMode,
    setEmergencyMode,
    selectedStationId,
    setSelectedStationId,
    acknowledgeAnomaly,
    resolveAnomaly,
    escalateAnomaly,
    injectSimulatedAnomaly
  };
}

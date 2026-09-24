'use client';

import React, { useState, useEffect } from 'react';
import { Station, WeatherReading } from '../../types/aws';
import { 
  Activity, 
  CloudRain, 
  Wind, 
  Gauge, 
  Thermometer, 
  BatteryCharging, 
  Zap
} from 'lucide-react';

interface RealTimeStreamProps {
  stations: Station[];
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  lastTickTime: string;
}

export const RealTimeStream: React.FC<RealTimeStreamProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  lastTickTime
}) => {
  const currentStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const [history, setHistory] = useState<WeatherReading[]>([]);

  useEffect(() => {
    if (currentStation) {
      setHistory((prev) => {
        const nextBuffer = [...prev, currentStation.currentReading];
        return nextBuffer.slice(-20);
      });
    }
  }, [currentStation?.currentReading?.timestamp]);

  const latestReading = currentStation.currentReading;

  const renderSparkline = (dataKey: keyof WeatherReading, strokeHex: string) => {
    if (history.length < 2) return null;
    const values = history.map((h) => Number(h[dataKey]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values) || min + 1;
    const width = 400;
    const height = 100;

    const points = values
      .map((val, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((val - min) / (max - min || 1)) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        <line x1="0" y1="25" x2={width} y2="25" stroke="#e2e8f0" strokeDasharray="3 3" />
        <line x1="0" y1="50" x2={width} y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
        <line x1="0" y1="75" x2={width} y2="75" stroke="#e2e8f0" strokeDasharray="3 3" />

        <polyline
          fill="none"
          stroke={strokeHex}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Station Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-200">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{currentStation.name}</span>
                <span className="text-xs font-mono bg-slate-100 text-sky-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
                  {currentStation.code}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                District: {currentStation.district}, {currentStation.state} • Elev: {currentStation.elevation}m
              </p>
            </div>
          </div>
        </div>

        {/* Station Dropdown selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-500 font-mono">Select AWS Node:</label>
          <select
            value={selectedStationId}
            onChange={(e) => onSelectStation(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500 font-mono shadow-xs"
          >
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.code}) - [{st.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensor Parameter Streaming Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Param 1: Precipitation / Rainfall */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 text-sky-600">
              <CloudRain className="w-4 h-4 text-sky-600" /> Rain Rate
            </span>
            <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold">
              LIVE 2s
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{latestReading.rainfallRate}</span>
            <span className="text-xs font-mono text-slate-500">mm/hr</span>
          </div>
          <div className="pt-2">
            {renderSparkline('rainfallRate', '#0284c7')}
          </div>
        </div>

        {/* Param 2: Wind Speed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 text-emerald-600">
              <Wind className="w-4 h-4 text-emerald-600" /> Wind Speed
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {latestReading.windDirection}° Vector
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{latestReading.windSpeed}</span>
            <span className="text-xs font-mono text-slate-500">km/h</span>
          </div>
          <div className="pt-2">
            {renderSparkline('windSpeed', '#16a34a')}
          </div>
        </div>

        {/* Param 3: Barometric Pressure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 text-amber-600">
              <Gauge className="w-4 h-4 text-amber-600" /> Barometric Pressure
            </span>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">
              QNH Delta
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{latestReading.pressure}</span>
            <span className="text-xs font-mono text-slate-500">hPa</span>
          </div>
          <div className="pt-2">
            {renderSparkline('pressure', '#d97706')}
          </div>
        </div>

        {/* Param 4: Temperature & Humidity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 text-blue-600">
              <Thermometer className="w-4 h-4 text-blue-600" /> Ambient Temp
            </span>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
              RH {latestReading.humidity}%
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{latestReading.temperature}</span>
            <span className="text-xs font-mono text-slate-500">°C</span>
          </div>
          <div className="pt-2">
            {renderSparkline('temperature', '#2563eb')}
          </div>
        </div>

      </div>

      {/* Streaming Diagnostics & Anomaly Confidence Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ML Real-time Inference Gauge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            ML Live Anomaly Confidence Score
          </h3>
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="inline-flex items-center justify-center p-6 rounded-full bg-white border-4 border-emerald-500 text-3xl font-bold font-mono text-emerald-600 shadow-sm">
              {currentStation.status === 'CRITICAL' ? '97.4%' : currentStation.status === 'WARNING' ? '82.1%' : '4.2%'}
            </div>
            
            <p className="text-xs font-mono text-slate-800 font-semibold">
              {currentStation.status === 'CRITICAL' 
                ? '⚠️ ANOMALY DETECTED: Cloudburst & Pressure Drop'
                : currentStation.status === 'WARNING'
                ? '⚡ WARN: High wind gust surge detected'
                : '✅ Station Operating Within Safety Bounds'}
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-600">
            <div className="flex justify-between">
              <span>Isolation Forest Score:</span>
              <span className="text-slate-900 font-bold">0.892</span>
            </div>
            <div className="flex justify-between">
              <span>LSTM Prediction Residual:</span>
              <span className="text-slate-900 font-bold">+3.4σ</span>
            </div>
            <div className="flex justify-between">
              <span>Model Classification:</span>
              <span className="text-emerald-600 font-bold">Meteorological Extreme</span>
            </div>
          </div>
        </div>

        {/* Station Telemetry & Hardware Diagnostics */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-emerald-600" />
            Hardware & Enclosure Diagnostics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Battery Voltage</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{latestReading.batteryVoltage} V</p>
              <span className="text-[10px] text-emerald-600 font-bold">Optimal Range</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Solar Radiation</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{latestReading.solarRadiation} W/m²</p>
              <span className="text-[10px] text-sky-600 font-bold">Active Solar Charge</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Station Health</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">{currentStation.healthScore}%</p>
              <span className="text-[10px] text-slate-500">Verified Calibration</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500">Signal RSSI</span>
              <p className="text-lg font-bold text-slate-900 mt-1">-68 dBm</p>
              <span className="text-[10px] text-emerald-600 font-bold">4G LTE Connection</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

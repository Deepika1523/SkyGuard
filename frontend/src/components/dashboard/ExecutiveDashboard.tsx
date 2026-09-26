'use client';

import React, { useState } from 'react';
import { Station, AnomalyEvent, SystemMetrics } from '../../types/aws';
import { 
  Radio, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Wind, 
  CloudRain, 
  Search,
  CheckCircle2,
  BellRing,
  ArrowUpRight,
  FlaskConical,
  Zap,
  RefreshCw,
  PieChart,
  TrendingUp,
  BarChart3,
  Clock,
  Brain,
  ListChecks,
  ChevronRight,
  AlertOctagon,
  Check
} from 'lucide-react';

interface ExecutiveDashboardProps {
  stations: Station[];
  anomalies: AnomalyEvent[];
  metrics: SystemMetrics;
  onSelectStation: (stationId: string) => void;
  onAcknowledgeAnomaly: (anomalyId: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  stations,
  anomalies,
  metrics,
  onSelectStation,
  onAcknowledgeAnomaly
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [chartParam, setChartParam] = useState<'temp' | 'humidity' | 'pressure'>('temp');

  const filteredStations = stations.filter((st) => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'ALL' || st.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sample fleet matrix data matching screenshot
  const fleetMatrix = [
    { code: 'AWS-DEL-01', name: 'Safdarjung Observatory', status: 'CRITICAL', elevation: '216.0 m' },
    { code: 'AWS-DEL-02', name: 'Palam Airport Station', status: 'CRITICAL', elevation: '224.0 m' },
    { code: 'AWS-DEL-03', name: 'Delhi Ridge Station', status: 'CRITICAL', elevation: '230.0 m' },
    { code: 'AWS-DEL-04', name: 'Ayanagar AWS Station', status: 'CRITICAL', elevation: '250.0 m' },
    { code: 'AWS-DEL-05', name: 'Noida Sector 62 AWS', status: 'CRITICAL', elevation: '200.0 m' },
    { code: 'BOM', name: 'Mumbai (Santacruz)', status: 'ACTIVE', elevation: '14.0 m' },
    { code: 'CCU', name: 'Kolkata (Dum Dum)', status: 'ACTIVE', elevation: '5.0 m' },
    { code: 'DEL', name: 'New Delhi (Safdarjung)', status: 'ACTIVE', elevation: '216.0 m' },
    { code: 'MAA', name: 'Chennai (Meenambakkam)', status: 'ACTIVE', elevation: '16.0 m' },
  ];

  return (
    <div className="space-y-8 font-sans p-2">
      
      {/* 1. Top KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: STATIONS ACTIVE */}
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-5 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono opacity-90">
                STATIONS ACTIVE
              </p>
              <h3 className="text-2xl font-extrabold font-mono mt-1">
                {metrics.activeStations}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-xs flex items-center justify-center text-white">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> +100% Operational
            </span>
          </div>
        </div>

        {/* KPI 2: ACTIVE ALERTS */}
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-5 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono opacity-90">
                ACTIVE ALERTS
              </p>
              <h3 className="text-2xl font-extrabold font-mono mt-1">
                {anomalies.filter(a => a.status !== 'RESOLVED').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-xs flex items-center justify-center text-white">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Active Monitoring
            </span>
          </div>
        </div>

        {/* KPI 3: AVERAGE HEALTH */}
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-5 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono opacity-90">
                AVERAGE HEALTH
              </p>
              <h3 className="text-2xl font-extrabold font-mono mt-1">
                {metrics.avgHealthScore}%
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-xs flex items-center justify-center text-white">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">✓ 0% False Alarms</span>
          </div>
        </div>

        {/* KPI 4: ANOMALIES DETECTED */}
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-5 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono opacity-90">
                ANOMALIES DETECTED
              </p>
              <h3 className="text-2xl font-extrabold font-mono mt-1">
                124
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-xs flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">4-Level AI Active</span>
          </div>
        </div>

      </div>

      {/* 2. Live Anomaly & Weather Event Simulator Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <FlaskConical className="w-4 h-4 text-blue-600" />
          <span>Live Anomaly & Weather Event Simulator</span>
        </div>
        <p className="text-xs text-slate-500">
          Inject synthetic faults (Spikes, Frozen flatline, Monotonic drift, Null missing gap, or Regional Heatwave) to evaluate real-time 4-level AI classification & XAI diagnostics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <select className="bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500">
            <option>AWS-DEL-01 — Safdarjung Observa</option>
            <option>AWS-MUM-02 — Colaba Observa</option>
            <option>AWS-BLR-03 — Peenya Observa</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500">
            <option>Single-Reading Sensor Spike</option>
            <option>Frozen / Flatline Sensor</option>
            <option>Monotonic Sensor Drift</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500">
            <option>Temperature Sensor</option>
            <option>Humidity Sensor</option>
            <option>Barometric Pressure</option>
          </select>
          <div className="flex items-center gap-2">
            <button className="flex-1 bg-gradient-to-r from-[#0284c7] to-[#2563eb] hover:from-[#0369a1] hover:to-[#1d4ed8] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all">
              <Zap className="w-4 h-4 fill-current" />
              <span>Inject Fault</span>
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all shadow-xs" title="Inject Heatwave">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. 3 Data Visualizer Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Sensor Fleet Health Ratio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>Sensor Fleet Health Ratio</span>
          </div>
          <div className="flex items-center justify-around text-center pt-2">
            <div>
              <div className="text-xl font-extrabold font-mono text-slate-900">98.4%</div>
              <div className="text-[11px] text-slate-500 font-mono">Fleet Health Index</div>
            </div>
            <div>
              <div className="text-xl font-extrabold font-mono text-slate-900">0.0%</div>
              <div className="text-[11px] text-slate-500 font-mono">False Hardware Alarms</div>
            </div>
          </div>
          <div className="flex justify-center py-2">
            <svg className="w-32 h-32" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.8" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.8" strokeDasharray="85, 100" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 12 5" fill="none" stroke="#f59e0b" strokeWidth="3.8" strokeDasharray="10, 100" strokeDashoffset="-85" />
            </svg>
          </div>
        </div>

        {/* Card 2: Telemetry Data Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Telemetry Data Volume</span>
          </div>
          <div className="grid grid-cols-3 text-center pt-2 font-mono text-xs">
            <div>
              <div className="font-extrabold text-slate-900 text-base">10,480</div>
              <div className="text-[10px] text-slate-500">Observed</div>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base">124</div>
              <div className="text-[10px] text-slate-500">Imputed</div>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base">99.8%</div>
              <div className="text-[10px] text-slate-500">Uptime</div>
            </div>
          </div>
          <div className="h-28 pt-2">
            <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,60 Q40,50 80,55 T160,20 T200,35 L200,80 L0,80 Z" fill="url(#areaGrad)" />
              <path d="M0,60 Q40,50 80,55 T160,20 T200,35" fill="none" stroke="#6366f1" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Card 3: Anomaly Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Anomaly Breakdown</span>
          </div>
          <div className="grid grid-cols-2 text-center pt-2 font-mono text-xs">
            <div>
              <div className="font-extrabold text-slate-900 text-base">78</div>
              <div className="text-[10px] text-slate-500">Genuine Weather</div>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base">46</div>
              <div className="text-[10px] text-slate-500">Sensor Faults</div>
            </div>
          </div>
          <div className="h-28 flex items-end justify-between px-4 pt-4 gap-2">
            <div className="w-4 bg-sky-400 rounded-t h-[60%]" />
            <div className="w-4 bg-amber-400 rounded-t h-[30%]" />
            <div className="w-4 bg-sky-400 rounded-t h-[45%]" />
            <div className="w-4 bg-amber-400 rounded-t h-[20%]" />
            <div className="w-4 bg-sky-400 rounded-t h-[90%]" />
            <div className="w-4 bg-amber-400 rounded-t h-[40%]" />
            <div className="w-4 bg-sky-400 rounded-t h-[70%]" />
          </div>
        </div>
      </div>

      {/* 4. Main Section Row 1: GIS Map & AWS Fleet Health Matrix (Left) + Live Telemetry & XAI Diagnostic (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: GIS Map & Fleet Health Matrix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  IMD AWS GIS Network Map
                </h2>
                <p className="text-xs text-slate-500">
                  Delhi / NCR Region Live Spatial Layers
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search station..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 w-36 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* GIS OpenStreetMap Canvas */}
            <div className="relative min-h-[300px] bg-slate-100 border border-slate-200 rounded-xl overflow-hidden mt-3 shadow-inner">
              <iframe
                title="IMD AWS Regional GIS Map"
                width="100%"
                height="300"
                style={{ border: 0, filter: 'contrast(1.05) brightness(0.98)' }}
                src="https://www.openstreetmap.org/export/embed.html?bbox=68.7,8.0,97.25,35.5&layer=mapnik"
                className="w-full h-[300px] rounded-xl"
              />
              <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-xs">
                📍 OpenStreetMap GIS Layer Active
              </div>
            </div>
          </div>

          {/* AWS Fleet Health Matrix Table (Matching Screenshot 2) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-sky-600" />
              AWS Fleet Health Matrix
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">STATION ID</th>
                    <th className="py-2.5 px-3">NAME</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ELEVATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {fleetMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectStation(item.code)}>
                      <td className="py-2.5 px-3 font-bold text-sky-700">{item.code}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3">
                        {item.status === 'CRITICAL' ? (
                          <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3 h-3" /> CRITICAL
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{item.elevation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Telemetry & Explainable AI Diagnostic */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Live Telemetry & Imputation
              </h2>
              
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-mono">
                <button 
                  onClick={() => setChartParam('temp')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${chartParam === 'temp' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Temp (°C)
                </button>
                <button 
                  onClick={() => setChartParam('humidity')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${chartParam === 'humidity' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Humidity (%)
                </button>
                <button 
                  onClick={() => setChartParam('pressure')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${chartParam === 'pressure' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Pressure (hPa)
                </button>
              </div>
            </div>

            {/* Time Series Telemetry Canvas */}
            <div className="h-56 pt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="70" x2="400" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="110" x2="400" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                <path d="M0,110 L20,95 L40,105 L60,100 L80,102 L100,98 L120,95 L140,85 L160,50 L180,30 L200,20 L220,10 L240,40 L260,50 L280,35 L300,30 L320,25 L340,15 L360,10 L380,5 L400,0 L400,160 L0,160 Z" fill="url(#chartGrad)" />
                <path d="M0,110 L20,95 L40,105 L60,100 L80,102 L100,98 L120,95 L140,85 L160,50 L180,30 L200,20 L220,10 L240,40 L260,50 L280,35 L300,30 L320,25 L340,15 L360,10 L380,5 L400,0" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                
                {/* Node Circles */}
                <circle cx="160" cy="50" r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <circle cx="180" cy="30" r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <circle cx="200" cy="20" r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <circle cx="220" cy="10" r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                <span>04:23 AM</span>
                <span>06:53 AM</span>
                <span>08:53 AM</span>
                <span>10:53 AM</span>
                <span>12:53 PM</span>
                <span>04:11 PM</span>
              </div>
            </div>
          </div>

          {/* Explainable AI (XAI) Diagnostic Card (Matching Screenshot 2) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Brain className="w-5 h-5 text-sky-600" />
                <span>Explainable AI (XAI) Diagnostic</span>
              </div>
              <span className="bg-sky-100 text-sky-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                CONFIDENCE: 91%
              </span>
            </div>

            <div className="text-xs font-mono text-slate-700 space-y-1.5 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              <p>
                <strong className="text-slate-900">**Classification**:</strong> <span className="text-red-600 font-bold">SENSOR_FAULT (CALIBRATION_ISSUE)</span> [Severity: HIGH]
              </p>
              <p className="text-slate-600">
                - <strong className="text-slate-900">**Level 3 Physics**:</strong> Physical Violation: Temp rose +4.5°C but Humidity remained static (0 change)
              </p>
              <p className="text-slate-600">
                - <strong className="text-slate-900">**Level 4 Spatial**:</strong> Divergence from regional AWS consensus: temperature: actual 36.42 vs expected 27.62 (diff: 8.8)
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs font-mono p-3 rounded-r-lg">
              <strong className="font-bold">Recommended Action:</strong> Sensor out of calibration balance. Replace analog humidity/pressure sensor board.
            </div>
          </div>
        </div>

      </div>

      {/* 5. Main Section Row 2: AWS Operations Log (Left) + Real-Time Active Alert Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AWS Operations Log (Left - 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-base">
            <Clock className="w-5 h-5 text-sky-600" />
            <span>AWS Operations Log</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Log Item 1 */}
            <div className="flex gap-3 relative pl-6 border-l-2 border-emerald-500">
              <span className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-emerald-500" />
              <div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  TODAY
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1">AWS-IND-0101 Humidity Calibration</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Checked and verified by Duty Meteorologist.</p>
              </div>
            </div>

            {/* Log Item 2 */}
            <div className="flex gap-3 relative pl-6 border-l-2 border-indigo-500">
              <span className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-indigo-500" />
              <div>
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  YESTERDAY
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1">Level 4 Spatial Consensus Check Passed</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">98.4% spatial correlation across Delhi NCR network.</p>
              </div>
            </div>

            {/* Log Item 3 */}
            <div className="flex gap-3 relative pl-6 border-l-2 border-amber-500">
              <span className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-amber-500" />
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  SEP 15
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1">Regional Heatwave Dispatched</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Spatial consensus level 4 validated, zero false hardware alarms.</p>
              </div>
            </div>

            {/* Log Item 4 */}
            <div className="flex gap-3 relative pl-6 border-l-2 border-purple-500">
              <span className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-purple-500" />
              <div>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  SEP 14
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1">Data Imputation Recovery</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Recovered 12 telemetry missing gaps via spatial Kriging.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Active Alert Feed (Right - 7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <BellRing className="w-5 h-5 text-red-600 animate-bounce" />
              <span>Real-Time Active Alert Feed</span>
            </div>

            <button className="text-xs font-mono font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50 transition-colors">
              <span>View All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ALERT ID</th>
                  <th className="py-2.5 px-3">STATION</th>
                  <th className="py-2.5 px-3">SEVERITY</th>
                  <th className="py-2.5 px-3">DIAGNOSTIC MESSAGE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-sky-700">#67</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">BOM</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3" /> HIGH
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">
                    [HIGH] Mumbai (Santacruz) (BOM): GENUINE_WEATHER_EVENT - EXTREME_EVENT
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded font-bold text-[10px] animate-pulse">
                      ALERT.STATUS
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-sky-700">#68</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">AWS-DEL-01</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 text-[11px]">
                      <AlertOctagon className="w-3 h-3" /> CRITICAL
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">
                    [CRITICAL] Safdarjung Observatory: SENSOR_FAULT (CALIBRATION_ISSUE) - Temp rose +4.5°C
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px]">
                      UNASSIGNED
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-sky-700">#69</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">DEL</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3" /> WARNING
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">
                    [WARNING] New Delhi (Safdarjung): Wind gust threshold exceeded (48 km/h)
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                      ACKNOWLEDGED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

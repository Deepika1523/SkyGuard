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
  BarChart3
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

  const filteredStations = stations.filter((st) => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'ALL' || st.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-4 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1 opacity-90">
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
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-4 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
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
        <div className="bg-gradient-to-br from-[#0284c7] to-[#2563eb] rounded-2xl p-4 relative overflow-hidden group transition-all shadow-md shadow-blue-500/20 text-white">
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
            <button className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all shadow-xs">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. 3 Data Visualizer Cards Row (Sensor Fleet Health, Telemetry Data Volume, Anomaly Breakdown) */}
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
            <svg className="w-36 h-36" viewBox="0 0 36 36">
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
          <div className="h-32 pt-2">
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
          <div className="h-32 flex items-end justify-between px-4 pt-4 gap-2">
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

      {/* 4. Main Grid: Geospatial Map & Live Anomaly Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Geospatial Station Command View */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                AWS Regional Geospatial Risk Map
              </h2>
              <p className="text-xs text-slate-500">
                Click any AWS Station node to open streaming telemetry & ML anomaly vector.
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
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 w-44 font-mono"
                />
              </div>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-900 px-2 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value="ALL">All Status</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
          </div>

          <div className="relative min-h-[380px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 flex justify-between items-center text-xs font-mono bg-white border border-slate-200 p-2.5 rounded-lg shadow-xs">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span> Critical Disaster
                </span>
              </div>
              <span className="text-slate-400">Grid: India AWS Cluster</span>
            </div>

            <div className="relative z-10 my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredStations.map((st) => {
                const isCritical = st.status === 'CRITICAL';
                const isWarning = st.status === 'WARNING';
                return (
                  <button
                    key={st.id}
                    onClick={() => onSelectStation(st.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group shadow-xs ${
                      isCritical
                        ? 'bg-red-50 border-red-300 hover:bg-red-100 text-slate-900'
                        : isWarning
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-sky-400 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            isCritical ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          <span className="font-mono text-xs font-bold text-slate-900">{st.code}</span>
                        </div>
                        <h4 className="font-bold text-xs mt-1 truncate max-w-[140px] text-slate-900 group-hover:text-sky-600 transition-colors">
                          {st.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{st.district}, {st.state}</p>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isCritical ? 'bg-red-600 text-white' : isWarning ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {st.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-1 text-slate-700">
                        <CloudRain className="w-3 h-3 text-sky-600" />
                        <span>{st.currentReading.rainfallRate} mm/h</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700">
                        <Wind className="w-3 h-3 text-sky-600" />
                        <span>{st.currentReading.windSpeed} km/h</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 text-[11px] text-slate-500 font-mono flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
              <span>Showing {filteredStations.length} of {stations.length} Weather Stations</span>
              <span className="text-sky-600 font-bold">Live Socket Updates Active</span>
            </div>
          </div>

        </div>

        {/* Right Column: Live Anomaly Ticker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Live Anomaly Alert Queue
              </h2>
              <span className="text-xs font-mono bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                {anomalies.filter(a => a.status !== 'RESOLVED').length} Active
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              ML Real-time anomaly classifications with SHAP feature contribution tags.
            </p>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {anomalies.map((anom) => {
                const isUnassigned = anom.status === 'UNASSIGNED';
                return (
                  <div
                    key={anom.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      anom.severity === 'CRITICAL'
                        ? 'bg-red-50 border-red-200 hover:border-red-400'
                        : 'bg-slate-50 border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            anom.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {anom.severity}
                          </span>
                          <span className="text-[11px] font-mono text-sky-700 font-bold">{anom.type}</span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900">{anom.stationName}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {anom.description}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{anom.timestamp}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {anom.shapFeatures.slice(0, 2).map((feat, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {feat.featureName}: <strong className="text-sky-600">{feat.value} {feat.unit}</strong> (+{(feat.shapValue * 100).toFixed(0)}% SHAP)
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        Confidence: <strong className="text-emerald-600">{(anom.confidenceScore * 100).toFixed(0)}%</strong>
                      </span>

                      {isUnassigned ? (
                        <button
                          onClick={() => onAcknowledgeAnomaly(anom.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <span>Acknowledge</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {anom.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

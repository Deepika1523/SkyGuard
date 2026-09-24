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
  ArrowUpRight
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
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active AWS Stations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden group hover:border-sky-400 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                AWS Network Status
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {metrics.activeStations} <span className="text-sm font-normal text-slate-400">/ {metrics.totalStations}</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 95.1% Operational
            </span>
            <span>Avg Health: {metrics.avgHealthScore}%</span>
          </div>
        </div>

        {/* KPI 2: Active Disaster Alerts */}
        <div className="bg-white border border-red-200 rounded-2xl p-4 relative overflow-hidden group hover:border-red-400 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Active Anomalies
              </p>
              <h3 className="text-2xl font-bold font-mono text-red-600 mt-1">
                {anomalies.filter(a => a.status !== 'RESOLVED').length}
              </h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-red-600 font-bold">
              {anomalies.filter(a => a.severity === 'CRITICAL').length} Critical Unresolved
            </span>
            <span className="text-amber-600 font-semibold">Cloudburst Alert Level 3</span>
          </div>
        </div>

        {/* KPI 3: Telemetry Stream Ingestion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden group hover:border-sky-400 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Telemetry Rate
              </p>
              <h3 className="text-2xl font-bold font-mono text-sky-600 mt-1">
                {metrics.telemetryIngestionRate.toLocaleString()} <span className="text-xs font-normal text-slate-400">msg/s</span>
              </h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-200">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="text-sky-600 font-semibold">Socket.io Low Latency</span>
            <span>Latency: 18ms</span>
          </div>
        </div>

        {/* KPI 4: ML Model F1 Performance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden group hover:border-blue-400 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                ML Model Precision
              </p>
              <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {metrics.modelAccuracyF1}% <span className="text-xs text-slate-400">F1</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>False Alarm: 1.2%</span>
            <span className="text-blue-600 font-semibold">SHAP Explainable</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Interactive Map Visualizer & Live Anomaly Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Geospatial Station Command View */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
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

            {/* Filter controls */}
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

          {/* Geospatial Map Canvas Placeholder Component */}
          <div className="relative min-h-[380px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden flex flex-col justify-between">
            {/* Map Top Status Bar */}
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

            {/* Station Map Nodes Layout */}
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

                    {/* Telemetry Snapshot */}
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

            {/* Bottom Status bar */}
            <div className="relative z-10 text-[11px] text-slate-500 font-mono flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
              <span>Showing {filteredStations.length} of {stations.length} Weather Stations</span>
              <span className="text-sky-600 font-bold">Live Socket Updates Active</span>
            </div>
          </div>

        </div>

        {/* Right Column: Live Anomaly Ticker & Alert Priority Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
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

            {/* Anomaly List Feed */}
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

                    {/* SHAP Feature Tags */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {anom.shapFeatures.slice(0, 2).map((feat, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {feat.featureName}: <strong className="text-sky-600">{feat.value} {feat.unit}</strong> (+{(feat.shapValue * 100).toFixed(0)}% SHAP)
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
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

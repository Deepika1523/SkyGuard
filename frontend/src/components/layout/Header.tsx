'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Zap, 
  AlertTriangle, 
  Activity,
  UploadCloud
} from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  lastTickTime: string;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  emergencyMode: boolean;
  setEmergencyMode: (val: boolean) => void;
  injectSimulatedAnomaly: (type: string) => void;
  activeCriticalCount: number;
  onOpenUploadModal?: () => void;
}


export const Header: React.FC<HeaderProps> = ({
  isConnected,
  lastTickTime,
  soundEnabled,
  setSoundEnabled,
  emergencyMode,
  setEmergencyMode,
  injectSimulatedAnomaly,
  activeCriticalCount,
  onOpenUploadModal
}) => {
  return (
    <header className={`border-b transition-colors duration-300 ${
      emergencyMode 
        ? 'bg-red-100 border-red-300 text-red-950' 
        : 'bg-white/95 border-slate-200 text-slate-900'
    } backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Mission Tagline */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`p-2.5 rounded-xl ${
              emergencyMode ? 'bg-red-600 text-white animate-pulse' : 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
            } font-bold`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            {activeCriticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] font-bold text-white items-center justify-center">
                  {activeCriticalCount}
                </span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-slate-900">
                SkyGuard AWS Intelligence
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-sky-100 text-sky-700 border border-sky-300 px-2 py-0.5 rounded-md font-bold">
                Disaster v2.4 ML
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>IMD Automatic Weather Station Network</span>
              <span className="text-slate-300">•</span>
              <span className="text-sky-600 font-mono text-[11px] font-semibold">Real-Time Telemetry Stream</span>
            </p>
          </div>
        </div>

        {/* Socket.io & Stream Indicators */}
        <div className="flex items-center space-x-3 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-800">
              {isConnected ? 'SOCKET CONNECTED' : 'RECONNECTING...'}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1 text-xs text-slate-600 font-mono">
            <Activity className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="text-slate-900 font-bold">1,840 msg/s</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-mono">Tick: {lastTickTime}</span>
        </div>

        {/* Action Controls & Emergency Switch */}
        <div className="flex items-center space-x-2">
          
          {/* Upload CSV Dataset Button */}
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 transition-all shadow-sm"
              title="Upload CSV / JSON weather telemetry dataset"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Dataset</span>
            </button>
          )}

          {/* Quick Simulate Anomaly Injector */}
          <button
            onClick={() => injectSimulatedAnomaly('CLOUDBURST_RISK')}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-all shadow-sm"
            title="Simulate incoming cloudburst anomaly"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate ML Anomaly</span>
          </button>


          {/* Mute/Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition-colors shadow-sm ${
              soundEnabled 
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:border-sky-500' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
            title={soundEnabled ? 'Mute Alert Chime' : 'Unmute Alert Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Disaster Emergency Mode Toggle */}
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-sm ${
              emergencyMode
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30 animate-pulse'
                : 'bg-white border-slate-300 text-slate-700 hover:border-red-400 hover:text-red-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>{emergencyMode ? 'DISASTER MODE ACTIVE' : 'DISASTER MODE'}</span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 text-xs font-bold font-mono">
              DOC
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

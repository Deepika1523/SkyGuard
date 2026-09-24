'use client';

import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Cpu, Radio } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [sensitivity, setSensitivity] = useState(0.85);
  const [contamination, setContamination] = useState(0.05);
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8000/ws/telemetry');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-sky-600" />
            ML Model Sensitivity & Threshold Configuration
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Adjust hybrid LSTM-Isolation Forest hyperparameters, Socket.io endpoints, and disaster alert rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ML Hyperparameters Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-mono uppercase">
            <Cpu className="w-4 h-4 text-sky-600" /> Anomaly Detection Hyperparameters
          </h3>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-800 mb-1">
                <span>LSTM Residual Anomaly Threshold (σ):</span>
                <span className="text-sky-700 font-bold">+{sensitivity}σ</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-sky-600 bg-slate-200 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Higher sensitivity reduces false negatives during fast microburst cloudbursts.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-slate-800 mb-1">
                <span>Isolation Forest Contamination Factor:</span>
                <span className="text-blue-700 font-bold">{(contamination * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.15"
                step="0.005"
                value={contamination}
                onChange={(e) => setContamination(Number(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Socket.io Streaming Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-mono text-xs shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase">
            <Radio className="w-4 h-4 text-emerald-600" /> Socket.io Streaming Endpoint
          </h3>

          <div>
            <label className="text-slate-600">WebSocket URL:</label>
            <input
              type="text"
              value={socketUrl}
              onChange={(e) => setSocketUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl mt-1"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider font-mono shadow-sm"
          >
            <Save className="w-4 h-4" /> Save ML Configurations
          </button>

          {saved && (
            <span className="text-emerald-600 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> ML Settings Updated Successfully!
            </span>
          )}
        </div>

      </form>

    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { AnomalyEvent } from '../../types/aws';
import { 
  History, 
  Play, 
  Pause, 
  RotateCcw, 
  Download
} from 'lucide-react';

interface AnomalyHistoryProps {
  anomalies: AnomalyEvent[];
}

export const AnomalyHistory: React.FC<AnomalyHistoryProps> = ({ anomalies }) => {
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(65);
  const [filterType, setFilterType] = useState('ALL');

  const filteredHistory = anomalies.filter((anom) => {
    if (filterType === 'METEO') return anom.isMeteorologicalExtreme;
    if (filterType === 'HARDWARE') return !anom.isMeteorologicalExtreme;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Historic Timeline Scrubber Replay Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-sky-600" />
              Historic Event Replay & Time Scrubber
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Scrub back through historical telemetry frames to observe weather anomaly progression.
            </p>
          </div>

          {/* Replay Controls */}
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsReplaying(!isReplaying)}
              className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
            >
              {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setReplayProgress(0)}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-800 font-bold px-2">Frame: T-45min</span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-500">
            <span>-24h Event Window</span>
            <span className="text-sky-700 font-bold">Replay Offset: 14:20 IST</span>
            <span>Live Sync Point</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={replayProgress}
            onChange={(e) => setReplayProgress(Number(e.target.value))}
            className="w-full accent-sky-600 bg-slate-200 cursor-pointer"
          />
        </div>
      </div>

      {/* Historical Anomaly Audit Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-base text-slate-900">Anomaly Audit Logs</h3>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="ALL">All Classifications</option>
              <option value="METEO">Meteorological Extreme</option>
              <option value="HARDWARE">Equipment / Sensor Fault</option>
            </select>
          </div>

          <button
            onClick={() => alert('Downloading CSV Audit Trail...')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold hover:border-sky-400 flex items-center gap-1.5 font-mono shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV Audit Log</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="p-3">Log ID</th>
                <th className="p-3">Station</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Type</th>
                <th className="p-3">Class</th>
                <th className="p-3">ML Confidence</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {filteredHistory.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-sky-700">{log.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.stationName}</td>
                  <td className="p-3 text-slate-500">{log.timestamp}</td>
                  <td className="p-3 font-bold">{log.type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      log.isMeteorologicalExtreme ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {log.isMeteorologicalExtreme ? 'Weather Extreme' : 'Equipment Fault'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600">{(log.confidenceScore * 100).toFixed(0)}%</td>
                  <td className="p-3 text-slate-500">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

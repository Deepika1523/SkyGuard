'use client';

import React, { useState } from 'react';
import { AnomalyEvent, AlertStatus } from '../../types/aws';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Sparkles,
  Megaphone,
  X
} from 'lucide-react';

interface AlertTriageProps {
  anomalies: AnomalyEvent[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onEscalate: (id: string) => void;
}

export const AlertTriage: React.FC<AlertTriageProps> = ({
  anomalies,
  onAcknowledge,
  onResolve,
  onEscalate
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(anomalies[0] || null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const columns: { status: AlertStatus; label: string; bg: string }[] = [
    { status: 'UNASSIGNED', label: 'Unassigned Alerts', bg: 'bg-red-50 border-red-200' },
    { status: 'TRIAGE', label: 'Under Analyst Review', bg: 'bg-amber-50 border-amber-200' },
    { status: 'ESCALATED', label: 'Disaster Mode Escalated', bg: 'bg-blue-50 border-blue-200' },
    { status: 'RESOLVED', label: 'Resolved / Suppressed', bg: 'bg-emerald-50 border-emerald-200' }
  ];

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setShowBroadcastModal(false);
      setBroadcastSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-600" />
            Incident Alert Triage & Dispatch Center
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Classify ML anomalies, verify SHAP feature attribution, and dispatch early warning advisories.
          </p>
        </div>

        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all font-mono"
        >
          <Megaphone className="w-4 h-4 animate-bounce" />
          <span>Broadcast Disaster Advisory</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const columnAnomalies = anomalies.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[500px]">
              
              {/* Column Header */}
              <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${col.bg}`}>
                <h3 className="font-bold text-xs text-slate-900">{col.label}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-xs">
                  {columnAnomalies.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnAnomalies.map((anom) => (
                  <div
                    key={anom.id}
                    onClick={() => setSelectedAnomaly(anom)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAnomaly?.id === anom.id
                        ? 'border-sky-500 bg-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        anom.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {anom.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{anom.timestamp}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 mt-2">{anom.stationName}</h4>
                    <p className="text-[11px] text-sky-700 font-mono mt-0.5">{anom.type}</p>

                    <div className="mt-2 text-[11px] text-slate-600 line-clamp-2">
                      {anom.description}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        ML Conf: <strong className="text-emerald-600">{(anom.confidenceScore * 100).toFixed(0)}%</strong>
                      </span>

                      {col.status === 'UNASSIGNED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcknowledge(anom.id);
                          }}
                          className="px-2 py-1 bg-sky-600 text-white rounded text-[10px] font-bold hover:bg-sky-500"
                        >
                          Assign Triage
                        </button>
                      )}

                      {col.status === 'TRIAGE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEscalate(anom.id);
                          }}
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-500"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected Anomaly SHAP Explainability Drawer */}
      {selectedAnomaly && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono text-sky-700 uppercase tracking-widest font-bold">
                SHAP Explainable AI Breakdown • {selectedAnomaly.id}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {selectedAnomaly.stationName} — {selectedAnomaly.type.replace(/_/g, ' ')}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEscalate(selectedAnomaly.id)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors font-mono shadow-xs"
              >
                Escalate Disaster Level
              </button>
              <button
                onClick={() => onResolve(selectedAnomaly.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors font-mono shadow-xs"
              >
                Mark Resolved
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Description & Recommendations */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-600 font-mono uppercase">ML Diagnostic Summary</h4>
                <p className="text-xs text-slate-800 leading-relaxed">{selectedAnomaly.description}</p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
                <h4 className="text-xs font-bold text-red-600 font-mono uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Recommended Disaster Action
                </h4>
                <p className="text-xs text-slate-900 font-semibold leading-relaxed">{selectedAnomaly.recommendedAction}</p>
              </div>
            </div>

            {/* SHAP Feature Contribution Bars */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-600 font-mono uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" /> SHAP Feature Attribution
              </h4>
              <p className="text-[11px] text-slate-500">
                Features contributing most to the anomaly prediction decision:
              </p>

              <div className="space-y-2.5 pt-2">
                {selectedAnomaly.shapFeatures.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-800 font-medium">{feat.featureName} ({feat.value} {feat.unit})</span>
                      <span className="text-sky-700 font-bold">+{(feat.shapValue * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, feat.shapValue * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-300 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-red-600 flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Dispatch Disaster Warning Broadcast
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastSent ? (
              <div className="p-6 text-center space-y-2 text-emerald-600 font-mono">
                <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce text-emerald-600" />
                <p className="font-bold text-base">Advisory Broadcasted Successfully!</p>
                <p className="text-xs text-slate-500">Disaster Management Command & Civic Channels Notified.</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-600">Target Region:</label>
                  <input
                    type="text"
                    defaultValue="Rudraprayag & Mandakini River Valley"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-600">Advisory Message:</label>
                  <textarea
                    rows={3}
                    defaultValue="EMERGENCY ALERT: High probability of cloudburst and flash flooding. Evacuate low-lying river bank settlements immediately."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-lg mt-1"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-mono shadow-sm"
                >
                  <Send className="w-4 h-4" /> Broadcast Emergency Advisory
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

'use client';

import React from 'react';
import { 
  Lightbulb, 
  GitMerge, 
  CloudLightning, 
  Brain, 
  Wrench, 
  Landmark 
} from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. USP Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            <span>SIH 28073 — Unique Selling Proposition</span>
          </span>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            "We don't just detect an anomaly; we determine whether the weather is actually unusual or the sensor is wrong."
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            An intelligent, multi-level automatic weather station (AWS) diagnostic platform engineered for the India Meteorological Department (IMD) to eliminate false alarms and guarantee telemetry integrity during severe weather events.
          </p>
        </div>
      </div>

      {/* 2. 4-Level Pipeline System Architecture Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <GitMerge className="w-5 h-5 text-blue-600" />
          <span>4-Level Pipeline System Architecture</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto flex justify-center">
          <svg viewBox="0 0 1000 240" className="w-full max-w-[960px] h-auto min-w-[750px]">
            <defs>
              <marker id="arrowHead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
              </marker>
              <linearGradient id="decisionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {/* Level 1 QC Box */}
            <rect x="20" y="70" width="160" height="100" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="2"/>
            <text x="100" y="105" fill="#0284c7" fontFamily="sans-serif" fontSize="14" fontWeight="700" textAnchor="middle">Level 1: Rule QC</text>
            <text x="100" y="130" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Climatological Bounds</text>
            <text x="100" y="148" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Rate of Change Limits</text>

            <line x1="180" y1="120" x2="220" y2="120" stroke="#0284c7" strokeWidth="2" markerEnd="url(#arrowHead)"/>

            {/* Level 2 ML Box */}
            <rect x="220" y="70" width="160" height="100" rx="10" fill="#ffffff" stroke="#7c3aed" strokeWidth="2"/>
            <text x="300" y="105" fill="#7c3aed" fontFamily="sans-serif" fontSize="14" fontWeight="700" textAnchor="middle">Level 2: ML Engine</text>
            <text x="300" y="130" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Isolation Forest</text>
            <text x="300" y="148" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Drift & Flatline Model</text>

            <line x1="380" y1="120" x2="420" y2="120" stroke="#0284c7" strokeWidth="2" markerEnd="url(#arrowHead)"/>

            {/* Level 3 Physics */}
            <rect x="420" y="70" width="170" height="100" rx="10" fill="#ffffff" stroke="#d97706" strokeWidth="2"/>
            <text x="505" y="105" fill="#d97706" fontFamily="sans-serif" fontSize="14" fontWeight="700" textAnchor="middle">Level 3: Physics</text>
            <text x="505" y="130" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Thermodynamics</text>
            <text x="505" y="148" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Clausius-Clapeyron</text>

            <line x1="590" y1="120" x2="630" y2="120" stroke="#0284c7" strokeWidth="2" markerEnd="url(#arrowHead)"/>

            {/* Level 4 Spatial Consensus */}
            <rect x="630" y="70" width="170" height="100" rx="10" fill="#ffffff" stroke="#059669" strokeWidth="2"/>
            <text x="715" y="105" fill="#059669" fontFamily="sans-serif" fontSize="14" fontWeight="700" textAnchor="middle">Level 4: Spatial</text>
            <text x="715" y="130" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Inverse Distance Weighting</text>
            <text x="715" y="148" fill="#64748b" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Spatial Consensus</text>

            <line x1="800" y1="120" x2="835" y2="120" stroke="#0284c7" strokeWidth="2" markerEnd="url(#arrowHead)"/>

            {/* Synthesis & Decision Engine */}
            <rect x="835" y="55" width="145" height="130" rx="10" fill="url(#decisionGrad)" stroke="#0284c7" strokeWidth="2"/>
            <text x="907" y="95" fill="#ffffff" fontFamily="sans-serif" fontSize="14" fontWeight="800" textAnchor="middle">Decision Engine</text>
            <text x="907" y="120" fill="#ffffff" fontFamily="sans-serif" fontSize="11" textAnchor="middle">XAI Diagnostics</text>
            <text x="907" y="138" fill="#ffffff" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Data Imputation</text>
            <text x="907" y="156" fill="#ffffff" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Alert Dispatch</text>
          </svg>
        </div>
      </div>

      {/* 3. Feature Highlights & SIH Problem Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: What Makes SkyGuard AI Different */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <CloudLightning className="w-5 h-5 text-amber-500" />
            <span>What Makes SkyGuard AI Different</span>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                <CloudLightning className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Thermodynamic Spatial Consensus</h4>
                <p className="leading-relaxed">
                  Unlike traditional thresholds that flag sudden spikes as faults, SkyGuard AI cross-verifies readings against neighboring stations using spatial inverse-distance weighting and physical thermodynamic laws.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Explainable AI (XAI) Diagnostics</h4>
                <p className="leading-relaxed">
                  Every flagged anomaly includes natural language reasoning detailing which level of the pipeline triggered, confidence percentage, and recommended technician action.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Automatic Data Imputation</h4>
                <p className="leading-relaxed">
                  Corrupted or missing telemetry packets are automatically recovered in real-time using historical time-series interpolation and spatial kriging.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: SIH Problem Statement & IMD Alignment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <Landmark className="w-5 h-5 text-blue-600" />
            <span>SIH Problem Statement & IMD Alignment</span>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-900 block text-xs font-bold mb-0.5">Problem Statement ID:</strong>
              SIH 28073 — Development of Intelligent Anomaly Detection & Sensor Health Verification System for Automatic Weather Stations (AWS).
            </p>

            <p>
              <strong className="text-slate-900 block text-xs font-bold mb-0.5">Ministry / Nodal Agency:</strong>
              Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD).
            </p>

            <p>
              <strong className="text-slate-900 block text-xs font-bold mb-0.5">Impact:</strong>
              Deployed across thousands of unmanned AWS stations in remote topographies, SkyGuard AI reduces manual inspection costs, prevents false weather alarms in public bulletins, and maintains continuous meteorological dataset continuity for climate forecasting models.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

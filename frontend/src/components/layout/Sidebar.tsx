'use client';

import React from 'react';
import { 
  Gauge, 
  AlertTriangle, 
  Bell, 
  UploadCloud, 
  LineChart, 
  FileText, 
  Info,
  Radio
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'fleet' 
  | 'anomalies' 
  | 'alerts' 
  | 'upload' 
  | 'analytics' 
  | 'reports' 
  | 'about' 
  | 'monitoring' 
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unresolvedAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unresolvedAlertCount = 5
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-screen select-none shadow-xs font-sans">
      <div className="space-y-5">
        
        {/* Brand Header inside Sidebar */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border border-slate-100 flex items-center justify-center bg-white">
            <img src="/logo.png" alt="SkyGuard Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1">
              SkyGuard <span className="text-blue-600 font-mono text-xs font-bold">AI</span>
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">
              IMD AWS SENTINEL
            </p>
          </div>
        </div>

        {/* Section 1: MAIN */}
        <div>
          <h3 className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-2">
            MAIN
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Gauge className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-blue-600 text-white">
                2
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'fleet'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Radio className={`w-4 h-4 ${activeTab === 'fleet' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Stations Fleet</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('anomalies')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'anomalies'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`w-4 h-4 ${activeTab === 'anomalies' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Anomalies Log</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-red-500 text-white">
                Hot
              </span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'alerts'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Alerts Feed</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500 text-white">
                {unresolvedAlertCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Section 2: COMPONENTS */}
        <div>
          <h3 className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-2">
            COMPONENTS
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className={`w-4 h-4 ${activeTab === 'upload' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Upload Dataset</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LineChart className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Analytics & Proof</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Audit Reports</span>
            </button>
          </nav>
        </div>

        {/* Section 3: EXTRAS */}
        <div>
          <h3 className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-2">
            EXTRAS
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Info className={`w-4 h-4 ${activeTab === 'about' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Architecture / About</span>
            </button>
          </nav>
        </div>

      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono space-y-0.5">
        <div className="font-bold text-slate-700">SIH 28073</div>
        <div className="text-[10px] text-slate-400">IMD / Ministry of Earth Sciences</div>
      </div>
    </aside>
  );
};

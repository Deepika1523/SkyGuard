'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  AlertOctagon, 
  History, 
  Radio, 
  Sliders, 
  ShieldCheck
} from 'lucide-react';

export type TabType = 'dashboard' | 'monitoring' | 'alerts' | 'history' | 'fleet' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unresolvedAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unresolvedAlertCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'monitoring' as TabType,
      label: 'Real-Time Stream',
      icon: Activity,
      badge: 'LIVE'
    },
    {
      id: 'alerts' as TabType,
      label: 'Alert Triage',
      icon: AlertOctagon,
      badge: unresolvedAlertCount > 0 ? `${unresolvedAlertCount}` : null,
      badgeColor: 'bg-red-600 text-white'
    },
    {
      id: 'history' as TabType,
      label: 'Anomaly History',
      icon: History,
      badge: null
    },
    {
      id: 'fleet' as TabType,
      label: 'Fleet Management',
      icon: Radio,
      badge: '248 AWS'
    },
    {
      id: 'settings' as TabType,
      label: 'ML Model Settings',
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-65px)] select-none shadow-sm">
      <div className="space-y-6">
        
        {/* Navigation Group Header */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-2">
            Operations Command
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick System Health Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-800">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ML Inference Engine
            </span>
            <span className="font-mono text-emerald-600 text-[11px] font-bold">98.7% F1</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            LSTM-Isolation Forest hybrid model active across all 248 AWS stations.
          </p>
        </div>

      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between font-mono">
          <span>Target Region:</span>
          <span className="text-slate-900 font-semibold">India AWS Fleet</span>
        </div>
        <div className="flex justify-between font-mono">
          <span>Authority:</span>
          <span className="text-slate-800">Disaster Mgmt Bureau</span>
        </div>
      </div>
    </aside>
  );
};

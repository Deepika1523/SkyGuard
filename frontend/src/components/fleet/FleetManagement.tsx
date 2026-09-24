'use client';

import React, { useState } from 'react';
import { Station } from '../../types/aws';
import { 
  Radio, 
  Plus, 
  Search, 
  Wrench, 
  X, 
  Save,
  Battery
} from 'lucide-react';

interface FleetManagementProps {
  stations: Station[];
}

export const FleetManagement: React.FC<FleetManagementProps> = ({ stations }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stationList, setStationList] = useState<Station[]>(stations);
  const [search, setSearch] = useState('');

  const [newStation, setNewStation] = useState({
    name: '',
    code: '',
    district: '',
    state: 'Uttarakhand',
    latitude: '30.000',
    longitude: '78.000',
    elevation: '1200'
  });

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Station = {
      id: `AWS-IND-${stationList.length + 1}`,
      name: newStation.name || 'New Regional Station',
      code: newStation.code || `AWS-NEW-0${stationList.length + 1}`,
      latitude: parseFloat(newStation.latitude),
      longitude: parseFloat(newStation.longitude),
      elevation: parseInt(newStation.elevation),
      district: newStation.district || 'Dehradun',
      state: newStation.state,
      status: 'ACTIVE',
      healthScore: 100,
      lastSeen: 'Just registered',
      currentReading: {
        timestamp: new Date().toISOString(),
        temperature: 20.0,
        humidity: 65,
        pressure: 950.0,
        rainfallRate: 0.0,
        windSpeed: 10.0,
        windDirection: 180,
        solarRadiation: 500,
        batteryVoltage: 13.5
      },
      activeAnomalyCount: 0
    };

    setStationList([created, ...stationList]);
    setShowAddModal(false);
  };

  const filtered = stationList.filter((st) => 
    st.name.toLowerCase().includes(search.toLowerCase()) || 
    st.district.toLowerCase().includes(search.toLowerCase()) ||
    st.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Fleet Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-600" />
            Automatic Weather Station (AWS) Fleet Management
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Monitor physical sensor health, schedule maintenance, and register new station hardware nodes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Register New AWS Station</span>
        </button>
      </div>

      {/* Fleet Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search station fleet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <span className="text-xs font-mono text-slate-500">Total Fleet: {stationList.length} Nodes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="p-3">Code</th>
                <th className="p-3">Station Name</th>
                <th className="p-3">District</th>
                <th className="p-3">Elevation</th>
                <th className="p-3">Status</th>
                <th className="p-3">Hardware Health</th>
                <th className="p-3">Battery V</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-sky-700">{st.code}</td>
                  <td className="p-3 font-semibold text-slate-900">{st.name}</td>
                  <td className="p-3 text-slate-500">{st.district}, {st.state}</td>
                  <td className="p-3 text-slate-700">{st.elevation} m</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      st.status === 'CRITICAL' ? 'bg-red-600 text-white' : st.status === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {st.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600">{st.healthScore}%</td>
                  <td className="p-3 text-slate-800 flex items-center gap-1 font-bold">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    {st.currentReading.batteryVoltage} V
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => alert(`Triggering sensor diagnostic test on ${st.name}...`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded flex items-center gap-1 border border-slate-200"
                    >
                      <Wrench className="w-3 h-3 text-sky-600" /> Diagnostics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-emerald-600 flex items-center gap-2 font-mono">
                <Radio className="w-5 h-5" /> Register AWS Weather Station
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-600">Station Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almora Ridge AWS"
                  value={newStation.name}
                  onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-lg mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600">Station Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="AWS-ALM-01"
                    value={newStation.code}
                    onChange={(e) => setNewStation({ ...newStation, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-600">District:</label>
                  <input
                    type="text"
                    required
                    placeholder="Almora"
                    value={newStation.district}
                    onChange={(e) => setNewStation({ ...newStation, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-lg mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-mono mt-4 shadow-xs"
              >
                <Save className="w-4 h-4" /> Save Station Registration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSocketStream } from '@/hooks/useSocketStream';
import { Header } from '@/components/layout/Header';
import { Sidebar, TabType } from '@/components/layout/Sidebar';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { RealTimeStream } from '@/components/monitoring/RealTimeStream';
import { AlertTriage } from '@/components/alerts/AlertTriage';
import { AnomalyHistory } from '@/components/history/AnomalyHistory';
import { FleetManagement } from '@/components/fleet/FleetManagement';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { DatasetUploader } from '@/components/monitoring/DatasetUploader';
import { 
  ArrowRight, 
  Play, 
  Sun, 
  CloudSun, 
  Droplets, 
  Wind, 
  Gauge, 
  Leaf, 
  ShieldCheck, 
  Users,
  Radio,
  Sparkles,
  Brain,
  Atom,
  AlertTriangle,
  BatteryCharging,
  Send,
  UploadCloud
} from 'lucide-react';

export default function HomePage() {
  const [showDashboardView, setShowDashboardView] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', org: '', email: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSending(true);
    setContactStatus(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          organization: contactForm.org,
          email: contactForm.email,
          message: contactForm.message
        })
      });
      const data = await res.json();
      if (res.ok) {
        setContactStatus(data.message || 'Inquiry successfully transmitted!');
        alert(data.message || 'Inquiry successfully transmitted!');
        setContactForm({ name: '', org: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send inquiry');
      }
    } catch (err: any) {
      setContactStatus(`Error: ${err.message}`);
    } finally {
      setContactSending(false);
    }
  };


  const {
    stations,
    anomalies,
    metrics,
    isConnected,
    lastTickTime,
    soundEnabled,
    setSoundEnabled,
    emergencyMode,
    setEmergencyMode,
    selectedStationId,
    setSelectedStationId,
    acknowledgeAnomaly,
    resolveAnomaly,
    escalateAnomaly,
    injectSimulatedAnomaly
  } = useSocketStream();

  const activeCriticalCount = anomalies.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;

  if (showDashboardView) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
        emergencyMode ? 'bg-red-50' : 'bg-slate-50'
      }`}>
        {/* Command Header */}
        <Header
          isConnected={isConnected}
          lastTickTime={lastTickTime}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          emergencyMode={emergencyMode}
          setEmergencyMode={setEmergencyMode}
          injectSimulatedAnomaly={injectSimulatedAnomaly}
          activeCriticalCount={activeCriticalCount}
          onOpenUploadModal={() => setShowUploadModal(true)}
        />


        {/* Main Dashboard Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unresolvedAlertCount={anomalies.filter(a => a.status === 'UNASSIGNED').length}
          />

          <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
            <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-mono text-slate-600 font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600" /> SkyGuard AI Command Center Active
              </span>
              <button
                onClick={() => setShowDashboardView(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold font-mono transition-colors"
              >
                ← Back to Main Landing Page
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                stations={stations}
                anomalies={anomalies}
                metrics={metrics}
                onSelectStation={(id) => {
                  setSelectedStationId(id);
                  setActiveTab('monitoring');
                }}
                onAcknowledgeAnomaly={acknowledgeAnomaly}
              />
            )}

            {activeTab === 'monitoring' && (
              <RealTimeStream
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
                lastTickTime={lastTickTime}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertTriage
                anomalies={anomalies}
                onAcknowledge={acknowledgeAnomaly}
                onResolve={resolveAnomaly}
                onEscalate={escalateAnomaly}
              />
            )}

            {activeTab === 'history' && (
              <AnomalyHistory anomalies={anomalies} />
            )}

            {activeTab === 'fleet' && (
              <FleetManagement stations={stations} />
            )}

            {activeTab === 'settings' && (
              <SystemSettings />
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-xs">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#60a5fa] flex items-center justify-center text-white shadow-md shadow-[#0ea5e9]/30">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900">
              SkyGuard AI
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase">
              MONITOR • DETECT • PROTECT
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <ul className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <li><a href="#" className="text-[#0ea5e9] border-b-2 border-[#0ea5e9] pb-1">Home</a></li>
          <li><a href="#about" className="hover:text-[#0ea5e9] transition-colors">About</a></li>
          <li><a href="#features" className="hover:text-[#0ea5e9] transition-colors">Features</a></li>
          <li><a href="#livedata" className="hover:text-[#0ea5e9] transition-colors">Live Data</a></li>
          <li><a href="#impact" className="hover:text-[#0ea5e9] transition-colors">Impact</a></li>
          <li><a href="#contact" className="hover:text-[#0ea5e9] transition-colors">Contact</a></li>
        </ul>

        {/* Right Nav Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>Upload Dataset (CSV)</span>
          </button>

          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs text-slate-600 font-mono">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </div>

          <button
            onClick={() => setShowDashboardView(true)}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#60a5fa] hover:from-[#0284c7] hover:to-[#3b82f6] text-white text-sm font-bold flex items-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>


      </nav>

      {/* Hero Banner Section */}
      <section className="relative min-h-[600px] px-8 py-16 flex items-center justify-between overflow-hidden bg-white">
        
        {/* Background Hero Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-90">
          <Image
            src="/aws_hero.jpg"
            alt="Automatic Weather Station on mountain ridge"
            fill
            className="object-cover object-right"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-60% to-transparent" />
        </div>

        {/* Left Hero Text */}
        <div className="relative z-10 max-w-2xl space-y-6 pl-4">
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-0.5 bg-[#0ea5e9]"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-[#0ea5e9] uppercase">
              WEATHER INTELLIGENCE FOR A SAFER TOMORROW
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Smarter Monitoring<br />
            for a <span className="bg-gradient-to-r from-[#0ea5e9] to-[#60a5fa] bg-clip-text text-transparent">Safer Tomorrow</span>
          </h1>

          <p className="text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl">
            SkyGuard AI uses advanced machine learning to detect anomalies in Automatic Weather Stations, enabling early warnings, proactive action, and stronger, more resilient communities.
          </p>

          <div className="flex items-center space-x-4 pt-2">
            <button
              onClick={() => setShowDashboardView(true)}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#60a5fa] hover:from-[#0284c7] hover:to-[#3b82f6] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#0ea5e9]/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Live Data</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => alert('Playing SkyGuard AI introduction video...')}
              className="px-6 py-3.5 rounded-full bg-white border border-slate-200 text-slate-800 font-bold text-sm flex items-center gap-3 shadow-xs hover:bg-slate-50 transition-all"
            >
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </span>
              <span>Watch Video</span>
            </button>
          </div>

        </div>

        {/* Floating Cursive Script Decorator */}
        <div className="hidden lg:block absolute top-24 right-[34%] z-10 text-center transform -rotate-6 pointer-events-none select-none">
          <p className="font-serif italic text-3xl text-sky-600 drop-shadow-sm font-semibold">
            Clearer Skies<br />
            Stronger Communities
          </p>
        </div>

        {/* Floating Live Station Glass Card */}
        <div className="hidden md:block relative z-10 bg-white/85 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-2xl shadow-slate-900/10 w-96 mr-8">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 pb-3 border-b border-slate-200">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Station — Varanasi, UP
            </span>
            <span>Last updated: 10:24 AM</span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sun className="w-10 h-10 text-amber-500" />
              <div>
                <span className="text-3xl font-extrabold text-slate-900 font-sans">28.4 °C</span>
                <p className="text-xs text-slate-500 font-medium">Partly Cloudy</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-600">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1 text-slate-500"><Droplets className="w-3 h-3 text-sky-500" /> Humidity</span>
                <strong className="text-slate-900">62 %</strong>
              </div>
              <div className="flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1 text-slate-500"><Wind className="w-3 h-3 text-sky-500" /> Wind Speed</span>
                <strong className="text-slate-900">12.6 km/h</strong>
              </div>
              <div className="flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1 text-slate-500"><Gauge className="w-3 h-3 text-sky-500" /> Pressure</span>
                <strong className="text-slate-900">1008 hPa</strong>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Wave Transition Divider */}
      <div className="relative w-full overflow-hidden leading-none bg-white">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12 text-slate-50 fill-current">
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

      {/* 3 Pillars Feature Section */}
      <section className="bg-slate-50 py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1 */}
          <div className="flex items-start space-x-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Leaf className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Detect Early</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identify anomalies before they become disasters.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-start space-x-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Enable Action</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Timely alerts for smarter decisions.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-start space-x-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Build Resilient Communities</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering authorities and citizens with reliable insights.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Tagline */}
        <div className="mt-12 text-center border-t border-slate-200/80 pt-6">
          <p className="font-mono text-xs tracking-widest text-slate-400 font-bold uppercase">
            DATA TODAY • SAFER TOMORROW
          </p>
        </div>
      </section>

      {/* SECTION: ABOUT */}
      <section id="about" className="py-20 px-8 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">MISSION & VISION</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2">About SkyGuard AI</h2>
            <p className="text-slate-600 mt-3 text-base">
              Fusing Machine Learning anomaly detection with physical thermodynamic laws to safeguard meteorological networks across India.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5 text-slate-600 text-base leading-relaxed">
              <p>
                Automatic Weather Stations (AWS) form the backbone of national disaster management and climate monitoring. However, hardware degradation, sensor freeze, battery drain, and packet loss often produce false readings that mask severe weather events or trigger false alarms.
              </p>
              <p>
                <strong className="text-slate-900 font-semibold">SkyGuard AI</strong> introduces a 4-level hybrid ML engine—combining physical climatological range bounds, Isolation Forest spatial clustering, and LSTM Autoencoder deep sequence residuals—to validate telemetry in real-time under 20ms latency.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowDashboardView(true)}
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>Launch Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
                <div className="text-3xl font-extrabold text-blue-600 font-sans">248</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">AWS Observatories</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
                <div className="text-3xl font-extrabold text-blue-600 font-sans">98.7%</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">ML Model F1-Score</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
                <div className="text-3xl font-extrabold text-blue-600 font-sans">&lt; 20ms</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Socket Latency</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
                <div className="text-3xl font-extrabold text-blue-600 font-sans">100%</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">SHAP Explainable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FEATURES */}
      <section id="features" className="py-20 px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">INTELLIGENCE SUITE</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2">Key System Features</h2>
            <p className="text-slate-600 mt-3 text-base">
              Engineered for high-stress disaster control operations with real-time telemetry validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Hybrid ML Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Isolation Forest unsupervised clustering combined with LSTM Autoencoder deep residual sequence modeling.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Atom className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Thermodynamic Physics Check</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Cross-validates temperature, humidity, and barometric pressure against Clausius-Clapeyron physical constraints.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">SHAP Explainable AI (XAI)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Provides exact percentage feature attribution breakdown explaining why a sensor reading was flagged.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Low-Latency Socket.io Stream</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Streams 1,840 telemetry readings per second with sub-20ms WebSocket response times.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Disaster Advisory Dispatch</h3>
              <p className="text-xs text-slate-500 leading-relaxed">One-click early warning advisory broadcast channel for State Disaster Response Forces and authorities.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Hardware Diagnostics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Monitors solar radiation charging, battery voltage drops, and 4G LTE signal RSSI levels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: LIVE DATA */}
      <section id="livedata" className="py-20 px-8 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">REAL-TIME MONITORING</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2">Live AWS Telemetry Stream</h2>
            <p className="text-slate-600 mt-3 text-base">
              Select any AWS station to view real-time meteorological readings and active anomaly status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-600">AWS-KED-01</span>
                    <h3 className="font-bold text-lg text-slate-900 mt-0.5">Kedarnath High-Altitude AWS</h3>
                    <p className="text-xs text-slate-500">Rudraprayag, Uttarakhand • 3,583m Elev</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full font-mono text-[10px] font-bold">CRITICAL</span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-center font-mono my-4">
                  <div>
                    <div className="text-[10px] text-slate-500">RAINFALL</div>
                    <div className="text-base font-extrabold text-red-600">112.4 mm/h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">WIND GUST</div>
                    <div className="text-base font-extrabold text-slate-900">64.5 km/h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">PRESSURE</div>
                    <div className="text-base font-extrabold text-amber-600">685.2 hPa</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDashboardView(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open Command Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-600">AWS-WAY-02</span>
                    <h3 className="font-bold text-lg text-slate-900 mt-0.5">Wayanad Ghat AWS Observatory</h3>
                    <p className="text-xs text-slate-500">Wayanad, Kerala • 950m Elev</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full font-mono text-[10px] font-bold">CRITICAL</span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-center font-mono my-4">
                  <div>
                    <div className="text-[10px] text-slate-500">RAINFALL</div>
                    <div className="text-base font-extrabold text-red-600">96.0 mm/h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">SOIL SAT</div>
                    <div className="text-base font-extrabold text-slate-900">245 mm/3h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">HEALTH</div>
                    <div className="text-base font-extrabold text-emerald-600">68.2 %</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDashboardView(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open Command Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: IMPACT */}
      <section id="impact" className="py-20 px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">DISASTER MANAGEMENT</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2">Community Impact Stories</h2>
            <p className="text-slate-600 mt-3 text-base">
              Real-world scenarios where SkyGuard AI enabled early action and prevented disaster loss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full font-mono text-[10px] font-bold mb-3">CLOUDBURST WARNING</span>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Mandakini Valley Evacuation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Detected an intense 112.4 mm/hr microburst rainfall spike with rapid pressure drop in Kedarnath AWS, issuing an automated level 3 early warning 45 minutes before flash flooding occurred.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-mono text-[10px] font-bold mb-3">LANDSLIDE PRECURSOR</span>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Wayanad Soil Saturation Alert</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identified continuous 3-hour precipitation accumulation exceeding slope stability thresholds, enabling district hydrologists to deploy road closures and evacuation advisories.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-mono text-[10px] font-bold mb-3">FALSE ALARM FILTER</span>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Sensor Flatline Diagnostics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Isolated a stuck transducer flatline on Mumbai Santacruz AWS pressure sensor, suppressing unnecessary civic panic while dispatching field maintenance engineers directly to repair the node.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CONTACT */}
      <section id="contact" className="py-20 px-8 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">CONNECT WITH OPERATIONS</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2">Disaster Command Center Contact</h2>
            <p className="text-slate-600 mt-3 text-base">
              Reach out to the SkyGuard Operations Bureau for integration, AWS node deployment, or emergency support.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Dr. S. Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Authority</label>
                  <input
                    type="text"
                    required
                    value={contactForm.org}
                    onChange={(e) => setContactForm({ ...contactForm, org: e.target.value })}
                    placeholder="State Disaster Response Force"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="s.sharma@sdrf.gov.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message / Request Details</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Specify AWS station deployment coordinates or emergency integration inquiry..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={contactSending}
                className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                <span>{contactSending ? 'Transmitting to Ops Email...' : 'Submit Official Inquiry'}</span>
                <Send className="w-4 h-4" />
              </button>
              {contactStatus && (
                <p className="text-center text-xs font-bold text-emerald-600 mt-2">{contactStatus}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Dataset Upload Modal Overlay */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <DatasetUploader onClose={() => setShowUploadModal(false)} />
        </div>
      )}

    </div>
  );
}


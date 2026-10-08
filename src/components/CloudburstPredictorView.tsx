import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CloudLightning,
  CloudRain,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  Compass,
  Radio,
  TrendingDown,
  Gauge,
  Zap,
  RefreshCw,
  Play,
  RotateCcw,
  MapPin,
  Info,
  Waves,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  Car,
  Map as MapIcon
} from 'lucide-react';
import {
  LocationId,
  CloudburstPredictionReport,
  CloudburstHourlyPoint
} from '../types';
import { LOCATIONS } from '../server/dataService';
import { useLanguage } from '../context/LanguageContext';
import { CloudburstRadarMap } from './CloudburstRadarMap';

interface CloudburstPredictorViewProps {
  currentLocation: LocationId;
  onLocationChange: (loc: LocationId) => void;
  onNavigateToForecast?: () => void;
}

export const CloudburstPredictorView: React.FC<CloudburstPredictorViewProps> = ({
  currentLocation,
  onLocationChange,
  onNavigateToForecast
}) => {
  const { language } = useLanguage();
  const [data, setData] = useState<CloudburstPredictionReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [selectedHourlyPoint, setSelectedHourlyPoint] = useState<CloudburstHourlyPoint | null>(null);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [radarViewMode, setRadarViewMode] = useState<'map' | 'scope'>('map');

  const activeLoc = LOCATIONS[currentLocation] || LOCATIONS.delhi;

  const fetchPrediction = async (sim: boolean = isSimulationActive) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cloudburst?location=${currentLocation}&simulate=${sim ? '1' : '0'}`);
      if (res.ok) {
        const json: CloudburstPredictionReport = await res.json();
        setData(json);
        if (json.timeline && json.timeline.length > 0) {
          setSelectedHourlyPoint(json.timeline[0]);
        }
        if (json.radarCells && json.radarCells.length > 0) {
          setActiveCellId(json.radarCells[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cloudburst prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(isSimulationActive);
  }, [currentLocation, isSimulationActive]);

  const toggleSimulation = () => {
    const nextState = !isSimulationActive;
    setIsSimulationActive(nextState);
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
        <div className="relative">
          <CloudLightning className="h-12 w-12 text-sky-600 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </div>
        <p className="mt-4 text-sm font-bold text-slate-800">
          Initializing Atmospheric Convective Sounding Engine...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Evaluating CAPE, Precipitable Water, and IMD Doppler Radar reflectivity across Delhi-NCR.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const selectedPoint = selectedHourlyPoint || data.timeline[0];
  const activeRadarCell = data.radarCells.find((c) => c.id === activeCellId) || data.radarCells[0];

  // Advisory color helpers
  const isRedWarning = data.imdAdvisoryLevel === 'RED_WARNING';
  const isOrangeAlert = data.imdAdvisoryLevel === 'ORANGE_ALERT';
  const badgeBg = isRedWarning ? 'bg-red-600 text-white' : isOrangeAlert ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar & Simulation Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white shadow-xs">
              <CloudLightning className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'hi' ? 'क्लाउडबर्स्ट एवं तीव्र संवहनी तूफान प्रिडिक्टर' : 'Cloudburst & Severe Convective Predictor'}
              </h2>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                IMD &gt;=100 mm/hr Benchmark
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-600 max-w-2xl">
            Coupled thermodynamic convective diagnostics synthesizing CAPE, Precipitable Water (PWAT), Doppler Radar reflectivity (dBZ), and urban flash inundation thresholds for Delhi-NCR.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          
          {/* Simulation Toggle Button */}
          <button
            id="cloudburst-simulation-toggle"
            onClick={toggleSimulation}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isSimulationActive
                ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isSimulationActive ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Simulating 118 mm/hr Cloudburst (Active)</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-red-600 fill-red-600" />
                <span>Test 118 mm/hr Cloudburst Scenario</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            id="cloudburst-refresh-btn"
            onClick={() => fetchPrediction(isSimulationActive)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh convective metrics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Hero Warning Banner & Diagnostic Headline */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
          isRedWarning
            ? 'border-red-300 bg-gradient-to-br from-red-500/10 via-red-50 to-white'
            : isOrangeAlert
            ? 'border-amber-300 bg-gradient-to-br from-amber-500/10 via-amber-50 to-white'
            : 'border-emerald-300 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${badgeBg}`}>
                <AlertTriangle className="h-3.5 w-3.5" />
                {data.imdAdvisoryHeadline.split(':')[0]}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Target Zone: <strong className="text-slate-800">{activeLoc.name}</strong> ({activeLoc.state})
              </span>
              <span className="text-xs text-slate-400">• Updated {data.generatedAt}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {data.imdAdvisoryHeadline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {data.imdBrief}
            </p>
          </div>

          {/* Right Metrics Hero Box */}
          <div className="flex flex-row lg:flex-col items-center justify-around lg:justify-center rounded-xl bg-white/90 border border-slate-200/80 p-4 shadow-xs min-w-[240px] text-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instantaneous Potential
              </div>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className={`font-mono text-3xl sm:text-4xl font-black ${isRedWarning ? 'text-red-600' : isOrangeAlert ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {data.sounding.estimatedRainRateMmHr}
                </span>
                <span className="text-xs font-bold text-slate-600">mm/hr</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                {data.sounding.estimatedRainRateMmHr >= 100
                  ? '⚡ EXCEEDS IMD CLOUDBURST CRITERIA'
                  : 'High-intensity convective downpour'}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 lg:h-px lg:w-full" />

            <div className="flex items-center justify-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Risk Score</span>
                <span className="font-mono text-lg font-black text-slate-900">{data.riskScore}/100</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Risk Tier</span>
                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${badgeBg}`}>
                  {data.currentRiskTier}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Multi-Parameter Convective Sounding Gauges */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Atmospheric Convective Instability Sounding Metrics
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Thresholds calibrated for Indo-Gangetic Plains & Delhi-NCR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* 1. CAPE */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CAPE</span>
              <Zap className={`h-3.5 w-3.5 ${data.sounding.capeJkg > 3000 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900">{data.sounding.capeJkg}</span>
              <span className="text-[10px] text-slate-500 font-semibold">J/kg</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-600">
              {data.sounding.capeJkg > 3500 ? '🔴 Extreme Instability' : data.sounding.capeJkg > 2000 ? '🟠 High Convection' : '🟢 Moderate'}
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.sounding.capeJkg / 4500) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Precipitable Water (PWAT) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PWAT Column</span>
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900">{data.sounding.pwatMm}</span>
              <span className="text-[10px] text-slate-500 font-semibold">mm</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-600">
              {data.sounding.pwatMm >= 60 ? '🔴 Tropical Saturation' : data.sounding.pwatMm >= 45 ? '🟠 Heavy Moisture' : '🟢 Normal'}
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.sounding.pwatMm / 75) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. CIN (Convective Inhibition) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CIN (Cap)</span>
              <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900">{data.sounding.cinJkg}</span>
              <span className="text-[10px] text-slate-500 font-semibold">J/kg</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-600">
              {Math.abs(data.sounding.cinJkg) < 25 ? '⚡ Cap Breached' : '🛡️ Thermal Inversion Cap'}
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (Math.abs(data.sounding.cinJkg) / 150) * 100)}%` }}
              />
            </div>
          </div>

          {/* 4. Lifted Index */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lifted Index</span>
              <Activity className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900">{data.sounding.liftedIndexK}</span>
              <span className="text-[10px] text-slate-500 font-semibold">K</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-600">
              {data.sounding.liftedIndexK < -6 ? '🔴 Severe Updraft' : '🟠 Unstable Parcel'}
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (Math.abs(data.sounding.liftedIndexK) / 10) * 100)}%` }}
              />
            </div>
          </div>

          {/* 5. Max Doppler Reflectivity */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Radar Max</span>
              <Radio className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900">{data.sounding.maxReflectivityDbz}</span>
              <span className="text-[10px] text-slate-500 font-semibold">dBZ</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-600">
              {data.sounding.maxReflectivityDbz >= 60 ? '🟣 Hail / Cloud Core' : '🔴 Heavy Rain Shaft'}
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.sounding.maxReflectivityDbz / 70) * 100)}%` }}
              />
            </div>
          </div>

          {/* 6. Updraft Velocity */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Updraft Speed</span>
              <Compass className="h-3.5 w-3.5 text-sky-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900">{data.sounding.updraftVelocityMs}</span>
              <span className="text-[10px] text-slate-500 font-semibold">m/s</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-600">
              Top: {data.sounding.echoTopHeightKm} km (Tropopause)
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-sky-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.sounding.updraftVelocityMs / 40) * 100)}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Convective Radar Surveillance & Active Storm Tracking */}
      <div className="space-y-4">
        
        {/* Radar View Mode Switcher Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Doppler Radar Surveillance & Convective Cell Tracking
              </h3>
              <p className="text-xs text-slate-500 hidden sm:block">
                IMD Delhi Palam C-Band Doppler Weather Radar (100km radius) monitoring convective cloud clusters
              </p>
            </div>
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setRadarViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                radarViewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Interactive GIS Map</span>
            </button>
            <button
              onClick={() => setRadarViewMode('scope')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                radarViewMode === 'scope'
                  ? 'bg-slate-900 text-emerald-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>CRT Scope</span>
            </button>
          </div>
        </div>

        {/* Two-Column Display: Radar Display + Active Cell Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 cols: Radar (Interactive GIS Map or CRT Scope) */}
          <div className="lg:col-span-7">
            {radarViewMode === 'map' ? (
              <CloudburstRadarMap
                radarCells={data.radarCells}
                inundationCheckpoints={data.inundationCheckpoints}
                currentLocation={currentLocation}
                activeCellId={activeCellId}
                onSelectCell={(cellId) => setActiveCellId(cellId)}
                isSimulatedSevere={isSimulationActive}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      Virtual IMD Doppler Weather Radar Scope (Delhi Palam / Mausam Bhawan)
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
                    C-BAND DWR • 100KM RADIUS
                  </span>
                </div>

                {/* Radar Screen Canvas / Visual */}
                <div className="relative aspect-[4/3] w-full rounded-xl bg-[#030914] border border-slate-800 overflow-hidden flex items-center justify-center">
                  
                  {/* Range Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-[25%] w-[25%] rounded-full border border-emerald-500/20" />
                    <div className="h-[50%] w-[50%] rounded-full border border-emerald-500/20" />
                    <div className="h-[75%] w-[75%] rounded-full border border-emerald-500/20" />
                    <div className="h-[96%] w-[96%] rounded-full border border-emerald-500/30" />
                    {/* Crosshairs */}
                    <div className="absolute h-full w-[1px] bg-emerald-500/20" />
                    <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                  </div>

                  {/* Rotating Sweep Beam */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none flex items-center justify-center origin-center"
                  >
                    <div
                      className="w-1/2 h-full absolute right-1/2 top-0 origin-right"
                      style={{
                        background: 'conic-gradient(from 180deg at 100% 50%, rgba(16, 185, 129, 0.25) 0deg, transparent 45deg)'
                      }}
                    />
                  </motion.div>

                  {/* Central Station Marker (Delhi / Palam) */}
                  <div className="absolute z-20 flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-white border-2 border-emerald-400 shadow-[0_0_10px_#10b981]" />
                    <span className="font-mono text-[9px] font-bold text-emerald-300 mt-0.5 bg-slate-900/80 px-1 rounded">
                      DELHI CORE
                    </span>
                  </div>

                  {/* Surrounding Landmark Labels */}
                  <span className="absolute top-4 left-6 text-[9px] font-mono text-slate-500">ROHTAK (NW)</span>
                  <span className="absolute top-4 right-6 text-[9px] font-mono text-slate-500">MEERUT (NE)</span>
                  <span className="absolute bottom-4 left-6 text-[9px] font-mono text-slate-500">GURUGRAM (SW)</span>
                  <span className="absolute bottom-4 right-6 text-[9px] font-mono text-slate-500">NOIDA (SE)</span>

                  {/* Convective Cells plotted on Radar */}
                  {data.radarCells.map((cell, idx) => {
                    const isSelected = cell.id === activeCellId;
                    const topPositions = ['28%', '42%', '65%'];
                    const leftPositions = ['34%', '68%', '38%'];
                    const top = topPositions[idx % topPositions.length];
                    const left = leftPositions[idx % leftPositions.length];

                    return (
                      <div
                        key={cell.id}
                        onClick={() => setActiveCellId(cell.id)}
                        style={{ top, left }}
                        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          <div
                            className={`h-12 w-12 rounded-full blur-xs opacity-80 ${
                              cell.peakDbz >= 60
                                ? 'bg-purple-600/70'
                                : cell.peakDbz >= 50
                                ? 'bg-red-600/70'
                                : 'bg-amber-500/70'
                            }`}
                          />
                          <div
                            className={`absolute h-4 w-4 rounded-full border-2 ${
                              isSelected ? 'border-white bg-red-500 scale-125' : 'border-amber-300 bg-red-600'
                            } transition-transform shadow-[0_0_8px_#ef4444]`}
                          />
                        </div>

                        <div className="mt-1 flex flex-col items-center">
                          <span className="font-mono text-[9px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-xs">
                            {cell.peakDbz} dBZ • ETA {cell.etaMinutes}m
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Radar Legend (dBZ Scale) */}
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded bg-slate-950/80 px-2 py-1 border border-slate-800 text-[8px] font-mono text-slate-300">
                    <span>15 dBZ</span>
                    <div className="flex h-2 w-24 rounded-full overflow-hidden">
                      <span className="w-1/4 bg-emerald-500" />
                      <span className="w-1/4 bg-yellow-400" />
                      <span className="w-1/4 bg-red-600" />
                      <span className="w-1/4 bg-purple-600" />
                    </div>
                    <span>65+ dBZ</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Right 5 cols: Active Cell Telemetry & Vector Analysis */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Target Cell Telemetry ({activeRadarCell.name.split(' ')[0]})
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                Tracking
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classification</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{activeRadarCell.cellType}</div>
                <div className="text-xs text-slate-600 mt-1">
                  Radar coordinates: {activeRadarCell.lat}°N, {activeRadarCell.lon}°E
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Core Reflectivity</div>
                  <div className="font-mono text-xl font-black text-red-600">{activeRadarCell.peakDbz} dBZ</div>
                  <div className="text-[10px] text-slate-500">Torrential rain shaft</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Estimated Rain Rate</div>
                  <div className="font-mono text-xl font-black text-sky-600">{activeRadarCell.rainRatePotentialMmHr} mm/h</div>
                  <div className="text-[10px] text-slate-500">Instantaneous discharge</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Vector & Speed</div>
                  <div className="font-mono text-base font-bold text-slate-900">
                    {activeRadarCell.speedKmh} km/h • {activeRadarCell.bearingDeg}°
                  </div>
                  <div className="text-[10px] text-slate-500">Steering wind alignment</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Delhi Ingress ETA</div>
                  <div className="font-mono text-xl font-black text-amber-600">{activeRadarCell.etaMinutes} mins</div>
                  <div className="text-[10px] text-slate-500">Direct trajectory to core</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
            <strong>Meteorologist Note:</strong> Severe convective cells with reflectivity exceeding 58 dBZ over the NCR basin create violent downbursts and localized cloudbursts capable of overwhelming urban storm drains in under 15 minutes.
          </div>
        </div>

      </div>
      </div>

      {/* 5. 72-Hour Prognostic Cloudburst & Rain Rate Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-600" />
              72-Hour Convective Risk & Rain Rate Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any hour block to inspect thermodynamic soundings and PM2.5 wet scavenging predictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
              <span className="h-2 w-2 rounded-full bg-red-600" /> Cloudburst &gt;=100mm/h
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Alert &gt;=45mm/h
            </span>
          </div>
        </div>

        {/* Horizontal Timeline Bar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {data.timeline.map((point) => {
            const isSelected = selectedPoint.timeLabel === point.timeLabel;
            const isCloudburstTier = point.expectedRainRateMmHr >= 100;
            const isAlertTier = point.expectedRainRateMmHr >= 45;

            return (
              <div
                key={point.timeLabel}
                onClick={() => setSelectedHourlyPoint(point)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : isCloudburstTier
                    ? 'border-red-300 bg-red-50/70 hover:bg-red-100/60'
                    : isAlertTier
                    ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/60'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {point.timeLabel}
                  </span>
                  <span className={`text-[9px] font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {point.timestamp}
                  </span>
                </div>

                <div className="mt-2 text-center">
                  <div className="font-mono text-xl font-black">
                    {point.expectedRainRateMmHr}
                    <span className="text-[10px] font-normal ml-0.5">mm/h</span>
                  </div>
                  <div className={`text-[9px] font-bold mt-1 uppercase ${isSelected ? 'text-sky-300' : 'text-slate-600'}`}>
                    CAPE {point.capeJkg}
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span
                    className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isCloudburstTier
                        ? 'bg-red-600 text-white'
                        : isAlertTier
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {point.riskTier}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Inspection Card for Selected Hour */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase">
                Prognosis for Window {selectedPoint.timeLabel} ({selectedPoint.timestamp})
              </span>
              <span className="text-xs text-slate-500 ml-2">
                Urban Flood Vulnerability: <strong className={selectedPoint.urbanFloodVulnerability === 'HIGH' ? 'text-red-600' : 'text-slate-700'}>{selectedPoint.urbanFloodVulnerability}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span>Rain Probability: <strong>{selectedPoint.riskProbabilityPercent}%</strong></span>
              <span>•</span>
              <span>PWAT: <strong>{selectedPoint.pwatMm} mm</strong></span>
              <span>•</span>
              <span>Radar Reflectivity: <strong>{selectedPoint.reflectivityDbz} dBZ</strong></span>
            </div>
          </div>

          {/* PM2.5 Scavenging Plunge Indicator */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700">
                <strong>Atmospheric Wet Deposition Scavenging:</strong> Pre-storm PM2.5 of <strong>{selectedPoint.pm25PreStorm} µg/m³</strong> is projected to drop to <strong>{selectedPoint.pm25PostStorm} µg/m³</strong> (-{selectedPoint.projectedPm25ScavengingPercent}% washout) during this rain spell.
              </span>
            </div>
            {onNavigateToForecast && (
              <button
                onClick={onNavigateToForecast}
                className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
              >
                <span>View Full AQI Forecast</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 6. Urban Inundation & Flash Flood Vulnerability Checkpoints */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {activeLoc.name} Critical Urban Inundation & Underpass Checkpoints
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Real-time drainage saturation capacity vs Instantaneous Rain Rate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {data.inundationCheckpoints.map((chk) => {
            const isFlooding = chk.currentRisk === 'CRITICAL_FLOODING';
            const isWarning = chk.currentRisk === 'WATERLOGGING_WARNING';

            return (
              <div
                key={chk.id}
                className={`rounded-xl border p-4 transition-all ${
                  isFlooding
                    ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{chk.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{chk.location}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                      isFlooding
                        ? 'bg-red-600 text-white'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {chk.currentRisk.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white/90 p-2 border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Drainage Limit</span>
                    <span className="font-mono font-bold text-slate-800">{chk.drainageCapacityMmHr} mm/h</span>
                  </div>
                  <div className="rounded-lg bg-white/90 p-2 border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Critical Burst</span>
                    <span className="font-mono font-bold text-red-600">{chk.criticalThresholdMmHr} mm/h</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="text-slate-700 flex items-start gap-1">
                    <Car className="h-3 w-3 text-slate-500 mt-0.5 shrink-0" />
                    <span>{chk.trafficImpact}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    Precedent: {chk.historicalIncident}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Coupled Aerosol Wet Scavenging & Disaster Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Atmospheric Chemistry & Wet Scavenging */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Waves className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Coupled PM2.5 Wet Scavenging Dynamics
              </h4>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-around rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Pre-Storm PM2.5</div>
                  <div className="font-mono text-2xl font-black text-red-600">
                    {data.wetScavengingDiagnostics.baselinePm25UgM3} µg/m³
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">Severe Air Quality</span>
                </div>

                <div className="text-2xl font-bold text-slate-300">➔</div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Post-Cloudburst PM2.5</div>
                  <div className="font-mono text-2xl font-black text-emerald-600">
                    {data.wetScavengingDiagnostics.postScavengingPm25UgM3} µg/m³
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    -{data.wetScavengingDiagnostics.scavengingEfficiencyPercent}% Washout
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Physical Mechanism:</strong> {data.wetScavengingDiagnostics.washoutMechanism}
              </p>

              <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-xs text-sky-900">
                <strong>Post-Storm Fog Caution:</strong> High surface moisture and nocturnal radiational cooling will re-entrain moisture within <strong>~{data.wetScavengingDiagnostics.fogReformationRiskHours} hours</strong>, creating dense radiation fog and secondary aerosol formation.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Slinn Aerosol Impaction Model</span>
            <span className="font-mono">R-squared = 0.91</span>
          </div>
        </div>

        {/* Right: Disaster Management & Civic Directives */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <ShieldCheck className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Disaster Management & Civic Action Directives
            </h4>
          </div>

          <div className="mt-4 space-y-2.5">
            {data.disasterManagementRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Protocol aligned with NDMA & DDMA monsoon guidelines</span>
            <span className="font-semibold text-slate-700">CPCB & IMD Telemetry Grounded</span>
          </div>
        </div>

      </div>

    </div>
  );
};

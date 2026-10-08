import React from 'react';
import {
  Wind,
  Clock,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { PlumePrediction } from '../types';

interface PlumePredictionCardProps {
  plume: PlumePrediction;
  onOpenMap?: () => void;
}

export const PlumePredictionCard: React.FC<PlumePredictionCardProps> = ({
  plume,
  onOpenMap,
}) => {
  return (
    <div
      id="plume-prediction-card"
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              Pollution Plume Tracking & Arrival Forecast
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Regional smoke plume detected along North-Western transport corridor
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
          ACTIVE ADVECTIVE TRANSPORT
        </span>
      </div>

      {/* Main Grid: Corridor, Arrival Countdown, Impact, Confidence */}
      <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        
        {/* Corridor */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5 text-slate-700" />
            Predicted Path
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 flex items-center gap-1">
            <span>Punjab</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span>Haryana</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span className="text-red-600">Delhi NCR</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Bearing: 315° NW at 18 km/h advection
          </div>
        </div>

        {/* Arrival ETA */}
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 text-red-600" />
            Estimated Arrival
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-red-600">
            {plume.estimatedArrivalFormatted}
          </div>
          <div className="mt-0.5 text-[10px] text-red-700/80 font-semibold">
            Expected: {plume.estimatedArrivalTime}
          </div>
        </div>

        {/* Expected PM2.5 Impact */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            Expected PM2.5 Load
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-amber-700">
            +{plume.expectedPm25ImpactPercent}%
          </div>
          <div className="mt-0.5 text-[10px] text-amber-800/80 font-semibold">
            ~+85 to 110 µg/m³ increment
          </div>
        </div>

        {/* Confidence */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Model Confidence
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-emerald-700">
            {plume.confidencePercent}%
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            HYSPLIT & WRF trajectory agreement
          </div>
        </div>

      </div>

      {/* Visual Plume Trajectory Simulation Strip */}
      <div className="relative z-10 mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Estimated plume trajectory (Advection Vector)</span>
          <span className="font-mono text-[10px] text-slate-500">Trajectory Model: NOAA HYSPLIT Emulation</span>
        </div>

        {/* Visual Stepper / Progress Path */}
        <div className="relative flex items-center justify-between gap-2 pt-2">
          {/* Background line */}
          <div className="absolute left-6 right-6 top-5 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-slate-300 rounded-full" />

          {/* Step 1: Upwind Source */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 border-2 border-white text-white shadow-xs">
              <Flame className="h-3.5 w-3.5" />
            </div>
            <span className="mt-1 text-[11px] font-bold text-slate-800">Punjab Fires</span>
            <span className="text-[9px] text-slate-400">Origin (0h)</span>
          </div>

          {/* Step 2: Mid-corridor transport */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 border-2 border-white text-white shadow-xs">
              <Wind className="h-3.5 w-3.5" />
            </div>
            <span className="mt-1 text-[11px] font-bold text-slate-800">Haryana Corridor</span>
            <span className="text-[9px] text-slate-400">Transit (+3.5h)</span>
          </div>

          {/* Step 3: NCR Basin Ingress */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 border-2 border-white text-white shadow-xs animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <span className="mt-1 text-[11px] font-bold text-red-700">Delhi NCR Ingress</span>
            <span className="text-[9px] font-mono text-red-600">ETA ~{plume.estimatedArrivalFormatted}</span>
          </div>

          {/* Step 4: Nocturnal Inversion Trapping */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 border border-slate-300 text-slate-700">
              <span className="text-[10px] font-bold">23:00</span>
            </div>
            <span className="mt-1 text-[11px] font-bold text-slate-700">Surface Trapping</span>
            <span className="text-[9px] text-slate-400">Peak Severe AQI</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[11px]">
          <span className="text-slate-600">
            {plume.statusExplanation}
          </span>
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              View on live map →
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

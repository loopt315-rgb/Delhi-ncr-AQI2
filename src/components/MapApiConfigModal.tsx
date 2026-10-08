import React, { useState } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Info,
  MapPin
} from 'lucide-react';

interface MapApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapApiConfigModal: React.FC<MapApiConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [googleMapsKey, setGoogleMapsKey] = useState<string>(() => {
    return localStorage.getItem('user_google_maps_key') || '';
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('user_google_maps_key', googleMapsKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Map Visibility & API Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Current base map sources and custom API key options
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          
          {/* Active Free Providers Status */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Clean High-Resolution Maps Active (Zero Watermarks, No API Key Required)</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800/90 leading-normal">
              We have loaded full-fidelity geographic mapping powered by <strong>Esri World Streets</strong>, <strong>OpenStreetMap HD</strong>, and <strong>Esri Satellite Aerial</strong>. All tiles are 100% clean with <strong>zero watermarks</strong> and require no API keys.
            </p>
          </div>

          {/* Optional Google Maps Platform Integration */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Google Maps Platform API Key (Optional)</span>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Pro Feature
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              If you have a Google Maps API Key or want to enable Google Air Quality API tiles and Street View, you can paste it below:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={googleMapsKey}
                onChange={(e) => setGoogleMapsKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
              />
              <button
                onClick={handleSave}
                className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                {isSaved ? 'Saved!' : 'Save'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Need a free Google Maps Demo Key?</span>
              <a
                href="https://mapsplatform.google.com/maps-demo-key"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
              >
                <span>Get Demo Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Live Data Sources List */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-600" />
              <span>Data Feeds Connected to Map</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>CPCB / DPCC 31 Stations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Open-Meteo ECMWF Wind</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>NASA VIIRS Stubble Fires</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Real-time IDW Dispersion</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Got It, View Map
          </button>
        </div>

      </div>
    </div>
  );
};

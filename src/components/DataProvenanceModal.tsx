import React, { useState, useEffect } from 'react';
import { ProvenanceReport } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  X,
  Database,
  Radio,
  Satellite,
  Sparkles,
  Info,
  Key
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const [provenance, setProvenance] = useState<ProvenanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProvenance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/provenance');
      if (res.ok) {
        const data = await res.json();
        setProvenance(data);
      }
    } catch (err) {
      console.error('Failed to fetch data provenance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProvenance();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="provenance-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div
        id="provenance-modal"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'hi' ? 'डेटा विश्वसनीयता एवं आधिकारिक स्रोत' : 'Data Reliability & Official Sources'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'वास्तविक CAAQMS मॉनिटर, उपग्रहों और वायुमंडलीय मॉडलों का पारदर्शी सत्यापन।'
                  : 'Transparent verification of real CAAQMS monitors, satellites, and atmospheric soundings.'}
              </p>
            </div>
          </div>

          <button
            id="close-provenance-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Operating Mode Banner */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-800 tracking-wider">
                {provenance?.overallMode === 'fully_live'
                  ? (language === 'hi' ? '100% पूर्ण लाइव स्ट्रीम सक्रिय' : '100% Fully Live Stream Active')
                  : (language === 'hi' ? 'हाइब्रिड लाइव वैज्ञानिक मॉडल सक्रिय' : 'Hybrid Live Scientific Model Active')}
              </span>
            </div>
            <button
              onClick={fetchProvenance}
              disabled={isLoading}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'फ़ीड्स जांचें' : 'Verify Feeds'}</span>
            </button>
          </div>
          <p className="mt-1.5 text-xs text-emerald-900 leading-relaxed">
            {provenance?.summary ||
              (language === 'hi'
                ? 'लाइव यूरोपीय कोपरनिकस (CAMS) मॉडल, ECMWF वायुमंडलीय जांच और नासा FIRMS उपग्रहों से वास्तविक समय में आंकड़े प्राप्त किए जाते हैं।'
                : 'Real atmospheric and meteorological observations are queried in real time from live European Copernicus (CAMS) models, ECMWF soundings, and NASA FIRMS satellites.')}
          </p>
        </div>

        {/* Breakdown of Integrated Data Providers */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'hi' ? 'संबद्ध वायुमंडलीय टेलीमेट्री सेवाएं' : 'Connected Atmospheric Telemetry Services'}
          </h3>

          {provenance?.sources.map((src) => {
            const isLive = src.status === 'live_active';
            return (
              <div
                key={src.id}
                className={`rounded-xl border p-4 transition-all ${
                  isLive
                    ? 'border-emerald-200 bg-white hover:border-emerald-300'
                    : 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {src.id === 'waqi' && <Database className="h-4 w-4 text-slate-700" />}
                    {src.id === 'open-meteo' && <Radio className="h-4 w-4 text-blue-600" />}
                    {src.id === 'nasa-firms' && <Satellite className="h-4 w-4 text-red-600" />}
                    {src.id === 'gemini' && <Sparkles className="h-4 w-4 text-purple-600" />}

                    <span className="text-sm font-bold text-slate-900">{src.name}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isLive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isLive ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{language === 'hi' ? 'लाइव सक्रिय' : 'LIVE ACTIVE'}</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-3 w-3" />
                        <span>{language === 'hi' ? 'वैकल्पिक टोकन' : 'OPTIONAL TOKEN'}</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-1 text-xs text-slate-600 font-medium">
                  {src.provider} • <span className="text-slate-500 font-normal">{src.dataType}</span>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {src.details}
                </p>

                {src.registrationUrl && !src.isKeyConfigured && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-white border border-amber-200 p-2.5 text-xs">
                    <span className="text-amber-800">
                      {language === 'hi'
                        ? 'CPCB ग्राउंड स्ट्रीम के लिए टोकन आवश्यक:'
                        : 'Token required for direct raw CPCB ground stream:'}{' '}
                      <code className="font-mono font-bold bg-amber-50 px-1 py-0.5 rounded">{src.apiKeyName}</code>
                    </span>
                    <a
                      href={src.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <span>{language === 'hi' ? 'मुफ्त की प्राप्त करें' : 'Get Free Key'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guidance for User */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Info className="h-4 w-4 text-blue-600" />
            <span>{language === 'hi' ? 'अपना निःशुल्क WAQI CPCB टोकन कैसे कनेक्ट करें' : 'How to Connect Your Free WAQI CPCB Token'}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'यह ऐप वर्तमान में बिना किसी क्रेडेंशियल के लाइव यूरोपीय कोपरनिकस (CAMS) वायु गुणवत्ता डेटा और ECMWF ध्वनि की जांच करता है। NDTV द्वारा उपयोग किए जाने वाले सटीक CPCB स्टेशन-स्तरीय फ़ीड को सक्षम करने के लिए:'
              : 'The app currently queries live European Copernicus (CAMS) air quality data and ECMWF planetary boundary layer soundings without requiring any credentials. To enable the exact station-level CPCB feed used by NDTV:'}
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
            <li>{language === 'hi' ? '10 सेकंड में मुफ्त टोकन प्राप्त करें:' : 'Generate a free token in 10 seconds at'}{' '}
              <a href="https://aqicn.org/data-platform/token/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">aqicn.org/data-platform/token/</a>.</li>
            <li>{language === 'hi' ? 'AI Studio सेटिंग्स / सीक्रेट्स मेनू में जोड़ें:' : 'Add'}{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">WAQI_API_TOKEN</code>.</li>
            <li>{language === 'hi' ? 'सर्वर स्वचालित रूप से सभी 28 स्टेशनों पर वास्तविक समय CAAQMS डेटा स्ट्रीम करेगा।' : 'The server automatically detects the key and streams real-time CAAQMS data across all 28 Delhi NCR stations.'}</li>
          </ol>
        </div>

        {/* Modal Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'समझ गया, बंद करें' : 'Got it, Close'}
          </button>
        </div>

      </div>
    </div>
  );
};

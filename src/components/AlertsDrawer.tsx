import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Flame,
  Wind,
  Clock,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { PredictiveAlert } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PredictiveAlert[];
  onOpenConfigure: () => void;
  onViewForecast: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onOpenConfigure,
  onViewForecast,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'hi' ? 'सक्रिय पूर्वानुमानित चेतावनियां' : 'Active Predictive Alerts'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === 'hi'
                ? `आपके क्षेत्र के लिए ${alerts.length} सक्रिय चेतावनी(यां)`
                : `${alerts.length} proactive warning(s) active for your zone`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#f8fafc]">
        {alerts.map((a) => {
          const isSevere = a.severity === 'severe' || a.severity === 'critical';
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-4 transition-all shadow-2xs ${
                isSevere
                  ? 'border-red-200 bg-red-50/80 text-slate-800'
                  : 'border-amber-200 bg-amber-50/80 text-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${isSevere ? 'text-red-700' : 'text-amber-700'}`} />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {language === 'hi' ? 'अग्रिम समय:' : 'Lead time:'} {a.leadTimeHours}h
                  </span>
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                    isSevere ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {a.severity}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-bold text-slate-900">
                {a.title}
              </h4>

              <p className="mt-1 text-slate-700 leading-normal">
                {a.description}
              </p>

              <div className="mt-3 space-y-1 border-t border-slate-200/80 pt-2 text-[11px]">
                <div className="font-bold text-slate-700">
                  {language === 'hi' ? 'ट्रिगर परिस्थितियां:' : 'Trigger Conditions:'}
                </div>
                {a.reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-600">
                    <span className={isSevere ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {language === 'hi' ? 'जारी:' : 'Issued'} {a.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Footer */}
      <div className="border-t border-slate-200 bg-white p-3 flex items-center justify-between">
        <button
          onClick={() => {
            onClose();
            onOpenConfigure();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>{language === 'hi' ? 'अलर्ट कॉन्फ़िगर करें' : 'Configure Alerts'}</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onViewForecast();
          }}
          className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer shadow-2xs"
        >
          <span>{language === 'hi' ? 'पूर्वानुमान देखें' : 'View Forecast'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

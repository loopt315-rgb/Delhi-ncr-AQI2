import React from 'react';
import {
  Sliders,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { PredictiveAlert } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SmartAlertsCardProps {
  alerts: PredictiveAlert[];
  onViewForecast: () => void;
  onOpenConfigure?: () => void;
}

export const SmartAlertsCard: React.FC<SmartAlertsCardProps> = ({
  alerts,
  onViewForecast,
  onOpenConfigure,
}) => {
  const { language, t } = useLanguage();
  const primaryAlert = alerts[0];

  if (!primaryAlert) return null;

  const isSafe = primaryAlert.severity === 'safe';
  const isInfo = primaryAlert.severity === 'info';
  const isSevere = primaryAlert.severity === 'severe';

  const cardStyle = isSafe
    ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
    : isInfo
    ? 'border-yellow-200 bg-yellow-50/90 text-yellow-950'
    : isSevere
    ? 'border-red-300 bg-red-50/90 text-red-950'
    : 'border-orange-200 bg-orange-50/90 text-orange-950';

  const badgeColor = isSafe
    ? 'text-emerald-700'
    : isInfo
    ? 'text-yellow-800'
    : isSevere
    ? 'text-red-700'
    : 'text-orange-700';

  const dotColor = isSafe
    ? 'bg-emerald-600'
    : isInfo
    ? 'bg-yellow-600'
    : 'bg-red-600';

  const pingColor = isSafe
    ? 'bg-emerald-400'
    : isInfo
    ? 'bg-yellow-400'
    : 'bg-red-400';

  const btnColor = isSafe
    ? 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700'
    : isInfo
    ? 'border-yellow-700 bg-yellow-700 hover:bg-yellow-800'
    : 'border-red-600 bg-red-600 hover:bg-red-700';

  const iconEmoji = isSafe ? '🟢' : isInfo ? '🟡' : isSevere ? '🚨' : '⚠️';

  return (
    <div
      id="predictive-alerts-card"
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6 ${cardStyle}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Alert Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingColor}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${dotColor}`}></span>
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
              {isSafe
                ? (language === 'hi' ? 'वायु गुणवत्ता स्थिति विंडो' : 'Air Quality Status Window')
                : (language === 'hi' ? 'पूर्वानुमान आधारित अग्रिम चेतावनी' : 'Proactive Predictive Alert')}
            </span>
            <span className="text-[11px] opacity-75 font-medium">
              • {language === 'hi' ? 'अनुमानित AQI' : 'Projected AQI'} ~{primaryAlert.projectedAqi} ({language === 'hi' ? `अगले ${primaryAlert.leadTimeHours} घंटे` : `Next ${primaryAlert.leadTimeHours}h`})
            </span>
          </div>

          <h3 className="mt-2 text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <span>{iconEmoji}</span>
            <span>{primaryAlert.title}</span>
          </h3>

          <p className="mt-1 text-xs sm:text-sm leading-normal opacity-90">
            {primaryAlert.description}
          </p>

          {/* Root Contributing Reasons */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold">{language === 'hi' ? 'वायुमंडलीय संकेत:' : 'Atmospheric Indicators:'}</span>
            {primaryAlert.reasons.map((r, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/90 px-2.5 py-1 text-slate-800 font-medium shadow-2xs"
              >
                <span className="font-bold">•</span>
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="alert-configure-btn"
            onClick={onOpenConfigure}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-500" />
            {t('configure')}
          </button>

          <button
            id="alert-view-forecast-btn"
            onClick={onViewForecast}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${btnColor}`}
          >
            <span>{t('viewForecast')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};


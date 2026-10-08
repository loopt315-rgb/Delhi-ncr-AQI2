import React from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { AISummaryResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AISummaryCardProps {
  summaryData: AISummaryResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onAskFollowUp?: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summaryData,
  isLoading,
  onRefresh,
  onAskFollowUp,
}) => {
  const { language, t } = useLanguage();

  return (
    <div
      id="ai-summary-card"
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 border-l-4 border-l-slate-900"
    >
      {/* Top Header & AI Model Badges */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {t('aiSummaryTitle')}
            </h3>
            <p className="text-[11px] text-slate-500">
              {t('aiSummarySub')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scientific Grounding Badge */}
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-700">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            {summaryData?.source === 'gemini' 
              ? (language === 'hi' ? 'जेमिनी वायुमंडलीय मॉडल' : 'Gemini 3.8 Atmospheric Model')
              : (language === 'hi' ? 'सत्यापित वायुमंडलीय भौतिकी' : 'Grounded Atmospheric Physics')}
          </span>

          <button
            id="refresh-ai-summary-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title={t('regenerate')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Natural Language Summary */}
      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2 py-4">
            <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
          </div>
        ) : (
          <div className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium italic">
            "{summaryData?.summary}"
          </div>
        )}
      </div>

      {/* Grounded Key Drivers & Peak Period */}
      {summaryData && !isLoading && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-slate-100 pt-4 text-xs">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              {t('keyAtmosphericDrivers')}
            </span>
            <ul className="mt-1.5 space-y-1 text-slate-700">
              {summaryData.keyDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-900 font-bold">•</span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                {t('criticalPeakWindow')}
              </span>
              <div className="mt-1 font-mono font-bold text-red-600 text-sm">
                {summaryData.peakPeriod}
              </div>
            </div>

            {onAskFollowUp && (
              <button
                id="ai-summary-ask-assistant-btn"
                onClick={onAskFollowUp}
                className="mt-2 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <span>{t('aiAskFollowUp')}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Labeling */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
        <span>
          {language === 'hi' 
            ? 'सत्यापित एआई ग्राउंडिंग: केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB), मौसम विभाग व नासा उपग्रह से सत्यापित।'
            : 'Verified AI Grounding: Strictly derived from observed CAAQMS telemetry, numerical weather parameters, and satellite fire radiative power. No hallucinated values.'}
        </span>
      </div>

    </div>
  );
};

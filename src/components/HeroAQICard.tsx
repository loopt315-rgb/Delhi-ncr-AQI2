import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { CurrentAQIResponse } from '../types';
import { getOfficialAQITier, CPCB_AQI_TIERS } from '../utils/colors';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryLabel, getCategoryMeaning } from '../utils/translations';

interface HeroAQICardProps {
  data: CurrentAQIResponse;
  onExploreFactors: () => void;
  onViewForecast: () => void;
}

export const HeroAQICard: React.FC<HeroAQICardProps> = ({
  data,
  onExploreFactors,
  onViewForecast,
}) => {
  const { language, t } = useLanguage();
  const tier = getOfficialAQITier(data.aqi);
  const localizedCategory = getCategoryLabel(tier.officialLevel, language);
  const localizedMeaning = getCategoryMeaning(tier.officialLevel, language);

  // Compute scale position percentage capped at 100%
  const scalePercent = Math.min(100, Math.max(2, (data.aqi / 500) * 100));

  // Dynamic comparison against WHO & Indian CPCB Standards
  const pm25Val = data.pollutants.pm25;
  const pm25WhoRatio = (pm25Val / 15).toFixed(1);
  const pm25Subtext = pm25Val <= 15
    ? (language === 'hi' ? 'WHO 24 घंटे के सुरक्षित मानक में' : 'Within WHO 24h guideline')
    : pm25Val <= 60
    ? (language === 'hi' ? 'CPCB मानक के अनुसार' : 'Within CPCB safe standard')
    : (language === 'hi' ? `WHO सीमा से ${pm25WhoRatio} गुना अधिक` : `${pm25WhoRatio}x WHO 24h limit`);

  const pm10Val = data.pollutants.pm10;
  const pm10CpcbRatio = (pm10Val / 100).toFixed(1);
  const pm10Subtext = pm10Val <= 100
    ? (language === 'hi' ? 'CPCB मानक के अनुसार' : 'Within CPCB 24h standard')
    : (language === 'hi' ? `CPCB सीमा से ${pm10CpcbRatio} गुना अधिक` : `${pm10CpcbRatio}x CPCB safe limit`);

  return (
    <div
      id="hero-aqi-card"
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Corner decorative accent themed to current AQI tier with breathing atmospheric aura */}
      <motion.div
        className="pointer-events-none absolute top-0 right-0 w-56 h-56 rounded-bl-full -mr-12 -mt-12 opacity-25 blur-xl transition-all"
        style={{ backgroundColor: tier.accentHex }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        
        {/* Left: Main AQI Display */}
        <div className="flex-1">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-mono font-semibold text-slate-700 border border-slate-200">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: tier.accentHex }}
                  animate={{ scale: [1, 2.2], opacity: [0.75, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: tier.accentHex }}></span>
              </span>
              {data.sourceType}: {data.stationName}
            </span>

            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <Clock className="h-3 w-3" />
              {t('lastUpdated')}: {data.lastUpdated}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {t('confidenceScore')}: <strong className="text-slate-800">{data.confidencePercent}%</strong>
            </span>
          </div>

          {/* Main Visual Value */}
          <div className="mt-4 flex items-baseline gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                {t('currentAqi')}
              </span>
              <motion.span
                key={data.aqi}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                id="hero-aqi-number"
                className="font-mono text-7xl sm:text-8xl font-black tracking-tight transition-all drop-shadow-xs"
                style={{ color: tier.accentHex }}
              >
                {data.aqi}
              </motion.span>
            </div>

            {/* Category Pill with Official Definition */}
            <div className="flex flex-col items-start gap-1.5 pb-2">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-white shadow-xs"
                style={{ backgroundColor: tier.accentHex }}
              >
                <span>{tier.emoji}</span>
                <span>{localizedCategory}</span>
              </motion.div>
              <span className="text-xs text-slate-600 font-medium max-w-[280px]">
                {localizedMeaning}
              </span>
            </div>
          </div>

          {/* Predictive Trend & Immediate Forecast Warning */}
          <div className={`mt-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-xs ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeText}`}>
            <div className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="h-4 w-4" />
              {data.trendText}
            </div>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="text-slate-700">
              {t('twelveHourProjection')}: AQI ~<strong className="font-bold" style={{ color: tier.accentHex }}>{data.expected12hAqi}</strong>.
            </span>
          </div>

          {/* CPCB 6-Tier AQI Scale Gauge with Pointer */}
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('officialSpectrum')}</span>
              <span className="text-slate-700 font-mono font-semibold">
                {data.aqi} / 500 ({localizedCategory})
              </span>
            </div>

            {/* Segmented Color Bar with Indicator Needle */}
            <div className="relative pt-2 pb-1">
              <div className="relative h-3 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                {/* 0-50 Good (10%) */}
                <div style={{ width: '10%' }} className="bg-[#16a34a]" title="0–50: Good (Safe for most people)" />
                {/* 51-100 Satisfactory (10%) */}
                <div style={{ width: '10%' }} className="bg-[#ca8a04]" title="51–100: Satisfactory (Generally okay)" />
                {/* 101-200 Moderate (20%) */}
                <div style={{ width: '20%' }} className="bg-[#ea580c]" title="101–200: Moderate (Discomfort for sensitive groups)" />
                {/* 201-300 Poor (20%) */}
                <div style={{ width: '20%' }} className="bg-[#dc2626]" title="201–300: Poor (Breathing discomfort for most people)" />
                {/* 301-400 Very Poor (20%) */}
                <div style={{ width: '20%' }} className="bg-[#9333ea]" title="301–400: Very Poor (Respiratory illness on prolonged exposure)" />
                {/* 401-500 Severe (20%) */}
                <div style={{ width: '20%' }} className="bg-[#78350f]" title="401–500: Severe (Can affect even healthy people)" />
              </div>

              {/* Pin indicator for current AQI with spring actuation and sonar radar ping */}
              <motion.div
                className="absolute top-0 -ml-2.5 flex flex-col items-center pointer-events-none"
                initial={{ left: '0%' }}
                animate={{ left: `${scalePercent}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 14 }}
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="absolute h-6 w-6 rounded-full border border-current opacity-75"
                    style={{ borderColor: tier.accentHex }}
                    animate={{ scale: [1, 1.8], opacity: [0.75, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                  />
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px]"
                    style={{ backgroundColor: tier.accentHex }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Labels under the scale with exact CPCB tiers */}
            <div className="grid grid-cols-6 text-[9px] font-semibold text-slate-500 text-center pt-0.5">
              <span className="text-emerald-700">0–50 {getCategoryLabel('Good', language)}</span>
              <span className="text-yellow-700">51–100 {getCategoryLabel('Satisfactory', language)}</span>
              <span className="text-orange-700">101–200 {getCategoryLabel('Moderate', language)}</span>
              <span className="text-red-700">201–300 {getCategoryLabel('Poor', language)}</span>
              <span className="text-purple-700">301–400 {getCategoryLabel('Very Poor', language)}</span>
              <span className="text-amber-950">401–500 {getCategoryLabel('Severe', language)}</span>
            </div>
          </div>
        </div>

        {/* Right: Key Pollutant Metrics & Fast Action Buttons */}
        <div className="flex flex-col justify-between gap-4 border-t border-slate-200 pt-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
          
          {/* Quick Pollutant Grid with hover actuation */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-slate-300 hover:shadow-xs"
            >
              <div className="text-[11px] font-medium text-slate-500">PM2.5 (Fine Particulates)</div>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <span className="text-xl font-bold" style={{ color: tier.accentHex }}>{data.pollutants.pm25}</span>
                <span className="text-[10px] text-slate-500">µg/m³</span>
              </div>
              <div className="mt-1 text-[10px] font-semibold text-slate-600">{pm25Subtext}</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-slate-300 hover:shadow-xs"
            >
              <div className="text-[11px] font-medium text-slate-500">PM10 (Coarse Inhalable)</div>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <span className="text-xl font-bold text-slate-800">{data.pollutants.pm10}</span>
                <span className="text-[10px] text-slate-500">µg/m³</span>
              </div>
              <div className="mt-1 text-[10px] font-semibold text-slate-600">{pm10Subtext}</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-slate-300 hover:shadow-xs"
            >
              <div className="text-[11px] font-medium text-slate-500">NO2 (Vehicular Combustion)</div>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <span className="text-xl font-bold text-slate-800">{data.pollutants.no2}</span>
                <span className="text-[10px] text-slate-500">µg/m³</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 font-medium">Urban arterial traffic</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-slate-300 hover:shadow-xs"
            >
              <div className="text-[11px] font-medium text-slate-500">O3 (Surface Ozone)</div>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <span className="text-xl font-bold text-slate-800">{data.pollutants.o3}</span>
                <span className="text-[10px] text-slate-500">µg/m³</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 font-medium">Photochemical oxidants</div>
            </motion.div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              id="hero-why-changing-btn"
              onClick={onExploreFactors}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none shadow-xs cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              {data.aqi <= 100 ? t('exploreFactors') : t('whyRisingTitle')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              id="hero-view-forecast-btn"
              onClick={onViewForecast}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none cursor-pointer"
            >
              <span>{t('tabForecast')}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
            </motion.button>
          </div>

        </div>

      </div>
    </div>
  );
};


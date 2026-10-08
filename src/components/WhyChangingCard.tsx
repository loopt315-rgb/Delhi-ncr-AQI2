import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Wind,
  Layers,
  Flame,
  Gauge,
  Activity,
  AlertCircle
} from 'lucide-react';
import { ContributingFactor, WeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface WhyChangingCardProps {
  factors: ContributingFactor[];
  headline: string;
  summary: string;
  weather: WeatherData;
}

export const WhyChangingCard: React.FC<WhyChangingCardProps> = ({
  factors,
  headline,
  summary,
  weather,
}) => {
  const { language } = useLanguage();
  const [showScientific, setShowScientific] = useState(false);

  return (
    <div
      id="why-changing-card"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'hi' ? 'AQI क्यों बढ़ रहा है?' : 'Why is AQI Increasing?'}
            </h3>
          </div>
          <p className="mt-1 text-sm font-bold text-red-700">
            {headline}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 self-start rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 border border-red-100">
          <Activity className="h-3 w-3 text-red-600" />
          {language === 'hi' ? 'महत्वपूर्ण वायुमंडलीय विश्लेषण' : 'Critical Atmospheric Diagnosis'}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        {summary}
      </p>

      {/* Level 1: Clean Visual Factor Cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {factors.map((factor) => {
          const isCritical = factor.severity === 'critical';
          return (
            <div
              key={factor.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isCritical
                  ? 'border-red-100 bg-red-50/60 hover:bg-red-50'
                  : 'border-orange-100 bg-orange-50/60 hover:bg-orange-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl" role="img" aria-label={factor.title}>
                    {factor.icon}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      isCritical
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {factor.metricValue}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {factor.title}
                  </h4>
                </div>

                <p className="mt-1 text-xs text-slate-600 leading-snug">
                  {factor.simpleExplanation}
                </p>
              </div>

              {/* Metric footer tag */}
              <div className="mt-3 border-t border-slate-200/80 pt-2 text-[10px] font-mono text-slate-500">
                {factor.metricLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level 2 Toggle: "View scientific details" */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          id="toggle-scientific-details-btn"
          onClick={() => setShowScientific(!showScientific)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none cursor-pointer"
        >
          <span>
            {showScientific
              ? (language === 'hi' ? 'वैज्ञानिक विवरण छिपाएं' : 'Hide scientific details')
              : (language === 'hi' ? 'वैज्ञानिक विवरण देखें →' : 'View scientific details →')}
          </span>
          {showScientific ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Level 2 Expandable Scientific Information */}
        {showScientific && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-700">
                {language === 'hi' ? 'सीमा परत एवं थर्मोडायनामिक पैरामीटर' : 'Boundary Layer & Thermodynamic Sounding Parameters'}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Model: ECMWF / WRF Intermediate Assimilation
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Thermometer className="h-3.5 w-3.5 text-red-500" />
                  <span>{language === 'hi' ? 'तापमान व्युत्क्रमण प्रवणता' : 'Temperature Inversion Gradient'}</span>
                </div>
                <div className="mt-1 text-lg font-mono font-bold text-slate-900">
                  +{weather.lapseRateCPerKm}°C / 100m
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {language === 'hi'
                    ? 'उल्टा तापमान प्रोफाइल हवा के ऊपर उठने को रोकता है और प्रदूषक नीचे फंस जाते हैं।'
                    : 'Inverted thermal profile prevents buoyant parcel ascent. Warm air lid blocks vertical dispersion.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Layers className="h-3.5 w-3.5 text-sky-600" />
                  <span>{language === 'hi' ? 'ग्रहणीय सीमा परत (PBL)' : 'Planetary Boundary Layer (PBL)'}</span>
                </div>
                <div className="mt-1 text-lg font-mono font-bold text-slate-900">
                  {weather.pblHeightMeters} {language === 'hi' ? 'मीटर' : 'meters'}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {language === 'hi'
                    ? 'रात में संपीड़न मिश्रण मात्रा को 300 मीटर से नीचे ले आता है, जिससे प्रदूषण बढ़ता है।'
                    : 'Nocturnal compression drops mixing volume below 300m, concentrating ground level emissions.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Wind className="h-3.5 w-3.5 text-amber-600" />
                  <span>{language === 'hi' ? 'वेंटिलेशन गुणांक' : 'Ventilation Coefficient'}</span>
                </div>
                <div className="mt-1 text-lg font-mono font-bold text-slate-900">
                  {weather.ventilationIndexM2S} m²/s
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {language === 'hi'
                    ? '2000 m²/s से कम का सूचकांक हवा में ठहराव और संचय का संकेत देता है।'
                    : 'Critical flushing index < 2000 m²/s indicates extreme stagnant accumulation capacity.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Gauge className="h-3.5 w-3.5 text-purple-600" />
                  <span>{language === 'hi' ? 'व्युत्क्रमण तीव्रता सूचकांक' : 'Inversion Strength Index'}</span>
                </div>
                <div className="mt-1 text-lg font-mono font-bold text-slate-900">
                  {weather.inversionStrengthText}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {language === 'hi'
                    ? 'दिल्ली एनसीआर बेसिन के ऊपर मजबूत वायुमंडलीय थर्मल आवरण।'
                    : 'Strong atmospheric thermal capping over Delhi NCR basin.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs lg:col-span-2">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{language === 'hi' ? 'वायुमंडलीय स्थिरता श्रेणी' : 'Atmospheric Stability Class'}</span>
                </div>
                <div className="mt-1 text-lg font-mono font-bold text-emerald-700">
                  {weather.atmosphericStabilityClass}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {language === 'hi'
                    ? 'पास्किल-गिफोर्ड रात्रि स्थिरता वर्गीकरण क्षैतिज और ऊर्ध्वाधर प्रसार में गंभीर दमन दर्शाता है।'
                    : 'Pasquill-Gifford nocturnal stability categorization indicates severe suppression of horizontal and vertical eddy diffusivity.'}
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};

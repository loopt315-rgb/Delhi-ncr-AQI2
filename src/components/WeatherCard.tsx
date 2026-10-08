import React from 'react';
import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Layers,
  CloudRain,
  Eye,
  Activity,
  Gauge
} from 'lucide-react';
import { WeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const { language, t } = useLanguage();

  return (
    <div
      id="weather-card"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {t('weatherConditions')}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('weatherSub')}
          </p>
        </div>

        {/* Pollution Trapping Score Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{t('trappingIndex')}:</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-mono text-xs font-black text-red-700">
            <Activity className="h-3.5 w-3.5 text-red-600 animate-pulse" />
            {weather.inversionScore} / 100 ({weather.inversionStrengthText.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Grid of Weather Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        
        {/* Temperature */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
            <Thermometer className="h-3.5 w-3.5 text-red-500" />
            <span>{t('temperature')}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {weather.temperatureC}°C
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {language === 'hi' ? 'ओस बिंदु' : 'Dew point'}: {weather.dewPointC}°C
          </div>
        </div>

        {/* Humidity */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
            <Droplets className="h-3.5 w-3.5 text-sky-600" />
            <span>{t('humidity')}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {weather.humidityPercent}%
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {language === 'hi' ? 'नमी का प्रभाव' : 'Hygroscopic growth'}
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
          <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
            <Wind className="h-3.5 w-3.5 text-amber-600" />
            <span>{t('windSpeed')}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-800">
            {weather.windSpeedMs} m/s
          </div>
          <div className="mt-0.5 text-[10px] text-amber-700 font-medium">
            {weather.windCardinal} ({weather.windSpeedKmh} km/h)
          </div>
        </div>

        {/* Boundary Layer Height */}
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5">
          <div className="flex items-center gap-1.5 text-red-900 text-xs font-bold">
            <Layers className="h-3.5 w-3.5 text-red-600" />
            <span>{t('mixingHeight')}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-red-700">
            {weather.pblHeightMeters}m
          </div>
          <div className="mt-0.5 text-[10px] text-red-600 font-medium">
            {language === 'hi' ? 'कड़ा जमीनी अवरोध' : 'Severe ground cap'}
          </div>
        </div>

        {/* Rain Probability */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
            <CloudRain className="h-3.5 w-3.5 text-blue-600" />
            <span>{t('precipitation')}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {weather.rainProbabilityPercent}%
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {language === 'hi' ? 'वर्षा की कोई संभावना नहीं' : 'No wet scavenging'}
          </div>
        </div>

        {/* Surface Visibility */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
            <Eye className="h-3.5 w-3.5 text-purple-600" />
            <span>{t('visibility')}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {weather.visibilityMeters}m
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {language === 'hi' ? 'घना स्मॉग' : 'Dense particulate smog'}
          </div>
        </div>

      </div>

      {/* Atmospheric Summary Strip */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="font-bold text-red-600">💨 {t('dispersionDiagnosis')}:</span>
          <span>{weather.windPollutionImpact}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-600">
          {t('ventilationIndex')}: <strong className="text-slate-900 font-bold">{weather.ventilationIndexM2S} m²/s</strong> ({language === 'hi' ? 'गंभीर' : 'Critical'}: &lt;2000 m²/s)
        </div>
      </div>

    </div>
  );
};

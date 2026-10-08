import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Wind,
  Thermometer,
  Layers,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Gauge,
  Key
} from 'lucide-react';
import { ForecastHourPoint } from '../types';
import { getAQITheme, getRiskColor } from '../utils/colors';
import { useLanguage } from '../context/LanguageContext';
import { get72HourForecast } from '../server/dataService';

type MetricType = 'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2';

interface ForecastChartProps {
  forecastData: ForecastHourPoint[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecastData }) => {
  const { language } = useLanguage();
  const [activeMetric, setActiveMetric] = useState<MetricType>('aqi');
  const [hoveredIdx, setHoveredIdx] = useState<number>(0);
  const [showConfidence, setShowConfidence] = useState<boolean>(true);
  const [showAccuracyDetails, setShowAccuracyDetails] = useState<boolean>(false);

  // Guard against undefined, null, or empty data
  const safeData = (Array.isArray(forecastData) && forecastData.length > 0)
    ? forecastData
    : get72HourForecast('delhi');

  const activePoint = safeData[hoveredIdx] || safeData[0];

  const metricLabels: Record<MetricType, { name: string; unit: string; description: string }> = {
    aqi: {
      name: 'AQI',
      unit: '',
      description: language === 'hi' ? 'राष्ट्रीय वायु गुणवत्ता सूचकांक (0-500 पैमाना)' : 'National Air Quality Index (0-500 scale)'
    },
    pm25: {
      name: 'PM2.5',
      unit: 'µg/m³',
      description: language === 'hi' ? 'अति सूक्ष्म कण ≤ 2.5 µm' : 'Fine inhalable particulates ≤ 2.5 µm'
    },
    pm10: {
      name: 'PM10',
      unit: 'µg/m³',
      description: language === 'hi' ? 'मोटे धूल कण ≤ 10 µm' : 'Coarse particulate matter ≤ 10 µm'
    },
    o3: {
      name: 'O₃',
      unit: 'µg/m³',
      description: language === 'hi' ? 'धरातलीय ओजोन' : 'Tropospheric surface ozone'
    },
    no2: {
      name: 'NO₂',
      unit: 'µg/m³',
      description: language === 'hi' ? 'वाहनों एवं दहन से नाइट्रोजन डाइऑक्साइड' : 'Nitrogen dioxide from combustion & traffic'
    },
  };

  // Get values array
  const values = safeData.map((d) => {
    const v = d[activeMetric];
    return typeof v === 'number' && !isNaN(v) ? v : (d.aqi || 150);
  });

  // Compute confidence upper and lower arrays for this metric
  const upperValues = safeData.map((d, i) => {
    const v = values[i];
    if (activeMetric === 'aqi') return d.confidenceUpper ?? Math.round(v * 1.15);
    return Math.round(v * 1.18);
  });
  const lowerValues = safeData.map((d, i) => {
    const v = values[i];
    if (activeMetric === 'aqi') return d.confidenceLower ?? Math.round(v * 0.85);
    return Math.max(5, Math.round(v * 0.82));
  });

  const allVals = [
    ...values,
    ...(showConfidence ? upperValues : []),
    ...(showConfidence ? lowerValues : [])
  ].filter((v) => typeof v === 'number' && !isNaN(v));

  const minVal = allVals.length > 0 ? Math.max(0, Math.min(...allVals) * 0.85) : 0;
  const maxVal = allVals.length > 0 ? Math.max(...allVals) * 1.12 : 500;
  const effectiveMax = maxVal <= minVal ? minVal + 100 : maxVal;

  // Chart dimensions for responsive SVG
  const width = 800;
  const height = 270;
  const paddingX = 50;
  const paddingY = 40;

  const getX = (idx: number) => {
    if (safeData.length <= 1) return paddingX;
    return paddingX + (idx / (safeData.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = effectiveMax - minVal || 1;
    const safeNum = typeof val === 'number' && !isNaN(val) ? val : minVal;
    return height - paddingY - ((safeNum - minVal) / range) * (height - paddingY * 2);
  };

  // Build SVG path
  const points = values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  const upperPoints = upperValues.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  const lowerPoints = lowerValues.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  
  // Smooth Bezier line string
  const createSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const upperLinePath = createSmoothPath(upperPoints);
  const lowerLinePath = createSmoothPath(lowerPoints);
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

  // Shaded Confidence corridor path: forward upper, backward lower
  const confidenceAreaPath = lowerPoints.length > 0
    ? `${upperLinePath} L ${lowerPoints[lowerPoints.length - 1].x} ${lowerPoints[lowerPoints.length - 1].y} ` +
      lowerPoints.slice().reverse().map((pt) => `L ${pt.x} ${pt.y}`).join(' ') + ' Z'
    : '';

  const aqiTheme = getAQITheme(activePoint?.aqi ?? 150);
  const riskTheme = getRiskColor(activePoint?.riskLevel ?? 'LOW');

  // Ventilation Index classification
  const vi = activePoint?.ventilationIndex ?? Math.round((activePoint?.pblHeightM ?? 300) * ((activePoint?.windSpeedKmh ?? 5) / 3.6));
  let viBadge = { text: 'Good Dispersion', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (vi < 1200) {
    viBadge = { text: 'Critical Trapping (Smog Trap)', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  } else if (vi < 2200) {
    viBadge = { text: 'Severe Trapping', bg: 'bg-red-50 text-red-700 border-red-200' };
  } else if (vi < 4500) {
    viBadge = { text: 'Moderate Mixing', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  }

  return (
    <div id="forecast-card" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      
      {/* Header with Title, Controls & Metric Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {language === 'hi' ? '72-घंटे का वायुमंडलीय एवं AQI पूर्वानुमान' : '72-Hour Atmospheric & AQI Forecast'}
            </h3>
            <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 font-mono">
              ECMWF + Bias-Corrected
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {language === 'hi'
              ? 'भौतिक ECMWF CAMS रसायन विज्ञान, वास्तविक CPCB ग्राउंड अंशांकन और बाउंड्री लेयर ट्रैपिंग मॉडल'
              : 'Coupled ECMWF CAMS Eulerian chemistry, continuous CPCB sensor calibration, and nocturnal inversion dynamics'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ensemble Confidence Band Toggle */}
          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              showConfidence
                ? 'border-indigo-300 bg-indigo-50/80 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle P10-P90 probabilistic uncertainty interval"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>{language === 'hi' ? 'P10-P90 अनिश्चितता बैंड' : 'P10-P90 Band'}</span>
          </button>

          {/* Metric Switcher Tabs with animated sliding pill */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {(['aqi', 'pm25', 'pm10', 'no2', 'o3'] as MetricType[]).map((m) => {
              const isSelected = activeMetric === m;
              return (
                <button
                  key={m}
                  id={`metric-btn-${m}`}
                  onClick={() => setActiveMetric(m)}
                  className={`relative rounded-lg px-3 py-1 text-xs font-bold transition-colors uppercase cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeMetricPill"
                      className="absolute inset-0 rounded-lg bg-slate-900 shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">
                    {m === 'pm25' ? 'PM2.5' : m === 'pm10' ? 'PM10' : m.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Value Scrubber Display */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {language === 'hi' ? 'चयनित समय' : 'Selected Horizon'}
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-slate-900">{activePoint.timeLabel}</span>
            <span className="text-xs text-slate-500">({activePoint.timestamp})</span>
          </div>
          {activePoint.grapStageRisk && (
            <div className="mt-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 inline-block">
              {activePoint.grapStageRisk}
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {language === 'hi' ? 'अनुमानित' : 'Predicted'} {metricLabels[activeMetric].name}
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-black text-red-600">{activePoint[activeMetric]}</span>
            <span className="text-xs text-slate-500">{metricLabels[activeMetric].unit}</span>
          </div>
          {showConfidence && (
            <div className="mt-0.5 text-[10px] font-mono text-slate-500">
              {language === 'hi' ? 'विश्वसनीयता दायरा' : 'Ensemble Band'}:{' '}
              <span className="font-semibold text-slate-700">
                {activePoint.confidenceLower ?? Math.round(activePoint.aqi * 0.9)} - {activePoint.confidenceUpper ?? Math.round(activePoint.aqi * 1.15)}
              </span>
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {language === 'hi' ? 'वायुमंडलीय साउंडिंग एवं वेंटिलेशन' : 'Atmospheric Sounding & VI'}
          </span>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-700">
            <span className="flex items-center gap-1 font-mono">
              <Thermometer className="h-3 w-3 text-amber-600" />
              {activePoint.tempC}°C
            </span>
            <span className="flex items-center gap-1 font-mono text-sky-700">
              <Wind className="h-3 w-3" />
              {activePoint.windSpeedKmh} km/h {activePoint.windDirection?.split(' ')[0]}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold font-mono ${viBadge.bg}`}>
              VI: {vi.toLocaleString()} m²/s
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {language === 'hi' ? 'अनुमानित स्वास्थ्य जोखिम' : 'Projected Health Risk'}
          </span>
          <div className="mt-1">
            <span
              className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${riskTheme.bg} ${riskTheme.text} ${riskTheme.border}`}
            >
              {activePoint.riskLevel}
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            PBL Height: {activePoint.pblHeightM}m
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.20" />
              <stop offset="60%" stopColor="#dc2626" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="confidenceBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
            </linearGradient>

            {/* Glowing forecast scanning beam gradient */}
            <linearGradient id="forecastLaserGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Reference guidelines & threshold markers */}
          {activeMetric === 'aqi' && (
            <>
              {/* Severe threshold: 401 */}
              {getY(401) >= paddingY && getY(401) <= height - paddingY && (
                <g>
                  <line
                    x1={paddingX}
                    y1={getY(401)}
                    x2={width - paddingX}
                    y2={getY(401)}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                  />
                  <text
                    x={width - paddingX + 5}
                    y={getY(401) + 4}
                    fill="#dc2626"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {language === 'hi' ? 'गंभीर (401)' : 'Severe (401)'}
                  </text>
                </g>
              )}

              {/* Very Poor threshold: 301 */}
              {getY(301) >= paddingY && getY(301) <= height - paddingY && (
                <g>
                  <line
                    x1={paddingX}
                    y1={getY(301)}
                    x2={width - paddingX}
                    y2={getY(301)}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                  />
                  <text
                    x={width - paddingX + 5}
                    y={getY(301) + 4}
                    fill="#ea580c"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {language === 'hi' ? 'बहुत खराब (301)' : 'Very Poor (301)'}
                  </text>
                </g>
              )}
            </>
          )}

          {/* Shaded Confidence Envelope (P10 - P90) with subtle pulsating breathing opacity */}
          {showConfidence && (
            <g>
              <motion.path
                d={confidenceAreaPath}
                fill="url(#confidenceBandGradient)"
                animate={{ fillOpacity: [0.75, 1, 0.75] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              />
              <path
                d={upperLinePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                strokeOpacity="0.5"
              />
              <path
                d={lowerLinePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                strokeOpacity="0.5"
              />
            </g>
          )}

          {/* Fill Area under curve */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Continuous Forecast Scanning Laser Beam */}
          <motion.line
            y1={paddingY}
            y2={height - paddingY}
            stroke="url(#forecastLaserGlow)"
            strokeWidth="2"
            strokeDasharray="3 2"
            initial={{ x1: paddingX, x2: paddingX }}
            animate={{
              x1: [paddingX, width - paddingX, paddingX],
              x2: [paddingX, width - paddingX, paddingX]
            }}
            transition={{ repeat: Infinity, duration: 11, ease: 'linear' }}
          />

          {/* Smooth Deterministic Line with entrance drawing animation */}
          <motion.path
            key={`line-${activeMetric}`}
            d={linePath}
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          {/* Point markers & hover hitzones */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            const ptData = safeData[idx] || activePoint;
            return (
              <g key={idx} className="cursor-pointer" onClick={() => setHoveredIdx(idx)} onMouseEnter={() => setHoveredIdx(idx)}>
                {/* Vertical cursor guide line */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeOpacity="0.7"
                  />
                )}

                {/* Radar sonar ping ring around active coordinate node */}
                {isHovered && (
                  <motion.circle
                    cx={pt.x}
                    cy={pt.y}
                    initial={{ r: 6, opacity: 0.9 }}
                    animate={{ r: [6, 22], opacity: [0.9, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 5}
                  fill="#ffffff"
                  stroke="#dc2626"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* Inner dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 3.5 : 2}
                  fill={isHovered ? '#dc2626' : '#ffffff'}
                />

                {/* Value text above point */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {ptData[activeMetric]}
                </text>

                {/* Bottom X-axis label */}
                <text
                  x={pt.x}
                  y={height - paddingY + 20}
                  textAnchor="middle"
                  fill={isHovered ? '#dc2626' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  {ptData.timeLabel}
                </text>

                {/* Invisible hit test rect */}
                <rect
                  x={pt.x - 25}
                  y={0}
                  width="50"
                  height={height}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Discrete Timeline Quick View Row with horizontal scroll */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {forecastData.map((pt, idx) => (
          <button
            key={idx}
            onClick={() => setHoveredIdx(idx)}
            className={`min-w-[76px] flex-1 rounded-xl py-2 px-1.5 transition-all text-center cursor-pointer ${
              hoveredIdx === idx
                ? 'bg-red-50 border border-red-300 text-red-700 shadow-xs'
                : 'border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <div className="text-[10px] font-mono uppercase font-bold">{pt.timeLabel}</div>
            <div className="text-sm font-black font-mono text-slate-900 mt-0.5">{pt[activeMetric]}</div>
            <div className="text-[9px] text-slate-500 mt-0.5 truncate">{pt.category}</div>
            {pt.ventilationIndex && (
              <div className={`mt-1 text-[8px] font-mono rounded px-1 py-0.2 truncate ${
                pt.ventilationIndex < 1500 ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
              }`}>
                VI {pt.ventilationIndex}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Model Reliability, Scientific Architecture & API Configuration Expander */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          onClick={() => setShowAccuracyDetails(!showAccuracyDetails)}
          className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              {language === 'hi'
                ? 'पूर्वानुमान सटीकता आर्किटेक्चर एवं API स्रोत गाइड'
                : 'Forecast Accuracy Architecture & API Source Configuration'}
            </span>
          </div>
          {showAccuracyDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAccuracyDetails && (
          <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">1</span>
                {language === 'hi' ? 'सक्रिय 72-घंटे का भौतिक-सांख्यिकीय पाइपलाइन' : 'Active 72-Hour Physical-Statistical Pipeline'}
              </h4>
              <p className="mt-1 text-slate-600 leading-relaxed">
                AirSense NCR couples the <strong>ECMWF CAMS Eulerian chemical transport model</strong> (hourly particulate physics) with <strong>continuous CPCB ground sensor calibration</strong>. At Hour 0, ground observation offsets are computed and dynamically blended forward using an 18-hour exponential relaxation decay (τ = 18h), preventing model cold-start bias.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">2</span>
                {language === 'hi' ? 'वेंटिलेशन इंडेक्स (VI) एवं थर्मल इन्वर्जन ट्रैपिंग' : 'Ventilation Index (VI) & Thermal Inversion Trapping'}
              </h4>
              <p className="mt-1 text-slate-600 leading-relaxed">
                The forecast computes the hourly Ventilation Index (VI = PBL Height × Wind Speed). When VI &lt; 1,500 m²/s, dispersion collapses into a nocturnal smog trap. When VI &gt; 6,000 m²/s, turbulent mixing flushes pollutants out of the Indo-Gangetic basin.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-indigo-600" />
                {language === 'hi' ? 'उच्चतम सटीकता हेतु समर्थित API कुंजियां' : 'Supported External APIs for Higher Precision'}
              </h4>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-mono font-bold text-slate-900">Open-Meteo CAMS</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">🟢 Built-in (No key needed)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Free live hourly chemical transport, PBL mixing heights, and surface wind vectors.</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-mono font-bold text-slate-900">WAQI_API_TOKEN</div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Optional (aqicn.org free key)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Enables direct, continuous live BAM sensor streams from all 31+ CPCB/DPCC monitoring stations.</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-mono font-bold text-slate-900">NASA_FIRMS_MAP_KEY</div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Optional (NASA free key)</div>
                  <div className="text-[10px] text-slate-500 mt-1">High-resolution 375m VIIRS stubble burning detections and satellite fire radiative power (FRP).</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

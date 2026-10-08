import React from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Satellite,
  Info,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';
import { FireSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StubbleFireTrackingProps {
  firesData: FireSummary;
  onFocusMapFires?: () => void;
}

export const StubbleFireTracking: React.FC<StubbleFireTrackingProps> = ({
  firesData,
  onFocusMapFires,
}) => {
  const { language } = useLanguage();

  const totalHotspots = Math.max(1, firesData.totalHotspots24h);
  const punjabPct = Math.round((firesData.byState.punjab / totalHotspots) * 100);
  const haryanaPct = Math.round((firesData.byState.haryana / totalHotspots) * 100);
  const upPct = Math.round((firesData.byState.uttarPradesh / totalHotspots) * 100);
  const rajPct = Math.round((firesData.byState.rajasthan / totalHotspots) * 100);

  return (
    <div
      id="stubble-fire-card"
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Dynamic Satellite Orbit Scanline */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 h-0.5 w-48 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80"
        animate={{ x: ['-100%', '700%'] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: 'linear' }}
      />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {language === 'hi'
                ? 'क्षेत्रीय प्रदूषण स्रोत एवं सक्रिय पराली दहन हॉटस्पॉट'
                : 'Regional Pollution Sources & Active Fire Hotspots'}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {language === 'hi'
              ? 'उपग्रह थर्मल विसंगतियों के माध्यम से अपविंड वायु क्षेत्र में बायोमास/पराली दहन की निगरानी'
              : 'Satellite thermal anomalies tracking potential biomass-burning activity across the upwind airshed'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="relative inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-mono text-xs font-bold text-orange-800 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"
                animate={{ scale: [1, 2.2], opacity: [0.75, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
            </span>
            {firesData.totalHotspots24h} {language === 'hi' ? 'हॉटस्पॉट (24 घंटे)' : 'Hotspots (24h)'}
          </motion.span>
        </div>
      </div>

      {/* State-wise Breakdown Cards with Dynamic Progress Bars */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        
        {/* Punjab */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 transition-colors hover:border-red-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-950">
            <span>{language === 'hi' ? 'पंजाब (अपविंड)' : 'Punjab (Upwind)'}</span>
            <span className="font-mono text-[10px] text-red-700">{punjabPct}%</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-black text-red-600">
              {firesData.byState.punjab}
            </span>
            <span className="text-xs text-slate-500">{language === 'hi' ? 'हॉटस्पॉट' : 'hotspots'}</span>
          </div>
          {/* Animated distribution bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-red-200/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-red-600"
              initial={{ width: 0 }}
              animate={{ width: `${punjabPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 text-[11px] text-red-700 font-medium">
            🔥 {language === 'hi' ? 'माझा / मालवा में उच्च घनत्व' : 'High density in Majha / Malwa'}
          </div>
        </motion.div>

        {/* Haryana */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="rounded-xl border border-orange-200 bg-orange-50/60 p-3.5 transition-colors hover:border-orange-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-bold text-orange-950">
            <span>{language === 'hi' ? 'हरियाणा' : 'Haryana'}</span>
            <span className="font-mono text-[10px] text-orange-700">{haryanaPct}%</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-black text-orange-600">
              {firesData.byState.haryana}
            </span>
            <span className="text-xs text-slate-500">{language === 'hi' ? 'हॉटस्पॉट' : 'hotspots'}</span>
          </div>
          {/* Animated distribution bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-orange-200/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-orange-600"
              initial={{ width: 0 }}
              animate={{ width: `${haryanaPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
          <div className="mt-2 text-[11px] text-orange-700 font-medium">
            🔥 {language === 'hi' ? 'कैथल, करनाल एवं कुरुक्षेत्र' : 'Kaithal, Karnal & Kurukshetra'}
          </div>
        </motion.div>

        {/* Uttar Pradesh */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 transition-colors hover:border-amber-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-950">
            <span>{language === 'hi' ? 'उत्तर प्रदेश' : 'Uttar Pradesh'}</span>
            <span className="font-mono text-[10px] text-amber-700">{upPct}%</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-black text-amber-700">
              {firesData.byState.uttarPradesh}
            </span>
            <span className="text-xs text-slate-500">{language === 'hi' ? 'हॉटस्पॉट' : 'hotspots'}</span>
          </div>
          {/* Animated distribution bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-amber-600"
              initial={{ width: 0 }}
              animate={{ width: `${upPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            🔥 {language === 'hi' ? 'पश्चिमी जिले एवं गन्ने की पत्तियां' : 'Western districts & sugarcane trash'}
          </div>
        </motion.div>

        {/* Rajasthan */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 hover:border-slate-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>{language === 'hi' ? 'राजस्थान' : 'Rajasthan'}</span>
            <span className="font-mono text-[10px] text-slate-600">{rajPct}%</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-black text-slate-800">
              {firesData.byState.rajasthan}
            </span>
            <span className="text-xs text-slate-500">{language === 'hi' ? 'हॉटस्पॉट' : 'hotspots'}</span>
          </div>
          {/* Animated distribution bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-slate-600"
              initial={{ width: 0 }}
              animate={{ width: `${rajPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-medium">
            🔥 {language === 'hi' ? 'उत्तरी नहर क्षेत्र' : 'Northern canal fringe'}
          </div>
        </motion.div>

      </div>

      {/* Detected Fire Clusters Table / List */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
          <span>
            {language === 'hi'
              ? 'उपग्रह द्वारा चिन्हित उच्च तीव्रता थर्मल विसंगतियां'
              : 'High-Intensity Detected Thermal Anomalies (Latest Satellite Passes)'}
          </span>
          <span className="font-mono text-[11px] text-slate-500">{firesData.satellitePass}</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[11px] uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2.5">{language === 'hi' ? 'क्लस्टर / जिला' : 'Cluster / District'}</th>
                <th className="px-3 py-2.5">{language === 'hi' ? 'राज्य' : 'State'}</th>
                <th className="px-3 py-2.5">{language === 'hi' ? 'फायर पावर (FRP)' : 'Fire Radiative Power'}</th>
                <th className="px-3 py-2.5">{language === 'hi' ? 'दिल्ली के सापेक्ष' : 'Relative to Delhi'}</th>
                <th className="px-3 py-2.5">{language === 'hi' ? 'सेंसर' : 'Sensor'}</th>
                <th className="px-3 py-2.5">{language === 'hi' ? 'पहचान समय' : 'Detected'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {firesData.hotspots.slice(0, 5).map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 text-slate-900 font-bold flex items-center gap-1.5">
                    <span className="text-orange-500">🔥</span>
                    {f.district}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{f.state}</td>
                  <td className="px-3 py-2 font-mono text-amber-700 font-semibold">{f.frpMw} MW</td>
                  <td className="px-3 py-2 font-mono text-slate-700">
                    {f.distanceFromDelhiKm} km {f.directionFromDelhi}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-500">{f.satellite}</td>
                  <td className="px-3 py-2 text-slate-500">{f.detectedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsible Scientific Disclaimer */}
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[11px] text-slate-600">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">
            {language === 'hi' ? 'वैज्ञानिक उत्तरदायित्व अस्वीकरण: ' : 'Scientific Attribution Disclaimer: '}
          </span>
          {firesData.disclaimer} {language === 'hi' ? 'सटीकता बनाए रखने के लिए थर्मल हस्ताक्षरों को "संभावित बायोमास दहन" के रूप में संदर्भित किया जाता है।' : 'We term thermal signatures as "Potential biomass-burning activity" to maintain strict scientific precision.'}
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { CurrentAQIResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PollutantBreakdownProps {
  data: CurrentAQIResponse;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const { language, t } = useLanguage();

  const pollutants = [
    {
      key: 'pm25',
      name: 'PM2.5',
      fullName: language === 'hi' ? 'सूक्ष्म कण (≤ 2.5 µm)' : 'Fine Particulate Matter (≤ 2.5 µm)',
      value: data.pollutants.pm25,
      unit: 'µg/m³',
      naqiStandard: 60,
      whoLimit: 15,
      severity: 'critical',
      description: language === 'hi'
        ? 'अति सूक्ष्म कण जो सीधे फेफड़ों की गहराई और रक्त परिसंचरण में प्रवेश करने में सक्षम हैं।'
        : 'Microscopic combustion particles capable of penetrating deep into alveolar pulmonary capillaries and entering systemic circulation.',
    },
    {
      key: 'pm10',
      name: 'PM10',
      fullName: language === 'hi' ? 'श्वसनीय मोटे कण (≤ 10 µm)' : 'Coarse Inhalable Particulates (≤ 10 µm)',
      value: data.pollutants.pm10,
      unit: 'µg/m³',
      naqiStandard: 100,
      whoLimit: 45,
      severity: 'high',
      description: language === 'hi'
        ? 'धूल और घर्षण कण जो ऊपरी श्वसन नली में जलन और सूजन पैदा करते हैं।'
        : 'Inhalable dust, fly-ash, and mechanical abrasion particles causing upper respiratory tract inflammation.',
    },
    {
      key: 'no2',
      name: 'NO2',
      fullName: language === 'hi' ? 'नाइट्रोजन डाइऑक्साइड' : 'Nitrogen Dioxide',
      value: data.pollutants.no2,
      unit: 'µg/m³',
      naqiStandard: 80,
      whoLimit: 25,
      severity: 'moderate',
      description: language === 'hi'
        ? 'वाहनों और थर्मल प्लांट्स से उत्सर्जित विषैली गैस।'
        : 'Emitted from vehicular internal combustion engines and high-temperature thermal power boilers; triggers bronchial hyperactivity.',
    },
    {
      key: 'o3',
      name: 'O3',
      fullName: language === 'hi' ? 'ओजोन (8-घंटे का औसत)' : 'Surface Ground Ozone (8-hr avg)',
      value: data.pollutants.o3,
      unit: 'µg/m³',
      naqiStandard: 100,
      whoLimit: 100,
      severity: 'moderate',
      description: language === 'hi'
        ? 'धूप और रासायनिक क्रियाओं से उत्पन्न द्वितीयक प्रदूषक।'
        : 'Secondary photochemical pollutant formed by solar reaction of NOx and Volatile Organic Compounds (VOCs).',
    },
    {
      key: 'so2',
      name: 'SO2',
      fullName: language === 'hi' ? 'सल्फर डाइऑक्साइड' : 'Sulphur Dioxide',
      value: data.pollutants.so2,
      unit: 'µg/m³',
      naqiStandard: 80,
      whoLimit: 40,
      severity: 'low',
      description: language === 'hi'
        ? 'औद्योगिक कोयला और रिफाइनरी जलने से उत्पन्न गैस।'
        : 'Produced from burning of sulphur-bearing coal in heavy industries and refineries.',
    },
    {
      key: 'co',
      name: 'CO',
      fullName: language === 'hi' ? 'कार्बन मोनोऑक्साइड' : 'Carbon Monoxide',
      value: data.pollutants.co,
      unit: 'mg/m³',
      naqiStandard: 4,
      whoLimit: 4,
      severity: 'moderate',
      description: language === 'hi'
        ? 'अपूर्ण दहन से निकलने वाली गंधहीन विषैली गैस जो हीमोग्लोबिन से जुड़ती है।'
        : 'Colourless, odourless toxic gas from incomplete hydrocarbon combustion that binds to blood haemoglobin.',
    },
  ];

  return (
    <div
      id="pollutant-breakdown-card"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {t('pollutantBreakdown')}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('pollutantBreakdownSub')}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <span>{expanded ? t('collapseDetails') : t('showDetails')}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Grid of Pollutants */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pollutants.map((p, pIdx) => {
          const ratioWho = (p.value / p.whoLimit).toFixed(1);
          const ratioNaqi = (p.value / p.naqiStandard).toFixed(1);
          const isExceeded = p.value > p.naqiStandard;
          const pctWidth = Math.min(100, (p.value / (p.naqiStandard * 2)) * 100);

          return (
            <motion.div
              key={p.key}
              whileHover={{ y: -3, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-slate-300 hover:shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm font-black text-slate-900">{p.name}</span>
                  <div className="text-[10px] text-slate-500 leading-tight">{p.fullName}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-lg font-black ${
                      p.severity === 'critical'
                        ? 'text-red-600'
                        : p.severity === 'high'
                        ? 'text-amber-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {p.value}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">{p.unit}</span>
                </div>
              </div>

              {/* Progress bar vs NAQI Standard with dynamic animated fill */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                  <span>{t('standard')}: {p.naqiStandard}</span>
                  <span className={isExceeded ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                    {ratioNaqi}x {t('standard')}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      p.severity === 'critical'
                        ? 'bg-red-600'
                        : p.severity === 'high'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pctWidth}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: pIdx * 0.08 }}
                  />
                </div>
              </div>

              {/* Expandable context description with smooth height animation */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-600 leading-normal">
                      {p.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

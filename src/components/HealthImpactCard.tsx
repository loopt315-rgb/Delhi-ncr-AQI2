import React from 'react';
import {
  Heart,
  ShieldAlert,
  Wind,
  AlertOctagon,
  Home,
  CheckCircle2,
  Clock,
  Info,
  Activity,
  Check
} from 'lucide-react';
import { HealthRiskAdvice } from '../types';
import { getRiskColor, CPCB_AQI_TIERS } from '../utils/colors';
import { useLanguage } from '../context/LanguageContext';

interface HealthImpactCardProps {
  advice: HealthRiskAdvice;
}

export const HealthImpactCard: React.FC<HealthImpactCardProps> = ({ advice }) => {
  const { language, t } = useLanguage();
  const riskColor = getRiskColor(advice.level);

  const getLocalizedRiskLevel = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('emergency') || l.includes('severe') || l.includes('hazardous')) {
      return language === 'hi' ? 'अति गंभीर' : level;
    }
    if (l.includes('high') || l.includes('very poor')) {
      return language === 'hi' ? 'उच्च जोखिम' : level;
    }
    if (l.includes('moderate')) {
      return language === 'hi' ? 'मध्यम' : level;
    }
    return language === 'hi' ? 'सामान्य' : level;
  };

  const getLocalizedTierName = (officialLevel: string) => {
    switch (officialLevel.toLowerCase()) {
      case 'good': return t('tierGood');
      case 'satisfactory': return t('tierSatisfactory');
      case 'moderate': return t('tierModerate');
      case 'poor': return t('tierPoor');
      case 'very poor': return t('tierVeryPoor');
      case 'severe': return t('tierSevere');
      default: return officialLevel;
    }
  };

  return (
    <div
      id="health-card"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {language === 'hi' ? 'स्वास्थ्य जोखिम विश्लेषण एवं व्यावहारिक सलाह' : 'Health-Risk Interpretation & Actionable Advice'}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {language === 'hi'
              ? 'CPCB राष्ट्रीय वायु गुणवत्ता सूचकांक मानकों पर आधारित आधिकारिक स्वास्थ्य परामर्श'
              : 'Official health advisories grounded in CPCB National Air Quality Index standards'}
          </p>
        </div>

        {/* Big Health Risk Badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black tracking-wider uppercase ${riskColor.bg} ${riskColor.text} ${riskColor.border}`}
        >
          <AlertOctagon className="h-4 w-4 shrink-0" />
          <span>{language === 'hi' ? 'स्वास्थ्य जोखिम:' : 'Health Risk:'} {getLocalizedRiskLevel(advice.level)}</span>
        </div>
      </div>

      {/* Primary Headline & Summary */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          {language === 'hi' ? 'वर्तमान नैदानिक परामर्श' : 'Current Clinical Advisory'}
        </div>
        <div className="mt-1 text-sm sm:text-base font-bold text-slate-900">
          {advice.title}
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {advice.summary}
        </p>
      </div>

      {/* Main Action Guidelines Matrix */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Outdoor Exercise */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Activity className="h-4 w-4 text-emerald-600" />
            {language === 'hi' ? 'बाहरी व्यायाम एवं खेलकूद' : 'Outdoor Exercise & Sports'}
          </div>
          <div className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900">
            {advice.outdoorExercise}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
            {language === 'hi' ? 'सामान्य परामर्श:' : 'General guidance:'} {advice.generalPopulation}
          </p>
        </div>

        {/* Outdoor Exposure & Mask Guidance */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Wind className="h-4 w-4 text-blue-600" />
            {language === 'hi' ? 'बाहरी संपर्क एवं मास्क परामर्श' : 'Outdoor Exposure & Masking'}
          </div>
          <div className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900">
            {advice.prolongedExposure}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
            {language === 'hi' ? 'मास्क दिशानिर्देश:' : 'Mask guideline:'} <strong className="text-slate-700 font-semibold">{advice.maskRecommendation}</strong>
          </p>
        </div>

        {/* Sensitive Groups */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Heart className="h-4 w-4 text-rose-600" />
            {language === 'hi' ? 'संवेदनशील समूह एवं बच्चे' : 'Sensitive Groups & Children'}
          </div>
          <div className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900">
            {advice.sensitiveGroups}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
            {language === 'hi'
              ? 'दमा, श्वसन रोगी, वरिष्ठ नागरिक एवं छोटे बच्चे शामिल।'
              : 'Includes asthma, pulmonary conditions, elderly, and infants.'}
          </p>
        </div>

        {/* Indoor Purifier Guidance */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Home className="h-4 w-4 text-indigo-600" />
            {language === 'hi' ? 'इनडोर वायु शुद्धिकरण रणनीति' : 'Indoor Air Mitigation Strategy'}
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {advice.purifierRecommendation}
          </p>
        </div>

      </div>

      {/* Official CPCB AQI Standards Table (Source of Truth) */}
      <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-700" />
            {language === 'hi'
              ? 'आधिकारिक CPCB राष्ट्रीय वायु गुणवत्ता सूचकांक (NAQI) मानक'
              : 'Official CPCB National Air Quality Index (NAQI) Standards'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Central Pollution Control Board</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4">{language === 'hi' ? 'AQI दायरा' : 'AQI Range'}</th>
                <th className="py-2.5 px-4">{language === 'hi' ? 'आधिकारिक स्तर' : 'Official Level'}</th>
                <th className="py-2.5 px-4">{language === 'hi' ? 'अर्थ एवं प्रभाव' : 'What It Means'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CPCB_AQI_TIERS.map((tier) => {
                const isCurrentTier = advice.title.toLowerCase().includes(tier.officialLevel.toLowerCase());
                return (
                  <tr
                    key={tier.range}
                    className={`transition-colors ${isCurrentTier ? `${tier.badgeBg} font-semibold` : 'hover:bg-slate-50/60'}`}
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                      {tier.range}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span>{tier.emoji}</span>
                        <span style={{ color: tier.accentHex }} className="font-bold">
                          {getLocalizedTierName(tier.officialLevel)}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {tier.whatItMeans}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[10px]">
                      {isCurrentTier ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs" style={{ backgroundColor: tier.accentHex }}>
                          <Check className="h-2.5 w-2.5" />
                          {language === 'hi' ? 'वर्तमान' : 'Current'}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 72-Hour Health-Risk Timeline */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          <Clock className="h-3.5 w-3.5 text-slate-600" />
          {language === 'hi' ? '72-घंटे का स्वास्थ्य जोखिम टाइमलाइन' : '72-Hour Health-Risk Timeline'}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {advice.timeline.map((t, idx) => {
            const tColor = getRiskColor(t.risk);
            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-2xs"
              >
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">{t.period}</div>
                <div
                  className={`mt-1.5 inline-block rounded border px-2.5 py-0.5 text-xs font-black uppercase ${tColor.bg} ${tColor.text} ${tColor.border}`}
                >
                  {getLocalizedRiskLevel(t.risk)}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">{t.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>
          {language === 'hi'
            ? 'चिकित्सा अस्वीकरण: यह सार्वजनिक दिशानिर्देश CPCB मानकों के अनुरूप है और पेशेवर चिकित्सीय निदान का विकल्प नहीं है। गंभीर लक्षणों पर तुरंत चिकित्सक से संपर्क करें।'
            : 'Medical Disclaimer: This advisory is aligned with CPCB National Air Quality Index public guidelines and does not substitute professional medical diagnosis. Consult healthcare professionals for personal symptoms.'}
        </span>
      </div>
    </div>
  );
};

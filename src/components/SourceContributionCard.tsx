import React from 'react';
import {
  PieChart,
  Layers,
  Flame,
  Truck,
  Building2,
  Trash2,
  ShieldCheck,
  Info
} from 'lucide-react';
import { SourceContributionData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SourceContributionCardProps {
  sourcesData: SourceContributionData;
}

export const SourceContributionCard: React.FC<SourceContributionCardProps> = ({
  sourcesData,
}) => {
  const { language } = useLanguage();

  const getLocalizedCategory = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('biomass') || c.includes('stubble') || c.includes('fire')) {
      return language === 'hi' ? 'पराली एवं बायोमास दहन' : cat;
    }
    if (c.includes('vehicular') || c.includes('traffic') || c.includes('transport')) {
      return language === 'hi' ? 'वाहनों का धुआं' : cat;
    }
    if (c.includes('industrial') || c.includes('power')) {
      return language === 'hi' ? 'औद्योगिक उत्सर्जन' : cat;
    }
    if (c.includes('dust') || c.includes('construction')) {
      return language === 'hi' ? 'सड़क एवं निर्माण धूल' : cat;
    }
    if (c.includes('waste') || c.includes('garbage')) {
      return language === 'hi' ? 'कचरा दहन' : cat;
    }
    return cat;
  };

  return (
    <div
      id="sources-card"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {language === 'hi' ? 'प्रदूषण स्रोत विभाजन एवं उत्तरदायित्व विश्लेषण' : 'Source Apportionment & Attribution Modeling'}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {language === 'hi'
              ? 'वर्तमान PM2.5 भार के लिए रासायनिक द्रव्यमान संतुलन (CMB) और उत्सर्जन सूची'
              : 'Chemical Mass Balance (CMB) and emission inventory reconciliation for current PM2.5 load'}
          </p>
        </div>

        {/* Local vs Regional pill */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
          <span className="text-slate-600 font-medium">
            {language === 'hi' ? 'क्षेत्रीय प्रभाव:' : 'Regional Ingress:'}
          </span>
          <span className="font-mono font-bold text-red-600">
            {sourcesData.regionalSharePercent}%
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">
            {language === 'hi' ? 'स्थानीय एनसीआर:' : 'Local NCR:'}
          </span>
          <span className="font-mono font-bold text-indigo-600">
            {sourcesData.localSharePercent}%
          </span>
        </div>
      </div>

      {/* Visual Stacked Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>{language === 'hi' ? 'कण भार विभाजन (Particulate Mass)' : 'Particulate Mass Apportionment'}</span>
          <span className="font-mono text-slate-500">{language === 'hi' ? 'कुल: 100%' : 'Total: 100%'}</span>
        </div>

        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
          {sourcesData.sources.map((s, idx) => (
            <div
              key={idx}
              style={{ width: `${s.estimatedPercentage}%`, backgroundColor: s.color || '#dc2626' }}
              className="h-full transition-all hover:opacity-80"
              title={`${s.category}: ${s.estimatedPercentage}%`}
            />
          ))}
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {sourcesData.sources.map((s, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color || '#dc2626' }} />
                <span className="font-mono text-base font-black text-slate-900">
                  {s.estimatedPercentage}%
                </span>
              </div>

              <div className="mt-2 text-xs font-bold text-slate-900">
                {getLocalizedCategory(s.category)}
              </div>

              <div className="mt-0.5 text-[10px] text-slate-500">
                {s.origin || s.name}
              </div>
            </div>

            <div className="mt-2 border-t border-slate-200 pt-1.5 text-[10px] text-slate-500">
              {language === 'hi' ? 'विश्वसनीयता:' : 'Confidence:'} {s.confidence}
            </div>
          </div>
        ))}
      </div>

      {/* Source Method Disclaimer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {language === 'hi'
            ? 'IIT-कानपुर / TERI / SAFAR रिसेप्टर इन्वेंट्री पर आधारित कार्यप्रणाली।'
            : 'Model methodology based on IIT-Kanpur / TERI / SAFAR receptor inventories.'}
        </span>
        <span className="hidden sm:inline font-mono text-[10px]">
          {language === 'hi' ? 'सटीकता सीमा: ±6.4%' : 'Confidence Band: ±6.4%'}
        </span>
      </div>

    </div>
  );
};

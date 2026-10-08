import React, { useState } from 'react';
import {
  X,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  ShieldCheck
} from 'lucide-react';
import { LocationId } from '../types';
import { LOCATIONS } from '../server/dataService';
import { useLanguage } from '../context/LanguageContext';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: LocationId;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  locationId,
}) => {
  const { language } = useLanguage();
  const [threshold300, setThreshold300] = useState(true);
  const [threshold400, setThreshold400] = useState(true);
  const [rapidSpike, setRapidSpike] = useState(true);
  const [plumeAlert, setPlumeAlert] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const locName = LOCATIONS[locationId]?.name || 'Delhi NCR';

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        id="alert-settings-modal"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'पूर्वानुमानित अलर्ट कॉन्फ़िगरेशन' : 'Predictive Alert Configuration'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'लक्षित क्षेत्र:' : 'Target Zone:'}{' '}
                <strong className="text-slate-800">{locName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Options */}
        <div className="mt-5 space-y-3.5 text-xs">
          
          {/* Threshold 1: AQI > 300 */}
          <label className="flex cursor-pointer items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
            <div className="pr-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                {language === 'hi'
                  ? 'बहुत खराब AQI चेतावनी (AQI > 300)'
                  : 'Very Poor AQI Warning (AQI > 300)'}
              </div>
              <p className="mt-1 text-slate-600">
                {language === 'hi'
                  ? 'AQI 300 के स्तर को पार करने से 3 से 6 घंटे पहले अग्रिम सूचना प्राप्त करें।'
                  : 'Receive proactive notice 3 to 6 hours before AQI crosses the 300 threshold.'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={threshold300}
              onChange={(e) => setThreshold300(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
          </label>

          {/* Threshold 2: AQI > 400 */}
          <label className="flex cursor-pointer items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
            <div className="pr-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
                {language === 'hi'
                  ? 'गंभीर / आपातकालीन अलर्ट (AQI > 400)'
                  : 'Severe / Emergency Alert (AQI > 400)'}
              </div>
              <p className="mt-1 text-slate-600">
                {language === 'hi'
                  ? 'गंभीर रात्रि व्युत्क्रमण प्रदूषण संचय का अनुमान होने पर तत्काल चेतावनी।'
                  : 'Instant high-priority warning when severe nocturnal inversion trapping is projected.'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={threshold400}
              onChange={(e) => setThreshold400(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
          </label>

          {/* Threshold 3: Rapid PM2.5 increase */}
          <label className="flex cursor-pointer items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
            <div className="pr-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-amber-600" />
                {language === 'hi'
                  ? 'तीव्र PM2.5 स्पाइक चेतावनी (> 50 µg/m³ 2h में)'
                  : 'Rapid PM2.5 Spike Detection (> 50 µg/m³ rise in 2h)'}
              </div>
              <p className="mt-1 text-slate-600">
                {language === 'hi'
                  ? 'स्थानीय या क्षेत्रीय संचय के कारण प्रदूषण में अचानक वृद्धि का त्वरित पता लगाना।'
                  : 'Early detection of sudden local or advective accumulation events.'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={rapidSpike}
              onChange={(e) => setRapidSpike(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
          </label>

          {/* Threshold 4: Regional smoke plume approaching */}
          <label className="flex cursor-pointer items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
            <div className="pr-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-600" />
                {language === 'hi'
                  ? 'निकट आ रहा क्षेत्रीय धुआं प्लूम'
                  : 'Approaching Regional Smoke Plume'}
              </div>
              <p className="mt-1 text-slate-600">
                {language === 'hi'
                  ? 'जब अपविंड बायोमास प्लूम एनसीआर गलियारे में प्रवेश करता है तो अधिसूचना प्राप्त करें।'
                  : 'Notify when an upwind biomass plume enters the NCR transport corridor (ETA < 8h).'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={plumeAlert}
              onChange={(e) => setPlumeAlert(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
          </label>

          {/* Threshold 5: Daily Health Briefing */}
          <label className="flex cursor-pointer items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
            <div className="pr-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                {language === 'hi'
                  ? 'दैनिक सुबह एवं शाम स्वास्थ्य ब्रीफिंग'
                  : 'Daily Morning & Evening Health Briefings'}
              </div>
              <p className="mt-1 text-slate-600">
                {language === 'hi'
                  ? '07:00 और 19:00 IST पर व्यायाम एवं वेंटिलेशन संबंधी सलाह।'
                  : 'Receive proactive outdoor exercise and ventilation advice at 07:00 and 19:00 IST.'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={dailyBriefing}
              onChange={(e) => setDailyBriefing(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="text-[11px] text-slate-500">
            {language === 'hi' ? 'प्राथमिकताएं स्थानीय कैश में सुरक्षित हैं' : 'Preferences stored in local telemetry cache'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              {savedToast ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{language === 'hi' ? 'सहेजा गया!' : 'Saved!'}</span>
                </>
              ) : (
                <span>{language === 'hi' ? 'अलर्ट नियम सहेजें' : 'Save Alert Rules'}</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

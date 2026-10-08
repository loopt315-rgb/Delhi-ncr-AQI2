import React from 'react';
import {
  X,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Database
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ScientificModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificModelModal: React.FC<ScientificModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        id="scientific-model-modal"
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'hi'
                  ? 'वायुमंडलीय बुद्धिमत्ता संरचना एवं मॉडलिंग'
                  : 'Atmospheric Intelligence Architecture & Modeling'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'वैज्ञानिक दस्तावेज: WRF-Chem पाइपलाइन, ML फीचर साउंडिंग और स्रोत वर्गीकरण'
                  : 'Scientific documentation: WRF-Chem pipeline, ML feature soundings, and provenance taxonomy'}
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

        {/* Content Body */}
        <div className="mt-5 space-y-6 text-xs leading-relaxed text-slate-700">
          
          {/* Section 1: Scientific Honesty Taxonomy */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-4 w-4" />
              {language === 'hi'
                ? '1. वैज्ञानिक सत्यता एवं डेटा स्रोत वर्गीकरण'
                : '1. Scientific Honesty & Provenance Taxonomy'}
            </h4>
            <p className="text-slate-600 mb-3">
              {language === 'hi'
                ? 'AirSense NCR वास्तविक समय मापों और गणितीय अनुमानों के बीच स्पष्टता बनाए रखने के लिए 4-स्तरीय डेटा स्रोत ढांचे का पालन करता है:'
                : 'AirSense NCR adheres to a strict 4-tier data provenance framework to eliminate ambiguity between real-time measurements and mathematical estimates:'}
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="font-mono font-bold text-emerald-700">
                  {language === 'hi' ? '● प्रेक्षित डेटा (Observed):' : '● Observed Data:'}
                </span>
                <p className="mt-1 text-slate-600">
                  {language === 'hi'
                    ? 'CPCB/DPCC मॉनिटरिंग स्टेशनों से सीधे भौतिक CAAQMS बीटा क्षीणन मॉनिटर (BAM) और टेलीमेट्री।'
                    : 'Direct physical CAAQMS Beta Attenuation Monitor (BAM) and chemiluminescence telemetry from CPCB/DPCC monitoring stations.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="font-mono font-bold text-sky-700">
                  {language === 'hi' ? '● पूर्वानुमान डेटा (Forecast):' : '● Forecast Data:'}
                </span>
                <p className="mt-1 text-slate-600">
                  {language === 'hi'
                    ? 'सीमा परत मौसम विज्ञान और ऐतिहासिक प्रतिगमन मॉडल से उत्पन्न 72 घंटे का पूर्वानुमान।'
                    : 'Prognostic 72-hour air parcel trajectories generated from boundary layer meteorology, diurnal heating curves, and historical diurnal regression.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="font-mono font-bold text-amber-800">
                  {language === 'hi' ? '● अनुमानित डेटा (Estimated):' : '● Estimated Data:'}
                </span>
                <p className="mt-1 text-slate-600">
                  {language === 'hi'
                    ? 'अपविंड पराली दहन प्लूम प्रसार और रासायनिक द्रव्यमान संतुलन स्रोत विभाजन।'
                    : 'Upwind stubble-burning plume advection, dispersion cones, and chemical mass balance source apportionment.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="font-mono font-bold text-indigo-700">
                  {language === 'hi' ? '● एआई-जनरेटेड (AI-Generated):' : '● AI-Generated:'}
                </span>
                <p className="mt-1 text-slate-600">
                  {language === 'hi'
                    ? 'Gemini 3.8 Flash द्वारा संश्लेषित भाषा सारांश, जो पूरी तरह से वास्तविक डेटा पर आधारित हैं।'
                    : 'Natural-language summaries synthesized by Gemini 3.8 Flash, strictly grounded in the quantitative physical outputs above with zero ungrounded facts.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: WRF-Chem Pipeline */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5 mb-2">
              <GitBranch className="h-4 w-4" />
              {language === 'hi'
                ? '2. रासायनिक परिवहन एवं मौसम संबंधी पाइपलाइन (WRF-Chem)'
                : '2. Chemical Transport & Meteorological Pipeline (WRF-Chem)'}
            </h4>
            <p className="text-slate-600 mb-3">
              {language === 'hi'
                ? 'मौसम अनुसंधान और पूर्वानुमान (WRF) मॉडल गैस-फेज तंत्र (CBM-Z) और एरोसोल मॉड्यूल (MOSAIC) के साथ संयुक्त:'
                : 'Full Eulerian chemical transport coupling: Weather Research and Forecasting (WRF) model combined with inline chemical gas-phase mechanisms (CBM-Z) and aerosol modules (MOSAIC):'}
            </p>

            {/* Pipeline schematic diagram */}
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 font-mono text-[11px] shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-800 border border-slate-200">GFS / ECMWF Initial Conditions</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="rounded bg-sky-50 px-2.5 py-1 text-sky-800 border border-sky-200">WRF Core (Dynamics & PBL)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-orange-50 px-2.5 py-1 text-orange-800 border border-orange-200">VIIRS/MODIS Fire Emissions + EDGAR</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="rounded bg-red-50 px-2.5 py-1 text-red-800 border border-red-200">MOSAIC Aerosol Chemistry</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-indigo-50 px-2.5 py-1 text-indigo-800 border border-indigo-200">3 km Nested Delhi NCR Domain</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="rounded bg-emerald-50 px-2.5 py-1 text-emerald-800 border border-emerald-200">AirSense Grounding & Alert Engine</span>
              </div>
            </div>
          </div>

          {/* Section 3: Inversion and Boundary Layer Physics */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
              <Activity className="h-4 w-4" />
              {language === 'hi'
                ? '3. ग्रहणीय सीमा परत (PBL) एवं थर्मल व्युत्क्रमण भौतिकी'
                : '3. Planetary Boundary Layer & Thermal Inversion Mechanics'}
            </h4>
            <p className="text-slate-600">
              {language === 'hi'
                ? 'दिल्ली एनसीआर सर्दियों के दौरान, सतह के तेजी से विकिरण शीतलन के कारण एक मजबूत थर्मल व्युत्क्रमण ढक्कन बन जाता है। प्रभावी मिश्रण गहराई दोपहर में >1,200 मीटर से घटकर रात में <250 मीटर हो जाती है। 2 m/s से कम हवा के साथ, वेंटिलेशन इंडेक्स 1,000 m²/s से नीचे चला जाता है, जिससे तीव्र प्रदूषण जमाव होता है।'
                : 'During Delhi NCR winters, rapid radiative surface cooling decouples the surface layer from upper airflows, forming an extreme thermal inversion lid. The effective mixing depth drops from >1,200m at midday to <250m at night. Combined with surface winds under 2 m/s, the ventilation index drops below 1,000 m²/s, causing severe pollutant accumulation regardless of day-to-day emission variations.'}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer shadow-2xs"
          >
            {language === 'hi' ? 'वैज्ञानिक संदर्भ बंद करें' : 'Close Scientific Reference'}
          </button>
        </div>
      </div>
    </div>
  );
};

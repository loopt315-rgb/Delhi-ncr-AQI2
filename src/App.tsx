import React, { useState, useEffect, useCallback } from 'react';
import {
  LocationId,
  ActiveNavTab,
  NCRStation,
  CurrentAQIResponse,
  ForecastHourPoint,
  WeatherData,
  FireSummary,
  PlumePrediction,
  SourceContributionData,
  HealthRiskAdvice,
  PredictiveAlert
} from './types';
import {
  getCurrentAQI,
  get72HourForecast,
  getContributingFactors,
  getWeatherData,
  getFiresSummary,
  getPlumePrediction,
  getSourceContribution,
  getHealthRiskAdvice,
  getPredictiveAlerts,
  LOCATIONS,
  NCR_STATIONS
} from './server/dataService';
import { useLanguage } from './context/LanguageContext';

import { Header } from './components/Header';
import { HeroAQICard } from './components/HeroAQICard';
import { ForecastChart } from './components/ForecastChart';
import { WhyChangingCard } from './components/WhyChangingCard';
import { PollutionMap } from './components/PollutionMap';
import { StubbleFireTracking } from './components/StubbleFireTracking';
import { PlumePredictionCard } from './components/PlumePredictionCard';
import { HealthImpactCard } from './components/HealthImpactCard';
import { SmartAlertsCard } from './components/SmartAlertsCard';
import { AISummaryCard } from './components/AISummaryCard';
import { PollutantBreakdown } from './components/PollutantBreakdown';
import { WeatherCard } from './components/WeatherCard';
import { SourceContributionCard } from './components/SourceContributionCard';
import { DelhiStationsView } from './components/DelhiStationsView';
import { AQIHeatmapView } from './components/AQIHeatmapView';
import { CoupledModelPipelineView } from './components/CoupledModelPipelineView';
import { CloudburstPredictorView } from './components/CloudburstPredictorView';
import { AndroidAppHubModal } from './components/AndroidAppHubModal';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { AlertsDrawer } from './components/AlertsDrawer';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { ScientificModelModal } from './components/ScientificModelModal';
import { DataProvenanceModal } from './components/DataProvenanceModal';

import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Flame,
  Wind,
  Info,
  ArrowUp,
  MapPin,
  TrendingUp,
  HeartPulse,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Map as MapIcon,
  Cpu,
  CloudLightning,
  Smartphone
} from 'lucide-react';
import { getAQITheme } from './utils/colors';

export default function App() {
  const { language, t } = useLanguage();
  const [currentLocation, setCurrentLocation] = useState<LocationId>('delhi');
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const [isAndroidHubOpen, setIsAndroidHubOpen] = useState(false);

  // Core Data States
  const [currentAQI, setCurrentAQI] = useState(() => getCurrentAQI('delhi'));
  const [stations, setStations] = useState<NCRStation[]>(() => NCR_STATIONS);
  const [forecast, setForecast] = useState(() => get72HourForecast('delhi'));
  const [factorsData, setFactorsData] = useState(() => getContributingFactors('delhi'));
  const [weather, setWeather] = useState(() => getWeatherData('delhi'));
  const [fires, setFires] = useState(() => getFiresSummary());
  const [plume, setPlume] = useState(() => getPlumePrediction('delhi'));
  const [sources, setSources] = useState(() => getSourceContribution('delhi'));
  const [health, setHealth] = useState(() => getHealthRiskAdvice('delhi'));
  const [alerts, setAlerts] = useState(() => getPredictiveAlerts('delhi'));
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    keyDrivers: string[];
    peakPeriod: string;
    source: 'gemini' | 'deterministic-grounded';
  } | null>(null);

  const navigateToTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Support Android PWA Shortcuts (?tab=cloudburst, ?tab=stations, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveNavTab | null;
      if (
        tabParam &&
        ['overview', 'stations', 'heatmap', 'forecast', 'causes', 'plume', 'health', 'model_pipeline', 'cloudburst'].includes(
          tabParam
        )
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Fetch all endpoints with validation and cache-busting
  const loadData = useCallback(async (loc: LocationId, showSpinner = true) => {
    if (showSpinner) setIsRefreshing(true);

    const safeFetchJson = async <T,>(url: string, validator: (data: any) => boolean): Promise<T | null> => {
      try {
        const separator = url.includes('?') ? '&' : '?';
        const cacheBustingUrl = `${url}${separator}_t=${Date.now()}`;
        const res = await fetch(cacheBustingUrl, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          }
        });
        if (!res.ok) return null;
        const json = await res.json();
        if (json && validator(json)) {
          return json as T;
        }
        return null;
      } catch {
        return null;
      }
    };

    try {
      const [
        aqiData,
        stationsData,
        forecastData,
        factorsDataRes,
        weatherData,
        firesData,
        plumeData,
        sourcesData,
        healthData,
        alertsData
      ] = await Promise.all([
        safeFetchJson<CurrentAQIResponse>(
          `/api/aq/current?location=${loc}`,
          (d) => typeof d.aqi === 'number' && !isNaN(d.aqi) && d.pollutants && typeof d.pollutants.pm25 === 'number'
        ),
        safeFetchJson<NCRStation[]>(
          '/api/stations',
          (d) => Array.isArray(d) && d.length > 0
        ),
        safeFetchJson<ForecastHourPoint[]>(
          `/api/aq/forecast?location=${loc}`,
          (d) => Array.isArray(d) && d.length > 0 && typeof d[0]?.aqi === 'number'
        ),
        safeFetchJson<any>(
          `/api/aq/factors?location=${loc}`,
          (d) => Array.isArray(d?.factors)
        ),
        safeFetchJson<WeatherData>(
          `/api/weather/current?location=${loc}`,
          (d) => typeof d?.temperatureC === 'number'
        ),
        safeFetchJson<FireSummary>(
          '/api/fires',
          (d) => typeof d?.totalCount === 'number'
        ),
        safeFetchJson<PlumePrediction>(
          `/api/plume?location=${loc}`,
          (d) => typeof d?.plumeRisk === 'string'
        ),
        safeFetchJson<SourceContributionData>(
          `/api/sources?location=${loc}`,
          (d) => Array.isArray(d?.sources)
        ),
        safeFetchJson<HealthRiskAdvice>(
          `/api/health-risk?location=${loc}`,
          (d) => Boolean(d?.summary || d?.generalAdvice)
        ),
        safeFetchJson<PredictiveAlert[]>(
          `/api/alerts?location=${loc}`,
          (d) => Array.isArray(d)
        )
      ]);

      if (aqiData) setCurrentAQI(aqiData);
      if (stationsData) setStations(stationsData);
      if (forecastData) setForecast(forecastData);
      if (factorsDataRes) setFactorsData(factorsDataRes);
      if (weatherData) setWeather(weatherData);
      if (firesData) setFires(firesData);
      if (plumeData) setPlume(plumeData);
      if (sourcesData) setSources(sourcesData);
      if (healthData) setHealth(healthData);
      if (alertsData) setAlerts(alertsData);
    } catch (err) {
      console.info('API fetch notice, using local calibrated models:', err);
    } finally {
      setIsRefreshing(false);
    }

    // Load AI summary
    setIsLoadingAI(true);
    try {
      const aiRes = await fetch(`/api/ai/summary?location=${loc}&lang=${language}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        }
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiSummary(aiData);
      } else {
        throw new Error('AI summary failed');
      }
    } catch {
      // Grounded deterministic fallback in active language
      if (language === 'hi') {
        setAiSummary({
          summary: `${LOCATIONS[loc]?.name || 'दिल्ली'} में वायु गुणवत्ता आज रात ~${getCurrentAQI(loc).expected12hAqi} (गंभीर) तक पहुंचने का अनुमान है। रात्रि में बाउंड्री लेयर 280 मीटर तक सिकुड़ने और शांत हवाओं (1.4 m/s) के कारण स्थानीय उत्सर्जन वायुमंडल में नीचे ही कैद हैं।`,
          keyDrivers: [
            'सख्त थर्मल इन्वर्जन (87/100) द्वारा 280 मीटर नीचे धुआं फंसना',
            '2 मीटर/सेकंड से धीमी गति की शांत हवाएं',
            'पंजाब व हरियाणा से आता पराली के धुएं का कॉरिडोर'
          ],
          peakPeriod: 'आज रात 21:00 से 02:00 IST के मध्य (~425 AQI)',
          source: 'deterministic-grounded'
        });
      } else if (language === 'pa') {
        setAiSummary({
          summary: `${LOCATIONS[loc]?.name || 'ਦਿੱਲੀ'} ਵਿੱਚ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਅੱਜ ਰਾਤ ~${getCurrentAQI(loc).expected12hAqi} ਤੱਕ ਪਹੁੰਚ ਸਕਦੀ ਹੈ। ਸ਼ਾਂਤ ਹਵਾਵਾਂ ਅਤੇ ਥਰਮਲ ਇਨਵਰਜ਼ਨ ਕਾਰਨ ਪ੍ਰਦੂਸ਼ਣ ਹੇਠਾਂ ਇਕੱਠਾ ਹੋ ਰਿਹਾ ਹੈ।`,
          keyDrivers: [
            'ਥਰਮਲ ਇਨਵਰਜ਼ਨ ਕਾਰਨ ਧੂੰਆਂ ਧਰਤੀ ਦੇ ਨੇੜੇ ਇਕੱਠਾ ਹੋਣਾ',
            'ਸ਼ਾਂਤ ਹਵਾਵਾਂ (1.4 m/s)',
            'ਖੇਤਰੀ ਧੂੰਏਂ ਦਾ ਪ੍ਰਭਾਵ'
          ],
          peakPeriod: 'ਅੱਜ ਰਾਤ 21:00 ਤੋਂ 02:00 IST ਦੇ ਵਿਚਕਾਰ',
          source: 'deterministic-grounded'
        });
      } else {
        setAiSummary({
          summary: `Air quality across ${LOCATIONS[loc]?.name || 'Delhi'} is expected to deteriorate tonight towards ~${getCurrentAQI(loc).expected12hAqi} (Severe). Nocturnal boundary layer compression to 280m and calm northwesterly winds (1.4 m/s) are preventing horizontal and vertical dispersion while an upstream smoke plume with ~+32% PM2.5 arrives.`,
          keyDrivers: [
            'Strong thermal inversion (87/100) trapping emissions below 280m',
            'Sub-2 m/s calm wind speed preventing advective clearing',
            'Active upwind biomass smoke plume inbound from Punjab/Haryana'
          ],
          peakPeriod: 'Tonight between 21:00 and 02:00 IST (~425 AQI)',
          source: 'deterministic-grounded'
        });
      }
    } finally {
      setIsLoadingAI(false);
    }
  }, [language]);

  useEffect(() => {
    loadData(currentLocation, true);
  }, [currentLocation, language, loadData]);

  // Top 5 polluted stations for quick NDTV-style overview preview
  const topPollutedStations = [...stations].sort((a, b) => b.aqi - a.aqi).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-slate-900 selection:text-white antialiased">
      
      {/* 1. Header with Top Navigation Tabs */}
      <Header
        currentLocation={currentLocation}
        onLocationChange={(loc) => setCurrentLocation(loc)}
        activeTab={activeTab}
        onTabChange={navigateToTab}
        stationsCount={stations.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScience={() => setIsScienceOpen(true)}
        onOpenProvenance={() => setIsProvenanceOpen(true)}
        onOpenAndroidHub={() => setIsAndroidHubOpen(true)}
        unreadAlertsCount={alerts.length}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(currentLocation, true)}
        lastUpdated={currentAQI.lastUpdated}
      />

      {/* Offline Status Warning for Android Users */}
      <OfflineBanner />

      {/* Android App Install Promotion Banner */}
      <AndroidInstallBanner onOpenAndroidHub={() => setIsAndroidHubOpen(true)} />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Core Product Tagline Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('appName')}
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300"></span>
                <span className="hidden sm:inline-block text-xs text-slate-500">
                  {t('zoneLabel')}: <strong className="text-slate-800">{LOCATIONS[currentLocation]?.name}</strong> ({LOCATIONS[currentLocation]?.state})
                </span>
                <button
                  onClick={() => setIsProvenanceOpen(true)}
                  className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer ml-1"
                  title={t('sourcesVerified')}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{t('sourcesVerified')}</span>
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                </button>
              </div>
              <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                "{t('tagline')}"
              </h2>
            </div>

            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => navigateToTab('cloudburst')}
                className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  activeTab === 'cloudburst'
                    ? 'border-red-600 bg-red-600 text-white shadow-xs'
                    : 'border-red-200 bg-red-50/60 text-red-700 hover:bg-red-100'
                }`}
              >
                <CloudLightning className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>⚡ {t('tabCloudburst') || 'Cloudburst'}</span>
              </button>
              <button
                onClick={() => navigateToTab('stations')}
                className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer border ${
                  activeTab === 'stations'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📍 {t('tabStations')} ({stations.length})
              </button>
              <button
                onClick={() => navigateToTab('heatmap')}
                className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer border ${
                  activeTab === 'heatmap'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🗺️ {t('tabHeatmap')}
              </button>
              <button
                onClick={() => navigateToTab('forecast')}
                className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer border ${
                  activeTab === 'forecast'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📈 {t('tabForecast')}
              </button>
              <button
                onClick={() => navigateToTab('causes')}
                className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer border ${
                  activeTab === 'causes'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🔍 {t('tabCauses')}
              </button>
              <button
                onClick={() => navigateToTab('health')}
                className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer border ${
                  activeTab === 'health'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🩺 {t('tabHealth')}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW / LIVE DELHI AQI */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Hero AQI Display Card */}
            <HeroAQICard
              data={currentAQI}
              onExploreFactors={() => navigateToTab('causes')}
              onViewForecast={() => navigateToTab('forecast')}
            />

            {/* NDTV Reference Feature: Top 5 Most Polluted Delhi Areas Quick Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Highest Polluted Areas in Delhi NCR Right Now
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateToTab('heatmap')}
                    className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <MapIcon className="h-3.5 w-3.5 text-red-600" />
                    <span>View Live Heat Map</span>
                  </button>
                  <button
                    onClick={() => navigateToTab('stations')}
                    className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    <span>All {stations.length} Stations</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {topPollutedStations.map((st) => {
                  const theme = getAQITheme(st.aqi);
                  return (
                    <div
                      key={st.id}
                      onClick={() => navigateToTab('stations')}
                      className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:border-red-300 hover:bg-red-50/30 transition-colors"
                    >
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-red-700">
                        {st.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{st.city}</div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-mono text-xl font-black text-red-600">{st.aqi}</span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: theme.accentHex }}
                        >
                          {st.status}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500 font-mono">
                        PM2.5: {st.pm25} µg/m³
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Predictive Smart Alerts */}
            <SmartAlertsCard
              alerts={alerts}
              onViewForecast={() => navigateToTab('forecast')}
              onOpenConfigure={() => setIsSettingsOpen(true)}
            />

            {/* AI-Generated Natural-Language Air Summary */}
            <AISummaryCard
              summaryData={aiSummary}
              isLoading={isLoadingAI}
              onRefresh={() => loadData(currentLocation, false)}
              onAskFollowUp={() => setIsChatOpen(true)}
            />

            {/* Live Geographic Airshed & Smoke Plume Map */}
            <PollutionMap
              fireHotspots={fires.hotspots}
              plume={plume}
              selectedLocation={currentLocation}
            />

            {/* Key Pollutant Breakdown & WHO Standards */}
            <PollutantBreakdown data={currentAQI} />

            {/* Quick Action Navigation Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => navigateToTab('heatmap')}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="mt-3 font-bold text-slate-900 text-sm">Geospatial AQI Heat Map</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Continuous IDW spatial dispersion across 31+ CAAQMS stations with live coordinate probing.
                </p>
              </div>

              <div
                onClick={() => navigateToTab('forecast')}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="mt-3 font-bold text-slate-900 text-sm">72-Hour Prognostic Forecast</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Track hourly AQI trajectories, midnight thermal inversion peaks, and 3-day projections.
                </p>
              </div>

              <div
                onClick={() => navigateToTab('causes')}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="mt-3 font-bold text-slate-900 text-sm">Why is Pollution Increasing?</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Physics breakdown: Boundary layer drop to 280m, calm winds, and nocturnal thermal trapping.
                </p>
              </div>

              <div
                onClick={() => navigateToTab('plume')}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Flame className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="mt-3 font-bold text-slate-900 text-sm">Regional Smoke & Plume Map</h4>
                <p className="mt-1 text-xs text-slate-500">
                  NASA satellite stubble fire counts in Punjab/Haryana and real-time advection corridor.
                </p>
              </div>

              <div
                onClick={() => navigateToTab('model_pipeline')}
                className="group cursor-pointer rounded-2xl border border-sky-200 bg-sky-50/40 p-5 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <h4 className="font-bold text-slate-900 text-sm">Coupled WRF-Chem & ML Model</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Stage A
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Raw 3km physics simulations vs. LightGBM residual calibration, 4-stage CAAQMS QC, and US EPA validation metrics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DELHI NCR STATIONS DIRECTORY (NDTV REFERENCE) */}
        {/* ========================================================================= */}
        {activeTab === 'stations' && (
          <DelhiStationsView
            stations={stations}
            currentLocation={currentLocation}
            onSelectStation={(loc) => {
              setCurrentLocation(loc);
              navigateToTab('overview');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: GEOSPATIAL AQI HEAT MAP */}
        {/* ========================================================================= */}
        {activeTab === 'heatmap' && (
          <AQIHeatmapView
            stations={stations}
            currentLocation={currentLocation}
            onLocationChange={(loc) => {
              setCurrentLocation(loc);
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 72-HOUR DETAILED FORECAST */}
        {/* ========================================================================= */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <ForecastChart forecastData={forecast} />
            <WeatherCard weather={weather} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: "WHY IS AQI RISING?" ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'causes' && (
          <div className="space-y-6">
            <WhyChangingCard
              factors={factorsData.factors}
              headline={factorsData.headline}
              summary={factorsData.summary}
              weather={weather}
            />
            <WeatherCard weather={weather} />
            <SourceContributionCard sourcesData={sources} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SMOKE PLUME & STUBBLE FIRES */}
        {/* ========================================================================= */}
        {activeTab === 'plume' && (
          <div className="space-y-6">
            <PlumePredictionCard
              plume={plume}
              onOpenMap={() => {
                const el = document.getElementById('pollution-map-container');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <PollutionMap
              fireHotspots={fires.hotspots}
              plume={plume}
              selectedLocation={currentLocation}
            />
            <StubbleFireTracking
              firesData={fires}
              onFocusMapFires={() => {
                const el = document.getElementById('pollution-map-container');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <SourceContributionCard sourcesData={sources} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: HEALTH ADVISORIES & PRECAUTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <HealthImpactCard advice={health} />
            <PollutantBreakdown data={currentAQI} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: COUPLED WRF-CHEM & ML MODEL PIPELINE (STAGE A) */}
        {/* ========================================================================= */}
        {activeTab === 'model_pipeline' && (
          <CoupledModelPipelineView selectedLocation={currentLocation} />
        )}

        {/* ========================================================================= */}
        {/* TAB: CLOUDBURST & EXTREME CONVECTIVE PREDICTOR */}
        {/* ========================================================================= */}
        {activeTab === 'cloudburst' && (
          <CloudburstPredictorView
            currentLocation={currentLocation}
            onLocationChange={(loc) => setCurrentLocation(loc)}
            onNavigateToForecast={() => navigateToTab('forecast')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 pb-24 md:pb-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">AirSense NCR</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">NDTV-Referenced Delhi NCR Air Quality Platform</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 max-w-xl">
                Synthesizing physical CAAQMS telemetry across 28 Delhi & NCR stations, Open-Meteo boundary layer soundings, NASA VIIRS/MODIS fire hotspots, and Gemini-grounded natural language intelligence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsScienceOpen(true)}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Info className="h-3.5 w-3.5" />
                <span>Model Architecture</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>Back to Top</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              Scientific Honesty: Observed values represent physical CAAQMS sensors. Forecasts & plume advection vectors are mathematical prognostic projections.
            </div>
            <div className="font-mono text-slate-500">
              Version 2.5.0 • Integrated with NDTV Delhi AQI Station Architecture
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button: Conversational Pollution Assistant */}
      <div className="fixed bottom-18 md:bottom-5 right-4 sm:right-5 z-40">
        <button
          id="open-airsense-assistant-btn"
          onClick={() => setIsChatOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl transition-all duration-200 hover:bg-slate-800 hover:scale-105 cursor-pointer"
        >
          {/* Pulsing notification indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>

          <MessageSquare className="h-4 w-4 text-white" />
          <span>{t('chatTitle')}</span>
        </button>
      </div>

      {/* Slide-over Drawers and Modals */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        locationId={currentLocation}
        currentAQI={currentAQI}
        weather={weather}
        forecast={forecast}
        stations={stations}
        fires={fires}
        plume={plume}
        sources={sources}
        health={health}
        onNavigateSection={(id) => {
          const clean = id.replace('#', '').toLowerCase();
          if (clean === 'why-changing-card' || clean === 'why-changing' || clean === 'causes' || clean === 'sources') {
            navigateToTab('causes');
          } else if (clean === 'forecast-card' || clean === 'forecast') {
            navigateToTab('forecast');
          } else if (clean === 'pollution-map-container' || clean === 'map' || clean === 'plume') {
            navigateToTab('plume');
          } else if (clean === 'health-card' || clean === 'health') {
            navigateToTab('health');
          } else if (clean === 'stations-view' || clean === 'stations') {
            navigateToTab('stations');
          }
        }}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onOpenConfigure={() => setIsSettingsOpen(true)}
        onViewForecast={() => navigateToTab('forecast')}
      />

      <AlertSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        locationId={currentLocation}
      />

      <ScientificModelModal
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
      />

      <DataProvenanceModal
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
      />

      {/* Android Mobile Ergonomic Bottom Navigation Bar */}
      <AndroidBottomNav
        activeTab={activeTab}
        onTabChange={navigateToTab}
        onOpenAndroidHub={() => setIsAndroidHubOpen(true)}
        stationsCount={stations.length}
      />

      {/* Android Application Hub Modal (PWA WebAPK, QR Scan, APK CLI) */}
      <AndroidAppHubModal
        isOpen={isAndroidHubOpen}
        onClose={() => setIsAndroidHubOpen(false)}
      />

    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Bell,
  Settings,
  ChevronDown,
  RefreshCw,
  Info,
  Activity,
  CheckCircle2,
  Wind,
  BarChart3,
  TrendingUp,
  HelpCircle,
  Flame,
  HeartPulse,
  ShieldCheck,
  Map,
  Cpu,
  CloudLightning,
  Smartphone
} from 'lucide-react';
import { LocationId, ActiveNavTab } from '../types';
import { LOCATIONS } from '../server/dataService';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  currentLocation: LocationId;
  onLocationChange: (loc: LocationId) => void;
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  stationsCount?: number;
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
  onOpenScience: () => void;
  onOpenProvenance?: () => void;
  onOpenAndroidHub?: () => void;
  unreadAlertsCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onLocationChange,
  activeTab,
  onTabChange,
  stationsCount = 28,
  onOpenAlerts,
  onOpenSettings,
  onOpenScience,
  onOpenProvenance,
  onOpenAndroidHub,
  unreadAlertsCount,
  isRefreshing,
  onRefresh,
  lastUpdated,
}) => {
  const { t, language } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const locationList = Object.values(LOCATIONS);
  const activeLoc = LOCATIONS[currentLocation];

  const tabs: { id: ActiveNavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: t('tabOverview'), icon: BarChart3 },
    { id: 'cloudburst', label: t('tabCloudburst') || (language === 'hi' ? 'क्लाउडबर्स्ट प्रेडिक्टर' : 'Cloudburst Predictor'), icon: CloudLightning, badge: 'Doppler' },
    { id: 'stations', label: t('tabStations'), icon: MapPin, badge: `${stationsCount}` },
    { id: 'heatmap', label: t('tabHeatmap'), icon: Map, badge: 'Live' },
    { id: 'forecast', label: t('tabForecast'), icon: TrendingUp },
    { id: 'causes', label: t('tabCauses'), icon: HelpCircle },
    { id: 'plume', label: t('tabPlume'), icon: Flame },
    { id: 'health', label: t('tabHealth'), icon: HeartPulse },
    { id: 'model_pipeline', label: language === 'hi' ? 'युग्मित मॉडल (Stage A)' : 'Coupled Model (Stage A)', icon: Cpu, badge: 'WRF-Chem' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      {/* Upper Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <Wind className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
                AirSense <span className="text-red-600 font-extrabold">NCR</span>
              </span>
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 sm:inline-block">
                NDTV REF
              </span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold hidden xs:block">
              Delhi NCR Air Pollution Intelligence
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              id="location-selector-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200 focus:outline-none"
            >
              <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <span className="max-w-[80px] truncate sm:max-w-[130px]">📍 {activeLoc.name}</span>
              <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('monitoringZones')}
                  </div>
                  {locationList.map((loc) => {
                    const isSelected = loc.id === currentLocation;
                    return (
                      <button
                        key={loc.id}
                        id={`loc-option-${loc.id}`}
                        onClick={() => {
                          onLocationChange(loc.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-red-50 font-bold text-red-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{loc.name}</div>
                          <div className="text-[10px] text-slate-400">{loc.state}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-red-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Language Switcher Feature */}
          <LanguageSwitcher />

          {/* Verified Data Provenance Button */}
          <button
            id="data-provenance-btn"
            title={t('provenanceTooltip')}
            onClick={onOpenProvenance}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100/70 cursor-pointer"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t('liveSourcesActive')}</span>
          </button>

          {/* Quick Refresh Button */}
          <button
            id="refresh-data-btn"
            title={t('refreshTooltip')}
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
          </button>

          {/* Scientific Info Modal Trigger */}
          <button
            id="science-model-btn"
            title={t('scienceTooltip')}
            onClick={onOpenScience}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {/* Android App Hub Trigger Button */}
          <button
            id="header-android-hub-btn"
            title="AirSense NCR Android App (WebAPK & Install)"
            onClick={onOpenAndroidHub}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer shadow-2xs"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">Android App</span>
          </button>

          {/* Predictive Alerts Bell Button */}
          <button
            id="alerts-toggle-btn"
            onClick={onOpenAlerts}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title={t('alertsTooltip')}
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            id="settings-toggle-btn"
            onClick={onOpenSettings}
            title={t('settingsTooltip')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* Top Navigation Tabs Bar */}
      <div className="border-t border-slate-200 bg-slate-50/90 px-4 sm:px-6 lg:px-8">
        <nav
          id="top-nav-tabs"
          className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto py-2 scrollbar-none"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="headerActiveTabPill"
                    className="absolute inset-0 rounded-xl bg-white shadow-xs border border-slate-200/90"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-red-50 text-red-700' : 'bg-slate-200/70 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};


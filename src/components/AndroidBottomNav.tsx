import React from 'react';
import {
  BarChart3,
  MapPin,
  TrendingUp,
  CloudLightning,
  Smartphone,
  Map
} from 'lucide-react';
import { ActiveNavTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AndroidBottomNavProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  onOpenAndroidHub: () => void;
  stationsCount?: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAndroidHub,
  stationsCount = 28,
}) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'overview' as ActiveNavTab,
      label: 'AQI',
      icon: BarChart3,
    },
    {
      id: 'cloudburst' as ActiveNavTab,
      label: 'Radar',
      icon: CloudLightning,
      badge: 'Doppler',
    },
    {
      id: 'stations' as ActiveNavTab,
      label: 'Stations',
      icon: MapPin,
      badge: `${stationsCount}`,
    },
    {
      id: 'heatmap' as ActiveNavTab,
      label: 'Map',
      icon: Map,
    },
    {
      id: 'forecast' as ActiveNavTab,
      label: 'Forecast',
      icon: TrendingUp,
    },
  ];

  return (
    <nav
      id="android-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom,0px)] shadow-lg"
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[54px] ${
                isActive
                  ? 'text-red-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-red-600 animate-pulse" />
              )}
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 rounded-full bg-red-600 px-1 py-0.2 text-[8px] font-bold text-white leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Android App Button */}
        <button
          id="bottom-nav-android-hub"
          onClick={onOpenAndroidHub}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-emerald-700 hover:text-emerald-800 transition-all cursor-pointer min-w-[54px]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100">
            <Smartphone className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-emerald-700">App</span>
        </button>
      </div>
    </nav>
  );
};

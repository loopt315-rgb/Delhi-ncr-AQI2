import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Wind,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';
import { NCRStation, LocationId } from '../types';
import { getAQITheme } from '../utils/colors';
import { useLanguage } from '../context/LanguageContext';
import { AQIHeatmapView } from './AQIHeatmapView';

interface DelhiStationsViewProps {
  stations: NCRStation[];
  currentLocation: LocationId;
  onSelectStation: (locId: LocationId) => void;
}

export const DelhiStationsView: React.FC<DelhiStationsViewProps> = ({
  stations,
  currentLocation,
  onSelectStation,
}) => {
  const { language, t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'heatmap'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'aqi-desc' | 'aqi-asc' | 'name'>('aqi-desc');
  const [filterSevereOnly, setFilterSevereOnly] = useState(false);

  // Derive unique cities
  const cities = ['All', 'Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Faridabad'];

  // Calculate high-level summary stats
  const stats = useMemo(() => {
    if (!stations.length) return { avg: 0, maxStation: null, minStation: null, severeCount: 0 };
    const sum = stations.reduce((acc, s) => acc + s.aqi, 0);
    const avg = Math.round(sum / stations.length);
    const sorted = [...stations].sort((a, b) => b.aqi - a.aqi);
    const maxStation = sorted[0];
    const minStation = sorted[sorted.length - 1];
    const severeCount = stations.filter((s) => s.aqi >= 401).length;
    return { avg, maxStation, minStation, severeCount };
  }, [stations]);

  // Filtered and sorted stations
  const filteredStations = useMemo(() => {
    return stations
      .filter((station) => {
        const matchesCity = selectedCity === 'All' || station.city.toLowerCase() === selectedCity.toLowerCase();
        const matchesSearch =
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (station.areaType && station.areaType.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSevere = !filterSevereOnly || station.aqi >= 401;
        return matchesCity && matchesSearch && matchesSevere;
      })
      .sort((a, b) => {
        if (sortBy === 'aqi-desc') return b.aqi - a.aqi;
        if (sortBy === 'aqi-asc') return a.aqi - b.aqi;
        return a.name.localeCompare(b.name);
      });
  }, [stations, selectedCity, searchQuery, sortBy, filterSevereOnly]);

  const mapCityToLocId = (city: string): LocationId => {
    const c = city.toLowerCase();
    if (c.includes('noida')) return 'noida';
    if (c.includes('gurugram')) return 'gurugram';
    if (c.includes('ghaziabad')) return 'ghaziabad';
    if (c.includes('faridabad')) return 'faridabad';
    return 'delhi';
  };

  const getLocalizedTier = (aqi: number) => {
    if (aqi <= 50) return t('tierGood');
    if (aqi <= 100) return t('tierSatisfactory');
    if (aqi <= 200) return t('tierModerate');
    if (aqi <= 300) return t('tierPoor');
    if (aqi <= 400) return t('tierVeryPoor');
    return t('tierSevere');
  };

  return (
    <div id="delhi-stations-view" className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-600">
                <MapPin className="h-3.5 w-3.5" />
                {language === 'hi' ? 'सीएएक्यूएमएस टेलीमेट्री' : 'NDTV Reference Telemetry'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'आधिकारिक CPCB एवं DPCC स्टेशन' : 'Official CPCB & DPCC Continuous Ambient Air Quality Stations'}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {language === 'hi' ? 'दिल्ली एनसीआर स्टेशन-वार वायु गुणवत्ता सूचकांक' : 'Delhi NCR Station-Wise Air Quality Index'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              {language === 'hi'
                ? 'दिल्ली, नोएडा, गुरुग्राम, गाजियाबाद एवं फरीदाबाद के 28 मॉनिटरिंग स्टेशनों का वास्तविक समय डेटा।'
                : 'Real-time monitoring across 28 continuous CAAQMS stations in Delhi, Noida, Gurugram, Ghaziabad, and Faridabad. Click any station to inspect its detailed atmospheric sounding.'}
            </p>
          </div>

          {/* Quick status badge */}
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 shrink-0">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                {language === 'hi' ? 'क्षेत्रीय स्थिति' : 'Airshed Condition'}
              </div>
              <div className="text-sm font-black text-red-800">
                {stats.severeCount} {language === 'hi' ? 'स्टेशन गंभीर श्रेणी में' : 'Stations in Severe Tier'}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'एनसीआर औसत AQI' : 'NCR Average AQI'}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-red-600">{stats.avg}</span>
              <span className="text-xs font-semibold text-red-600">{getLocalizedTier(stats.avg)}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {language === 'hi' ? '28 मॉनिटरिंग केंद्रों में' : 'Across 28 monitoring hubs'}
            </span>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
            <span className="text-[11px] font-semibold text-red-700">
              {language === 'hi' ? 'सर्वाधिक प्रदूषित स्टेशन' : 'Most Polluted Station'}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-red-700">{stats.maxStation?.aqi || 432}</span>
              <span className="text-xs font-bold text-red-700 truncate max-w-[90px]">
                {stats.maxStation?.name}
              </span>
            </div>
            <span className="text-[10px] text-red-600">PM2.5: {stats.maxStation?.pm25} µg/m³ ({getLocalizedTier(stats.maxStation?.aqi || 432)})</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'अपेक्षाकृत कम AQI' : 'Relatively Lower AQI'}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-amber-600">{stats.minStation?.aqi || 345}</span>
              <span className="text-xs font-bold text-amber-600 truncate max-w-[90px]">
                {stats.minStation?.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              {language === 'hi' ? 'साउथ रिज माइक्रोक्लाइमेट' : 'South Ridge microclimate'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'प्रमुख प्रदूषक' : 'Dominant Pollutant'}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-800">PM2.5</span>
              <span className="text-xs font-semibold text-slate-600">
                {language === 'hi' ? 'सूक्ष्म धूल' : 'Fine Dust'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {language === 'hi' ? '100% एनसीआर स्टेशनों में' : '100% of NCR stations'}
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher: Station Cards vs Continuous Geospatial Heat Map */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 ml-1">
            {language === 'hi' ? 'प्रारूप चुनें:' : 'View Format:'}
          </span>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              id="stations-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{language === 'hi' ? `स्टेशन कार्ड (${stations.length})` : `Station Cards (${stations.length})`}</span>
            </button>
            <button
              id="stations-view-heatmap-btn"
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'heatmap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-red-600" />
              <span>{t('tabHeatmap')}</span>
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium mr-2 hidden sm:inline">
          {viewMode === 'heatmap'
            ? (language === 'hi' ? 'निरंतर स्थानिक इंटरपोलेशन' : 'Continuous inverse distance spatial interpolation')
            : (language === 'hi' ? 'व्यक्तिगत निगरानी स्टेशन' : 'Individual monitoring station soundings')}
        </span>
      </div>

      {viewMode === 'heatmap' ? (
        <AQIHeatmapView
          stations={stations}
          currentLocation={currentLocation}
          onLocationChange={onSelectStation}
        />
      ) : (
        <>
          {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* City Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {cities.map((city) => {
              const isActive = selectedCity === city;
              const count =
                city === 'All'
                  ? stations.length
                  : stations.filter((s) => s.city.toLowerCase() === city.toLowerCase()).length;
              return (
                <button
                  key={city}
                  id={`filter-city-${city.toLowerCase()}`}
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {city === 'All' && language === 'hi' ? 'सभी' : city} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}

            <button
              id="filter-severe-toggle"
              onClick={() => setFilterSevereOnly(!filterSevereOnly)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                filterSevereOnly
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              🔥 {t('tierSevere')} ({stats.severeCount})
            </button>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {language === 'hi' ? 'क्रम:' : 'Sort:'}
            </span>
            <select
              id="stations-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="aqi-desc">
                {language === 'hi' ? 'अधिकतम AQI (खराब पहले)' : 'Highest AQI (Worst first)'}
              </option>
              <option value="aqi-asc">
                {language === 'hi' ? 'न्यूनतम AQI' : 'Lowest AQI'}
              </option>
              <option value="name">
                {language === 'hi' ? 'स्टेशन का नाम (A - Z)' : 'Station Name (A - Z)'}
              </option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="station-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'स्टेशन या क्षेत्र के नाम से खोजें (जैसे आनंद विहार, बवाना, वजीरपुर, रोहिणी)...'
                : 'Search stations by name or locality (e.g. Anand Vihar, Bawana, Wazirpur, Rohini, Noida Sec 62)...'
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {language === 'hi' ? 'हटाएं' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Stations Table / Card Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'hi' ? 'निगरानी स्टेशन निर्देशिका' : 'Monitoring Station Directory'}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {filteredStations.length} {language === 'hi' ? 'प्रदर्शित' : 'Showing'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Source: CPCB / DPCC CAAQMS Telemetry
          </span>
        </div>

        {filteredStations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Search className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {language === 'hi' ? 'कोई स्टेशन नहीं मिला' : 'No stations matched your criteria'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'hi' ? 'फ़िल्टर साफ़ करें या अन्य शहर चुनें।' : "Try clearing search filters or selecting 'All' cities."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStations.map((station) => {
              const theme = getAQITheme(station.aqi);
              const localizedTier = getLocalizedTier(station.aqi);

              return (
                <div
                  key={station.id}
                  id={`station-row-${station.id}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors gap-3 ${
                    station.aqi >= 401 ? 'bg-red-50/20' : ''
                  }`}
                >
                  {/* Left: Station info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-base font-black text-white shadow-2xs"
                      style={{ backgroundColor: theme.accentHex }}
                    >
                      {station.aqi}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{station.name}</h4>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          {station.city}
                        </span>
                        {station.areaType && (
                          <span className="hidden sm:inline-block rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-100">
                            {station.areaType}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span
                          className="font-bold"
                          style={{ color: theme.accentHex }}
                        >
                          {localizedTier}
                        </span>
                        <span>•</span>
                        <span>
                          PM2.5: <strong className="text-slate-800 font-mono">{station.pm25} µg/m³</strong>
                        </span>
                        <span>•</span>
                        <span>
                          PM10: <strong className="text-slate-800 font-mono">{station.pm10} µg/m³</strong>
                        </span>
                        {station.lastUpdated && (
                          <>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="hidden sm:inline text-slate-400 text-[11px]">
                              {station.lastUpdated}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      id={`inspect-station-${station.id}`}
                      onClick={() => onSelectStation(mapCityToLocId(station.city))}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{language === 'hi' ? 'क्षेत्र देखें' : 'Inspect Zone'}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {/* Official CPCB Standard Reference Footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {language === 'hi'
              ? 'राष्ट्रीय वायु गुणवत्ता सूचकांक (NAQI) मानक: 0-50 (अच्छा), 51-100 (संतोषजनक), 101-200 (मध्यम), 201-300 (खराब), 301-400 (बहुत खराब), 401-500 (गंभीर)।'
              : 'National Air Quality Index (NAQI) Standard: 0-50 (Good), 51-100 (Satisfactory), 101-200 (Moderate), 201-300 (Poor), 301-400 (Very Poor), 401-500 (Severe).'}
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 shrink-0">
          Telemetry Protocol: CPCB/Sameer CAAQMS
        </div>
      </div>

    </div>
  );
};

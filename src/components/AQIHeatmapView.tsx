import React, { useState, useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  RotateCcw,
  Sliders,
  Eye,
  Activity,
  Flame,
  Wind,
  Info,
  ChevronRight,
  Crosshair,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
  Minimize2,
  Key
} from 'lucide-react';
import { NCRStation, LocationId } from '../types';
import { getAQITheme } from '../utils/colors';
import { MAP_TILE_PROVIDERS, NCR_LANDMARKS } from '../utils/mapTiles';
import { MapApiConfigModal } from './MapApiConfigModal';
import { useLanguage } from '../context/LanguageContext';

interface AQIHeatmapViewProps {
  stations: NCRStation[];
  currentLocation: LocationId;
  onSelectStation?: (stationId: string) => void;
  onLocationChange?: (locationId: LocationId) => void;
}

type HeatmapMetric = 'aqi' | 'pm25' | 'pm10';
type DisplayMode = 'both' | 'heatmap' | 'stations';

export const AQIHeatmapView: React.FC<AQIHeatmapViewProps> = ({
  stations,
  currentLocation,
  onSelectStation,
  onLocationChange,
}) => {
  const { language, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupsRef = useRef<{
    heatmap: L.LayerGroup;
    stations: L.LayerGroup;
    landmarks: L.LayerGroup;
    probeMarker: L.LayerGroup;
  }>({
    heatmap: L.layerGroup(),
    stations: L.layerGroup(),
    landmarks: L.layerGroup(),
    probeMarker: L.layerGroup(),
  });

  // Base map & layer controls
  const [selectedBaseMap, setSelectedBaseMap] = useState<string>('streets');
  const [metric, setMetric] = useState<HeatmapMetric>('aqi');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [opacity, setOpacity] = useState<number>(0.65);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

  // Interactive probe on click
  const [probeResult, setProbeResult] = useState<{
    lat: number;
    lon: number;
    value: number;
    metric: HeatmapMetric;
    nearestStation: NCRStation | null;
    distanceKm: number;
  } | null>(null);

  const [selectedStation, setSelectedStation] = useState<NCRStation | null>(() => {
    return stations.find((s) => s.id === 'st-1') || stations[0] || null;
  });

  // Filtered stations for display
  const activeStations = useMemo(() => {
    if (selectedCity === 'All') return stations;
    return stations.filter((s) => s.city.toLowerCase() === selectedCity.toLowerCase());
  }, [stations, selectedCity]);

  // Statistics for current metric
  const stats = useMemo(() => {
    if (!stations.length) return { max: 0, min: 0, avg: 0, maxStation: null, severeCount: 0 };
    const getVal = (s: NCRStation) => (metric === 'aqi' ? s.aqi : metric === 'pm25' ? s.pm25 : s.pm10);
    const sorted = [...stations].sort((a, b) => getVal(b) - getVal(a));
    const maxStation = sorted[0];
    const minStation = sorted[sorted.length - 1];
    const avg = Math.round(stations.reduce((acc, s) => acc + getVal(s), 0) / stations.length);
    const severeCount = stations.filter((s) => s.aqi >= 401).length;
    return {
      max: getVal(maxStation),
      min: getVal(minStation),
      avg,
      maxStation,
      severeCount,
    };
  }, [stations, metric]);

  // ---------------------------------------------------------------------------
  // Inverse Distance Weighting (IDW) calculation for any (lat, lon)
  // ---------------------------------------------------------------------------
  const calculateIDW = (lat: number, lon: number, m: HeatmapMetric): number => {
    if (!stations.length) return 300;
    let totalWeight = 0;
    let weightedSum = 0;
    const p = 2.2; // Power parameter

    for (let i = 0; i < stations.length; i++) {
      const s = stations[i];
      const val = m === 'aqi' ? s.aqi : m === 'pm25' ? s.pm25 : s.pm10;
      const dLat = (lat - s.lat) * 111; // ~km
      const dLon = (lon - s.lon) * 96;  // ~km
      const distSq = dLat * dLat + dLon * dLon;

      if (distSq < 0.04) {
        return val;
      }

      const weight = 1 / Math.pow(distSq, p / 2);
      totalWeight += weight;
      weightedSum += val * weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 300;
  };

  // ---------------------------------------------------------------------------
  // Initialize Leaflet Map
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6250, 77.2100], // Delhi center
      zoom: 11,
      minZoom: 8,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Base Tile Layer
    const baseConfig = MAP_TILE_PROVIDERS[selectedBaseMap] || MAP_TILE_PROVIDERS.streets;
    const tileLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Attach Layer Groups in logical order
    layerGroupsRef.current.heatmap.addTo(map);
    layerGroupsRef.current.landmarks.addTo(map);
    layerGroupsRef.current.stations.addTo(map);
    layerGroupsRef.current.probeMarker.addTo(map);

    // Click on map to probe coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lon = Number(e.latlng.lng.toFixed(4));
      const val = Math.round(calculateIDW(lat, lon, metric));

      // Find nearest station
      let nearest: NCRStation | null = null;
      let minDist = 999;
      for (let i = 0; i < stations.length; i++) {
        const s = stations[i];
        const dLat = (lat - s.lat) * 111;
        const dLon = (lon - s.lon) * 96;
        const d = Math.sqrt(dLat * dLat + dLon * dLon);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      }

      setProbeResult({
        lat,
        lon,
        value: val,
        metric,
        nearestStation: nearest,
        distanceKm: Number(minDist.toFixed(1)),
      });

      // Show temporary probe circle on map
      layerGroupsRef.current.probeMarker.clearLayers();
      const probePin = L.circleMarker([lat, lon], {
        radius: 8,
        color: '#0f172a',
        fillColor: '#38bdf8',
        fillOpacity: 0.9,
        weight: 3,
      });
      probePin.bindPopup(`
        <div style="font-family: inherit; padding: 12px; min-width: 180px;">
          <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase;">Interpolated Air Quality Probe</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">
            ${metric.toUpperCase()}: ${val} ${metric === 'aqi' ? '' : 'µg/m³'}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Coordinates: ${lat}, ${lon}<br/>
            Nearest Station: ${nearest?.name || 'N/A'} (${minDist.toFixed(1)} km)
          </div>
        </div>
      `).openPopup();
      layerGroupsRef.current.probeMarker.addLayer(probePin);
    });

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Update Base Tile Layer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const baseConfig = MAP_TILE_PROVIDERS[selectedBaseMap];
    if (!baseConfig) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [selectedBaseMap]);

  // ---------------------------------------------------------------------------
  // Re-render Heatmap & Station Layers
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layerGroupsRef.current;
    groups.heatmap.clearLayers();
    groups.stations.clearLayers();
    groups.landmarks.clearLayers();

    // 1. HEATMAP SPATIAL DISPERSION OVERLAY
    if (displayMode !== 'stations') {
      // Render smooth overlapping dispersion circles centered at each station
      // with opacity scaled by user preference
      activeStations.forEach((st) => {
        const val = metric === 'aqi' ? st.aqi : metric === 'pm25' ? st.pm25 : st.pm10;
        const theme = getAQITheme(metric === 'aqi' ? val : val * 1.5);
        
        // Multi-ring gradient simulation
        const rings = [
          { radius: 6500, fillOpacity: opacity * 0.16 },
          { radius: 4200, fillOpacity: opacity * 0.32 },
          { radius: 2200, fillOpacity: opacity * 0.52 },
        ];

        rings.forEach((ring) => {
          const circle = L.circle([st.lat, st.lon], {
            radius: ring.radius,
            color: theme.accentHex,
            fillColor: theme.accentHex,
            fillOpacity: ring.fillOpacity,
            weight: 0,
            interactive: false,
          });
          groups.heatmap.addLayer(circle);
        });

        // Highlight hotspot cores if enabled
        if (showHotspots && st.aqi >= 400) {
          const hotspotCircle = L.circle([st.lat, st.lon], {
            radius: 3500,
            color: '#dc2626',
            fillColor: '#991b1b',
            fillOpacity: opacity * 0.45,
            weight: 2,
            dashArray: '4, 4',
            interactive: false,
          });
          groups.heatmap.addLayer(hotspotCircle);
        }
      });
    }

    // 2. MONITORING STATION MARKERS
    if (displayMode !== 'heatmap') {
      activeStations.forEach((st) => {
        const val = metric === 'aqi' ? st.aqi : metric === 'pm25' ? st.pm25 : st.pm10;
        const theme = getAQITheme(metric === 'aqi' ? val : val * 1.5);
        const isSevere = st.aqi >= 401;

        const iconHtml = `
          <div class="cursor-pointer transition-transform hover:scale-115 flex items-center gap-1 ${
            isSevere ? 'pulse-severe' : ''
          }" style="
            background: ${theme.accentHex};
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          ">
            <span>${val}</span>
            <span style="font-size: 8px; opacity: 0.85;">${metric.toUpperCase()}</span>
          </div>
        `;

        const divIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-station-pin',
          iconSize: [64, 24],
          iconAnchor: [32, 12],
        });

        const marker = L.marker([st.lat, st.lon], { icon: divIcon });

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 14px; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">${st.city} • ${st.areaType}</span>
              <span style="background: ${theme.accentHex}; color: #fff; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 800;">${st.status}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0 8px 0;">${st.name}</h4>
            <div style="background: #f8fafc; border-radius: 8px; padding: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
              <div>
                <div style="color: #64748b; font-size: 10px;">AQI</div>
                <div style="font-size: 16px; font-weight: 800; color: ${theme.accentHex};">${st.aqi}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 10px;">PM2.5</div>
                <div style="font-size: 15px; font-weight: 700; color: #1e293b;">${st.pm25} µg/m³</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between;">
              <span>PM10: ${st.pm10} µg/m³</span>
              <span>${st.lastUpdated}</span>
            </div>
          </div>
        `);

        marker.on('click', () => {
          setSelectedStation(st);
          if (onSelectStation) onSelectStation(st.id);
        });

        groups.stations.addLayer(marker);
      });
    }

    // 3. DELHI NCR LANDMARKS
    if (showLandmarks) {
      NCR_LANDMARKS.forEach((lm) => {
        const lmHtml = `
          <div class="flex items-center gap-1 cursor-pointer bg-white/90 text-slate-800 px-2 py-0.5 rounded-md border border-slate-300 shadow-xs hover:bg-white text-[10px] font-bold whitespace-nowrap">
            <span>${lm.icon}</span>
            <span>${lm.name.split(' (')[0]}</span>
          </div>
        `;
        const lmIcon = L.divIcon({
          html: lmHtml,
          className: 'custom-lm-pin',
          iconSize: [90, 20],
          iconAnchor: [45, 10],
        });
        const lmMarker = L.marker([lm.lat, lm.lon], { icon: lmIcon });
        lmMarker.bindPopup(`
          <div style="font-family: inherit; padding: 10px;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${lm.name}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Key Delhi NCR Reference Point</div>
          </div>
        `);
        groups.landmarks.addLayer(lmMarker);
      });
    }
  }, [displayMode, metric, opacity, showHotspots, showLandmarks, activeStations]);

  // Fly to area
  const flyToArea = (center: [number, number], zoom: number) => {
    mapInstanceRef.current?.flyTo(center, zoom, { duration: 1.2 });
  };

  return (
    <div
      id="aqi-heatmap-view-container"
      className={`space-y-4 ${isFullscreen ? 'fixed inset-4 z-50 bg-white p-6 rounded-2xl shadow-2xl flex flex-col' : ''}`}
    >
      {/* Top Banner / Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-600 rounded-full"></span>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                {language === 'hi' ? 'भू-स्थानिक AQI हीट मैप एवं फैलाव मॉडल' : 'Geospatial AQI Heat Map & Dispersion Model'}
              </h2>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                {language === 'hi' ? 'लाइव CPCB ग्रिड' : 'Live CPCB Grid'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {language === 'hi'
                ? 'स्थानिक फैलाव, जीपीएस प्रोब और सड़क-स्तरीय मानचित्र के साथ दिल्ली एनसीआर का नक्शा।'
                : 'Interactive geographic map of Delhi NCR with spatial dispersion, continuous probe sampling, and street-level cartography.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Key className="h-3.5 w-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'मानचित्र एवं API सेटिंग्स' : 'Map & API Settings'}</span>
            </button>

            <button
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {isFullscreen
                  ? (language === 'hi' ? 'सामान्य स्क्रीन' : 'Exit Full')
                  : (language === 'hi' ? 'फुलस्क्रीन' : 'Fullscreen')}
              </span>
            </button>
          </div>
        </div>

        {/* Primary Controls Toolbar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 border-t border-slate-100 pt-3 text-xs">
          
          {/* Base Map Selector */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {language === 'hi' ? 'आधार मानचित्र:' : 'Base Cartography:'}
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {Object.values(MAP_TILE_PROVIDERS).map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => setSelectedBaseMap(prov.id)}
                  className={`flex-1 rounded-md py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    selectedBaseMap === prov.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {prov.id === 'streets'
                    ? (language === 'hi' ? 'सड़कें' : 'Streets')
                    : prov.id === 'osm'
                    ? 'OSM'
                    : prov.id === 'satellite'
                    ? (language === 'hi' ? 'उपग्रह' : 'Satellite')
                    : (language === 'hi' ? 'डार्क' : 'Night')}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {language === 'hi' ? 'प्रदर्शित मीट्रिक:' : 'Display Metric:'}
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {(['aqi', 'pm25', 'pm10'] as HeatmapMetric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`flex-1 rounded-md py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    metric === m ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'aqi' ? (language === 'hi' ? 'AQI इंडेक्स' : 'AQI Index') : m === 'pm25' ? 'PM2.5' : 'PM10'}
                </button>
              ))}
            </div>
          </div>

          {/* Display Mode */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {language === 'hi' ? 'परत दृश्यता:' : 'Layer Visibility:'}
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {(
                [
                  { id: 'both', label: language === 'hi' ? 'दोनों' : 'Both' },
                  { id: 'heatmap', label: language === 'hi' ? 'हीटमैप' : 'Heatmap' },
                  { id: 'stations', label: language === 'hi' ? 'केवल पिन' : 'Pins Only' },
                ] as Array<{ id: DisplayMode; label: string }>
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setDisplayMode(mode.id)}
                  className={`flex-1 rounded-md py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    displayMode === mode.id ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>{language === 'hi' ? 'हीटमैप पारदर्शिता:' : 'Heatmap Opacity:'}</span>
              <span className="font-mono text-slate-900">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.95"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Quick Region Focus & City Filter Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
          
          {/* Quick Fly-To Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">
              {language === 'hi' ? 'फोकस:' : 'Focus:'}
            </span>
            <button
              onClick={() => flyToArea([28.6250, 77.2100], 11)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              🎯 {language === 'hi' ? 'संपूर्ण दिल्ली एनसीआर' : 'Full Delhi NCR'}
            </button>
            <button
              onClick={() => flyToArea([28.6476, 77.3158], 13)}
              className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 cursor-pointer"
            >
              ⚠️ {language === 'hi' ? 'आनंद विहार (ईस्ट हॉटस्पॉट)' : 'Anand Vihar (East Hotspot)'}
            </button>
            <button
              onClick={() => flyToArea([28.7762, 77.0510], 12)}
              className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-700 hover:bg-orange-100 cursor-pointer"
            >
              🏭 {language === 'hi' ? 'बवाना (औद्योगिक क्षेत्र)' : 'Bawana (North Industrial)'}
            </button>
            <button
              onClick={() => flyToArea([28.6315, 77.2167], 13)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              🏛️ {language === 'hi' ? 'सेंट्रल विस्टा / सीपी' : 'Central Vista / CP'}
            </button>
            <button
              onClick={() => flyToArea([28.4595, 77.0266], 12)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              🏢 {language === 'hi' ? 'गुरुग्राम साइबर हब' : 'Gurugram Cyber Hub'}
            </button>
          </div>

          {/* Hotspot & Landmark Toggles */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
              <input
                type="checkbox"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
                className="accent-red-600 rounded"
              />
              <span>{language === 'hi' ? 'गंभीर हॉटस्पॉट' : 'Severe Hotspots'}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
              <input
                type="checkbox"
                checked={showLandmarks}
                onChange={(e) => setShowLandmarks(e.target.checked)}
                className="accent-slate-900 rounded"
              />
              <span>{language === 'hi' ? 'प्रमुख स्थल' : 'Landmarks'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Interactive Probe */}
      <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
        isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[540px]'
      }`}>
        <div ref={mapContainerRef} className="h-full w-full select-none" />

        {/* Tip Box on Map */}
        <div className="absolute top-3 left-3 z-20 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-md text-[11px] text-slate-700 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-sky-600 shrink-0" />
          <span>
            {language === 'hi'
              ? 'हवा की गुणवत्ता जांचने के लिए मानचित्र पर कहीं भी क्लिक करें।'
              : 'Click anywhere on the map to sample the air quality probe.'}
          </span>
        </div>

        {/* Probe Inspector Card */}
        {probeResult && (
          <div className="absolute bottom-4 right-4 z-20 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Crosshair className="h-4 w-4 text-sky-600" />
                <span className="font-bold text-slate-900 text-xs">
                  {language === 'hi' ? 'GPS प्रोब रीडिंग' : 'GPS Probe Reading'}
                </span>
              </div>
              <button
                onClick={() => setProbeResult(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                {language === 'hi' ? 'अनुमानित' : 'Estimated'} {probeResult.metric.toUpperCase()}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {probeResult.value}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {probeResult.metric === 'aqi' ? 'AQI' : 'µg/m³'}
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-600 space-y-1">
              <div>{language === 'hi' ? 'निर्देशांक:' : 'Coordinates:'} <span className="font-mono">{probeResult.lat}, {probeResult.lon}</span></div>
              {probeResult.nearestStation && (
                <div>
                  {language === 'hi' ? 'निकटतम सेंसर:' : 'Nearest Sensor:'} <strong>{probeResult.nearestStation.name}</strong> ({probeResult.distanceKm} km)
                </div>
              )}
            </div>
          </div>
        )}

        {/* CPCB Scale Bar Overlay */}
        <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-md text-[11px] hidden sm:block">
          <div className="font-bold text-slate-800 text-[11px] mb-1.5 flex items-center justify-between">
            <span>{language === 'hi' ? 'CPCB AQI फैलाव बैंड' : 'CPCB AQI Dispersion Bands'}</span>
            <span className="text-slate-400 font-normal">{language === 'hi' ? '31 सेंसर' : '31 Sensors'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#16a34a]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">0-50</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#84cc16]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">51-100</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#eab308]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">101-200</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#f97316]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">201-300</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#ef4444]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">301-400</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#b91c1c]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">401-450</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-3 w-7 rounded-xs bg-[#7f1d1d]"></div>
              <span className="text-[9px] font-bold text-slate-600 mt-0.5">450+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Station Telemetry Card */}
      {selectedStation && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                  style={{ backgroundColor: getAQITheme(selectedStation.aqi).accentHex }}
                >
                  {selectedStation.status}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{selectedStation.city} • {selectedStation.areaType}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedStation.name}</h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  {language === 'hi' ? 'वर्तमान AQI' : 'Current AQI'}
                </div>
                <div
                  className="text-2xl font-black"
                  style={{ color: getAQITheme(selectedStation.aqi).accentHex }}
                >
                  {selectedStation.aqi}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">PM2.5</div>
                <div className="text-2xl font-black text-slate-900">
                  {selectedStation.pm25} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <div className="text-slate-400 font-semibold text-[10px]">
                {language === 'hi' ? 'PM10 स्तर' : 'PM10 Level'}
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedStation.pm10} µg/m³</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <div className="text-slate-400 font-semibold text-[10px]">
                {language === 'hi' ? 'प्रमुख प्रदूषक' : 'Dominant Pollutant'}
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedStation.dominantPollutant}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <div className="text-slate-400 font-semibold text-[10px]">
                {language === 'hi' ? 'स्टेशन का स्थान' : 'Station Location'}
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedStation.lat}, {selectedStation.lon}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <div className="text-slate-400 font-semibold text-[10px]">
                {language === 'hi' ? 'टेलीमेट्री स्ट्रीम' : 'Telemetry Stream'}
              </div>
              <div className="font-bold text-emerald-600 text-sm mt-0.5">{selectedStation.lastUpdated}</div>
            </div>
          </div>
        </div>
      )}

      {/* Map API Configuration Modal */}
      <MapApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
};

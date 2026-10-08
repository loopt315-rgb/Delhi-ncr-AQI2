import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Layers,
  Flame,
  Wind,
  Navigation,
  Eye,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Info,
  MapPin,
  Key,
  Maximize2,
  Minimize2,
  Crosshair,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { FireHotspot, PlumePrediction, LocationId, NCRStation } from '../types';
import { NCR_STATIONS } from '../server/dataService';
import { getAQITheme } from '../utils/colors';
import { MAP_TILE_PROVIDERS, NCR_LANDMARKS, MapTileProvider } from '../utils/mapTiles';
import { MapApiConfigModal } from './MapApiConfigModal';
import { useLanguage } from '../context/LanguageContext';

type MapLayer = 'aqi' | 'pm25' | 'fires' | 'wind' | 'plume' | 'landmarks';

interface PollutionMapProps {
  fireHotspots: FireHotspot[];
  plume: PlumePrediction;
  selectedLocation: LocationId;
  onSelectStation?: (stationId: string) => void;
}

export const PollutionMap: React.FC<PollutionMapProps> = ({
  fireHotspots,
  plume,
  selectedLocation,
  onSelectStation,
}) => {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupsRef = useRef<{
    stations: L.LayerGroup;
    fires: L.LayerGroup;
    plume: L.LayerGroup;
    wind: L.LayerGroup;
    landmarks: L.LayerGroup;
    heatmap: L.LayerGroup;
  }>({
    stations: L.layerGroup(),
    fires: L.layerGroup(),
    plume: L.layerGroup(),
    wind: L.layerGroup(),
    landmarks: L.layerGroup(),
    heatmap: L.layerGroup(),
  });

  // Base map & layer states
  const [selectedBaseMap, setSelectedBaseMap] = useState<string>('streets');
  const [activeLayers, setActiveLayers] = useState<Record<MapLayer, boolean>>({
    aqi: true,
    pm25: false,
    fires: true,
    wind: true,
    plume: true,
    landmarks: true,
  });

  const [timeStep, setTimeStep] = useState<number>(0); // 0: Now, 1: +6h, 2: +12h, 3: +24h
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'station' | 'fire' | 'landmark';
    title: string;
    details: string;
    badge: string;
    badgeColor: string;
    subtext?: string;
  } | null>(null);

  const timeLabels = ['NOW (Observed)', '+6h (Plume Arrival)', '+12h (Inversion Peak)', '+24h (Dispersal)'];

  // ---------------------------------------------------------------------------
  // Initialize Leaflet Map
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered between Delhi and Punjab to show both airshed and fire sources
    const map = L.map(mapContainerRef.current, {
      center: [28.6476, 77.2090], // Delhi center
      zoom: 10,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Base Tile Layer (CartoDB Voyager)
    const baseConfig = MAP_TILE_PROVIDERS[selectedBaseMap] || MAP_TILE_PROVIDERS.streets;
    const tileLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Attach Layer Groups
    layerGroupsRef.current.heatmap.addTo(map);
    layerGroupsRef.current.plume.addTo(map);
    layerGroupsRef.current.wind.addTo(map);
    layerGroupsRef.current.fires.addTo(map);
    layerGroupsRef.current.landmarks.addTo(map);
    layerGroupsRef.current.stations.addTo(map);

    mapInstanceRef.current = map;

    // Handle initial resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Update Tile Layer when Base Map changes
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
  // Re-render Data Overlays on Layers or TimeStep Change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layerGroupsRef.current;

    // 1. CLEAR EXISTING OVERLAYS
    groups.stations.clearLayers();
    groups.fires.clearLayers();
    groups.plume.clearLayers();
    groups.wind.clearLayers();
    groups.landmarks.clearLayers();
    groups.heatmap.clearLayers();

    // 2. DISPERSION HEATMAP HALOS (When AQI is active)
    if (activeLayers.aqi) {
      NCR_STATIONS.forEach((st) => {
        const theme = getAQITheme(st.aqi);
        const radiusMeters = st.aqi >= 400 ? 5500 : st.aqi >= 300 ? 4200 : 3200;
        const circle = L.circle([st.lat, st.lon], {
          radius: radiusMeters,
          color: theme.accentHex,
          fillColor: theme.accentHex,
          fillOpacity: 0.22,
          weight: 1.5,
          dashArray: st.aqi >= 400 ? '4, 4' : undefined,
        });
        groups.heatmap.addLayer(circle);
      });
    }

    // 3. STATIONS MARKERS (Vibrant badge with exact AQI number)
    if (activeLayers.aqi) {
      NCR_STATIONS.forEach((st) => {
        const theme = getAQITheme(st.aqi);
        const isSevere = st.aqi >= 401;

        const iconHtml = `
          <div class="cursor-pointer transition-transform hover:scale-110 flex items-center gap-1 ${
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
            <span style="font-size: 9px; opacity: 0.85;">AQI</span>
            <span>${st.aqi}</span>
          </div>
        `;

        const divIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-station-pin',
          iconSize: [60, 24],
          iconAnchor: [30, 12],
        });

        const marker = L.marker([st.lat, st.lon], { icon: divIcon });

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 14px; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">${st.city} • ${st.areaType}</span>
              <span style="background: ${theme.accentHex}; color: #fff; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 800;">${st.status}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0 8px 0;">${st.name}</h4>
            <div style="background: #f8fafc; border-radius: 8px; padding: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
              <div>
                <div style="color: #64748b; font-size: 10px;">Current AQI</div>
                <div style="font-size: 16px; font-weight: 800; color: ${theme.accentHex};">${st.aqi}</div>
              </div>
              <div>
                <div style="color: #64748b; font-size: 10px;">PM2.5 Conc.</div>
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
          setSelectedEntity({
            type: 'station',
            title: st.name,
            details: `AQI ${st.aqi} • ${st.status} (PM2.5: ${st.pm25} µg/m³, PM10: ${st.pm10} µg/m³)`,
            badge: `${st.city} • ${st.areaType}`,
            badgeColor: theme.accentHex,
            subtext: `Telemetry source: CPCB CAAQMS network station (${st.lastUpdated})`,
          });
          if (onSelectStation) onSelectStation(st.id);
        });

        groups.stations.addLayer(marker);
      });
    }

    // 4. STUBBLE BURNING FIRES (NASA VIIRS in Punjab & Haryana)
    if (activeLayers.fires && fireHotspots.length > 0) {
      fireHotspots.forEach((fire) => {
        const fireIconHtml = `
          <div class="fire-flicker flex items-center justify-center cursor-pointer" style="
            width: 28px;
            height: 28px;
            background: rgba(239, 68, 68, 0.95);
            color: #ffffff;
            border-radius: 9999px;
            border: 2px solid #ffedd5;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
            font-size: 13px;
          ">
            🔥
          </div>
        `;

        const fireIcon = L.divIcon({
          html: fireIconHtml,
          className: 'custom-fire-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const fireMarker = L.marker([fire.lat, fire.lon], { icon: fireIcon });

        fireMarker.bindPopup(`
          <div style="font-family: inherit; padding: 14px; min-width: 210px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 700; color: #ea580c; text-transform: uppercase;">NASA VIIRS Thermal Detection</span>
              <span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 999px; font-size: 9px; font-weight: 700;">${fire.confidence}% Conf</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0 6px 0;">Stubble Farm Fire (${fire.state})</h4>
            <div style="font-size: 11px; color: #475569; background: #fff7ed; padding: 8px; border-radius: 8px; border: 1px solid #ffedd5;">
              <div><strong>Radiative Power:</strong> ${fire.frp} MW</div>
              <div><strong>Brightness Temp:</strong> ${fire.brightness} K</div>
              <div><strong>Satellite Detection:</strong> ${fire.acqTime} IST</div>
            </div>
          </div>
        `);

        fireMarker.on('click', () => {
          setSelectedEntity({
            type: 'fire',
            title: `Farm Fire Hotspot • ${fire.state}`,
            details: `Fire Radiative Power: ${fire.frp} MW • Brightness: ${fire.brightness}K`,
            badge: `${fire.confidence}% Satellite Confidence`,
            badgeColor: '#dc2626',
            subtext: `Detected by NASA Suomi-NPP VIIRS thermal sensor at ${fire.acqTime}`,
          });
        });

        groups.fires.addLayer(fireMarker);
      });
    }

    // 5. SMOKE PLUME ADVECTION CORRIDOR
    if (activeLayers.plume) {
      // Plume corridor dynamically extends and thickens based on timeStep
      const plumeOpacity = [0.35, 0.50, 0.65, 0.40][timeStep];
      const plumeFillColor = timeStep >= 2 ? '#b91c1c' : '#ea580c';

      // Polygon points: Punjab source -> Haryana corridor -> Delhi NCR basin
      const basePlumeCoords: L.LatLngExpression[] = [
        [31.20, 75.30], // Jalandhar / Kapurthala
        [30.40, 75.80], // Sangrur / Barnala
        [29.90, 76.50], // Kaithal / Kurukshetra
        [29.30, 76.90], // Panipat corridor
        [28.70, 77.10], // North Delhi (Bawana / Narela)
        [28.55, 77.40], // East Delhi / Noida
        [28.35, 77.30], // Faridabad
        [28.40, 76.85], // West Gurugram
        [29.10, 76.40], // Jind
        [29.70, 75.80], // Patiala
        [30.80, 75.10], // Firozpur
      ];

      const plumePoly = L.polygon(basePlumeCoords, {
        color: '#dc2626',
        weight: 1.5,
        fillColor: plumeFillColor,
        fillOpacity: plumeOpacity,
        dashArray: '5, 5',
      });

      plumePoly.bindPopup(`
        <div style="font-family: inherit; padding: 12px; max-width: 240px;">
          <h4 style="font-weight: 800; font-size: 12px; color: #991b1b;">Agricultural Smoke Advection Corridor</h4>
          <p style="font-size: 11px; color: #475569; margin-top: 4px;">
            North-westerly seasonal winds funnel stubble particulate matter along the Grand Trunk road axis into the lower-elevation Delhi bowl.
          </p>
          <div style="margin-top: 6px; font-size: 10px; font-weight: bold; color: #ea580c;">
            Simulation Phase: ${timeLabels[timeStep]}
          </div>
        </div>
      `);

      groups.plume.addLayer(plumePoly);
    }

    // 6. WIND VECTORS (North-Westerly Flow: 315° towards Delhi)
    if (activeLayers.wind) {
      const windSamplePoints: [number, number][] = [
        [30.50, 76.00], // Punjab
        [29.70, 76.60], // Karnal
        [29.20, 77.00], // Panipat
        [28.90, 77.15], // Sonipat
        [28.65, 77.22], // Delhi
        [28.45, 77.05], // Gurugram
      ];

      windSamplePoints.forEach(([lat, lon], idx) => {
        const windIconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: rgba(2, 132, 199, 0.85);
            color: white;
            border-radius: 999px;
            font-size: 11px;
            transform: rotate(135deg); /* Pointing South-East */
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          ">
            ➔
          </div>
        `;
        const icon = L.divIcon({
          html: windIconHtml,
          className: 'custom-wind-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const windMarker = L.marker([lat, lon], { icon });
        windMarker.bindTooltip('Wind: NW 315° @ 4 km/h (Slow transport)', { direction: 'top' });
        groups.wind.addLayer(windMarker);
      });
    }

    // 7. MAJOR DELHI NCR LANDMARKS
    if (activeLayers.landmarks) {
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
  }, [activeLayers, fireHotspots, timeStep]);

  // Toggle single layer
  const toggleLayer = (layer: MapLayer) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // FlyTo presets
  const flyToArea = (center: [number, number], zoom: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(center, zoom, { duration: 1.2 });
  };

  return (
    <div
      id="pollution-map-container"
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 p-6 flex flex-col' : ''
      }`}
    >
      {/* Top Map Header & Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full"></span>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {language === 'hi'
                ? 'लाइव भौगोलिक एयरशेड एवं धुआं प्लूम मैप'
                : 'Live Geographic Airshed & Smoke Plume Map'}
            </h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Live GIS
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {language === 'hi'
              ? 'सड़क एवं उपग्रह मानचित्रकला, 31 CPCB निरंतर साउंडिंग, नासा VIIRS पराली अग्नि एवं धुआं प्लूम।'
              : 'Real-world road & satellite cartography, 31 CPCB continuous soundings, NASA VIIRS farm fires & advection plume.'}
          </p>
        </div>

        {/* Action Buttons: Fullscreen & API Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Configure Map Providers or Google Maps API"
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
                ? (language === 'hi' ? 'छोटा करें' : 'Exit Full')
                : (language === 'hi' ? 'पूर्ण स्क्रीन' : 'Fullscreen')}
            </span>
          </button>
        </div>
      </div>

      {/* Layer Toggles & Base Map Selector Toolbar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
        
        {/* Base Map Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 ml-1">
            {language === 'hi' ? 'बेस:' : 'Base:'}
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            {Object.values(MAP_TILE_PROVIDERS).map((prov) => (
              <button
                key={prov.id}
                onClick={() => setSelectedBaseMap(prov.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  selectedBaseMap === prov.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {prov.id === 'streets'
                  ? (language === 'hi' ? 'सड़क' : 'Streets')
                  : prov.id === 'osm'
                  ? 'OSM'
                  : prov.id === 'satellite'
                  ? (language === 'hi' ? 'उपग्रह' : 'Satellite')
                  : (language === 'hi' ? 'डार्क' : 'Night')}
              </button>
            ))}
          </div>
        </div>

        {/* Overlays Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'aqi', label: language === 'hi' ? 'स्टेशन' : 'Stations', icon: '📍' },
              { id: 'fires', label: language === 'hi' ? 'पराली अग्नि' : 'Stubble Fires', icon: '🔥' },
              { id: 'plume', label: language === 'hi' ? 'धुआं प्लूम' : 'Smoke Plume', icon: '💨' },
              { id: 'wind', label: language === 'hi' ? 'हवा की दिशा' : 'Wind Vector', icon: '🌬️' },
              { id: 'landmarks', label: language === 'hi' ? 'प्रमुख स्थल' : 'Landmarks', icon: '🏛️' },
            ] as Array<{ id: MapLayer; label: string; icon: string }>
          ).map((layer) => {
            const active = activeLayers[layer.id];
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'border border-slate-900 bg-slate-900 text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{layer.icon}</span>
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Region Presets & Time Progression Slider */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        {/* Quick Fly-To Locations */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1 hidden md:inline">
            {language === 'hi' ? 'फोकस:' : 'Focus:'}
          </span>
          <button
            onClick={() => flyToArea([28.6476, 77.2090], 10)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            🎯 {language === 'hi' ? 'सम्पूर्ण दिल्ली एनसीआर' : 'All Delhi NCR'}
          </button>
          <button
            onClick={() => flyToArea([28.6476, 77.3158], 13)}
            className="rounded-lg border border-red-200 bg-red-50/80 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 cursor-pointer"
          >
            ⚠️ {language === 'hi' ? 'आनंद विहार हॉटस्पॉट' : 'Anand Vihar Hotspot'}
          </button>
          <button
            onClick={() => flyToArea([28.7762, 77.0510], 12)}
            className="rounded-lg border border-orange-200 bg-orange-50/80 px-2 py-1 text-[11px] font-bold text-orange-700 hover:bg-orange-100 cursor-pointer"
          >
            🏭 {language === 'hi' ? 'बवाना औद्योगिक' : 'Bawana Industrial'}
          </button>
          <button
            onClick={() => flyToArea([28.6315, 77.2167], 13)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            🏢 {language === 'hi' ? 'सेंट्रल दिल्ली (CP)' : 'Central Delhi (CP)'}
          </button>
          <button
            onClick={() => flyToArea([30.40, 75.80], 8)}
            className="rounded-lg border border-amber-200 bg-amber-50/80 px-2 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
          >
            🔥 {language === 'hi' ? 'पंजाब पराली क्षेत्र' : 'Punjab Farm Fire Belt'}
          </button>
        </div>

        {/* Time Step Simulation */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Trajectory:</span>
          {timeLabels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setTimeStep(idx)}
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold transition-all cursor-pointer ${
                timeStep === idx
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {idx === 0 ? 'NOW' : idx === 1 ? '+6H' : idx === 2 ? '+12H' : '+24H'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className={`relative mt-3 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner ${
        isFullscreen ? 'flex-1 min-h-[480px]' : 'h-[500px]'
      }`}>
        <div ref={mapContainerRef} className="h-full w-full select-none" />

        {/* Selected Entity Float Card */}
        {selectedEntity && (
          <div className="absolute top-3 left-3 z-20 max-w-sm rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: selectedEntity.badgeColor }}
              >
                {selectedEntity.badge}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <h4 className="mt-1 font-bold text-slate-900 text-sm">{selectedEntity.title}</h4>
            <p className="mt-0.5 text-xs text-slate-700 font-semibold">{selectedEntity.details}</p>
            {selectedEntity.subtext && (
              <p className="mt-1 text-[10px] text-slate-500">{selectedEntity.subtext}</p>
            )}
          </div>
        )}

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-md text-[11px] hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>CPCB AQI:</span>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" title="Good (0-50)"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" title="Moderate (101-200)"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" title="Poor (201-300)"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" title="Very Poor (301-400)"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#b91c1c]" title="Severe (401-450)"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#7f1d1d]" title="Hazardous (451+)"></span>
            </div>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-700 font-bold">
            <span>🔥 NASA VIIRS Fire</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-700 font-bold">
            <span>💨 Smoke Plume</span>
          </div>
        </div>
      </div>

      {/* Map API Configuration Modal */}
      <MapApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';
import {
  Layers,
  Radio,
  Crosshair,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Navigation,
  Droplets,
  Eye,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  DopplerRadarCell,
  InundationCheckpoint,
  LocationId
} from '../types';
import { MAP_TILE_PROVIDERS } from '../utils/mapTiles';

interface CloudburstRadarMapProps {
  radarCells: DopplerRadarCell[];
  inundationCheckpoints: InundationCheckpoint[];
  currentLocation: LocationId;
  activeCellId: string | null;
  onSelectCell: (cellId: string) => void;
  isSimulatedSevere: boolean;
}

// IMD Delhi Palam Doppler Weather Radar coordinates
const PALAM_RADAR_LAT = 28.5839;
const PALAM_RADAR_LON = 77.1200;

export const CloudburstRadarMap: React.FC<CloudburstRadarMapProps> = ({
  radarCells,
  inundationCheckpoints,
  currentLocation,
  activeCellId,
  onSelectCell,
  isSimulatedSevere
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups
  const rangeRingsGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const radarCellsGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const inundationGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const radarStationGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Component UI State
  const [selectedBaseMap, setSelectedBaseMap] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [showRangeRings, setShowRangeRings] = useState<boolean>(true);
  const [showInundationPoints, setShowInundationPoints] = useState<boolean>(true);
  const [showRadarCells, setShowRadarCells] = useState<boolean>(true);
  const [isSweepActive, setIsSweepActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'scope'>('map');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [PALAM_RADAR_LAT, PALAM_RADAR_LON],
      zoom: 10,
      minZoom: 8,
      maxZoom: 15,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });

    // Add standard top-right zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial base tile layer
    const provider = MAP_TILE_PROVIDERS[selectedBaseMap] || MAP_TILE_PROVIDERS.dark;
    const tileLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Attach layer groups
    rangeRingsGroupRef.current.addTo(map);
    radarCellsGroupRef.current.addTo(map);
    inundationGroupRef.current.addTo(map);
    radarStationGroupRef.current.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map Tiles when provider changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const provider = MAP_TILE_PROVIDERS[selectedBaseMap] || MAP_TILE_PROVIDERS.dark;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: 'abcd'
    }).addTo(mapInstanceRef.current);

    // Send tile to back so radar graphics stay on top
    newTile.bringToBack();
    tileLayerRef.current = newTile;
  }, [selectedBaseMap]);

  // Handle Resize or Fullscreen toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isFullscreen, viewMode]);

  // 1. Render IMD Delhi Palam Radar Base Station & Range Rings
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear previous station and range ring layers
    radarStationGroupRef.current.clearLayers();
    rangeRingsGroupRef.current.clearLayers();

    // Radar Station Marker
    const radarStationHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
        <div class="relative flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-400 shadow-[0_0_15px_#10b981]">
          <svg class="h-4 w-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
            <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
          </svg>
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-1.5 py-0.5 border border-emerald-800 text-[9px] font-mono font-bold text-emerald-300 shadow-md">
          IMD PALAM DWR
        </div>
      </div>
    `;

    const radarStationIcon = L.divIcon({
      html: radarStationHtml,
      className: 'custom-dwr-station',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const stationMarker = L.marker([PALAM_RADAR_LAT, PALAM_RADAR_LON], { icon: radarStationIcon })
      .bindPopup(`
        <div class="p-3 font-sans text-slate-800">
          <div class="flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-wide">
            <span>📡 IMD Doppler Weather Radar</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 mt-1">Palam / Mausam Bhawan C-Band DWR</h4>
          <p class="text-xs text-slate-600 mt-1">
            Transmitting 5.6 GHz C-band microwave pulses with 100km surveillance radius. Providing volumetric dual-polarization reflectivity, radial velocity, and spectrum width for NCR convective early-warning.
          </p>
          <div class="mt-2 grid grid-cols-2 gap-1 text-[10px] font-mono bg-slate-50 p-2 rounded border border-slate-200">
            <div>Frequency: <strong>5.6 GHz</strong></div>
            <div>Peak Power: <strong>250 kW</strong></div>
            <div>Elevation: <strong>225m ASL</strong></div>
            <div>Beamwidth: <strong>1.0°</strong></div>
          </div>
        </div>
      `);

    radarStationGroupRef.current.addLayer(stationMarker);

    // If Range Rings are enabled, draw 25, 50, 75, 100 km concentric rings
    if (showRangeRings) {
      const rings = [
        { radiusM: 25000, label: '25 km (Urban Core)', color: '#10b981', dash: '3, 4' },
        { radiusM: 50000, label: '50 km (NCR Inner Belt)', color: '#059669', dash: '4, 6' },
        { radiusM: 75000, label: '75 km (NCR Outer Perimeter)', color: '#047857', dash: '5, 8' },
        { radiusM: 100000, label: '100 km (Full Radar Surveillance Limit)', color: '#065f46', dash: '6, 10' }
      ];

      rings.forEach((ring) => {
        const circle = L.circle([PALAM_RADAR_LAT, PALAM_RADAR_LON], {
          radius: ring.radiusM,
          color: ring.color,
          weight: 1.5,
          opacity: 0.75,
          fill: true,
          fillColor: ring.color,
          fillOpacity: 0.02,
          dashArray: ring.dash
        });

        circle.bindTooltip(ring.label, {
          permanent: false,
          direction: 'top',
          className: 'radar-ring-tooltip text-[10px] font-mono bg-slate-950 text-emerald-300 border border-emerald-800'
        });

        rangeRingsGroupRef.current.addLayer(circle);
      });
    }
  }, [showRangeRings]);

  // 2. Render Convective Storm Cells on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    radarCellsGroupRef.current.clearLayers();

    if (!showRadarCells) return;

    radarCells.forEach((cell) => {
      const isSelected = cell.id === activeCellId;

      // Color mapping according to dBZ reflectivity
      const isSupercell = cell.peakDbz >= 60;
      const isHeavy = cell.peakDbz >= 50;
      const coreColor = isSupercell ? '#9333ea' : isHeavy ? '#dc2626' : '#ea580c';
      const haloColor = isSupercell ? 'rgba(147, 51, 234, 0.45)' : isHeavy ? 'rgba(220, 38, 38, 0.45)' : 'rgba(234, 88, 12, 0.4)';

      // 2a. Draw Doppler Reflectivity Ground Contours (outer halo + core circle)
      const outerRadiusM = cell.peakDbz >= 60 ? 10000 : cell.peakDbz >= 50 ? 7500 : 5000;
      const innerRadiusM = outerRadiusM * 0.45;

      const outerHalo = L.circle([cell.lat, cell.lon], {
        radius: outerRadiusM,
        color: coreColor,
        weight: 1,
        opacity: 0.8,
        fill: true,
        fillColor: coreColor,
        fillOpacity: isSelected ? 0.35 : 0.22,
        dashArray: isSelected ? '4, 4' : undefined
      });

      const innerCore = L.circle([cell.lat, cell.lon], {
        radius: innerRadiusM,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fill: true,
        fillColor: coreColor,
        fillOpacity: 0.65
      });

      // 2b. Draw Velocity & Heading Vector Arrow (30-min projected path)
      const radians = (cell.bearingDeg * Math.PI) / 180;
      // Convert bearing + speed to projected coordinate offset (rough approx: 1 deg ~ 111 km)
      const distanceKm30Min = (cell.speedKmh * 30) / 60;
      const latOffset = (distanceKm30Min * Math.cos(radians)) / 111;
      const lonOffset = (distanceKm30Min * Math.sin(radians)) / (111 * Math.cos((cell.lat * Math.PI) / 180));

      const targetLat = cell.lat + latOffset;
      const targetLon = cell.lon + lonOffset;

      const motionVector = L.polyline(
        [
          [cell.lat, cell.lon],
          [targetLat, targetLon]
        ],
        {
          color: '#fbbf24',
          weight: 2.5,
          opacity: 0.85,
          dashArray: '3, 4'
        }
      );

      // 2c. Custom Interactive Storm Core Marker
      const markerHtml = `
        <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${isSupercell ? 'bg-purple-500' : 'bg-red-500'} opacity-75"></span>
            <div class="relative flex h-6 w-6 items-center justify-center rounded-full text-white font-black text-[10px] shadow-lg ${
              isSelected ? 'ring-3 ring-white scale-125' : ''
            }" style="background-color: ${coreColor}; box-shadow: 0 0 12px ${coreColor}">
              ⚡
            </div>
          </div>
          
          <div class="mt-1 flex items-center gap-1 rounded bg-slate-950/90 px-1.5 py-0.5 border border-slate-700 text-[9px] font-mono font-bold text-white shadow-md">
            <span class="text-amber-400 font-black">${cell.peakDbz}</span>
            <span>dBZ</span>
            <span class="text-slate-400">•</span>
            <span class="text-sky-300">${cell.etaMinutes}m</span>
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-convective-cell',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const cellMarker = L.marker([cell.lat, cell.lon], { icon: markerIcon });

      cellMarker.on('click', () => {
        onSelectCell(cell.id);
      });

      // Cell Popup
      cellMarker.bindPopup(`
        <div class="p-3 font-sans text-slate-900 max-w-xs">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              ${cell.cellType}
            </span>
            <span class="text-[10px] font-mono font-bold text-slate-500">
              ETA ${cell.etaMinutes}m
            </span>
          </div>

          <h4 class="font-bold text-sm text-slate-900 mt-2">${cell.name}</h4>
          
          <div class="mt-2.5 grid grid-cols-2 gap-2 text-xs">
            <div class="bg-slate-50 p-2 rounded border border-slate-200">
              <span class="text-[9px] font-bold text-slate-400 block uppercase">Peak Reflectivity</span>
              <span class="font-mono text-sm font-black text-red-600">${cell.peakDbz} dBZ</span>
            </div>
            <div class="bg-slate-50 p-2 rounded border border-slate-200">
              <span class="text-[9px] font-bold text-slate-400 block uppercase">Est. Rain Rate</span>
              <span class="font-mono text-sm font-black text-sky-600">${cell.rainRatePotentialMmHr} mm/h</span>
            </div>
            <div class="bg-slate-50 p-2 rounded border border-slate-200">
              <span class="text-[9px] font-bold text-slate-400 block uppercase">Tracking Speed</span>
              <span class="font-mono text-xs font-bold text-slate-800">${cell.speedKmh} km/h</span>
            </div>
            <div class="bg-slate-50 p-2 rounded border border-slate-200">
              <span class="text-[9px] font-bold text-slate-400 block uppercase">Trajectory Vector</span>
              <span class="font-mono text-xs font-bold text-slate-800">${cell.bearingDeg}° bearing</span>
            </div>
          </div>

          <div class="mt-2.5 rounded bg-amber-50 p-2 border border-amber-200 text-[11px] text-amber-900 leading-tight">
            ${
              cell.peakDbz >= 60
                ? '⚡ <strong>EXTREME CLOUDBURST RISK:</strong> Severe convective core capable of catastrophic flash waterlogging.'
                : '⚠️ <strong>INTENSE PRECIPITATION:</strong> Torrential convective line with potential urban road flooding.'
            }
          </div>
        </div>
      `);

      radarCellsGroupRef.current.addLayer(outerHalo);
      radarCellsGroupRef.current.addLayer(innerCore);
      radarCellsGroupRef.current.addLayer(motionVector);
      radarCellsGroupRef.current.addLayer(cellMarker);
    });
  }, [radarCells, activeCellId, showRadarCells, onSelectCell]);

  // 3. Render Inundation Checkpoints on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    inundationGroupRef.current.clearLayers();

    if (!showInundationPoints) return;

    inundationCheckpoints.forEach((chk) => {
      if (chk.lat === undefined || chk.lon === undefined) return;

      const isCritical = chk.currentRisk === 'CRITICAL_FLOODING';
      const isWarning = chk.currentRisk === 'WATERLOGGING_WARNING';
      const isElevated = chk.currentRisk === 'ELEVATED';

      const pinColor = isCritical ? '#dc2626' : isWarning ? '#f59e0b' : isElevated ? '#eab308' : '#10b981';
      const pinIcon = isCritical ? '🌊' : isWarning ? '⚠️' : '🚗';

      const markerHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          ${
            isCritical
              ? '<span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-red-400 opacity-75"></span>'
              : ''
          }
          <div class="relative flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-black border-2 border-white shadow-md"
               style="background-color: ${pinColor}">
            ${pinIcon}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-flood-checkpoint',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([chk.lat, chk.lon], { icon }).bindPopup(`
        <div class="p-3 font-sans text-slate-900 max-w-xs">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded text-white" style="background-color: ${pinColor}">
              ${chk.currentRisk.replace('_', ' ')}
            </span>
            <span class="text-[10px] font-bold text-slate-500">Underpass Checkpoint</span>
          </div>

          <h4 class="font-bold text-sm text-slate-900 mt-2">${chk.name}</h4>
          <p class="text-[11px] text-slate-500 mt-0.5">${chk.location}</p>

          <div class="mt-2.5 grid grid-cols-2 gap-2 text-xs">
            <div class="bg-slate-50 p-2 rounded border border-slate-200">
              <span class="text-[9px] font-bold text-slate-400 block uppercase">Drainage Saturation</span>
              <span class="font-mono text-sm font-bold text-slate-800">${chk.drainageCapacityMmHr} mm/h</span>
            </div>
            <div class="bg-slate-50 p-2 rounded border border-slate-200">
              <span class="text-[9px] font-bold text-slate-400 block uppercase">Critical Threshold</span>
              <span class="font-mono text-sm font-bold text-red-600">${chk.criticalThresholdMmHr} mm/h</span>
            </div>
          </div>

          <div class="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
            <strong>Traffic Impact:</strong> ${chk.trafficImpact}
          </div>
        </div>
      `);

      inundationGroupRef.current.addLayer(marker);
    });
  }, [inundationCheckpoints, showInundationPoints]);

  // Recenter map back to Palam Radar / Delhi NCR core
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([PALAM_RADAR_LAT, PALAM_RADAR_LON], 10, {
      duration: 1.2
    });
  }, []);

  // Zoom into active storm cell
  const handleFocusActiveCell = useCallback(() => {
    if (!mapInstanceRef.current || !activeCellId) return;
    const targetCell = radarCells.find((c) => c.id === activeCellId);
    if (targetCell) {
      mapInstanceRef.current.flyTo([targetCell.lat, targetCell.lon], 11, {
        duration: 1.2
      });
    }
  }, [activeCellId, radarCells]);

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 bg-slate-950 text-white overflow-hidden shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'w-full'
      }`}
    >
      {/* 1. Radar Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md z-30">
        
        {/* Title & Live Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
                Doppler Weather Radar GIS Map
              </h3>
              <span className="flex items-center gap-1 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                C-BAND 100KM SURVEILLANCE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Georeferenced IMD Delhi Palam Radar with real-time reflectivity contours, convective storm tracks, and vulnerable flood underpasses
            </p>
          </div>
        </div>

        {/* Action Buttons & Layer Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          
          {/* Base Map Selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setSelectedBaseMap('dark')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedBaseMap === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Night Radar Theme"
            >
              Night
            </button>
            <button
              onClick={() => setSelectedBaseMap('satellite')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedBaseMap === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite Aerial Imagery"
            >
              Satellite
            </button>
            <button
              onClick={() => setSelectedBaseMap('streets')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedBaseMap === 'streets' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Streets & Roads"
            >
              Streets
            </button>
          </div>

          {/* Layer Toggle: Range Rings */}
          <button
            onClick={() => setShowRangeRings(!showRangeRings)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
              showRangeRings
                ? 'border-emerald-700 bg-emerald-950/80 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 100km Radar Range Rings"
          >
            <Crosshair className="h-3 w-3" />
            <span className="hidden sm:inline">Range Rings</span>
          </button>

          {/* Layer Toggle: Inundation Checkpoints */}
          <button
            onClick={() => setShowInundationPoints(!showInundationPoints)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
              showInundationPoints
                ? 'border-red-700 bg-red-950/80 text-red-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Vulnerable Urban Underpasses"
          >
            <Droplets className="h-3 w-3" />
            <span className="hidden sm:inline">Underpasses ({inundationCheckpoints.length})</span>
          </button>

          {/* Toggle Rotating Sweep Beam */}
          <button
            onClick={() => setIsSweepActive(!isSweepActive)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
              isSweepActive
                ? 'border-emerald-700 bg-emerald-900/60 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle 360° Doppler Beam Sweep Animation"
          >
            <RotateCcw className={`h-3 w-3 ${isSweepActive ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sweep</span>
          </button>

          {/* Recenter button */}
          <button
            onClick={handleRecenter}
            className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Center on Delhi Palam DWR"
          >
            <Navigation className="h-3 w-3 text-emerald-400" />
            <span className="hidden sm:inline">Center DWR</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Radar Map'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

        </div>
      </div>

      {/* 2. Main Leaflet Map Display */}
      <div className="relative w-full overflow-hidden" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '480px' }}>
        
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="h-full w-full bg-[#030914]" />

        {/* Animated 360° Radar Sweep Overlay (Aligned to Palam DWR center) */}
        {isSweepActive && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
            <div
              className="absolute h-[640px] w-[640px] rounded-full origin-center animate-[spin_5s_linear_infinite]"
              style={{
                background: 'conic-gradient(from 180deg at 50% 50%, rgba(16, 185, 129, 0.28) 0deg, transparent 55deg)'
              }}
            />
          </div>
        )}

        {/* Top-Left Geographic Orientation Badge */}
        <div className="absolute top-3 left-3 z-30 pointer-events-none flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md px-2.5 py-1 border border-slate-800 text-[10px] font-mono text-emerald-400 shadow-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RADAR STATUS: ACTIVE TRANSMIT</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950/85 backdrop-blur-md px-2.5 py-1 border border-slate-800 text-[9px] font-mono text-slate-300 shadow-md">
            <span>DELHI PALAM (28.58°N, 77.12°E)</span>
            <span>•</span>
            <span className="text-amber-400">{radarCells.length} CELLS TRACKED</span>
          </div>
        </div>

        {/* Quick Jump to Active Cell Floating Button */}
        {activeCellId && (
          <div className="absolute top-3 right-14 z-30">
            <button
              onClick={handleFocusActiveCell}
              className="flex items-center gap-1.5 rounded-lg bg-purple-950/90 hover:bg-purple-900 px-2.5 py-1 border border-purple-700 text-[10px] font-bold text-purple-200 shadow-md backdrop-blur-md transition-all cursor-pointer"
            >
              <Zap className="h-3 w-3 text-purple-400" />
              <span>Zoom to Cell</span>
            </button>
          </div>
        )}

        {/* Bottom Radar Reflectivity dBZ Legend Bar */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-30 rounded-xl bg-slate-950/90 backdrop-blur-md p-2.5 border border-slate-800 shadow-lg text-[10px] font-mono text-slate-300">
          <div className="flex items-center justify-between gap-4 mb-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <span>Doppler Base Reflectivity (dBZ)</span>
            <span>Rain Rate Equiv.</span>
          </div>

          {/* Color Gradient Scale */}
          <div className="flex h-3 w-full sm:w-80 rounded overflow-hidden shadow-inner border border-slate-700">
            <div className="w-[18%] bg-emerald-600 flex items-center justify-center text-[8px] font-black text-white">20</div>
            <div className="w-[20%] bg-green-500 flex items-center justify-center text-[8px] font-black text-slate-900">30</div>
            <div className="w-[22%] bg-yellow-400 flex items-center justify-center text-[8px] font-black text-slate-900">40</div>
            <div className="w-[20%] bg-orange-500 flex items-center justify-center text-[8px] font-black text-white">50</div>
            <div className="w-[12%] bg-red-600 flex items-center justify-center text-[8px] font-black text-white">60</div>
            <div className="w-[8%] bg-purple-600 flex items-center justify-center text-[8px] font-black text-white">70</div>
          </div>

          <div className="mt-1 flex items-center justify-between text-[8px] text-slate-400">
            <span>Light (&lt;2 mm/h)</span>
            <span>Moderate</span>
            <span>Heavy (&gt;25 mm/h)</span>
            <span className="text-red-400 font-bold">Cloudburst (&gt;100 mm/h)</span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Radar Information Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>&gt;60 dBZ (Severe Core)</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>50-60 dBZ (Heavy Shaft)</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>40-50 dBZ (Rain Line)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-slate-500">Scan Elevation Angle: 0.5° (Base PPI)</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Updated Live</span>
        </div>
      </div>

    </div>
  );
};

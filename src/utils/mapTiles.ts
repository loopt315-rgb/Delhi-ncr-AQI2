export interface MapTileProvider {
  id: 'streets' | 'satellite' | 'dark' | 'osm';
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const MAP_TILE_PROVIDERS: Record<string, MapTileProvider> = {
  streets: {
    id: 'streets',
    name: 'Streets (Esri World)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ, TomTom',
    maxZoom: 19,
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap (Clean HD)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite Aerial (Esri HD)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics, USGS, NASA',
    maxZoom: 18,
  },
  dark: {
    id: 'dark',
    name: 'Night Canvas (Esri Dark)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin',
    maxZoom: 16,
  },
};

export interface NCRLandmark {
  id: string;
  name: string;
  category: 'monument' | 'transport' | 'hub';
  lat: number;
  lon: number;
  icon: string;
}

export const NCR_LANDMARKS: NCRLandmark[] = [
  { id: 'india-gate', name: 'India Gate / Central Vista', category: 'monument', lat: 28.6129, lon: 77.2295, icon: '🏛️' },
  { id: 'connaught-place', name: 'Connaught Place (CP)', category: 'hub', lat: 28.6315, lon: 77.2167, icon: '🏢' },
  { id: 'red-fort', name: 'Red Fort / Old Delhi', category: 'monument', lat: 28.6562, lon: 77.2410, icon: '🏰' },
  { id: 'igi-airport', name: 'IGI International Airport', category: 'transport', lat: 28.5562, lon: 77.1000, icon: '✈️' },
  { id: 'akshardham', name: 'Akshardham / NH24', category: 'monument', lat: 28.6127, lon: 77.2773, icon: '🛕' },
  { id: 'qutub-minar', name: 'Qutub Minar (South Delhi)', category: 'monument', lat: 28.5244, lon: 77.1855, icon: '🗼' },
  { id: 'cyber-city', name: 'Cyber City, Gurugram', category: 'hub', lat: 28.4950, lon: 77.0895, icon: '🏙️' },
  { id: 'noida-hub', name: 'Sector 62 IT Hub, Noida', category: 'hub', lat: 28.6280, lon: 77.3649, icon: '🏢' },
  { id: 'anand-vihar-isbt', name: 'Anand Vihar ISBT & Station', category: 'transport', lat: 28.6476, lon: 77.3158, icon: '🚆' },
];

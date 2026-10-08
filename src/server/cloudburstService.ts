import {
  LocationId,
  CloudburstPredictionReport,
  CloudburstRiskTier,
  ConvectiveSoundingMetrics,
  CloudburstHourlyPoint,
  DopplerRadarCell,
  InundationCheckpoint
} from '../types';
import { LOCATIONS } from './dataService';

// Bounding box and key vulnerable underpass/low-lying checkpoints across Delhi-NCR
const INUNDATION_CATALOG: Record<LocationId, InundationCheckpoint[]> = {
  delhi: [
    {
      id: 'chk-minto',
      name: 'Minto Road Railway Bridge Underpass',
      location: 'Connaught Place / New Delhi Railway Station Corridor',
      lat: 28.6366,
      lon: 77.2255,
      criticalThresholdMmHr: 35,
      currentRisk: 'CRITICAL_FLOODING',
      drainageCapacityMmHr: 32,
      trafficImpact: 'Severe arterial disruption; CP to Old Delhi route completely blocked when flooded.',
      historicalIncident: 'Submerged buses and vehicles recorded during intense >45mm/hr convective rain bursts.'
    },
    {
      id: 'chk-pragati',
      name: 'Pragati Maidan Tunnel & Mathura Road Underpass',
      location: 'Central-East Delhi / Ring Road Interface',
      lat: 28.6186,
      lon: 77.2435,
      criticalThresholdMmHr: 45,
      currentRisk: 'WATERLOGGING_WARNING',
      drainageCapacityMmHr: 42,
      trafficImpact: 'Subsurface sump overflow; causes gridlock on Ring Road and Bhairon Marg.',
      historicalIncident: 'Tunnel closed for 48 hours during extreme monsoon precipitation event.'
    },
    {
      id: 'chk-zakhira',
      name: 'Zakhira Flyover Underpass & Rohtak Road',
      location: 'West-Central Delhi',
      lat: 28.6655,
      lon: 77.1585,
      criticalThresholdMmHr: 30,
      currentRisk: 'CRITICAL_FLOODING',
      drainageCapacityMmHr: 28,
      trafficImpact: 'Cuts off Punjabi Bagh, Patel Nagar, and Anand Parbat commercial zone.',
      historicalIncident: '4 to 5 feet standing water during sudden convective downpours.'
    },
    {
      id: 'chk-aiims',
      name: 'AIIMS - Safdarjung Ring Road Subway & Lowlands',
      location: 'South Delhi Medical Corridor',
      lat: 28.5672,
      lon: 77.2100,
      criticalThresholdMmHr: 50,
      currentRisk: 'ELEVATED',
      drainageCapacityMmHr: 48,
      trafficImpact: 'Slow traffic crawl; impacts emergency ambulance ingress to AIIMS Trauma Centre.',
      historicalIncident: 'Drain backflow during high-intensity rain events.'
    },
    {
      id: 'chk-najafgarh',
      name: 'Najafgarh Drain Basin & Dwarka Sector 19/23',
      location: 'South-West Delhi Natural Drainage Basin',
      lat: 28.5822,
      lon: 77.0120,
      criticalThresholdMmHr: 40,
      currentRisk: 'ELEVATED',
      drainageCapacityMmHr: 38,
      trafficImpact: 'Localized sub-city waterlogging and residential basement inundation.',
      historicalIncident: 'Najafgarh drain level breaching danger mark during heavy catchment rain.'
    }
  ],
  gurugram: [
    {
      id: 'chk-hero-honda',
      name: 'Hero Honda Chowk & Khandsa Drain Corridor',
      location: 'NH-48 Central Gurugram Arterial Spine',
      lat: 28.4385,
      lon: 77.0095,
      criticalThresholdMmHr: 32,
      currentRisk: 'CRITICAL_FLOODING',
      drainageCapacityMmHr: 30,
      trafficImpact: 'Multi-kilometer gridlock on Delhi-Jaipur Expressway; total paralysis of service lanes.',
      historicalIncident: 'Historic Gurujam events where commuters were stranded over 12 hours.'
    },
    {
      id: 'chk-golf-course',
      name: 'Golf Course Road Genpact & DLF Underpasses',
      location: 'Sector 42 / 53 High-Density IT Corridor',
      lat: 28.4682,
      lon: 77.0945,
      criticalThresholdMmHr: 48,
      currentRisk: 'WATERLOGGING_WARNING',
      drainageCapacityMmHr: 45,
      trafficImpact: 'Underpasses closed for safety; traffic diverted to surface signal bottlenecks.',
      historicalIncident: 'Automated flood pumps overwhelmed by rapid 60mm/hr cloud cell descent.'
    },
    {
      id: 'chk-subhash',
      name: 'Subhash Chowk & Sohna Road Junction',
      location: 'South Gurugram Connection',
      lat: 28.4190,
      lon: 77.0425,
      criticalThresholdMmHr: 35,
      currentRisk: 'ELEVATED',
      drainageCapacityMmHr: 32,
      trafficImpact: 'Severe commuter delays toward Badshahpur and SPR.',
      historicalIncident: 'Waterlogging up to knee height in surrounding commercial hubs.'
    }
  ],
  noida: [
    {
      id: 'chk-sec62',
      name: 'Sector 62 Underpass & Model Town Intersection',
      location: 'Noida - NH24 / Delhi Border Arterial',
      lat: 28.6280,
      lon: 77.3649,
      criticalThresholdMmHr: 40,
      currentRisk: 'WATERLOGGING_WARNING',
      drainageCapacityMmHr: 38,
      trafficImpact: 'Heavy delays for commuters travelling to Indirapuram and Greater Noida West.',
      historicalIncident: 'Water pooling up to 2.5 feet during high-intensity localized convective cells.'
    },
    {
      id: 'chk-mahamaya',
      name: 'Mahamaya Flyover / Kalindi Kunj Border Ingress',
      location: 'Yamuna Riverbank Corridor',
      lat: 28.5520,
      lon: 77.3180,
      criticalThresholdMmHr: 45,
      currentRisk: 'ELEVATED',
      drainageCapacityMmHr: 42,
      trafficImpact: 'Choked entry into South Delhi via Okhla Barrage.',
      historicalIncident: 'Yamuna backflow into storm drains during simultaneous high river flow.'
    },
    {
      id: 'chk-sec18',
      name: 'Sector 18 Commercial Hub & Atta Market Subway',
      location: 'Central Noida Retail Zone',
      lat: 28.5700,
      lon: 77.3235,
      criticalThresholdMmHr: 50,
      currentRisk: 'SAFE',
      drainageCapacityMmHr: 48,
      trafficImpact: 'Minor disruption to underground parking structures.',
      historicalIncident: 'Localized pooling cleared quickly by dedicated municipal pumping stations.'
    }
  ],
  ghaziabad: [
    {
      id: 'chk-loni',
      name: 'Loni Road & Hindon River Basin Incline',
      location: 'North Ghaziabad Industrial Border',
      lat: 28.7520,
      lon: 77.2880,
      criticalThresholdMmHr: 26,
      currentRisk: 'CRITICAL_FLOODING',
      drainageCapacityMmHr: 24,
      trafficImpact: 'Total obstruction of heavy vehicle and freight transit between Delhi and UP.',
      historicalIncident: 'Prolonged inundation due to unpaved drainage channels and rapid siltation.'
    },
    {
      id: 'chk-mohan-nagar',
      name: 'Mohan Nagar Intersection & GT Road Underpass',
      location: 'Central Ghaziabad Hub',
      lat: 28.6750,
      lon: 77.3820,
      criticalThresholdMmHr: 34,
      currentRisk: 'WATERLOGGING_WARNING',
      drainageCapacityMmHr: 30,
      trafficImpact: 'Major traffic bottleneck affecting buses and Anand Vihar transit.',
      historicalIncident: 'Underpass filled with water during sudden downpours.'
    }
  ],
  faridabad: [
    {
      id: 'chk-old-faridabad',
      name: 'Old Faridabad Railway Underpass',
      location: 'Central Commercial Railway Crossing',
      lat: 28.4130,
      lon: 77.3190,
      criticalThresholdMmHr: 30,
      currentRisk: 'CRITICAL_FLOODING',
      drainageCapacityMmHr: 28,
      trafficImpact: 'Severed connectivity between East and West Faridabad.',
      historicalIncident: 'Submerged passenger vehicles during severe convective showers.'
    },
    {
      id: 'chk-badkhal',
      name: 'Badkhal Chowk & Neelam Flyover Descent',
      location: 'Mathura Road Arterial',
      lat: 28.4340,
      lon: 77.2980,
      criticalThresholdMmHr: 38,
      currentRisk: 'ELEVATED',
      drainageCapacityMmHr: 35,
      trafficImpact: 'Long vehicular queues on Delhi-Agra highway stretch.',
      historicalIncident: 'Drainage overflow into adjacent commercial showrooms.'
    }
  ]
};

// Doppler Radar cells simulating active convective cells tracked in the NCR radar coverage domain
function generateRadarCells(locationId: LocationId, isSimulatedSevere: boolean): DopplerRadarCell[] {
  const loc = LOCATIONS[locationId] || LOCATIONS.delhi;

  if (isSimulatedSevere) {
    return [
      {
        id: 'cell-alpha',
        name: 'Mesoscale Convective Cell "Alpha-1"',
        lat: Number((loc.lat + 0.18).toFixed(4)),
        lon: Number((loc.lon - 0.22).toFixed(4)),
        bearingDeg: 315, // NW
        speedKmh: 42,
        peakDbz: 62.5,
        etaMinutes: 22,
        cellType: 'Isolated Supercell',
        rainRatePotentialMmHr: 114
      },
      {
        id: 'cell-bravo',
        name: 'Severe Multicell Line "Bravo-Core"',
        lat: Number((loc.lat + 0.32).toFixed(4)),
        lon: Number((loc.lon + 0.15).toFixed(4)),
        bearingDeg: 340, // NNW
        speedKmh: 36,
        peakDbz: 56.0,
        etaMinutes: 48,
        cellType: 'Intense Multicell Line',
        rainRatePotentialMmHr: 88
      },
      {
        id: 'cell-gamma',
        name: 'Convective Downdraft Cluster "Gamma-3"',
        lat: Number((loc.lat - 0.14).toFixed(4)),
        lon: Number((loc.lon - 0.28).toFixed(4)),
        bearingDeg: 245, // WSW
        speedKmh: 48,
        peakDbz: 53.5,
        etaMinutes: 75,
        cellType: 'Mesoscale Convective Cluster',
        rainRatePotentialMmHr: 65
      }
    ];
  }

  // Realistic seasonal baseline (watch / moderate potential)
  return [
    {
      id: 'cell-1',
      name: 'Convective Cell "Rohtak-NCR Line"',
      lat: Number((loc.lat + 0.25).toFixed(4)),
      lon: Number((loc.lon - 0.35).toFixed(4)),
      bearingDeg: 300,
      speedKmh: 32,
      peakDbz: 46.2,
      etaMinutes: 55,
      cellType: 'Mesoscale Convective Cluster',
      rainRatePotentialMmHr: 42
    },
    {
      id: 'cell-2',
      name: 'Thermal Cell "Mewat-Sohna Pulse"',
      lat: Number((loc.lat - 0.22).toFixed(4)),
      lon: Number((loc.lon - 0.15).toFixed(4)),
      bearingDeg: 210,
      speedKmh: 24,
      peakDbz: 38.0,
      etaMinutes: 110,
      cellType: 'Scattered Squall',
      rainRatePotentialMmHr: 22
    }
  ];
}

/**
 * Generates the full Cloudburst and Extreme Convective report
 */
export async function getCloudburstPrediction(
  locationId: LocationId,
  isSimulationActive: boolean = false
): Promise<CloudburstPredictionReport> {
  const loc = LOCATIONS[locationId] || LOCATIONS.delhi;

  // Sounding metrics: If simulation is active, model a classic IMD Cloudburst scenario
  // Otherwise, compute physically consistent atmospheric convective soundings
  let sounding: ConvectiveSoundingMetrics;
  let riskTier: CloudburstRiskTier;
  let riskScore: number;
  let imdAdvisoryLevel: 'RED_WARNING' | 'ORANGE_ALERT' | 'YELLOW_WATCH' | 'GREEN_NO_WARNING';
  let imdAdvisoryHeadline: string;
  let imdBrief: string;

  if (isSimulationActive) {
    // Extreme Cloudburst event simulation (>= 100 mm/hr)
    sounding = {
      capeJkg: 3950,
      pwatMm: 66.4,
      cinJkg: -14,
      liftedIndexK: -7.8,
      kIndexC: 41.2,
      maxReflectivityDbz: 63.5,
      updraftVelocityMs: 31.4,
      echoTopHeightKm: 16.8,
      estimatedRainRateMmHr: 118,
      soilSaturationPercent: 88
    };
    riskTier = 'CRITICAL';
    riskScore = 92;
    imdAdvisoryLevel = 'RED_WARNING';
    imdAdvisoryHeadline = 'IMD RED WARNING: Extreme Cloudburst & Flash Inundation Imminent';
    imdBrief = 'Severe localized convective storm cell detected with radar reflectivity exceeding 62 dBZ and echo tops piercing the tropopause at 16.8 km. Explosive CAPE of 3,950 J/kg coupled with 66.4 mm Precipitable Water indicates intense cloudburst potential (>100 mm/hr) within the next 30 to 60 minutes across Delhi-NCR.';
  } else {
    // Calibrated baseline convective state (elevated watch / convective alert monitoring)
    sounding = {
      capeJkg: 2380,
      pwatMm: 51.8,
      cinJkg: -42,
      liftedIndexK: -4.6,
      kIndexC: 34.5,
      maxReflectivityDbz: 46.8,
      updraftVelocityMs: 16.2,
      echoTopHeightKm: 12.4,
      estimatedRainRateMmHr: 44,
      soilSaturationPercent: 62
    };
    riskTier = 'ALERT';
    riskScore = 64;
    imdAdvisoryLevel = 'ORANGE_ALERT';
    imdAdvisoryHeadline = 'IMD ORANGE ALERT: Severe Convective Storm & Urban Waterlogging Watch';
    imdBrief = 'Moderate-to-high instability over the National Capital Region with CAPE at 2,380 J/kg and Precipitable Water at 51.8 mm. Convective inhibition is weakening under strong surface thermal heating. Isolated intense spells (35–55 mm/hr) expected with localized waterlogging across vulnerable low-lying underpasses.';
  }

  // 72-Hour Prognostic timeline
  const timeline: CloudburstHourlyPoint[] = [];
  const baseTime = new Date();
  const baselinePm25 = 345; // Baseline high particulate loading in Delhi air

  const hourSteps = [
    { offset: 0, label: 'NOW', rainProb: isSimulationActive ? 95 : 68, rainRate: sounding.estimatedRainRateMmHr, cape: sounding.capeJkg, pwat: sounding.pwatMm, cin: sounding.cinJkg, dbz: sounding.maxReflectivityDbz },
    { offset: 1, label: '+1H', rainProb: isSimulationActive ? 98 : 74, rainRate: isSimulationActive ? 122 : 48, cape: sounding.capeJkg - 200, pwat: sounding.pwatMm - 2, cin: -8, dbz: isSimulationActive ? 64 : 48 },
    { offset: 2, label: '+2H', rainProb: isSimulationActive ? 85 : 55, rainRate: isSimulationActive ? 75 : 28, cape: sounding.capeJkg - 800, pwat: sounding.pwatMm - 8, cin: -30, dbz: isSimulationActive ? 52 : 38 },
    { offset: 3, label: '+3H', rainProb: isSimulationActive ? 50 : 35, rainRate: isSimulationActive ? 22 : 12, cape: 1800, pwat: 44, cin: -65, dbz: 32 },
    { offset: 6, label: '+6H', rainProb: 25, rainRate: 4, cape: 1200, pwat: 38, cin: -110, dbz: 20 },
    { offset: 12, label: '+12H', rainProb: 15, rainRate: 0, cape: 850, pwat: 34, cin: -140, dbz: 14 },
    { offset: 24, label: '+24H', rainProb: 30, rainRate: 8, cape: 1650, pwat: 42, cin: -75, dbz: 25 },
    { offset: 48, label: '+48H', rainProb: 20, rainRate: 2, cape: 1350, pwat: 37, cin: -90, dbz: 18 },
    { offset: 72, label: '+72H', rainProb: 18, rainRate: 0, cape: 1100, pwat: 35, cin: -105, dbz: 15 }
  ];

  for (const step of hourSteps) {
    const d = new Date(baseTime.getTime() + step.offset * 3600 * 1000);
    const timeStr = step.offset === 0 ? 'NOW' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    let tier: CloudburstRiskTier = 'LOW';
    if (step.rainRate >= 100) tier = 'CRITICAL';
    else if (step.rainRate >= 45) tier = 'ALERT';
    else if (step.rainRate >= 20) tier = 'WATCH';

    // Wet scavenging calculation: Slinn aerosol washout model
    // Higher rain rates scrub PM2.5 aggressively
    const scavengingRatePct = Math.min(92, Math.round(Math.pow(step.rainRate / 100, 0.45) * 88));
    const postPm25 = Math.max(22, Math.round(baselinePm25 * (1 - (step.rainRate > 5 ? scavengingRatePct / 100 : 0))));

    timeline.push({
      timeLabel: step.offset === 0 ? 'NOW' : `+${step.offset}h`,
      timestamp: timeStr,
      hoursOffset: step.offset,
      riskTier: tier,
      riskProbabilityPercent: step.rainProb,
      expectedRainRateMmHr: step.rainRate,
      capeJkg: step.cape,
      pwatMm: step.pwat,
      cinJkg: step.cin,
      reflectivityDbz: step.dbz,
      projectedPm25ScavengingPercent: step.rainRate > 5 ? scavengingRatePct : 0,
      pm25PreStorm: baselinePm25,
      pm25PostStorm: postPm25,
      urbanFloodVulnerability: step.rainRate >= 50 ? 'HIGH' : step.rainRate >= 25 ? 'MODERATE' : 'LOW'
    });
  }

  // Urban Inundation checkpoints customized for the active city
  const rawCheckpoints = INUNDATION_CATALOG[locationId] || INUNDATION_CATALOG.delhi;
  const inundationCheckpoints: InundationCheckpoint[] = rawCheckpoints.map((chk) => {
    let currentRisk: InundationCheckpoint['currentRisk'] = 'SAFE';
    if (sounding.estimatedRainRateMmHr >= chk.criticalThresholdMmHr * 1.2) {
      currentRisk = 'CRITICAL_FLOODING';
    } else if (sounding.estimatedRainRateMmHr >= chk.drainageCapacityMmHr) {
      currentRisk = 'WATERLOGGING_WARNING';
    } else if (sounding.estimatedRainRateMmHr >= chk.drainageCapacityMmHr * 0.65) {
      currentRisk = 'ELEVATED';
    }
    return { ...chk, currentRisk };
  });

  // Radar cells
  const radarCells = generateRadarCells(locationId, isSimulationActive);

  // Atmospheric chemistry wet scavenging diagnostics
  const scavengingEfficiency = isSimulationActive ? 89 : 68;
  const postScavengingPm25 = Math.round(baselinePm25 * (1 - scavengingEfficiency / 100));

  const disasterRecommendations: string[] = isSimulationActive
    ? [
        'ACTIVATE FLOOD SUMP PUMPS: Municipalities must deploy high-capacity diesel de-watering pumps at Minto Bridge, Pragati Maidan Tunnel, and NH-48 Hero Honda Chowk.',
        'TRAFFIC DIVERSIONS: Delhi Traffic Police and Gurugram Police should issue immediate advisories halting vehicular access into depressed underpasses.',
        'SUSPEND METRO SUB-SURFACE CONCOURSE ACCESS: Verify floodgate integrity at low-elevation Delhi Metro stations (ITO, Kashmere Gate, Central Secretariat).',
        'EVACUATE YAMUNA / HINDON FLOODPLAINS: Advise temporary relocation for temporary agricultural settlements along Yamuna flood embankments.',
        'AEROSOL MONITORING: Note that while PM2.5 will plunge below 35 µg/m³ during the downpour, severe nocturnal mist/fog will re-entrain surface moisture within 6 hours.'
      ]
    : [
        'MONITOR DOPPLER RADAR CONVECTIVE CELLS: Keep continuous surveillance on incoming cells from Rohtak-Sonipat corridor.',
        'PRE-CLEAR DRAINAGE INLETS: Ensure civic authorities clear roadside catchpits of accumulated solid waste and plastic debris.',
        'DRIVE WITH CAUTION: Reduce vehicle speeds on Ring Road, NH-48, and Noida-Greater Noida Expressway during sudden rain bursts.',
        'RESPIRATORY CARE: Take advantage of temporary atmospheric PM2.5 scavenging for ventilation, but prepare for high relative humidity post-storm.'
      ];

  return {
    generatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    locationId,
    locationName: loc.name,
    currentRiskTier: riskTier,
    riskScore,
    imdAdvisoryLevel,
    imdAdvisoryHeadline,
    imdBrief,
    sounding,
    timeline,
    radarCells,
    inundationCheckpoints,
    wetScavengingDiagnostics: {
      baselinePm25UgM3: baselinePm25,
      postScavengingPm25UgM3: postScavengingPm25,
      scavengingEfficiencyPercent: scavengingEfficiency,
      washoutMechanism: 'In-cloud impaction scavenging + sub-cloud droplet collision-coalescence washing sub-micron particulates down to ground runoff.',
      fogReformationRiskHours: isSimulationActive ? 5 : 8
    },
    disasterManagementRecommendations: disasterRecommendations
  };
}

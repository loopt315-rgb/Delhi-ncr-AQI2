export type SupportedLanguage = 'en' | 'hi' | 'pa';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  shortLabel: string;
}

export type LocationId = 'delhi' | 'noida' | 'gurugram' | 'ghaziabad' | 'faridabad';

export interface LocationInfo {
  id: LocationId;
  name: string;
  state: string;
  lat: number;
  lon: number;
  primaryStation: string;
}

export type AQICategory = 
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe'
  | 'Hazardous';

export interface NCRStation {
  id: string;
  name: string;
  city: string;
  areaType?: 'Residential' | 'Industrial' | 'Traffic' | 'Commercial' | 'Airport';
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  pm10: number;
  status: AQICategory | string;
  dominantPollutant?: string;
  lastUpdated?: string;
}

export type ActiveNavTab = 'overview' | 'stations' | 'heatmap' | 'forecast' | 'causes' | 'plume' | 'health' | 'model_pipeline' | 'cloudburst';

export interface PollutantValues {
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  o3: number;   // µg/m³
  no2: number;  // µg/m³
  so2: number;  // µg/m³
  co: number;   // mg/m³
}

export interface CurrentAQIResponse {
  locationId: LocationId;
  locationName: string;
  stationName: string;
  aqi: number;
  category: AQICategory;
  trend: 'improving' | 'stable' | 'worsening';
  trendText: string;
  expected12hAqi: number;
  confidencePercent: number;
  lastUpdated: string;
  sourceType: 'Observed' | 'Forecast' | 'Estimated';
  pollutants: PollutantValues;
}

export interface ForecastHourPoint {
  timeLabel: string; // "NOW", "+6H", "+12H", "+24H", "+48H", "+72H" or ISO string
  timestamp: string;
  hoursOffset: number;
  aqi: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  tempC: number;
  humidity: number;
  windSpeedKmh: number;
  windDirection: string;
  pblHeightM: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'SEVERE';
  confidenceLower?: number; // P10 optimistic bound
  confidenceUpper?: number; // P90 pessimistic bound
  ventilationIndex?: number; // m²/s (PBL height * wind speed)
  inversionTrapping?: 'critical' | 'severe' | 'moderate' | 'low';
  grapStageRisk?: string; // e.g., 'GRAP Stage IV Risk', 'GRAP Stage III'
}

export interface ContributingFactor {
  id: string;
  icon: string;
  severity: 'critical' | 'warning' | 'info' | 'safe';
  title: string;
  simpleExplanation: string;
  scientificDetail: string;
  metricLabel: string;
  metricValue: string;
}

export interface WeatherData {
  temperatureC: number;
  humidityPercent: number;
  windSpeedMs: number;
  windDirectionDeg: number;
  windCardinal: string;
  windPollutionImpact: string;
  rainProbabilityPercent: number;
  pblHeightMeters: number;
  inversionScore: number; // 0 - 100
  inversionStrengthText: string;
  lapseRateCPerKm: number;
  ventilationIndexM2S: number;
  atmosphericStabilityClass: string; // e.g. "Class F (Extremely Stable)"
  lastUpdated: string;
}

export interface FireHotspot {
  id: string;
  lat: number;
  lon: number;
  state: 'Punjab' | 'Haryana' | 'Uttar Pradesh' | 'Rajasthan';
  district: string;
  frpMw: number; // Fire Radiative Power in MW
  confidence: number;
  satellite: 'VIIRS' | 'MODIS';
  detectedTime: string;
  distanceFromDelhiKm: number;
  directionFromDelhi: string; // e.g. "NW (315°)"
}

export interface FireSummary {
  totalHotspots24h: number;
  byState: {
    punjab: number;
    haryana: number;
    uttarPradesh: number;
    rajasthan: number;
  };
  highIntensityCount: number;
  satellitePass: string;
  disclaimer: string;
  hotspots: FireHotspot[];
}

export interface PlumePrediction {
  detected: boolean;
  statusText: string;
  originCorridor: string;
  trajectoryDescription: string;
  estimatedArrivalHours: number;
  estimatedArrivalFormatted: string; // e.g. "6h 40m"
  expectedPm25ImpactPercent: number; // e.g. 32
  confidencePercent: number;
  windAdvectionSpeedKmh: number;
  plumeCoordinates: Array<{ lat: number; lon: number; intensity: number; stage: string }>;
  labelNote: string; // "Estimated plume trajectory"
}

export interface SourceItem {
  name: string;
  category: string;
  estimatedPercentage: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  color?: string;
  origin?: string;
}

export interface SourceContributionData {
  regionalSharePercent: number;
  localSharePercent: number;
  sources: SourceItem[];
}

export interface AISummaryResponse {
  summary: string;
  keyDrivers: string[];
  peakPeriod: string;
  source: 'gemini' | 'deterministic-grounded';
}

export interface HealthRiskAdvice {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'SEVERE';
  title: string;
  summary: string;
  outdoorExercise: string;
  prolongedExposure: string;
  sensitiveGroups: string;
  generalPopulation: string;
  purifierRecommendation: string;
  maskRecommendation: string;
  timeline: Array<{
    period: string;
    risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'SEVERE';
    note: string;
  }>;
  disclaimer: string;
}

export interface PredictiveAlert {
  id: string;
  title: string;
  severity: 'severe' | 'warning' | 'advisory' | 'critical' | 'safe' | 'info';
  expectedHours: number;
  leadTimeHours?: number;
  projectedAqi: number;
  description?: string;
  reasons: string[];
  recommendedAction: string;
  timestamp: string;
}

export interface AlertConfig {
  threshold300: boolean;
  threshold400: boolean;
  rapidIncrease: boolean;
  plumeApproaching: boolean;
  highHealthRisk: boolean;
  soundEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundedFactors?: string[];
  actionLink?: string;
  actionLinkLabel?: string;
  suggestedFollowUps?: string[];
  isStreaming?: boolean;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  provider: string;
  status: 'live_active' | 'configured' | 'calibrated_model' | 'key_needed';
  dataType: string;
  apiKeyName?: string;
  isKeyConfigured: boolean;
  registrationUrl?: string;
  details: string;
}

export interface ProvenanceReport {
  overallMode: 'hybrid_live' | 'fully_live' | 'calibrated_baseline';
  summary: string;
  sources: DataSourceStatus[];
  lastChecked: string;
}

export interface StationQCStatus {
  stationId: string;
  stationName: string;
  city: string;
  timestamp: string;
  pm25Raw: number | null;
  pm10Raw: number | null;
  o3Raw: number | null;
  qcFlags: {
    rangePlausible: boolean;
    sensorPersistenceOk: boolean;
    rateOfChangeOk: boolean;
    ratioPlausible: boolean;
  };
  overallQC: 'PASSED' | 'FLAGGED_SPIKE' | 'FLAGGED_STUCK' | 'FLAGGED_INVERTED' | 'INVALID_RANGE';
  failureReasons: string[];
  pm25Validated: number;
  pm10Validated: number;
}

export interface QCPipelineReport {
  timestamp: string;
  totalStationsEvaluated: number;
  passingCount: number;
  flaggedCount: number;
  compliancePercentage: number;
  stations: StationQCStatus[];
}

export interface ModelValidationMetrics {
  mae: number;
  rmse: number;
  nmbPercent: number;
  nmePercent: number;
  pearsonR: number;
  indexAgreement: number;
}

export interface ValidationScorecard {
  generatedAt: string;
  system: string;
  uncalibratedRawWrfChem: ModelValidationMetrics;
  mlCorrected: ModelValidationMetrics;
  improvement: {
    rmseReductionPercent: number;
    biasImprovement: string;
  };
}

export interface TrappingDiagnostics {
  timestamp: string;
  pblHeightM: number;
  surfaceInversionStrengthCPer100m: number;
  ventilationIndexM2S: number;
  windSpeed10mMs: number;
  windDirectionDeg: number;
  relativeHumidity: number;
  stabilityClass: string;
  pollutionTrappingRiskIndex: number; // 0 - 100
  trappingCategory: 'CRITICAL_TRAPPING' | 'SEVERE_TRAPPING' | 'MODERATE_DISPERSION' | 'FAVORABLE_VENTILATION';
  physicalMechanisms: string[];
}

export interface CoupledForecastPoint extends ForecastHourPoint {
  rawWrfChemPm25: number;
  rawWrfChemO3: number;
  mlCorrectedPm25: number;
  mlCorrectedO3: number;
  uncertaintyP10: number;
  uncertaintyP90: number;
  inversionStrength: number;
  ventilationIndexM2S: number;
  ptri: number;
}

export type SimulationCycleStatusType = 'Success' | 'Failure' | 'Running' | 'Idle';

export interface SimulationCycleInfo {
  status: SimulationCycleStatusType;
  lastRunAt: string;
  durationMs?: number;
  log?: string;
  success?: boolean;
  cycleId?: string;
  modelVersion?: string;
  gridDomain?: string;
  leadHours?: number;
  stationsProcessed?: number;
}

// ============================================================================
// CLOUDBURST & EXTREME CONVECTIVE PREDICTOR TYPES
// ============================================================================

export type CloudburstRiskTier = 'LOW' | 'WATCH' | 'ALERT' | 'CRITICAL';

export interface ConvectiveSoundingMetrics {
  capeJkg: number;               // Convective Available Potential Energy (J/kg)
  pwatMm: number;                // Precipitable Water / Total Column Moisture (mm)
  cinJkg: number;                // Convective Inhibition (J/kg)
  liftedIndexK: number;          // Lifted Index (K)
  kIndexC: number;               // K-Index (°C)
  maxReflectivityDbz: number;    // Simulated Doppler radar reflectivity (dBZ)
  updraftVelocityMs: number;     // Vertical updraft speed (m/s)
  echoTopHeightKm: number;       // Radar echo top height (km)
  estimatedRainRateMmHr: number; // Potential instantaneous rainfall rate (mm/hr)
  soilSaturationPercent: number; // Topsoil moisture saturation (%)
}

export interface CloudburstHourlyPoint {
  timeLabel: string;
  timestamp: string;
  hoursOffset: number;
  riskTier: CloudburstRiskTier;
  riskProbabilityPercent: number; // 0 - 100%
  expectedRainRateMmHr: number;
  capeJkg: number;
  pwatMm: number;
  cinJkg: number;
  reflectivityDbz: number;
  projectedPm25ScavengingPercent: number; // % PM2.5 reduction due to wet deposition
  pm25PreStorm: number;
  pm25PostStorm: number;
  urbanFloodVulnerability: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface InundationCheckpoint {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lon?: number;
  criticalThresholdMmHr: number;
  currentRisk: 'CRITICAL_FLOODING' | 'WATERLOGGING_WARNING' | 'ELEVATED' | 'SAFE';
  drainageCapacityMmHr: number;
  trafficImpact: string;
  historicalIncident: string;
}

export interface DopplerRadarCell {
  id: string;
  name: string;
  lat: number;
  lon: number;
  bearingDeg: number;
  speedKmh: number;
  peakDbz: number;
  etaMinutes: number;
  cellType: 'Isolated Supercell' | 'Mesoscale Convective Cluster' | 'Intense Multicell Line' | 'Scattered Squall';
  rainRatePotentialMmHr: number;
}

export interface CloudburstPredictionReport {
  generatedAt: string;
  locationId: LocationId;
  locationName: string;
  currentRiskTier: CloudburstRiskTier;
  riskScore: number; // 0 - 100
  imdAdvisoryLevel: 'RED_WARNING' | 'ORANGE_ALERT' | 'YELLOW_WATCH' | 'GREEN_NO_WARNING';
  imdAdvisoryHeadline: string;
  imdBrief: string;
  sounding: ConvectiveSoundingMetrics;
  timeline: CloudburstHourlyPoint[];
  radarCells: DopplerRadarCell[];
  inundationCheckpoints: InundationCheckpoint[];
  wetScavengingDiagnostics: {
    baselinePm25UgM3: number;
    postScavengingPm25UgM3: number;
    scavengingEfficiencyPercent: number;
    washoutMechanism: string;
    fogReformationRiskHours: number;
  };
  disasterManagementRecommendations: string[];
}



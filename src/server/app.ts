import express from "express";
import { LocationId, SupportedLanguage } from "../types";
import {
  LOCATIONS,
  NCR_STATIONS,
  getCurrentAQI,
  getCurrentAQIAsync,
  getNCRStationsAsync,
  get72HourForecast,
  get72HourForecastAsync,
  getContributingFactors,
  getWeatherData,
  getWeatherDataAsync,
  getFiresSummary,
  getFiresSummaryAsync,
  getPlumePrediction,
  getPlumePredictionAsync,
  getSourceContribution,
  getHealthRiskAdvice,
  getPredictiveAlerts,
  getProvenanceReport
} from "./dataService";
import {
  getCoupledAtmosphericForecast,
  getQCPipelineReport,
  getValidationScorecard,
  getTrappingDiagnostics,
  runStageAPipeline,
  getSimulationCycleStatus
} from "./stageAService";
import { generateAISummary, handleAIChat } from "./geminiService";
import { getCloudburstPrediction } from "./cloudburstService";

export const app = express();

app.use(express.json());

const router = express.Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AirSense NCR Intelligence Engine",
    timestamp: new Date().toISOString()
  });
});

// Data Provenance & Reliability status endpoint
router.get("/provenance", (_req, res) => {
  const report = getProvenanceReport();
  res.json(report);
});

// Locations endpoint
router.get("/locations", (_req, res) => {
  res.json(Object.values(LOCATIONS));
});

// Stations endpoint
router.get("/stations", async (_req, res) => {
  try {
    const stations = await getNCRStationsAsync();
    res.json(stations);
  } catch {
    res.json(NCR_STATIONS);
  }
});

// Current AQI endpoint (with live priority)
router.get("/aq/current", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  try {
    const data = await getCurrentAQIAsync(loc);
    res.json(data);
  } catch {
    res.json(getCurrentAQI(loc));
  }
});

// 72-Hour AQI Forecast endpoint
router.get("/aq/forecast", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  try {
    const data = await get72HourForecastAsync(loc);
    res.json(data);
  } catch {
    res.json(get72HourForecast(loc));
  }
});

// Why is AQI Changing endpoint
router.get("/aq/factors", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  let aqiVal: number | undefined;
  try {
    const cur = await getCurrentAQIAsync(loc);
    aqiVal = cur.aqi;
  } catch {
    // fallback
  }
  const data = getContributingFactors(loc, aqiVal);
  res.json(data);
});

// Weather & atmospheric inversion endpoint
router.get("/weather/current", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  try {
    const data = await getWeatherDataAsync(loc);
    res.json(data);
  } catch {
    res.json(getWeatherData(loc));
  }
});

router.get("/weather/forecast", (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  const forecast = get72HourForecast(loc);
  res.json(forecast.map(f => ({
    timeLabel: f.timeLabel,
    tempC: f.tempC,
    humidity: f.humidity,
    windSpeedKmh: f.windSpeedKmh,
    windDirection: f.windDirection,
    pblHeightM: f.pblHeightM
  })));
});

// Regional fires endpoint
router.get("/fires", async (_req, res) => {
  try {
    const data = await getFiresSummaryAsync();
    res.json(data);
  } catch {
    res.json(getFiresSummary());
  }
});

// Pollution Plume arrival prediction endpoint
router.get("/plume", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  try {
    const data = await getPlumePredictionAsync(loc);
    res.json(data);
  } catch {
    res.json(getPlumePrediction(loc));
  }
});

// Source contribution analysis endpoint
router.get("/sources", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  let aqiVal: number | undefined;
  try {
    const cur = await getCurrentAQIAsync(loc);
    aqiVal = cur.aqi;
  } catch {
    // fallback
  }
  const data = getSourceContribution(loc, aqiVal);
  res.json(data);
});

// Health risk endpoint
router.get("/health-risk", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  let aqiVal: number | undefined;
  try {
    const cur = await getCurrentAQIAsync(loc);
    aqiVal = cur.aqi;
  } catch {
    // fallback
  }
  const data = getHealthRiskAdvice(loc, aqiVal);
  res.json(data);
});

// Predictive alerts endpoint
router.get("/alerts", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  let aqiVal: number | undefined;
  try {
    const cur = await getCurrentAQIAsync(loc);
    aqiVal = cur.aqi;
  } catch {
    // fallback
  }
  const data = getPredictiveAlerts(loc, aqiVal);
  res.json(data);
});

// Alert configure endpoint
router.post("/alerts/configure", (req, res) => {
  // Return acknowledged settings
  res.json({ success: true, settings: req.body });
});

// AI Natural-Language Air Summary
router.get("/ai/summary", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  const lang = (req.query.lang as SupportedLanguage) || "en";
  try {
    const summary = await generateAISummary(loc, lang);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate summary", details: String(err) });
  }
});

// Conversational Pollution Assistant endpoint
router.post("/chat", async (req, res) => {
  try {
    const body = req.body || {};
    const { location = "delhi", message, history = [], language = "en" } = body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message string is required" });
      return;
    }

    const response = await handleAIChat(
      location as LocationId,
      message,
      Array.isArray(history) ? history : [],
      language as SupportedLanguage
    );
    res.json(response);
  } catch (err) {
    console.error("[AirSense Chat Error]:", err);
    try {
      const body = req.body || {};
      const loc = (body.location as LocationId) || "delhi";
      const lang = (body.language as SupportedLanguage) || "en";
      const fallback = await handleAIChat(loc, body.message || "air quality update", [], lang);
      res.json(fallback);
    } catch {
      res.status(500).json({ error: "Chat processing error", details: String(err) });
    }
  }
});

// ============================================================================
// STAGE A: COUPLED WRF-CHEM & ML BIAS CORRECTION ENDPOINTS
// ============================================================================

// Coupled Forecast (Raw WRF-Chem vs ML-Corrected + Uncertainty Bounds)
router.get("/model/forecast", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  try {
    const forecast = await getCoupledAtmosphericForecast(loc);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: "Failed to load coupled forecast", details: String(err) });
  }
});

// Observation QC Status across all CAAQMS stations
router.get("/model/qc", async (_req, res) => {
  try {
    const qc = await getQCPipelineReport();
    res.json(qc);
  } catch (err) {
    res.status(500).json({ error: "Failed to load QC report", details: String(err) });
  }
});

// Model Validation Scorecard (US EPA / CPCB benchmark metrics)
router.get("/model/validation", async (_req, res) => {
  try {
    const scorecard = await getValidationScorecard();
    res.json(scorecard);
  } catch (err) {
    res.status(500).json({ error: "Failed to load validation scorecard", details: String(err) });
  }
});

// Thermodynamic Inversion Sounding & Pollution Trapping Diagnostics
router.get("/model/trapping", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  try {
    const trapping = await getTrappingDiagnostics(loc);
    res.json(trapping);
  } catch (err) {
    res.status(500).json({ error: "Failed to load trapping diagnostics", details: String(err) });
  }
});

// Simulation Cycle Status & Last Run Metadata
router.get("/model/run-cycle", async (_req, res) => {
  try {
    const status = await getSimulationCycleStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to load simulation cycle status", details: String(err) });
  }
});

// Execute Stage A Pipeline Run Trigger
router.post("/model/run-cycle", async (_req, res) => {
  try {
    const result = await runStageAPipeline();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Pipeline run failed", details: String(err) });
  }
});

// Cloudburst & Extreme Convective Predictor
router.get("/cloudburst", async (req, res) => {
  const loc = (req.query.location as LocationId) || "delhi";
  const simulate = req.query.simulate === "true" || req.query.simulate === "1";
  try {
    const report = await getCloudburstPrediction(loc, simulate);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate cloudburst report", details: String(err) });
  }
});

// Mount router on both /api and root / for seamless compatibility
app.use("/api", router);
app.use("/", router);

export default app;

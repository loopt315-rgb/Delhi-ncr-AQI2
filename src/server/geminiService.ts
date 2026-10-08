import { GoogleGenAI } from "@google/genai";
import {
  LocationId,
  SupportedLanguage,
  LiveTelemetryPayload,
  CurrentAQIResponse,
  WeatherData,
  ForecastHourPoint,
  NCRStation,
  FireSummary,
  PlumePrediction,
  HealthRiskAdvice
} from "../types";
import {
  getCurrentAQI,
  getCurrentAQIAsync,
  get72HourForecast,
  get72HourForecastAsync,
  getContributingFactors,
  getWeatherData,
  getWeatherDataAsync,
  getFiresSummary,
  getFiresSummaryAsync,
  getPlumePrediction,
  getHealthRiskAdvice,
  LOCATIONS,
  NCR_STATIONS,
  getNCRStationsAsync
} from "./dataService";

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'model';
  text: string;
}

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory cache for AI summaries with language keys to avoid hitting rate limits
const summaryCache = new Map<string, { data: { summary: string; keyDrivers: string[]; peakPeriod: string; source: "gemini" | "deterministic-grounded" }; expiresAt: number }>();
const SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

const OFFICIAL_CPCB_TABLE = `
AQI Category Standards (Source of Truth):
• 0–50: 🟢 Good — Safe for most people.
• 51–100: 🟡 Satisfactory — Generally okay, but sensitive people may notice discomfort.
• 101–200: 🟠 Moderate — People with asthma, lung or heart problems may have breathing discomfort.
• 201–300: 🔴 Poor — Breathing discomfort is possible for most people during prolonged exposure.
• 301–400: 🟣 Very Poor — Prolonged exposure can cause respiratory illness.
• 401–500: 🟤 Severe — Can affect even healthy people; serious risk for those with existing conditions.
`;

function getOfficialMeaning(aqi: number): { level: string; icon: string; meaning: string } {
  if (aqi <= 50) return { level: 'Good', icon: '🟢', meaning: 'Safe for most people.' };
  if (aqi <= 100) return { level: 'Satisfactory', icon: '🟡', meaning: 'Generally okay, but sensitive people may notice discomfort.' };
  if (aqi <= 200) return { level: 'Moderate', icon: '🟠', meaning: 'People with asthma, lung or heart problems may have breathing discomfort.' };
  if (aqi <= 300) return { level: 'Poor', icon: '🔴', meaning: 'Breathing discomfort is possible for most people during prolonged exposure.' };
  if (aqi <= 400) return { level: 'Very Poor', icon: '🟣', meaning: 'Prolonged exposure can cause respiratory illness.' };
  return { level: 'Severe', icon: '🟤', meaning: 'Can affect even healthy people; serious risk for those with existing conditions.' };
}

/**
 * Executes a Gemini API call with fallback across supported model tiers.
 * Prioritizes low-latency models with active quota headroom (gemini-3.8-flash, gemini-flash-latest).
 * Enforces strict per-call and overall execution deadlines with timer cleanup for serverless safety.
 */
async function callGeminiWithFallback<T>(
  fn: (modelName: string) => Promise<T>,
  timeoutMs: number = 8500
): Promise<T | null> {
  const models = [
    "gemini-3.8-flash",
    "gemini-flash-latest"
  ];

  const overallDeadline = Date.now() + 15000;

  for (const model of models) {
    const remainingTime = overallDeadline - Date.now();
    if (remainingTime <= 1000) break;

    const callTimeout = Math.min(timeoutMs, remainingTime);
    let timerId: NodeJS.Timeout | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => reject(new Error("call_timeout")), callTimeout);
      });
      const result = await Promise.race([fn(model), timeoutPromise]);
      if (timerId) clearTimeout(timerId);
      return result;
    } catch {
      if (timerId) clearTimeout(timerId);
      continue;
    }
  }

  return null;
}

export async function generateAISummary(
  locationId: LocationId,
  lang: SupportedLanguage = 'en'
): Promise<{
  summary: string;
  keyDrivers: string[];
  peakPeriod: string;
  source: "gemini" | "deterministic-grounded";
}> {
  // Check cache first using location and language key
  const cacheKey = `${locationId}_${lang}`;
  const cached = summaryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const current = getCurrentAQI(locationId);
  const weather = getWeatherData(locationId);
  const plume = getPlumePrediction(locationId);
  const fires = getFiresSummary();
  const factors = getContributingFactors(locationId, current.aqi);
  const locName = LOCATIONS[locationId]?.name || "Delhi NCR";
  const official = getOfficialMeaning(current.aqi);

  // Compute realistic dynamic key drivers based on AQI tier & language
  let keyDrivers: string[];
  let peakPeriod: string;

  if (lang === 'hi') {
    if (current.aqi <= 50) {
      keyDrivers = [
        "गहरी वायुमंडलीय मिश्रण परत (>1,100 मी) जो प्रदूषण को ऊपर फैला रही है",
        "लगातार बहती सतही हवाएं जो वाहनों और सड़क की धूल को साफ कर रही हैं",
        "स्वच्छ क्षेत्रीय वायु गलियारा जिसमें पराली के धुएं का कोई प्रभाव नहीं"
      ];
      peakPeriod = "अगले 24 घंटों तक स्वच्छ वायु की स्थिति बने रहने की संभावना (AQI 35–50)";
    } else if (current.aqi <= 100) {
      keyDrivers = [
        "मध्यम वायुमंडलीय मिश्रण ऊंचाई जिससे वायु गुणवत्ता स्थिर बनी हुई है",
        "शहरी परिवहन प्रदूषण का सामान्य फैलाव",
        "मजबूत थर्मल इन्वर्जन का अभाव"
      ];
      peakPeriod = `शाम के समय हल्का बदलाव संभावित (~${current.expected12hAqi} AQI)`;
    } else if (current.aqi <= 200) {
      keyDrivers = [
        "शाम के समय वाहनों का धुआं और धूल का जमाव",
        "सतही हवा की गति कम होने से क्षैतिज वेंटिलेशन में गिरावट",
        "सड़क स्तर पर सांस लेने की ऊंचाई पर फंसा धुआं"
      ];
      peakPeriod = `शाम 19:00 से 23:00 बजे के बीच चरम स्तर (~${current.expected12hAqi} AQI)`;
    } else if (current.aqi <= 300) {
      keyDrivers = [
        "शाम की सीमा परत (PBL) का 400 मीटर से नीचे संकुचन",
        "2 मी/से से कम शांत हवा की गति जो प्रदूषण को बाहर निकलने से रोक रही है",
        "क्षेत्रीय धुंध और वाहनों के धुएं का निरंतर संचय"
      ];
      peakPeriod = `आज रात 20:00 से 01:00 बजे के बीच (~${current.expected12hAqi} AQI)`;
    } else {
      keyDrivers = [
        "मजबूत भू-स्तरीय तापमान इन्वर्जन जो प्रदूषण को ऊपर उठने से रोक रहा है",
        "शांत सतही हवाएं (<1.5 मी/से) जो प्रदूषण को फैलने नहीं दे रहीं",
        `हवा के रुख पर पंजाब-हरियाणा से पराली के धुएं का आगमन (अनुमानित समय ~${plume.estimatedArrivalFormatted})`
      ];
      peakPeriod = `आज रात 21:00 से 02:00 बजे के बीच अत्यधिक स्तर (~${current.expected12hAqi} AQI)`;
    }
  } else if (lang === 'pa') {
    if (current.aqi <= 100) {
      keyDrivers = [
        "ਚੰਗੀ ਵਾਯੂਮੰਡਲੀ ਪਰਤ ਜੋ ਹਵਾ ਨੂੰ ਸਾਫ਼ ਰੱਖ ਰਹੀ ਹੈ",
        "ਕੁਦਰਤੀ ਹਵਾ ਦੀ ਚੰਗੀ ਗਤੀ",
        "ਧੂੰਏਂ ਦਾ ਘੱਟ ਪ੍ਰਭਾਵ"
      ];
      peakPeriod = "ਅਗਲੇ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਹਵਾ ਸਾਫ਼ ਰਹਿਣ ਦੀ ਉਮੀਦ";
    } else {
      keyDrivers = [
        "ਰਾਤ ਦਾ ਥਰਮਲ ਇਨਵਰਸ਼ਨ ਜੋ ਧੂੰਏਂ ਨੂੰ ਧਰਤੀ ਕੋਲ ਕੈਦ ਕਰਦਾ ਹੈ",
        "ਹਵਾ ਦੀ ਮੱਠੀ ਰਫ਼ਤਾਰ (<1.5 ਮੀ/ਸੈ)",
        "ਖੇਤਰੀ ਧੂੰਏਂ ਅਤੇ ਗੱਡੀਆਂ ਦੇ ਪ੍ਰਦੂਸ਼ਣ ਦਾ ਜਮਾਵ"
      ];
      peakPeriod = `ਅੱਜ ਰਾਤ 21:00 ਤੋਂ 02:00 ਵਜੇ ਦਰਮਿਆਨ (~${current.expected12hAqi} AQI)`;
    }
  } else {
    // English
    if (current.aqi <= 50) {
      keyDrivers = [
        "Deep atmospheric mixing layer (>1,100m) promoting rapid vertical dispersion",
        "Sustained surface winds flushing vehicular and road dust emissions",
        "Clean regional atmospheric corridor with negligible biomass smoke impact"
      ];
      peakPeriod = "Clean air conditions projected through the next 24 hours (AQI 35–50)";
    } else if (current.aqi <= 100) {
      keyDrivers = [
        "Moderate atmospheric mixing height maintaining stable air quality",
        "Normal urban transit particulate dispersion across major arterial corridors",
        "Absence of strong thermal inversion ceiling"
      ];
      peakPeriod = `Minor evening commute variance expected (~${current.expected12hAqi} AQI)`;
    } else if (current.aqi <= 200) {
      keyDrivers = [
        "Evening vehicular exhaust and road dust accumulation",
        "Lowering surface wind speeds reducing horizontal ventilation",
        "Localized combustion emissions lingering at street breathing level"
      ];
      peakPeriod = `Evening rush period between 19:00 and 23:00 IST (~${current.expected12hAqi} AQI)`;
    } else if (current.aqi <= 300) {
      keyDrivers = [
        "Descending evening planetary boundary layer trapping emissions below 400m",
        "Sub-2 m/s calm wind speed preventing horizontal advective clearing",
        "Regional background haze and vehicle exhaust accumulation"
      ];
      peakPeriod = `Tonight between 20:00 and 01:00 IST (~${current.expected12hAqi} AQI)`;
    } else {
      keyDrivers = [
        "Strong ground-level temperature inversion lid suppressing vertical dispersion",
        "Stagnant surface winds (<1.5 m/s) preventing atmospheric clearing",
        `Upwind agricultural biomass smoke plume advection (ETA ~${plume.estimatedArrivalFormatted})`
      ];
      peakPeriod = `Tonight between 21:00 and 02:00 IST (~${current.expected12hAqi} AQI)`;
    }
  }

  const ai = getGenAI();

  if (ai) {
    const langPromptInstruction = lang === 'hi'
      ? 'CRITICAL: Write your entire response in clear, formal, natural Hindi (हिन्दी) using standard Indian CPCB and meteorological terms (जैसे: वायु गुणवत्ता सूचकांक, अच्छा, मध्यम, खराब, बहुत खराब, गंभीर).'
      : lang === 'pa'
      ? 'CRITICAL: Write your entire response in natural Punjabi (ਪੰਜਾਬੀ).'
      : 'Write your response in English.';

    const prompt = `You are the lead atmospheric scientist at AirSense NCR. Generate a concise, natural-language summary (max 3 sentences) explaining air quality for ${locName}.
Ground your answer STRICTLY in these verified data points and the official Indian CPCB standard:

${OFFICIAL_CPCB_TABLE}

Current Observed Data:
- Location: ${locName}
- Observed AQI: ${current.aqi}
- Official Level: ${official.icon} ${official.level}
- What it means: "${official.meaning}"
- Current PM2.5: ${current.pollutants.pm25} µg/m³
- Trend: ${current.trendText}, projected 12h peak ~${current.expected12hAqi}
- Atmospheric summary: ${factors.headline} - ${factors.summary}

LANGUAGE REQUIREMENT:
${langPromptInstruction}

CRITICAL RULES:
- Your response MUST strictly reflect the official level (${official.level}) and its exact meaning ("${official.meaning}").
- If AQI is Good (0-50) or Satisfactory (51-100), acknowledge the clean and safe conditions. Do NOT claim severe toxic smog exists when AQI is low!
- If AQI is Poor, Very Poor, or Severe, highlight the relevant health risk and atmospheric reasons clearly.
- Keep it concise, professional, and clear.`;

    const response = await callGeminiWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      })
    );

    if (response && response.text) {
      const result = {
        summary: response.text.trim(),
        keyDrivers,
        peakPeriod,
        source: "gemini" as const,
      };

      summaryCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
      });

      return result;
    }

    console.log(`[AirSense AI] Engaging physics-grounded deterministic telemetry for ${locName} (${lang}).`);
  }

  // High quality deterministic fallback grounded in actual atmospheric physics values & official CPCB table
  let fallbackSummary = "";
  if (lang === 'hi') {
    if (current.aqi <= 50) {
      fallbackSummary = `${locName} में वायु गुणवत्ता वर्तमान में ${official.icon} अच्छी (${current.aqi} AQI) है, जो अधिकांश लोगों के लिए सुरक्षित है। अनुकूल वायुमंडलीय फैलाव और सक्रिय हवाएं स्वच्छ स्थिति बनाए रखे हुए हैं।`;
    } else if (current.aqi <= 100) {
      fallbackSummary = `${locName} में वायु गुणवत्ता वर्तमान में ${official.icon} संतोषजनक (${current.aqi} AQI) है। स्थिति सामान्यतः ठीक है, परंतु संवेदनशील लोगों को शाम के समय हल्की परेशानी हो सकती है।`;
    } else if (current.aqi <= 200) {
      fallbackSummary = `${locName} में वायु गुणवत्ता वर्तमान में ${official.icon} मध्यम (${current.aqi} AQI) है। दमा और श्वसन संबंधी समस्याओं वाले लोगों को शाम के समय सांस लेने में कठिनाई हो सकती है।`;
    } else if (current.aqi <= 300) {
      fallbackSummary = `${locName} में वायु गुणवत्ता ${official.icon} खराब (${current.aqi} AQI) श्रेणी में पहुंच गई है। धीमी हवाओं और वायुमंडलीय संकुचन के कारण लंबे समय तक बाहर रहने पर सांस लेने में असहजता हो सकती है।`;
    } else if (current.aqi <= 400) {
      fallbackSummary = `${locName} में वायु गुणवत्ता ${official.icon} बहुत खराब (${current.aqi} AQI) है। शांत सतही हवाएं (${weather.windSpeedMs} मी/से) और थर्मल इन्वर्जन प्रदूषकों को सांस लेने के स्तर पर रोके हुए हैं।`;
    } else {
      fallbackSummary = `${locName} में वायु गुणवत्ता ${official.icon} गंभीर (${current.aqi} AQI) स्तर पर पहुंच गई है। यह स्वस्थ लोगों के स्वास्थ्य पर भी गंभीर प्रभाव डाल सकती है और बीमार व्यक्तियों के लिए अत्यधिक जोखिमपूर्ण है।`;
    }
  } else if (lang === 'pa') {
    if (current.aqi <= 100) {
      fallbackSummary = `${locName} ਵਿੱਚ ਹਵਾ ਗੁਣਵੱਤਾ ਵਰਤਮਾਨ ਵਿੱਚ ${official.icon} ਸੰਤੋਖਜਨਕ (${current.aqi} AQI) ਹੈ, ਜੋ ਜ਼ਿਆਦਾਤਰ ਲੋਕਾਂ ਲਈ ਠੀਕ ਹੈ।`;
    } else {
      fallbackSummary = `${locName} ਵਿੱਚ ਹਵਾ ਗੁਣਵੱਤਾ ${official.icon} ਗੰਭੀਰ (${current.aqi} AQI) ਪੱਧਰ 'ਤੇ ਹੈ। ਸ਼ਾਂਤ ਮੌਸਮੀ ਹਾਲਾਤ ਅਤੇ ਧੂੰਆਂ ਜ਼ਮੀਨੀ ਪੱਧਰ 'ਤੇ ਪ੍ਰਦੂਸ਼ਣ ਨੂੰ ਰੋਕ ਰਹੇ ਹਨ।`;
    }
  } else {
    // English
    if (current.aqi <= 50) {
      fallbackSummary = `Air quality across ${locName} is currently ${official.icon} Good (${current.aqi} AQI), which is safe for most people. Favorable boundary layer depth and active surface winds maintain clean atmospheric conditions, with PM2.5 comfortably within safe limits.`;
    } else if (current.aqi <= 100) {
      fallbackSummary = `Air quality across ${locName} is currently ${official.icon} Satisfactory (${current.aqi} AQI). Air quality is generally okay, but sensitive people may notice minor discomfort during peak evening commute hours.`;
    } else if (current.aqi <= 200) {
      fallbackSummary = `Air quality across ${locName} is currently ${official.icon} Moderate (${current.aqi} AQI). People with asthma, lung or heart problems may have breathing discomfort upon prolonged exposure as evening winds decrease.`;
    } else if (current.aqi <= 300) {
      fallbackSummary = `Air quality across ${locName} has reached ${official.icon} Poor (${current.aqi} AQI). Breathing discomfort is possible for most people during prolonged exposure due to slowing surface winds and evening boundary layer compression.`;
    } else if (current.aqi <= 400) {
      fallbackSummary = `Air quality across ${locName} is ${official.icon} Very Poor (${current.aqi} AQI). Prolonged exposure can cause respiratory illness. Stagnant surface winds (${weather.windSpeedMs} m/s) and a ground-level thermal inversion are trapping particulate emissions close to breathing height.`;
    } else {
      fallbackSummary = `Air quality across ${locName} is ${official.icon} Severe (${current.aqi} AQI). This can affect even healthy people; serious risk for those with existing conditions. Deep atmospheric stagnation and upwind smoke trap hazardous particulates near the surface.`;
    }
  }

  const fallbackResult = {
    summary: fallbackSummary,
    keyDrivers,
    peakPeriod,
    source: "deterministic-grounded" as const,
  };

  summaryCache.set(cacheKey, {
    data: fallbackResult,
    expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
  });

  return fallbackResult;
}

export async function handleAIChat(
  locationId: LocationId,
  userMessage: string,
  history: ChatHistoryItem[] = [],
  language: SupportedLanguage = 'en',
  liveTelemetry?: LiveTelemetryPayload
): Promise<{
  text: string;
  groundedFactors: string[];
  actionLink?: string;
  actionLinkLabel?: string;
  suggestedFollowUps?: string[];
}> {
  // 1. Resolve live data — prioritize exact live telemetry sent from the website
  let current: CurrentAQIResponse;
  if (liveTelemetry?.currentAQI && typeof liveTelemetry.currentAQI.aqi === 'number') {
    current = liveTelemetry.currentAQI;
  } else {
    try {
      current = await getCurrentAQIAsync(locationId);
    } catch {
      current = getCurrentAQI(locationId);
    }
  }

  let weather: WeatherData;
  if (liveTelemetry?.weather && typeof liveTelemetry.weather.temperatureC === 'number') {
    weather = liveTelemetry.weather;
  } else {
    try {
      weather = await getWeatherDataAsync(locationId);
    } catch {
      weather = getWeatherData(locationId);
    }
  }

  let forecast: ForecastHourPoint[];
  if (Array.isArray(liveTelemetry?.forecast) && liveTelemetry.forecast.length > 0) {
    forecast = liveTelemetry.forecast;
  } else {
    try {
      forecast = await get72HourForecastAsync(locationId);
    } catch {
      forecast = get72HourForecast(locationId);
    }
  }

  let fires: FireSummary;
  if (liveTelemetry?.fires && typeof liveTelemetry.fires.totalHotspots24h === 'number') {
    fires = liveTelemetry.fires;
  } else {
    fires = getFiresSummary();
  }

  let plume: PlumePrediction;
  if (liveTelemetry?.plume && liveTelemetry.plume.originCorridor) {
    plume = liveTelemetry.plume;
  } else {
    plume = getPlumePrediction(locationId);
  }

  let health: HealthRiskAdvice;
  if (liveTelemetry?.health && (liveTelemetry.health.summary || (liveTelemetry.health as any).generalAdvice)) {
    health = liveTelemetry.health;
  } else {
    health = getHealthRiskAdvice(locationId, current.aqi);
  }

  let stationsList: NCRStation[];
  if (Array.isArray(liveTelemetry?.stations) && liveTelemetry.stations.length > 0) {
    stationsList = liveTelemetry.stations;
  } else {
    try {
      stationsList = await getNCRStationsAsync();
    } catch {
      stationsList = NCR_STATIONS;
    }
  }

  const sortedStations = [...stationsList].sort((a, b) => b.aqi - a.aqi);
  const worstStation = sortedStations[0] || NCR_STATIONS[0];
  const cleanestStation = sortedStations[sortedStations.length - 1] || NCR_STATIONS[NCR_STATIONS.length - 1];

  const factors = getContributingFactors(locationId, current.aqi);
  const locName = LOCATIONS[locationId]?.name || "Delhi NCR";
  const official = getOfficialMeaning(current.aqi);

  // Determine active GRAP (Graded Response Action Plan) Stage
  let grapStage = "GRAP Stage I (Poor: 201–300)";
  if (current.aqi > 450) {
    grapStage = "GRAP Stage IV (Severe+: >450) - Strictest restrictions, 4-wheeler diesel bans, school closures/online, truck bans";
  } else if (current.aqi > 400) {
    grapStage = "GRAP Stage III (Severe: 401–450) - Construction & demolition halt, BS-III petrol & BS-IV diesel bans";
  } else if (current.aqi > 300) {
    grapStage = "GRAP Stage II (Very Poor: 301–400) - Diesel genset bans, parking fee hikes, mechanical sweeping";
  } else if (current.aqi <= 200) {
    grapStage = "Below GRAP Threshold (Normal preventive surveillance)";
  }

  const ai = getGenAI();

  if (ai) {
    const systemInstruction = `You are "AirSense Climate & Atmospheric AI", an expert environmental scientist, meteorologist, and climate educator dedicated to the National Capital Region (Delhi, Noida, Gurugram, Ghaziabad, Faridabad) and global atmospheric science.

MISSION & ROLE:
Provide deeply informative, accurate, thoughtful, and actionable answers to ANY user input related to air quality, climate science, meteorology, public health, environmental policy, or daily life decisions. You are knowledgeable, empathetic, scientifically rigorous, and easy to understand.

MANDATORY DATA GROUNDING DIRECTIVE (SOURCE OF TRUTH — LIVE WEBSITE TELEMETRY):
You are functioning inside the live AirSense application. The user is actively looking at the website metrics on screen.
ALL numbers, statistics, rankings, pollutant concentrations, and forecasts you state MUST STRICTLY AND ACCURATELY REFLECT the exact data displaying on the website for ${locName}:

1. EXACT CURRENT AQI & POLLUTANTS ON THE WEBSITE:
- Station Name: ${current.stationName} (${locName})
- Observed AQI: ${current.aqi} (${official.icon} ${official.level})
- Official CPCB Standard: "${official.meaning}"
- PM2.5 Concentration: ${current.pollutants.pm25} µg/m³ (WHO 24h limit: 15 µg/m³, CPCB 24h standard: 60 µg/m³)
- PM10 Concentration: ${current.pollutants.pm10} µg/m³ (CPCB standard: 100 µg/m³)
- Gaseous Pollutants: NO2: ${current.pollutants.no2} µg/m³ | O3: ${current.pollutants.o3} µg/m³ | SO2: ${current.pollutants.so2} µg/m³ | CO: ${current.pollutants.co} mg/m³
- Trend & Expected Peak: ${current.trendText}, projected 12h peak is ~${current.expected12hAqi} AQI
- Source Type & Reliability: ${current.sourceType || 'Observed'} with ${current.confidencePercent}% confidence

2. EXACT ATMOSPHERIC & SURFACE WEATHER ON THE WEBSITE:
- Temperature: ${weather.temperatureC}°C | Relative Humidity: ${weather.humidityPercent}%
- Surface Wind: ${weather.windSpeedMs} m/s (${weather.windCardinal})
- Boundary Layer (PBL) Mixing Height: ${weather.pblHeightMeters} meters
- Thermal Inversion Score: ${weather.inversionScore}/100
- Rain Probability: ${weather.rainProbabilityPercent}%

3. EXACT 72-HOUR FORECAST CHART NUMBERS ON THE WEBSITE:
- +3h Outlook: AQI ${forecast[1]?.aqi || current.aqi} (${forecast[1]?.category || official.level})
- +6h Outlook: AQI ${forecast[2]?.aqi || current.aqi} (${forecast[2]?.category || official.level})
- +12h Nighttime Peak: AQI ${forecast[4]?.aqi || forecast[2]?.aqi || current.expected12hAqi} (${forecast[4]?.category || official.level})
- +24h Tomorrow Outlook: AQI ${forecast[6]?.aqi || forecast[3]?.aqi || current.aqi}

4. EXACT STATIONS RANKINGS ACROSS DELHI NCR ON THE WEBSITE:
- Highest / Most Polluted Area: ${worstStation?.name} (${worstStation?.city}) at ${worstStation?.aqi} AQI
- Cleanest / Lowest AQI Area: ${cleanestStation?.name} (${cleanestStation?.city}) at ${cleanestStation?.aqi} AQI
- Total Monitored Stations: ${stationsList.length}

5. EXACT SATELLITE STUBBLE FIRES & SMOKE PLUME ON THE WEBSITE:
- Active 24h Thermal Anomalies (NASA VIIRS): Total ${fires.totalHotspots24h} (Punjab: ${fires.byState.punjab}, Haryana: ${fires.byState.haryana})
- Smoke Plume Trajectory: Origin ${plume.originCorridor}, ETA ~${plume.estimatedArrivalFormatted}, Expected PM2.5 impact +${plume.expectedPm25ImpactPercent}%

6. EXACT REGULATORY & HEALTH PROTOCOLS ON THE WEBSITE:
- Active GRAP Stage: ${grapStage}
- Clinical Summary: ${health.summary}
- Mask Advisory: ${health.maskRecommendation}
- Outdoor Workout Advisory: ${health.outdoorExercise}
- Indoor Filtration: ${health.purifierRecommendation}

OFFICIAL CPCB NATIONAL AIR QUALITY INDEX (NAQI) DEFINITIONS:
${OFFICIAL_CPCB_TABLE}

CONVERSATION & RESPONSE STYLE:
- ALWAYS directly address the user's specific prompt first in a natural, conversational, intelligent manner.
- STRICT DATA CONSISTENCY: Every time the user asks about the current AQI, pollutants, weather, forecast, fires, or comparisons, you MUST use the exact figures listed above from the website. Never invent differing numbers.
- "CAN I GO OUT TODAY?" / OUTDOOR SAFETY DIRECTIVE:
  When the user asks "Can I go out today?", "Should I go outside?", "Is it safe to go out?", or inquires about the results/consequences of going outside:
  1. Give a definitive, unequivocal VERDICT right at the top (e.g., 🟢 Safe to go out / 🟠 Moderate caution / 🔴 Not recommended / ⛔ Strictly avoid non-essential exposure) based on the exact AQI (${current.aqi} ${official.level}) and station (${current.stationName}).
  2. Differentiate clearly between healthy adults and vulnerable groups (children, elderly, asthma/heart patients, pregnant women).
  3. Detail WHAT THE RESULTS WOULD BE IF THEY GO OUT:
     • Immediate physiological symptoms: burning/watering eyes, scratchy dry throat, coughing, airway constriction, fatigue.
     • Deep alveolar & systemic mechanism: microscopic PM2.5 (${current.pollutants.pm25} µg/m³) penetrating past the trachea into alveoli, entering the bloodstream, causing vascular inflammation and elevated cardiovascular load.
     • Vulnerable group risks: acute bronchospasm for asthmatics, children breathing ~50% more air per kg of body mass, increased cardiovascular strain for seniors.
  4. Best & worst timing of the day: safest window is mid-afternoon (13:00–16:00) when solar heating breaks the thermal inversion lid; worst windows are early morning (05:00–08:30) and late night when the nocturnal inversion lid (${weather.pblHeightMeters}m PBL) traps peak emissions.
  5. Mandatory safeguards if they must go out: certified N95/FFP2 respirator with airtight seal, vehicle AC set to internal recirculation, zero strenuous outdoor cardio, washing face/eyes upon return, and running HEPA filtration indoors.
- PERSONALITY & CONVERSATIONAL TONE: Match the user's conversational tone and emotional vibe. If the user greets you or speaks casually/friendly (e.g. "hi", "hello", "hey", "how are you", "how are u doing", "good morning", "good evening", "friend", "buddy", "thanks", "thank you"), respond warmly, politely, and conversationally in kind! Answer whatever they asked directly and naturally, while introducing yourself or offering helpful guidance for Delhi NCR.
- NEVER output robotic walls of text or irrelevant static boilerplate. Always reply directly and meaningfully according to what the user explicitly said or asked.
- Adapt your depth: if they ask a quick question, give a clear concise answer; if they ask for a deep scientific or policy explanation, provide detailed, fascinating environmental science.
- Use clean Markdown styling: bold headings, organized bullet points, and appropriate emojis. Avoid unformatted walls of text.
- Ground your responses with live telemetry where appropriate so the user gets real-time, actionable value.
- When relevant, mention 2-3 logical follow-up ideas or questions they might find helpful.
${language === 'hi' ? '- LANGUAGE MANDATE: The user has selected Hindi (हिन्दी) mode. Respond clearly, warmly, and politely in fluent Hindi (Devanagari script). Keep technical terms (like AQI, PM2.5, N95, CPCB, GRAP) in familiar form while explaining everything thoroughly in Hindi.' : language === 'pa' ? '- LANGUAGE MANDATE: The user has selected Punjabi (ਪੰਜਾਬੀ) mode. Respond clearly, warmly, and politely in fluent Punjabi (Gurmukhi script).' : ''}`;

    // Construct multi-turn contents for Gemini
    const contentsPayload: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Include recent history (up to 8 turns)
    for (const h of history.slice(-8)) {
      contentsPayload.push({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      });
    }

    // Add current user message
    contentsPayload.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await callGeminiWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      })
    );

    if (response && response.text) {
      // Determine logical action link based on user intent
      let actionLink: string | undefined;
      let actionLinkLabel: string | undefined;
      const q = userMessage.toLowerCase();
      if (q.includes("map") || q.includes("plume") || q.includes("smoke") || q.includes("fire") || q.includes("stubble")) {
        actionLink = "#map";
        actionLinkLabel = "Inspect Live Plume & Satellite Fire Map →";
      } else if (q.includes("forecast") || q.includes("tomorrow") || q.includes("weekend") || q.includes("hour")) {
        actionLink = "#forecast";
        actionLinkLabel = "View 72-Hour Numerical Forecast →";
      } else if (q.includes("why") || q.includes("inversion") || q.includes("wind") || q.includes("pbl")) {
        actionLink = "#why-changing";
        actionLinkLabel = "Explore Atmospheric Sounding & Inversion →";
      } else if (q.includes("source") || q.includes("traffic") || q.includes("vehicle") || q.includes("dust")) {
        actionLink = "#sources";
        actionLinkLabel = "View Sectoral Source Contributions →";
      } else if (q.includes("health") || q.includes("exercise") || q.includes("mask") || q.includes("run")) {
        actionLink = "#health";
        actionLinkLabel = "View Health Action Guide & Standards →";
      }

      // Generate context-aware follow-up chips
      const suggestedFollowUps: string[] = [];
      if (q.includes("exercise") || q.includes("run") || q.includes("walk")) {
        suggestedFollowUps.push("What is the best hour for a walk tomorrow?");
        suggestedFollowUps.push("How effective are N95 masks for jogging?");
      } else if (q.includes("mask") || q.includes("purifier") || q.includes("indoor")) {
        suggestedFollowUps.push("What CADR do I need for my bedroom?");
        suggestedFollowUps.push("Do indoor plants really remove PM2.5?");
      } else if (q.includes("grap") || q.includes("rule") || q.includes("ban")) {
        suggestedFollowUps.push("Are diesel cars banned in Delhi right now?");
        suggestedFollowUps.push("When will GRAP Stage 4 be lifted?");
      } else if (q.includes("why") || q.includes("inversion") || q.includes("weather")) {
        suggestedFollowUps.push("Why does pollution peak around midnight?");
        suggestedFollowUps.push("When will wind speeds increase?");
      } else {
        suggestedFollowUps.push("Is it safe for kids to play outside today?");
        suggestedFollowUps.push("Which area in Delhi has the cleanest air?");
      }

      return {
        text: response.text.trim(),
        groundedFactors: [
          `Current AQI: ${current.aqi} (${official.icon} ${official.level})`,
          `PBL Mixing Height: ${weather.pblHeightMeters}m`,
          `Surface Winds: ${weather.windSpeedMs} m/s ${weather.windCardinal}`,
          `Active Fire Count: ${fires.totalHotspots24h} (Punjab/Haryana)`
        ],
        actionLink,
        actionLinkLabel,
        suggestedFollowUps
      };
    }

    console.log(`[AirSense AI] Chat assistant fallback activated for query in ${locName}.`);
  }

  // ============================================================================
  // COMPREHENSIVE CLIMATE & ATMOSPHERIC SCIENCE DETERMINISTIC INTELLIGENCE ENGINE
  // ============================================================================
  const q = userMessage.toLowerCase().trim();

  // 0A. Friendly Greetings, How-Are-You, Pleasantries
  const isGreeting = /^(hi|hello|hey|hola|namaste|sat sri akaal|howdy|whats up|what's up|sup|greetings)\b/i.test(q) ||
    q.includes("how are you") || q.includes("how are u") || q.includes("how r u") ||
    q.includes("good morning") || q.includes("good afternoon") || q.includes("good evening") ||
    q.includes("friend") || q.includes("buddy");

  if (isGreeting) {
    if (language === 'hi') {
      return {
        text: `### 👋 नमस्ते मित्र! मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद!\n\nमैं आपका मित्रवत **एयरसेंस (AirSense) जलवायु और वायु गुणवत्ता सहायक** हूँ।\n\nवर्तमान में **${locName}** में वायु गुणवत्ता **${official.icon} ${official.level} (${current.aqi} AQI)** है।\n\nमैं आपकी क्या मदद कर सकता हूँ? आप मुझसे पूछ सकते हैं:\n* 🏃 **दैनिक जीवन:** क्या बाहर जाना या सैर करना सुरक्षित है?\n* 😷 **सुरक्षा:** कौन सा मास्क पहनें और घर में खिड़कियाँ कब खोलें?\n* 🌡️ **मौसम व वायु:** प्रदूषण क्यों बढ़ रहा है या हवा की दिशा क्या है?\n* 📜 **सरकारी नियम:** क्या GRAP के तहत गाड़ियों पर कोई प्रतिबंध है?`,
        groundedFactors: [
          `स्थिति: ${locName}`,
          `वर्तमान AQI: ${current.aqi} (${official.level})`,
          `तापमान: ${weather.temperatureC}°C | आर्द्रता: ${weather.humidityPercent}%`
        ],
        actionLink: "#health",
        actionLinkLabel: "दैनिक स्वास्थ्य एवं मौसम रिपोर्ट देखें →",
        suggestedFollowUps: [
          "क्या आज बाहर जाना सुरक्षित है?",
          "प्रदूषण से बचने के लिए क्या सावधानी बरतें?",
          "अगले 24 घंटों का मौसम और AQI कैसा रहेगा?"
        ]
      };
    }

    if (language === 'pa') {
      return {
        text: `### 👋 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੋਸਤ! ਮੈਂ ਬਿਲਕੁਲ ਠੀਕ ਹਾਂ!\n\nਮੈਂ **${locName}** ਲਈ ਤੁਹਾਡਾ ਹਵਾ ਗੁਣਵੱਤਾ ਅਤੇ ਮੌਸਮ ਸਹਾਇਕ ਹਾਂ। ਇਸ ਵੇਲੇ ਇੱਥੇ AQI **${current.aqi} (${official.level})** ਹੈ।\n\nਦੱਸੋ, ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?`,
        groundedFactors: [
          `ਸਥਾਨ: ${locName}`,
          `AQI: ${current.aqi} (${official.level})`
        ],
        actionLink: "#health",
        actionLinkLabel: "ਸਿਹਤ ਸਲਾਹ ਵੇਖੋ →",
        suggestedFollowUps: [
          "ਕੀ ਅੱਜ ਬਾਹਰ ਜਾਣਾ ਸੁਰੱਖਿਅਤ ਹੈ?",
          "ਅਗਲੇ 3 ਦਿਨਾਂ ਦੀ ਹਵਾ ਕਿਹੋ ਜਿਹੀ ਰਹੇਗੀ?"
        ]
      };
    }

    // English
    return {
      text: `### 👋 Hello friend! I'm doing great, thank you for asking!\n\nI'm **AirSense Climate & Air Quality AI**, your local environmental companion for **${locName}** and Delhi NCR.\n\nRight now in **${locName}**, the air quality is **${official.icon} ${official.level} (${current.aqi} AQI)** — *${official.meaning}*\n\nHere is a quick snapshot of current conditions:\n* 🌡️ **Weather:** ${weather.temperatureC}°C, ${weather.humidityPercent}% humidity with surface winds at ${weather.windSpeedMs} m/s (${weather.windCardinal}).\n* 🫁 **Particulate Load:** PM2.5 is at **${current.pollutants.pm25} µg/m³**.\n\nHow can I help you today? Feel free to ask me:\n* 🏃 Whether it's safe to go for a run, walk your dog, or commute\n* 😷 Which mask (like N95) or indoor purifier works best\n* 📜 Current GRAP vehicle or construction rules\n* 📈 The 72-hour air quality forecast for your neighborhood!`,
      groundedFactors: [
        `Location: ${locName}`,
        `Current AQI: ${current.aqi} (${official.level})`,
        `Surface Weather: ${weather.temperatureC}°C, Wind ${weather.windSpeedMs} m/s`,
        `Primary Particulate: PM2.5 (${current.pollutants.pm25} µg/m³)`
      ],
      actionLink: "#forecast",
      actionLinkLabel: "View 72-Hour Numerical AQI Trend →",
      suggestedFollowUps: [
        "Is it safe to go outside right now?",
        "What is the best hour for a walk tomorrow?",
        "Why is air quality changing tonight?"
      ]
    };
  }

  // 0B. Identity, Capabilities & "Who are you"
  if (q.includes("who are you") || q.includes("what is your name") || q.includes("what can you do") || q.includes("introduce yourself") || q.includes("tell me about yourself") || q.includes("what are you")) {
    return {
      text: `### 🤖 About AirSense AI\n\nI am your dedicated **Environmental Intelligence Assistant** designed specifically for the National Capital Region (Delhi, Noida, Gurugram, Ghaziabad, Faridabad).\n\n**What I can do for you:**\n* 🛰️ **Live Ground & Satellite Data:** Integrated with Central Pollution Control Board (CPCB) continuous monitoring stations and NASA VIIRS satellite stubble fire tracking.\n* 🌡️ **Atmospheric Physics:** Real-time boundary layer mixing height (PBL), thermal inversion sounding scores, and dispersion indices.\n* 🏃 **Personal Health & Activity Guidance:** Safe outdoor workout windows, N95 respirator guidelines, and vulnerable group advisories (asthma, elders, children).\n* 📜 **Regulatory Intelligence:** Real-time Graded Response Action Plan (GRAP) stage tracking, BS-III/IV diesel vehicle bans, and school notices.\n* 🔮 **72-Hour Predictions:** High-resolution numerical forecasts for AQI and individual pollutants (PM2.5, PM10, NO2, O3).\n\nFeel free to ask me anything in English, Hindi (हिन्दी), or Punjabi (ਪੰਜਾਬੀ)!`,
      groundedFactors: [
        `Active Station: ${locName} (${current.stationName})`,
        `Data Anchoring: CPCB CAAQMS + NASA VIIRS + Open-Meteo ECMWF`,
        `Current Index: ${current.aqi} AQI`
      ],
      actionLink: "#provenance",
      actionLinkLabel: "View Verification & Reliability Proof →",
      suggestedFollowUps: [
        "How is AQI calculated in India?",
        "Is it safe to exercise outdoors today?",
        "What are the GRAP Stage 3 rules?"
      ]
    };
  }

  // 0C. Gratitude & Pleasantries ("Thank you", "Thanks", "Great")
  if (q.includes("thank you") || q.includes("thanks") || q.includes("thx") || q.includes("appreciate") || q.includes("good job") || q.includes("awesome") || q.includes("nice")) {
    return {
      text: `### 😊 You're very welcome!\n\nI'm always here to help you stay informed, healthy, and breathing safe air across ${locName}.\n\nRemember to check back whenever you plan to head outside, exercise, or adjust your home ventilation. Stay safe and have a wonderful day! 🌿`,
      groundedFactors: [
        `Location: ${locName}`,
        `Current Status: ${current.aqi} AQI (${official.level})`
      ],
      suggestedFollowUps: [
        "What is the forecast for tomorrow?",
        "Which area in Delhi NCR has the cleanest air?",
        "What are the best indoor air purifying plants?"
      ]
    };
  }

  // 0D. Farewells ("Bye", "Goodbye", "Good night")
  if (q.includes("bye") || q.includes("goodbye") || q.includes("good night") || q.includes("see you") || q.includes("take care")) {
    return {
      text: `### 👋 Goodbye and take care!\n\nRemember: if you're sleeping in **${locName}** tonight, keep windows closed during overnight hours when the thermal inversion ceiling drops. Keep your air filter running for restful sleep.\n\nFeel free to say hi anytime you need a quick weather or pollution check! 🌙`,
      groundedFactors: [
        `Overnight Inversion Index: ${weather.inversionScore}/100`,
        `Projected Peak: ~${current.expected12hAqi} AQI`
      ],
      suggestedFollowUps: [
        "What will the AQI be when I wake up tomorrow?",
        "When is the safest time to open windows?"
      ]
    };
  }

  // 0E. Humor & Jokes
  if (q.includes("joke") || q.includes("laugh") || q.includes("funny")) {
    return {
      text: `### 😄 Here's an atmospheric scientist's joke for you!\n\n**Q:** Why did the atmospheric thermal inversion get kicked out of the party?\n\n**A:** Because it put a lid on everyone and wouldn't let anyone disperse!\n\nOn a serious note, while Delhi's winter inversion traps smoke and dust down here, you can always check our **72-hour forecast** to find the exact hours when winds pick up and clear things out! 🌤️`,
      groundedFactors: [
        `Inversion Index: ${weather.inversionScore}/100`,
        `Surface Wind: ${weather.windSpeedMs} m/s`
      ],
      actionLink: "#why-changing",
      actionLinkLabel: "Learn how the thermal inversion works →",
      suggestedFollowUps: [
        "When will the wind pick up to clear the smog?",
        "What is the forecast for tomorrow afternoon?"
      ]
    };
  }

  // 0F. Comprehensive "Can I Go Out Today?" / Outdoor Safety & Consequences Engine
  const isGoingOutQuery =
    q.includes("go out") ||
    q.includes("go outside") ||
    q.includes("going out") ||
    q.includes("going outside") ||
    q.includes("step out") ||
    q.includes("stepping out") ||
    q.includes("safe to go") ||
    q.includes("can i go") ||
    q.includes("should i go") ||
    q.includes("what if i go out") ||
    q.includes("what happens if i go out") ||
    q.includes("result if i go out") ||
    q.includes("results if i go out") ||
    q.includes("can i walk outside") ||
    q.includes("can i run outside") ||
    q.includes("office") ||
    q.includes("market") ||
    q.includes("shopping") ||
    q.includes("kids") ||
    q.includes("school") ||
    q.includes("elderly") ||
    q.includes("dog walk") ||
    q.includes("बाहर") ||
    q.includes("सैर") ||
    q.includes("ਘੁੰਮਣ") ||
    q.includes("ਜਾ ਸਕਦਾ") ||
    q.includes("ਬਾਹਰ");

  if (isGoingOutQuery) {
    const isGood = current.aqi <= 50;
    const isSatisfactory = current.aqi <= 100;
    const isModerate = current.aqi <= 200;
    const isPoor = current.aqi <= 300;
    const isVeryPoor = current.aqi <= 400;
    const isSevere = current.aqi > 400;

    let verdictTitle = "";
    let verdictSummary = "";

    if (isGood) {
      verdictTitle = "🟢 YES, COMPLETELY SAFE TO GO OUT";
      verdictSummary = "Air quality is pristine across the airshed. Enjoy unrestricted outdoor activities, workouts, and family movement.";
    } else if (isSatisfactory) {
      verdictTitle = "🟢 YES, GENERALLY SAFE (MINOR SENSITIVITY CAUTION)";
      verdictSummary = "Safe for the general public for normal activities. Highly sensitive individuals with chronic bronchitis or severe asthma should monitor comfort.";
    } else if (isModerate) {
      verdictTitle = "🟠 MODERATE CAUTION — GENERAL ADULTS MAY GO OUT, LIMIT TIME FOR SENSITIVE GROUPS";
      verdictSummary = "Healthy adults can commute and do normal brief outdoor errands. However, children, seniors, and asthma patients should avoid strenuous outdoor exertion.";
    } else if (isPoor) {
      verdictTitle = "🔴 NOT RECOMMENDED FOR PROLONGED EXPOSURE — ESSENTIAL OUTINGS ONLY";
      verdictSummary = "Breathing discomfort is probable upon prolonged outdoor exposure. Avoid unnecessary leisure outings, keep commutes brief, and wear an N95 respirator.";
    } else if (isVeryPoor) {
      verdictTitle = "🔴 STRONGLY DISCOURAGED OUTDOORS — SIGNIFICANT RESPIRATORY & VASCULAR RISK";
      verdictSummary = "Air is toxic at breathing height due to temperature inversion trapping. Stay indoors whenever possible. If you must step out for essential work, strict N95 protection is mandatory.";
    } else {
      verdictTitle = "⛔ EMERGENCY ALERT — STRICTLY AVOID GOING OUT";
      verdictSummary = "Hazardous severe pollution levels. Outdoor air can trigger acute respiratory illness even in healthy individuals and severe cardiovascular stress in vulnerable groups.";
    }

    if (language === 'hi') {
      return {
        text: `### 🚶 क्या आज बाहर जाना सुरक्षित है? (${locName} विश्लेषण)\n\n**निर्णय (Direct Verdict):** ${isGood || isSatisfactory ? '🟢 हाँ, बाहर जाना सुरक्षित है।' : isModerate ? '🟠 मध्यम सावधानी: सामान्य काम के लिए बाहर जा सकते हैं, पर संवेदनशील लोग बचें।' : '🔴 बाहर जाने से बचें — केवल अति-आवश्यक काम पर ही निकलें।'}\n\n* **वर्तमान स्टेशन:** ${current.stationName}\n* **प्रदर्शित AQI:** **${current.aqi}** (${official.icon} ${official.level}) — *"${official.meaning}"*\n* **PM2.5 सांद्रता:** **${current.pollutants.pm25} µg/m³** (WHO मानक 15 से ${(current.pollutants.pm25 / 15).toFixed(1)} गुना अधिक)\n* **वायुमंडलीय स्थिति:** तापमान ${weather.temperatureC}°C, हवा की गति ${weather.windSpeedMs} मी/से (${weather.windCardinal}), इन्वर्जन इंडेक्स ${weather.inversionScore}/100\n* **GRAP नियम:** ${grapStage}\n\n---\n\n### ⚠️ यदि आप बाहर जाते हैं तो क्या परिणाम और प्रभाव होंगे?\n1. **तात्कालिक लक्षण (30-60 मिनट में):**\n   * आँखों में जलन, चुभन और पानी आना।\n   * गले में खराश, सूखापन और बार-बार खाँसी।\n   * साँस लेने में भारीपन और थकान।\n2. **शरीर के अंदर गहरा प्रभाव (डीप पल्मोनरी मैकेनिज़्म):**\n   * ${current.pollutants.pm25} µg/m³ वाले अति-सूक्ष्म PM2.5 कण नाक के बालों और बलगम को पार करके सीधे फेफड़ों की वायु-कोशिकाओं (Alveoli) में पहुँच जाते हैं।\n   * वहाँ से ये कण सीधे रक्तप्रवाह में प्रवेश करते हैं, जिससे रक्त धमनियों में सूजन (Vascular Inflammation) और ब्लड प्रेशर में वृद्धि होती है।\n3. **संवेदनशील समूहों पर प्रभाव:**\n   * **बच्चे:** वयस्कों की तुलना में प्रति किलो वजन पर अधिक हवा साँस में लेते हैं, जिससे उनके फेफड़ों को तीव्र नुकसान होता है।\n   * **अस्थमा/हृदय रोगी:** ब्रोंकोस्पास्म (साँस फूलना) का तेज दौरा पड़ सकता है।\n\n---\n\n### ⏰ बाहर जाने का सबसे सुरक्षित व सबसे खतरनाक समय:\n* ☀️ **सबसे सुरक्षित समय:** **दोपहर 1:00 बजे से शाम 4:00 बजे तक** — जब धूप से धरातल गर्म होता है और थर्मल इन्वर्जन की छत टूटकर प्रदूषक ऊपर फैलते हैं।\n* 🌙 **सबसे खतरनाक समय:** **सुबह 5:00 से 8:30 बजे** तथा **रात 8:00 से 1:00 बजे** — जब ठंड के कारण प्रदूषण ज़मीनी स्तर पर कैद रहता है।\n\n---\n\n### 🛡️ यदि बाहर जाना ही पड़े तो अनिवार्य सावधानियां:\n1. केवल **N95 या FFP2 रेस्पिरेटर** पहनें जो चेहरे पर पूरी तरह सील हो (कपड़े का मास्क PM2.5 को नहीं रोकता)।\n2. बाहर तेज दौड़ना, व्यायाम या साइकिल चलाना बिल्कुल न करें।\n3. कार में यात्रा करते समय खिड़कियां बंद रखें और AC को **Internal Air Recirculation** मोड पर चलाएं।\n4. घर लौटने पर तुरंत मुँह और आँखों को ठंडे ताजे पानी से धोएं।`,
        groundedFactors: [
          `निर्णय: ${isGood || isSatisfactory ? 'सुरक्षित' : isModerate ? 'मध्यम' : 'असुरक्षित'}`,
          `प्रदर्शित AQI: ${current.aqi} (${official.level})`,
          `PM2.5: ${current.pollutants.pm25} µg/m³`,
          `मास्क सलाह: ${health.maskRecommendation}`
        ],
        actionLink: "#health",
        actionLinkLabel: "विस्तृत स्वास्थ्य व क्लिनिकल प्रोटोकॉल देखें →",
        suggestedFollowUps: [
          "क्या सुबह की सैर करना सुरक्षित है?",
          "सर्दियों में कौन सा N95 मास्क सबसे अच्छा है?",
          "घर में खिड़कियाँ किस समय खोलनी चाहिए?"
        ]
      };
    }

    if (language === 'pa') {
      return {
        text: `### 🚶 ਕੀ ਅੱਜ ਬਾਹਰ ਜਾਣਾ ਸੁਰੱਖਿਅਤ ਹੈ? (${locName})\n\n**ਸਪਸ਼ਟ ਫੈਸਲਾ:** ${isGood || isSatisfactory ? '🟢 ਹਾਂ, ਬਾਹਰ ਜਾਣਾ ਸੁਰੱਖਿਅਤ ਹੈ।' : isModerate ? '🟠 ਸਾਵਧਾਨੀ ਵਰਤੋ: ਜ਼ਰੂਰੀ ਕੰਮ ਲਈ ਜਾ ਸਕਦੇ ਹੋ।' : '🔴 ਬਾਹਰ ਜਾਣ ਤੋਂ ਬਚੋ — ਹਵਾ ਜ਼ਹਿਰੀਲੀ ਹੈ।'}\n\n* **ਮੌਜੂਦਾ ਸਟੇਸ਼ਨ:** ${current.stationName}\n* **ਪ੍ਰਦਰਸ਼ਿਤ AQI:** **${current.aqi}** (${official.icon} ${official.level})\n* **PM2.5:** **${current.pollutants.pm25} µg/m³** (${(current.pollutants.pm25 / 15).toFixed(1)}x WHO ਮਿਆਰ)\n* **ਮੌਸਮ:** ਤਾਪਮਾਨ ${weather.temperatureC}°C, ਹਵਾ ${weather.windSpeedMs} ਮੀ/ਸੈ, ਇਨਵਰਜ਼ਨ ਸਕੋਰ ${weather.inversionScore}/100\n\n### ⚠️ ਜੇਕਰ ਤੁਸੀਂ ਬਾਹਰ ਜਾਂਦੇ ਹੋ ਤਾਂ ਕੀ ਨਤੀਜੇ ਹੋਣਗੇ?\n* ਅੱਖਾਂ ਵਿੱਚ ਜਲਣ ਅਤੇ ਗਲੇ ਵਿੱਚ ਖਰਾਸ਼।\n* PM2.5 ਦੇ ਬਰੀਕ ਕਣ ਫੇਫੜਿਆਂ ਰਾਹੀਂ ਖੂਨ ਵਿੱਚ ਪਹੁੰਚ ਕੇ ਸੋਜਸ਼ ਪੈਦਾ ਕਰਦੇ ਹਨ।\n* ਦਮੇ ਦੇ ਮਰੀਜ਼ਾਂ ਅਤੇ ਬੱਚਿਆਂ ਲਈ ਬਹੁਤ ਵੱਡਾ ਜੋਖਮ ਹੈ।\n\n### 🛡️ ਸਾਵਧਾਨੀਆਂ:\n* ਪ੍ਰਮਾਣਿਤ N95 ਮਾਸਕ ਪਾਓ।\n* ਦੁਪਹਿਰ 1:00 ਤੋਂ 4:00 ਵਜੇ ਦਾ ਸਮਾਂ ਸਭ ਤੋਂ ਘੱਟ ਪ੍ਰਦੂਸ਼ਿਤ ਹੁੰਦਾ ਹੈ; ਸਵੇਰੇ-ਸ਼ਾਮ ਬਾਹਰ ਨਾ ਨਿਕਲੋ।`,
        groundedFactors: [
          `ਫੈਸਲਾ: ${isGood || isSatisfactory ? 'ਸੁਰੱਖਿਅਤ' : 'ਅਸੁਰੱਖਿਅਤ'}`,
          `AQI: ${current.aqi} (${official.level})`,
          `PM2.5: ${current.pollutants.pm25} µg/m³`
        ],
        actionLink: "#health",
        actionLinkLabel: "ਕਲੀਨਿਕਲ ਸਿਹਤ ਸਲਾਹ ਵੇਖੋ →",
        suggestedFollowUps: [
          "ਕੀ ਕੱਲ੍ਹ ਹਵਾ ਸੁਧਰ ਜਾਵੇਗੀ?",
          "ਕਿਹੜਾ ਮਾਸਕ PM2.5 ਨੂੰ ਰੋਕਦਾ ਹੈ?"
        ]
      };
    }

    // English Comprehensive Response
    return {
      text: `### 🚶 Outdoor Exposure Decision & Risk Evaluation for ${locName}\n\n#### 🎯 DIRECT VERDICT: ${verdictTitle}\n${verdictSummary}\n\n---\n\n#### 📊 Live Website Telemetry Considered:\n* **Selected Station:** **${current.stationName}** (${locName})\n* **Observed AQI:** **${current.aqi}** (${official.icon} **${official.level}**) — *"${official.meaning}"*\n* **PM2.5 Concentration:** **${current.pollutants.pm25} µg/m³** (${(current.pollutants.pm25 / 15).toFixed(1)}x WHO 24h limit of 15 µg/m³; CPCB limit: 60 µg/m³)\n* **PM10 Dust Level:** **${current.pollutants.pm10} µg/m³** (CPCB limit: 100 µg/m³)\n* **Atmospheric State:** Surface Temp **${weather.temperatureC}°C**, Humidity **${weather.humidityPercent}%**, Winds **${weather.windSpeedMs} m/s ${weather.windCardinal}**, Mixing Height **${weather.pblHeightMeters}m**, Inversion Index **${weather.inversionScore}/100**\n* **Active GRAP Stage:** **${grapStage}**\n* **Regional Smoke & Fire Impact:** **${fires.totalHotspots24h}** active fires via corridor **${plume.originCorridor}** (+${plume.expectedPm25ImpactPercent}% PM2.5)\n\n---\n\n#### ⚠️ What Are the Results & Consequences If You Go Out?\n\n1. **Immediate Acute Symptoms (Within 30–60 Minutes):**\n   * **Ocular Irritation:** Eye burning, stinging, and redness triggered by airborne nitrates and secondary oxidants.\n   * **Upper Respiratory Irritation:** Scratchy dry throat, post-nasal drip, hoarseness, and persistent coughing.\n   * **Airway Resistance:** Chest tightness and reduced peak expiratory volume as bronchial airways constrict.\n   * **Headache & Fatigue:** Reduced blood oxygenation combined with ambient carbon monoxide (${current.pollutants.co} mg/m³).\n\n2. **Deep Cellular & Vascular Damage (Microscopic Mechanism):**\n   * Because PM2.5 particulates are sub-micron (<2.5 µm), they bypass the body's natural nasal cilia and mucus defenses.\n   * They travel directly into the terminal bronchioles and alveolar sacs, where they translocate across the alveolar-capillary barrier straight into the bloodstream.\n   * This triggers acute vascular endothelial inflammation, oxidative stress, arterial constriction, elevated heart rate, and increased risk of thrombosis.\n\n3. **Specific Impact on Sensitive Groups:**\n   * **Children:** Inhale ~50% more air per pound of body weight than adults, driving toxic particles directly into developing alveolar tissue.\n   * **Asthma / Respiratory Patients:** Inhaling high-density particulates triggers reactive bronchospasms, severe wheezing, and frequent emergency inhaler use.\n   * **Elderly & Cardiovascular Patients:** Increased systemic arterial stiffness raises the risk of ischemic events, angina, and arrhythmias.\n\n---\n\n#### ⏰ Best & Worst Hours of the Day (Timing Analysis):\n* ☀️ **Safest Window (13:00 to 16:00 IST):**\n  * Daytime solar insolation heats the ground surface, temporarily breaking the nocturnal thermal inversion lid.\n  * The boundary layer expands, allowing particulates to disperse into a taller column of air. If you must run errands, do so in this window.\n* 🌙 **Most Hazardous Windows (05:00 to 08:30 IST & 20:00 to 01:00 IST):**\n  * Nighttime infrared radiation cools the ground rapidly, dropping the inversion lid to just **${weather.pblHeightMeters} meters**.\n  * Surface winds stall to **${weather.windSpeedMs} m/s**, compressing vehicular exhaust and regional smoke into an ultra-dense blanket right at breathing height. **Avoid all outdoor movement during these hours.**\n\n---\n\n#### 🛡️ Mandatory Precautions If You Must Go Out:\n1. 😷 **Certified N95 / FFP2 Respirator:** Must be worn with an airtight facial seal. Surgical masks or cloth bandanas have large pore sizes (100–200 µm) and leak around the sides, failing against PM2.5.\n2. 🚫 **No Outdoor Cardio / Exercise:** Strenuous workouts increase minute ventilation rate by 4x to 8x (60–100 L/min), driving millions of toxic particles deep into the pulmonary bed.\n3. 🚗 **Commuting:** Keep car windows tightly rolled up and set the air conditioning strictly to **Internal Air Recirculation** mode.\n4. 🚿 **Post-Exposure Care:** Upon returning indoors, immediately wash your eyes and face with cool water, change outer garments, and stay in a room with a True HEPA air purifier running.`,
      groundedFactors: [
        `Verdict: ${verdictTitle.split(' — ')[0]}`,
        `Observed AQI: ${current.aqi} (${official.level})`,
        `PM2.5: ${current.pollutants.pm25} µg/m³ (${(current.pollutants.pm25 / 15).toFixed(1)}x WHO)`,
        `Safest Window: Mid-afternoon (13:00 - 16:00)`,
        `Mask Protocol: ${health.maskRecommendation}`
      ],
      actionLink: "#health",
      actionLinkLabel: "View Clinical Health Action Timeline →",
      suggestedFollowUps: [
        "What is the best hour for a walk tomorrow?",
        "Which mask effectively stops PM2.5 particulates?",
        "What CADR air purifier do I need for my room?"
      ]
    };
  }

  // 1. GRAP & Environmental Policy Queries
  if (q.includes("grap") || q.includes("policy") || q.includes("rule") || q.includes("ban") || q.includes("odd even") || q.includes("diesel") || q.includes("construction")) {
    const isSevere = current.aqi > 400;
    return {
      text: `### 📜 Graded Response Action Plan (GRAP) Status\n\n**Current Active Level:** ${grapStage}\n\nUnder the Commission for Air Quality Management (CAQM), GRAP enforces tiered emergency measures across Delhi NCR:\n\n* **Stage I (AQI 201–300, Poor):** Strict dust suppression at construction sites, ban on open biomass burning, intensified water sprinkling on arterial roads.\n* **Stage II (AQI 301–400, Very Poor):** Ban on diesel generator sets (except essential services), enhanced parking fees to discourage personal vehicles, increased metro/bus frequency.\n* **Stage III (AQI 401–450, Severe):** Total halt on non-essential construction & demolition, ban on BS-III petrol & BS-IV diesel 4-wheelers, closure of stone crushers and brick kilns.\n* **Stage IV (AQI >450, Severe+):** Entry ban on non-essential commercial trucks into Delhi, shift of primary/middle schools to online mode, 50% work-from-home advisory, possible odd-even vehicle rationing.\n\n**Status in ${locName}:** With current AQI at **${current.aqi}**, ${isSevere ? 'Stage III/IV emergency curbs are heavily monitored.' : 'preventive enforcement is active.'}`,
      groundedFactors: [
        `Active Tier: ${grapStage.split(' - ')[0]}`,
        `Current AQI: ${current.aqi} (${official.level})`,
        `Location: ${locName}`
      ],
      actionLink: "#health",
      actionLinkLabel: "View CPCB Air Quality Reference Standards →",
      suggestedFollowUps: [
        "Are BS-IV diesel cars allowed in Delhi right now?",
        "What are the school closure rules under GRAP?",
        "How effective has the Odd-Even scheme been?"
      ]
    };
  }

  // 2. Pollutants Chemistry & Science (PM2.5 vs PM10, NO2, Ozone)
  if (q.includes("pm2.5") || q.includes("pm10") || q.includes("difference") || q.includes("particulate") || q.includes("pollutant") || q.includes("no2") || q.includes("ozone")) {
    return {
      text: `### 🔬 Particle & Chemical Pollutant Science\n\nAir quality is governed by fine and coarse suspended particulates:\n\n* **PM2.5 (Fine Respirable Particulates < 2.5 µm):**\n  * **Size:** About 1/30th the diameter of a single human hair.\n  * **Current in ${locName}:** **${current.pollutants.pm25} µg/m³** (${(current.pollutants.pm25 / 15).toFixed(1)}x WHO guideline).\n  * **Why it matters:** Because they are so microscopic, they bypass the nasal cilia, penetrate deep into lung alveoli, and directly cross into the bloodstream, triggering vascular inflammation.\n  * **Key Sources:** Secondary ammonium nitrates/sulfates, vehicle exhaust, biomass combustion smoke.\n\n* **PM10 (Coarse Inhalable Dust 2.5–10 µm):**\n  * **Current in ${locName}:** **${current.pollutants.pm10} µg/m³**.\n  * **Key Sources:** Road dust suspension, construction debris, mechanical abrasive wear (tires & brakes).\n\n* **Gaseous Pollutants:**\n  * **NO2 (${current.pollutants.no2} µg/m³):** Emitted directly from diesel & petrol engines; acts as a precursor to ground-level ozone and nitrate aerosols.\n  * **O3 (${current.pollutants.o3} µg/m³):** Formed photochemically during sunny afternoon hours when NOx and volatile organic compounds (VOCs) react.`,
      groundedFactors: [
        `PM2.5: ${current.pollutants.pm25} µg/m³`,
        `PM10: ${current.pollutants.pm10} µg/m³`,
        `NO2: ${current.pollutants.no2} µg/m³`
      ],
      actionLink: "#sources",
      actionLinkLabel: "Inspect Sectoral Source Contributions →",
      suggestedFollowUps: [
        "Why can't our lungs filter out PM2.5?",
        "Which mask can stop PM2.5 particulates?",
        "Where does most NO2 come from in Delhi?"
      ]
    };
  }

  // 3. Thermal Inversion, Meteorology & Boundary Layer
  if (q.includes("inversion") || q.includes("mixing") || q.includes("pbl") || q.includes("lid") || q.includes("cold") || q.includes("winter") || q.includes("fog") || q.includes("smog") || q.includes("weather")) {
    return {
      text: `### 🌡️ The Atmospheric Physics of Delhi's Winter Smog\n\nWhy does pollution spike so sharply in winter even when emissions stay constant? The answer lies in **Thermal Inversion** and **Boundary Layer Compression**:\n\n1. **Normal Day Atmosphere:** The sun heats the earth's surface. Warm air rises rapidly, carrying pollutants high into the upper atmosphere where strong tropospheric winds disperse them.\n2. **Nocturnal Thermal Inversion:** On clear autumn and winter nights, the ground rapidly loses infrared heat into space. A layer of warm air settles *above* a cold ground layer. This creates a literal **atmospheric ceiling (thermal lid)**.\n3. **Planetary Boundary Layer (PBL) Squeeze:**\n   * In summer, the mixing height reaches **2,000m+**.\n   * Right now over ${locName}, the mixing depth has collapsed down to **${weather.pblHeightMeters} meters** with an Inversion Score of **${weather.inversionScore}/100**.\n   * The total volume of air available to dilute vehicle fumes, smoke, and dust is compressed by up to 80%.\n4. **Surface Wind Stagnation:** Surface winds are currently **${weather.windSpeedMs} m/s** (${weather.windCardinal}). Winds below 2.0 m/s cannot sweep particulates out of the Indo-Gangetic basin.`,
      groundedFactors: [
        `PBL Height: ${weather.pblHeightMeters}m`,
        `Inversion Score: ${weather.inversionScore}/100`,
        `Wind: ${weather.windSpeedMs} m/s (${weather.windCardinal})`,
        `Temperature: ${weather.temperatureC}°C`
      ],
      actionLink: "#why-changing",
      actionLinkLabel: "Explore Atmospheric Sounding Graph →",
      suggestedFollowUps: [
        "At what time of day is thermal inversion strongest?",
        "How does rain clear up an inversion?",
        "Why is the Indo-Gangetic plain especially vulnerable?"
      ]
    };
  }

  // 4. Masks & Respiratory Protection
  if (q.includes("mask") || q.includes("n95") || q.includes("cloth") || q.includes("respirator") || q.includes("surgical") || q.includes("protect")) {
    return {
      text: `### 😷 Clinical Respiratory Protection Guide\n\nNot all masks protect against winter smog. Here is the medical consensus on mask efficacy against fine sub-micron particulates (PM2.5):\n\n* **N95 / FFP2 Respirators (Highly Recommended):**\n  * **Filtration Efficiency:** Filters ≥95% of airborne particles down to 0.3 microns.\n  * **Key Feature:** Electrostatic melt-blown filter media that traps particles through diffusion and electrostatic attraction.\n  * **Fit Matters:** A tight facial seal with an adjustable metal nose clip is mandatory. Facial hair or side gaps drop real-world filtration below 60%.\n* **Surgical / Three-Ply Masks (Ineffective for PM2.5):**\n  * Designed to catch large fluid droplets from the wearer, not fine sub-micron aerosol particles. Gaps at the cheeks allow polluted air to bypass the filter.\n* **Cloth / Bandana Masks (Virtually Zero PM2.5 Protection):**\n  * Woven cotton fabric weaves have pore sizes of 100–200 microns — PM2.5 particulates slip straight through.\n\n**Current Recommendation for ${locName}:** ${health.maskRecommendation}`,
      groundedFactors: [
        `Current AQI: ${current.aqi} (${official.level})`,
        `PM2.5 Concentration: ${current.pollutants.pm25} µg/m³`,
        `Guideline: N95/FFP2 with airtight facial seal`
      ],
      actionLink: "#health",
      actionLinkLabel: "Open Clinical Health Guidance Card →",
      suggestedFollowUps: [
        "Can an N95 mask be washed and reused?",
        "Are masks with exhalation valves safe?",
        "What masks are recommended for young children?"
      ]
    };
  }

  // 5. Air Purifiers, HEPA Filters & Indoor Air Quality
  if (q.includes("purifier") || q.includes("hepa") || q.includes("indoor") || q.includes("plant") || q.includes("filter") || q.includes("room") || q.includes("window")) {
    return {
      text: `### 🏠 Indoor Air Quality & Purifier Optimization\n\nIndoor PM2.5 typically mirrors 60–80% of outdoor air unless actively filtered. Here is how to keep indoor air safe in ${locName}:\n\n1. **True HEPA H13 Filter:** Ensure the purifier uses a mechanical True HEPA H13 or H14 filter (capturing 99.97% of particulates down to 0.3 microns). Avoid ionic or electrostatic purifiers that generate secondary ozone.\n2. **CADR (Clean Air Delivery Rate):** Sizing rule of thumb:\n   * **CADR (in m³/hr) should equal at least 5x your room volume.**\n   * Example: A 150 sq ft bedroom (~35 m³) needs a purifier with CADR ≥ 180 m³/hr for 5 air changes per hour (ACH).\n3. **Window Management:** Keep doors and windows firmly shut between **18:00 and 10:00 IST**, when boundary layer inversion traps peak concentrations at ground level.\n4. **Indoor Sources to Avoid:** Burning incense sticks (agarbatti), mosquito coils, or unvented gas cooktops can spike indoor PM2.5 past 500 µg/m³ in minutes.\n5. **Indoor Plants:** NASA clean-air plants (Snake Plant / Sansevieria, Areca Palm, Spider Plant) help absorb VOCs and produce oxygen, but *cannot* substitute for a mechanical HEPA filter for high-density PM2.5.`,
      groundedFactors: [
        `Indoor Strategy: ${health.purifierRecommendation}`,
        `Current Outdoor AQI: ${current.aqi} (${official.level})`,
        `PBL Inversion Peak: Nighttime`
      ],
      actionLink: "#health",
      actionLinkLabel: "Review Indoor Mitigation Protocols →",
      suggestedFollowUps: [
        "How often should I replace my HEPA filter in Delhi?",
        "Is it safe to open windows in the afternoon?",
        "Do air purifiers consume a lot of electricity?"
      ]
    };
  }

  // 6. Stubble Burning, Agronomy & Crop Residue
  if (q.includes("stubble") || q.includes("parali") || q.includes("farm") || q.includes("punjab") || q.includes("haryana") || q.includes("fire") || q.includes("smoke") || q.includes("satellite")) {
    return {
      text: `### 🌾 Stubble Burning (Parali) & Regional Airshed Dynamics\n\nAgricultural crop residue burning in Punjab and Haryana is a major seasonal driver of episodic spikes:\n\n* **Why Farmers Burn:** Farmers have a very narrow window of 10–14 days between harvesting paddy (rice) and sowing wheat. Clearing dense, silica-rich paddy straw mechanically was historically expensive, making field burning the fastest option.\n* **Current NASA VIIRS Satellite Hotspots:**\n  * **Punjab:** ${fires.byState.punjab} active thermal anomalies\n  * **Haryana:** ${fires.byState.haryana} active thermal anomalies\n  * **Total 24h Hotspots:** **${fires.totalHotspots24h}** fires\n* **Smoke Plume Trajectory:** Plumes originating from the ${plume.originCorridor} travel along prevailing northwest winds towards the Delhi NCR bowl.\n* **ETA & Impact for ${locName}:** Peak plume arrival estimated around **${plume.estimatedArrivalFormatted}**, adding an estimated **+${plume.expectedPm25ImpactPercent}%** to local PM2.5 levels.\n* **Long-Term Solutions:** In-situ mechanization (Happy Seeder, Super-SMS harvesters), Pusa bio-decomposer fungal sprays, and ex-situ biomass pelletization for thermal power plants.`,
      groundedFactors: [
        `Active Fire Count: ${fires.totalHotspots24h}`,
        `Punjab Fires: ${fires.byState.punjab} | Haryana: ${fires.byState.haryana}`,
        `Plume Impact: +${plume.expectedPm25ImpactPercent}% PM2.5`,
        `Origin Corridor: ${plume.originCorridor}`
      ],
      actionLink: "#map",
      actionLinkLabel: "View Live Satellite Hotspots & Smoke Plumes →",
      suggestedFollowUps: [
        "What is the Pusa bio-decomposer spray?",
        "When does stubble burning season officially end?",
        "What percentage of Delhi's pollution comes from stubble?"
      ]
    };
  }

  // 7. Outdoor Exercise, Running, Walking & Sports
  if (q.includes("exercise") || q.includes("run") || q.includes("walk") || q.includes("jog") || q.includes("outside") || q.includes("outdoor") || q.includes("gym") || q.includes("morning")) {
    const isClean = current.aqi <= 100;
    const isModerate = current.aqi <= 200;

    return {
      text: `### 🏃 Exercise & Physical Activity Advisory\n\n* **Current AQI in ${locName}:** **${current.aqi}** (${official.icon} ${official.level})\n* **Clinical Standard:** ${official.meaning}\n\n**Cardio & Tidal Breathing Mechanics:**\nWhen running or doing intense aerobic workouts, your minute ventilation rate increases by 4x to 8x (up to 60–100 liters of air per minute), and mouth breathing bypasses natural nasal filtration. This deposits massive amounts of PM2.5 deep into the bronchial tree.\n\n**Actionable Advice for Today:**\n* **Outdoor Strenuous Cardio:** ${isClean ? '🟢 Safe and encouraged! Clean atmospheric conditions.' : isModerate ? '🟠 Moderate caution: Reduce duration; avoid busy traffic corridors.' : '🔴 Strictly NOT recommended outdoors. Shift workouts to well-ventilated indoor spaces with HEPA purification.'}\n* **Morning vs. Afternoon:** If you must walk outside, **never go during early morning hours (05:00–08:30 AM)** when radiative inversion traps maximum toxins at ground level. The safest window is **mid-afternoon (13:00–16:00)** when solar heating temporarily expands the boundary layer.\n* **Sensitive Groups:** Children, seniors, and anyone with asthma or hypertension should avoid all outdoor exertion under current levels.`,
      groundedFactors: [
        `Observed AQI: ${current.aqi} (${official.level})`,
        `Guideline: ${health.outdoorExercise}`,
        `Safest Window: Mid-afternoon (13:00 - 16:00)`
      ],
      actionLink: "#health",
      actionLinkLabel: "Inspect Health Action Timeline →",
      suggestedFollowUps: [
        "Why is early morning air worse than afternoon air?",
        "Can I exercise indoors without an air purifier?",
        "Is walking with an N95 mask safe for heart patients?"
      ]
    };
  }

  // 8. Comparing Cities & Localities (Anand Vihar, Lodhi Road, Noida, Gurugram)
  if (q.includes("compare") || q.includes("noida") || q.includes("gurugram") || q.includes("ghaziabad") || q.includes("faridabad") || q.includes("worst") || q.includes("cleanest") || q.includes("anand vihar") || q.includes("lodhi")) {
    return {
      text: `### 🏙️ Comparative NCR Airshed Analysis\n\nAir quality varies significantly across Delhi NCR depending on micro-geography, industrial density, and arterial highway traffic:\n\n* **Current Station Overview:**\n  * **${locName} (Current Selection):** AQI **${current.aqi}** (${official.level})\n  * **Highest / Most Hazardous Hotspot:** **${worstStation?.name} (${worstStation?.city})** at **${worstStation?.aqi} AQI** (Dominant: PM2.5, heavy interstate traffic & industrial hub).\n  * **Cleanest / Best Ventilated Station:** **${cleanestStation?.name} (${cleanestStation?.city})** at **${cleanestStation?.aqi} AQI** (buffered by institutional greenery & open canopy).\n\n* **City Averages Across NCR:**\n  * **Ghaziabad & East Delhi (Loni / Anand Vihar / Vasundhara):** Consistently higher due to unpaved road dust, border freight trucks, and downwind industrial zones.\n  * **Central & South Delhi (Lodhi Road / R.K. Puram):** Moderate-to-high, buffered by Lutyens green cover.\n  * **Gurugram & Faridabad:** Subject to Aravali dust drift and construction corridors, with pockets like Gwal Pahari remaining relatively cleaner.\n\nYou can switch locations anytime using the top dropdown selector!`,
      groundedFactors: [
        `Selected: ${locName} (${current.aqi})`,
        `Highest: ${worstStation?.name} (${worstStation?.aqi})`,
        `Lowest: ${cleanestStation?.name} (${cleanestStation?.aqi})`
      ],
      actionLink: "#map",
      actionLinkLabel: "View All Stations on Interactive Map →",
      suggestedFollowUps: [
        "Why is Anand Vihar always among the most polluted?",
        "How do trees and green buffers lower local AQI?",
        "Show me the 72-hour forecast for Noida"
      ]
    };
  }

  // 9. Forecast & Trend Queries
  if (q.includes("forecast") || q.includes("tomorrow") || q.includes("improve") || q.includes("72") || q.includes("weekend") || q.includes("next") || q.includes("hour")) {
    const pt12 = forecast[2] || forecast[1] || forecast[0];
    const pt24 = forecast.find(p => p.hoursOffset === 24) || forecast[3] || forecast[0];
    const pt48 = forecast.find(p => p.hoursOffset === 48) || forecast[4] || forecast[0];
    const pt72 = forecast[forecast.length - 1] || forecast[0];

    return {
      text: `### 📈 72-Hour Air Quality & Meteorological Outlook for ${locName}\n\n* **Now:** **${current.aqi}** (${official.icon} ${official.level}) — ${current.trendText}\n* **Next 12 Hours (+12h):** Projected **~${pt12.aqi} AQI** (${pt12.category}) — driven by nocturnal boundary layer compression and wind dip.\n* **Tomorrow (+24h):** Projected **~${pt24.aqi} AQI** (${pt24.category})\n* **Day 2 (+48h):** Projected **~${pt48.aqi} AQI** (${pt48.category})\n* **Day 3 (+72h):** Projected **~${pt72.aqi} AQI** (${pt72.category})\n\n**Meteorological Factors Governing the Trend:**\n* **Surface Ventilation:** Sustained wind speeds around ${weather.windSpeedMs} m/s ${weather.windCardinal}.\n* **Precipitation Probability:** ${weather.rainProbabilityPercent}%. ${weather.rainProbabilityPercent > 30 ? 'Rainfall could trigger particulate wet deposition and rapid clearing.' : 'No significant rain expected to wash out airborne particulates.'}\n* **Thermal Inversion:** Nighttime cooling will keep ground-level inversion high (~${weather.inversionScore}/100) until daytime solar heating breaks the lid around 11:00 AM.`,
      groundedFactors: [
        `Current: ${current.aqi} (${official.level})`,
        `+12h Peak: ~${pt12.aqi} AQI`,
        `+24h Outlook: ~${pt24.aqi} AQI`,
        `Rain Prob: ${weather.rainProbabilityPercent}%`
      ],
      actionLink: "#forecast",
      actionLinkLabel: "Open 72-Hour Numerical Forecast Chart →",
      suggestedFollowUps: [
        "When will wind speeds increase enough to clear the air?",
        "Will rain wash away Delhi's pollution this week?",
        "What is the hourly AQI forecast for tomorrow morning?"
      ]
    };
  }

  // 10. Default General Informative Climate Response
  return {
    text: `### 🌍 AirSense Climate Intelligence: ${locName}\n\n* **Current Air Quality:** **${current.aqi} AQI** (${official.icon} ${official.level})\n* **Official Standard:** "${official.meaning}"\n* **Primary Pollutant:** PM2.5 at **${current.pollutants.pm25} µg/m³** (${(current.pollutants.pm25 / 15).toFixed(1)}x WHO guideline)\n* **Atmospheric State:** Mixing Depth ${weather.pblHeightMeters}m | Inversion Index ${weather.inversionScore}/100 | Winds ${weather.windSpeedMs} m/s ${weather.windCardinal}\n* **Health Summary:** ${health.summary}\n\n**What would you like to explore?**\n* 🏃 **Health & Fitness:** Safe exercise windows, N95 mask fit, child/asthma protection.\n* 🌡️ **Atmospheric Science:** Thermal inversion dynamics, mixing height, smoke plume transport.\n* 📜 **Policy & GRAP:** Vehicle restrictions, odd-even rules, construction curbs.\n* 🏠 **Indoor Safety:** Air purifier CADR sizing, HEPA filtration, ventilation schedules.`,
    groundedFactors: [
      `Location: ${locName}`,
      `AQI: ${current.aqi} (${official.level})`,
      `Official Meaning: ${official.meaning}`,
      `Mixing Height: ${weather.pblHeightMeters}m`
    ],
    actionLink: "#why-changing",
    actionLinkLabel: "Explore Atmospheric Factors →",
    suggestedFollowUps: [
      "Why is air quality so bad right now?",
      "What are the GRAP Stage 3 rules?",
      "Is it safe to go for a run outside today?"
    ]
  };
}

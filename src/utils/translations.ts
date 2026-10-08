import { SupportedLanguage, AQICategory } from '../types';

export interface TranslationDictionary {
  // Brand & Slogan
  appName: string;
  appSubtitle: string;
  tagline: string;
  zoneLabel: string;
  liveSourcesActive: string;
  ndtvRef: string;

  // Language Switcher
  language: string;
  selectLanguage: string;

  // Navigation Tabs
  tabOverview: string;
  tabStations: string;
  tabHeatmap: string;
  tabForecast: string;
  tabCauses: string;
  tabPlume: string;
  tabHealth: string;
  tabCloudburst: string;

  // Header & Actions
  monitoringZones: string;
  refreshTooltip: string;
  alertsTooltip: string;
  settingsTooltip: string;
  scienceTooltip: string;
  provenanceTooltip: string;
  updatedAt: string;

  // Hero AQI Card
  currentAqiTitle: string;
  expected12h: string;
  confidenceScore: string;
  primaryPollutant: string;
  trendWorsening: string;
  trendImproving: string;
  trendStable: string;
  exploreWhyBtn: string;
  viewForecastBtn: string;
  officialStandard: string;
  whoLimitCompare: string;
  cpcbLimitCompare: string;

  // AQI Categories
  catGood: string;
  catSatisfactory: string;
  catModerate: string;
  catPoor: string;
  catVeryPoor: string;
  catSevere: string;
  catHazardous: string;

  // AQI Meanings
  meaningGood: string;
  meaningSatisfactory: string;
  meaningModerate: string;
  meaningPoor: string;
  meaningVeryPoor: string;
  meaningSevere: string;
  meaningHazardous: string;

  // AI Atmospheric Intelligence
  aiSummaryTitle: string;
  aiSubtitle: string;
  aiGroundedBadge: string;
  aiRegenerateBtn: string;
  aiKeyDriversTitle: string;
  aiPeakPeriodTitle: string;
  aiAskFollowUp: string;
  aiThinking: string;

  // Atmospheric Factors / Why Rising
  whyRisingTitle: string;
  whyRisingSubtitle: string;
  inversionTitle: string;
  inversionDesc: string;
  windTitle: string;
  windDesc: string;
  stubbleTitle: string;
  stubbleDesc: string;
  vehicleTitle: string;
  vehicleDesc: string;
  weatherTitle: string;

  // Health Advice
  healthAdviceTitle: string;
  healthSubtitle: string;
  generalPublic: string;
  sensitiveGroups: string;
  wearMasks: string;
  wearMasksDesc: string;
  avoidOutdoors: string;
  avoidOutdoorsDesc: string;
  airPurifiers: string;
  airPurifiersDesc: string;
  schoolsAdvisory: string;
  schoolsAdvisoryDesc: string;

  // Regional Smoke & Stubble
  stubbleTrackingTitle: string;
  activeFiresPunjab: string;
  activeFiresHaryana: string;
  windVectorTitle: string;
  plumeEtaTitle: string;

  // Stations
  stationsTableTitle: string;
  searchStationsPlaceholder: string;
  filterByCity: string;
  allCities: string;
  stationColumn: string;
  cityColumn: string;
  aqiColumn: string;
  categoryColumn: string;
  pm25Column: string;
  pm10Column: string;

  // Chatbot Drawer
  chatTitle: string;
  chatSubtitle: string;
  chatPlaceholder: string;
  chatSendBtn: string;
  chatWelcomeMessage: string;
  suggestedPromptsTitle: string;
  prompt1: string;
  prompt2: string;
  prompt3: string;
  prompt4: string;

  // Additional & Dynamic Keys
  sourcesVerified?: string;
  aiSummarySub?: string;
  regenerate?: string;
  keyAtmosphericDrivers?: string;
  criticalPeakWindow?: string;
  tierGood?: string;
  tierSatisfactory?: string;
  tierModerate?: string;
  tierPoor?: string;
  tierVeryPoor?: string;
  tierSevere?: string;
  lastUpdated?: string;
  currentAqi?: string;
  twelveHourProjection?: string;
  officialSpectrum?: string;
  exploreFactors?: string;
  pollutantBreakdown?: string;
  pollutantBreakdownSub?: string;
  collapseDetails?: string;
  showDetails?: string;
  standard?: string;
  configure?: string;
  viewForecast?: string;
  weatherConditions?: string;
  weatherSub?: string;
  trappingIndex?: string;
  temperature?: string;
  humidity?: string;
  windSpeed?: string;
  mixingHeight?: string;
  precipitation?: string;
  visibility?: string;
  dispersionDiagnosis?: string;
  ventilationIndex?: string;

  [key: string]: string | undefined;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'AirSense NCR',
    appSubtitle: 'Delhi NCR Air Pollution Intelligence',
    tagline: 'Predict pollution. Understand why. Act before it gets worse.',
    zoneLabel: 'Zone',
    liveSourcesActive: 'Live Sources Active',
    ndtvRef: 'NDTV REF',

    language: 'Language',
    selectLanguage: 'Choose Language',

    tabOverview: 'Overview',
    tabStations: 'Delhi Stations',
    tabHeatmap: 'AQI Heat Map',
    tabForecast: '72h Forecast',
    tabCauses: 'Why Rising?',
    tabPlume: 'Smoke & Fires',
    tabHealth: 'Health Advice',
    tabCloudburst: 'Cloudburst Predictor',

    monitoringZones: 'Delhi NCR Monitoring Zones',
    refreshTooltip: 'Refresh Live Atmospheric Feeds',
    alertsTooltip: 'Predictive Alerts & Warnings',
    settingsTooltip: 'Alert Settings & Preferences',
    scienceTooltip: 'Forecasting Models & Pipeline',
    provenanceTooltip: 'Data Reliability & Official Feeds',
    updatedAt: 'Updated',

    currentAqiTitle: 'Current Air Quality Index',
    expected12h: 'Expected in 12h',
    confidenceScore: 'Confidence Score',
    primaryPollutant: 'Primary Pollutant',
    trendWorsening: 'Worsening rapidly',
    trendImproving: 'Gradually improving',
    trendStable: 'Relatively stable',
    exploreWhyBtn: 'Explore Why It Is Changing',
    viewForecastBtn: 'View 72h Forecast',
    officialStandard: 'CPCB National Standard',
    whoLimitCompare: 'vs WHO Guideline',
    cpcbLimitCompare: 'vs CPCB 24h Safe Limit',

    catGood: 'Good',
    catSatisfactory: 'Satisfactory',
    catModerate: 'Moderate',
    catPoor: 'Poor',
    catVeryPoor: 'Very Poor',
    catSevere: 'Severe',
    catHazardous: 'Hazardous / Emergency',

    meaningGood: 'Safe for most people.',
    meaningSatisfactory: 'Generally okay, but sensitive people may notice discomfort.',
    meaningModerate: 'People with asthma, lung or heart problems may have breathing discomfort.',
    meaningPoor: 'Breathing discomfort is possible for most people during prolonged exposure.',
    meaningVeryPoor: 'Prolonged exposure can cause respiratory illness.',
    meaningSevere: 'Can affect even healthy people; serious risk for those with existing conditions.',
    meaningHazardous: 'Health emergency: emergency outdoor activity bans and N95 masks mandated.',

    aiSummaryTitle: 'AI Atmospheric Intelligence Summary',
    aiSubtitle: 'Synthesized from real-time CAAQMS sensors, boundary layer soundings, and satellite fire telemetry',
    aiGroundedBadge: 'Grounded Atmospheric Physics',
    aiRegenerateBtn: 'Regenerate Grounded Summary',
    aiKeyDriversTitle: 'Primary Atmospheric Drivers',
    aiPeakPeriodTitle: 'Critical Exposure Window',
    aiAskFollowUp: 'Ask AI Assistant for Advice',
    aiThinking: 'Synthesizing atmospheric soundings and real-time station metrics...',

    whyRisingTitle: 'Atmospheric Diagnosis: Why Is AQI Changing?',
    whyRisingSubtitle: 'Deconstruct the interplay of meteorological lids, wind speed, and regional emission sources',
    inversionTitle: 'Nocturnal Thermal Inversion',
    inversionDesc: 'A cold surface air layer traps rising smoke and vehicular emissions within a compressed boundary ceiling.',
    windTitle: 'Calm Horizontal Wind Speed',
    windDesc: 'Sub-2 m/s surface ventilation fails to advect particulate matter out of the NCR geographic basin.',
    stubbleTitle: 'Upwind Stubble Smoke (Biomass)',
    stubbleDesc: 'Northwesterly winds transport agricultural field burning particulates from Punjab and Haryana.',
    vehicleTitle: 'Vehicular & Urban Trapped Emissions',
    vehicleDesc: 'Rush-hour nitrogen dioxide (NO2) and carbon black stay concentrated at street breathing level.',
    weatherTitle: 'Current Meteorological Indicators',

    healthAdviceTitle: 'Health Impact & Protective Guidelines',
    healthSubtitle: 'Actionable clinical safeguards graded by CPCB/WHO exposure thresholds',
    generalPublic: 'General Public',
    sensitiveGroups: 'Sensitive Groups (Children, Elderly, Asthmatics)',
    wearMasks: 'N95 / FFP2 Respirator Required',
    wearMasksDesc: 'Standard cloth or surgical masks do not filter sub-micron PM2.5. Wear a snug-fitting N95 outdoors.',
    avoidOutdoors: 'Avoid Outdoor Morning & Evening Cardio',
    avoidOutdoorsDesc: 'Heavy breathing during peak inversion hours draws toxic particulates deep into the alveoli.',
    airPurifiers: 'Run Indoor Air Purifiers on High',
    airPurifiersDesc: 'Keep windows tightly sealed. Ensure HEPA filter replacement cycle is maintained.',
    schoolsAdvisory: 'Restrict Outdoor School Activities',
    schoolsAdvisoryDesc: 'Physical education classes and morning assemblies should be suspended or moved indoors.',

    stubbleTrackingTitle: 'Regional Stubble Fires & Smoke Plume Advection',
    activeFiresPunjab: 'Punjab Active Detections',
    activeFiresHaryana: 'Haryana Active Detections',
    windVectorTitle: 'Atmospheric Wind Vector',
    plumeEtaTitle: 'Estimated Smoke Arrival Window',

    stationsTableTitle: 'Live CAAQMS Station Telemetry',
    searchStationsPlaceholder: 'Search station by name or locality (e.g., Anand Vihar, Punjabi Bagh)...',
    filterByCity: 'Filter by Territory:',
    allCities: 'All Territories (28+)',
    stationColumn: 'Station & Locality',
    cityColumn: 'Zone / State',
    aqiColumn: 'AQI (Index)',
    categoryColumn: 'Severity Tier',
    pm25Column: 'PM2.5 (µg/m³)',
    pm10Column: 'PM10 (µg/m³)',

    chatTitle: 'AirSense Atmospheric Assistant',
    chatSubtitle: 'Grounded in real-time CPCB telemetry, GRAP guidelines, and meteorological soundings',
    chatPlaceholder: 'Ask about air quality, outdoor exercise safety, or mask guidelines...',
    chatSendBtn: 'Send',
    chatWelcomeMessage: 'Hello! I am your AirSense NCR atmospheric intelligence assistant. How can I assist you with today’s pollution levels, forecasts, or health advisories?',
    suggestedPromptsTitle: 'Suggested Questions',
    prompt1: 'Is it safe to go for a run in Delhi tomorrow morning?',
    prompt2: 'Why is air quality deteriorating tonight?',
    prompt3: 'What GRAP stage is active and what are the restrictions?',
    prompt4: 'What precautions should elderly and asthmatic patients take?',

    // Component & Dynamic Keys
    sourcesVerified: 'Official CPCB, DPCC, IITM SAFAR & NASA VIIRS Feeds Active',
    aiSummarySub: 'Physical Atmospheric Dynamics & Trapping Inversion Analysis',
    regenerate: 'Regenerate',
    keyAtmosphericDrivers: 'Key Atmospheric Drivers & Inversion Dynamics',
    criticalPeakWindow: 'Predicted Peak Inversion & Smog Window',
    tierGood: 'Good',
    tierSatisfactory: 'Satisfactory',
    tierModerate: 'Moderate',
    tierPoor: 'Poor',
    tierVeryPoor: 'Very Poor',
    tierSevere: 'Severe',
    lastUpdated: 'Last Updated',
    currentAqi: 'Current AQI',
    twelveHourProjection: '12-Hour Projection',
    officialSpectrum: 'Official CPCB AQI Spectrum',
    exploreFactors: 'Explore Atmospheric Factors',
    pollutantBreakdown: 'Critical Pollutant Breakdown',
    pollutantBreakdownSub: 'Sensor telemetry vs. CPCB 24h safety standards & WHO guidelines',
    collapseDetails: 'Collapse Details',
    showDetails: 'Show Details',
    standard: 'Standard',
    configure: 'Configure',
    viewForecast: 'View Forecast',
    weatherConditions: 'Local Atmospheric Sounding',
    weatherSub: 'Boundary layer mixing, surface wind vector & inversion index',
    trappingIndex: 'Thermal Inversion Trapping',
    temperature: 'Temperature',
    humidity: 'Relative Humidity',
    windSpeed: 'Wind Vector',
    mixingHeight: 'PBL Mixing Height',
    precipitation: 'Precipitation',
    visibility: 'Optical Visibility',
    dispersionDiagnosis: 'Atmospheric Dispersion Diagnosis',
    ventilationIndex: 'Ventilation Index',
  },

  hi: {
    appName: 'एयरसेंस NCR',
    appSubtitle: 'दिल्ली-एनसीआर वायु प्रदूषण विश्लेषण एवं पूर्वानुमान',
    tagline: 'प्रदूषण का पूर्वानुमान लगाएं। कारणों को समझें। स्थिति बिगड़ने से पहले कदम उठाएं।',
    zoneLabel: 'क्षेत्र',
    liveSourcesActive: 'लाइव सरकारी फीड्स सक्रिय',
    ndtvRef: 'NDTV संदर्भ',

    language: 'भाषा (Language)',
    selectLanguage: 'भाषा चुनें',

    tabOverview: 'अवलोकन',
    tabStations: 'दिल्ली स्टेशन',
    tabHeatmap: 'AQI हीट मैप',
    tabForecast: '72h पूर्वानुमान',
    tabCauses: 'प्रदूषण क्यों बढ़ रहा है?',
    tabPlume: 'धुआं और पराली',
    tabHealth: 'स्वास्थ्य सलाह',
    tabCloudburst: 'क्लाउडबर्स्ट प्रिडिक्टर',

    monitoringZones: 'दिल्ली-एनसीआर निगरानी क्षेत्र',
    refreshTooltip: 'लाइव वायुमंडलीय डेटा रीफ्रेश करें',
    alertsTooltip: 'पूर्वानुमान अलर्ट और चेतावनियां',
    settingsTooltip: 'अलर्ट सेटिंग्स और प्राथमिकताएं',
    scienceTooltip: 'पूर्वानुमान मॉडल और वैज्ञानिक प्रणाली',
    provenanceTooltip: 'डेटा प्रामाणिकता और आधिकारिक स्रोत',
    updatedAt: 'अंतिम अपडेट',

    currentAqiTitle: 'वर्तमान वायु गुणवत्ता सूचकांक (AQI)',
    expected12h: 'अगले 12 घंटों में संभावित',
    confidenceScore: 'विश्वसनीयता स्कोर',
    primaryPollutant: 'मुख्य प्रदूषक',
    trendWorsening: 'तेजी से बिगड़ रहा है',
    trendImproving: 'धीरे-धीरे सुधार हो रहा है',
    trendStable: 'अपेक्षाकृत स्थिर',
    exploreWhyBtn: 'बदलाव के कारण जानें',
    viewForecastBtn: '72 घंटे का पूर्वानुमान देखें',
    officialStandard: 'CPCB राष्ट्रीय मानक',
    whoLimitCompare: 'WHO दिशानिर्देशों की तुलना में',
    cpcbLimitCompare: 'CPCB 24h सुरक्षित सीमा की तुलना में',

    catGood: 'अच्छा (Good)',
    catSatisfactory: 'संतोषजनक (Satisfactory)',
    catModerate: 'मध्यम (Moderate)',
    catPoor: 'खराब (Poor)',
    catVeryPoor: 'बहुत खराब (Very Poor)',
    catSevere: 'गंभीर (Severe)',
    catHazardous: 'आपातकालीन / अति गंभीर (Hazardous)',

    meaningGood: 'अधिकांश लोगों के लिए सुरक्षित हवा।',
    meaningSatisfactory: 'सामान्यतः ठीक, परंतु अति-संवेदनशील लोगों को हल्की परेशानी हो सकती है।',
    meaningModerate: 'दमा, फेफड़े या हृदय रोगियों को सांस लेने में असहजता हो सकती है।',
    meaningPoor: 'लंबे समय तक संपर्क में रहने पर सामान्य लोगों को भी सांस लेने में परेशानी हो सकती है।',
    meaningVeryPoor: 'लंबे समय तक रहने से सांस संबंधी बीमारियां हो सकती हैं।',
    meaningSevere: 'स्वस्थ व्यक्तियों के स्वास्थ्य पर भी गंभीर असर; बीमार लोगों के लिए अत्यधिक जोखिम।',
    meaningHazardous: 'स्वास्थ्य आपातकाल: सभी बाहरी गतिविधियों पर रोक, N95 मास्क अनिवार्य।',

    aiSummaryTitle: 'एआई वायुमंडलीय विश्लेषण सारांश',
    aiSubtitle: 'CAAQMS सेंसर, तापमान इन्वर्जन और सैटेलाइट पराली डेटा का वास्तविक समय विश्लेषण',
    aiGroundedBadge: 'भौतिकी आधारित वैज्ञानिक विश्लेषण',
    aiRegenerateBtn: 'नया विश्लेषण प्राप्त करें',
    aiKeyDriversTitle: 'प्रदूषण बढ़ने के प्रमुख कारण',
    aiPeakPeriodTitle: 'अत्यधिक खतरे का समय (Peak Window)',
    aiAskFollowUp: 'एआई सहायक से स्वास्थ्य सलाह पूछें',
    aiThinking: 'वायुमंडलीय परिस्थितियों और स्टेशन डेटा का विश्लेषण हो रहा है...',

    whyRisingTitle: 'वायुमंडलीय विश्लेषण: AQI क्यों बदल रहा है?',
    whyRisingSubtitle: 'तापमान उलटाव (थर्मल इन्वर्जन), हवा की गति और क्षेत्रीय स्रोतों का संयुक्त प्रभाव',
    inversionTitle: 'रात्रि कालीन थर्मल इन्वर्जन',
    inversionDesc: 'सतह की ठंडी हवा गर्म हवा के नीचे फंस जाती है, जिससे धुआं और धूल वायुमंडल में ऊपर नहीं उठ पाते।',
    windTitle: 'शांत सतही हवा (<2 मी/से)',
    windDesc: 'हवा की धीमी गति के कारण प्रदूषक दिल्ली-एनसीआर की भौगोलिक घाटी से बाहर नहीं निकल पाते।',
    stubbleTitle: 'हवा के रुख पर पराली का धुआं',
    stubbleDesc: 'उत्तर-पश्चिमी हवाएं पंजाब और हरियाणा के खेतों में पराली जलने का धुआं एनसीआर में लाती हैं।',
    vehicleTitle: 'स्थानीय वाहन एवं शहरी उत्सर्जन',
    vehicleDesc: 'शाम के व्यस्त समय का गाड़ियों का धुआं (NO2) और कार्बन जमीन के नजदीक सांस लेने के स्तर पर जमा रहता है।',
    weatherTitle: 'वर्तमान मौसमी परिस्थितियां',

    healthAdviceTitle: 'स्वास्थ्य प्रभाव एवं सुरक्षा परामर्श',
    healthSubtitle: 'CPCB और WHO के मानकों पर आधारित चिकित्सा सुरक्षा निर्देश',
    generalPublic: 'आम नागरिक',
    sensitiveGroups: 'संवेदनशील समूह (बच्चे, बुजुर्ग, दमा व हृदय रोगी)',
    wearMasks: 'N95 / FFP2 मास्क पहनना अनिवार्य',
    wearMasksDesc: 'साधारण कपड़े का मास्क PM2.5 कणों को नहीं रोक सकता। बाहर जाते समय फिटिंग वाला N95 मास्क ही लगाएं।',
    avoidOutdoors: 'सुबह व शाम की सैर और व्यायाम से बचें',
    avoidOutdoorsDesc: 'गंभीर प्रदूषण में गहरी सांस लेने से जहरीले सूक्ष्म कण सीधे फेफड़ों की गहराई तक पहुंच जाते हैं।',
    airPurifiers: 'कमरे में एयर प्यूरीफायर चालू रखें',
    airPurifiersDesc: 'खिड़की-दरवाजे बंद रखें और प्यूरीफायर के HEPA फिल्टर की नियमित जांच करें।',
    schoolsAdvisory: 'स्कूलों की बाहरी गतिविधियां बंद रखें',
    schoolsAdvisoryDesc: 'बच्चों के खेल-कूद, पीटी क्लास और सुबह की प्रार्थना सभा को खुले मैदान में न कराएं।',

    stubbleTrackingTitle: 'क्षेत्रीय पराली दहन और धुएं का बहाव',
    activeFiresPunjab: 'पंजाब में सक्रिय पराली आग',
    activeFiresHaryana: 'हरियाणा में सक्रिय पराली आग',
    windVectorTitle: 'वायुमंडलीय हवा का रुख',
    plumeEtaTitle: 'धुएं के पहुंचने का अनुमानित समय',

    stationsTableTitle: 'लाइव सरकारी CAAQMS स्टेशन डेटा',
    searchStationsPlaceholder: 'स्टेशन या इलाके के नाम से खोजें (उदा. आनंद विहार, पंजाबी बाग)...',
    filterByCity: 'शहर / क्षेत्र अनुसार फ़िल्टर करें:',
    allCities: 'सभी 28+ स्टेशन',
    stationColumn: 'स्टेशन व क्षेत्र',
    cityColumn: 'शहर / राज्य',
    aqiColumn: 'AQI स्कोर',
    categoryColumn: 'श्रेणी (Tier)',
    pm25Column: 'PM2.5 (µg/m³)',
    pm10Column: 'PM10 (µg/m³)',

    chatTitle: 'एयरसेंस एआई वायुमंडलीय सहायक',
    chatSubtitle: 'CPCB डेटा, GRAP दिशानिर्देश और वैज्ञानिक मौसम विश्लेषण पर आधारित',
    chatPlaceholder: 'वायु गुणवत्ता, मास्क सलाह या बाहरी गतिविधियों के बारे में पूछें...',
    chatSendBtn: 'भेजें',
    chatWelcomeMessage: 'नमस्ते! मैं आपका एयरसेंस एनसीआर वायु गुणवत्ता सहायक हूं। आज के प्रदूषण स्तर, पूर्वानुमान या स्वास्थ्य सावधानियों के बारे में आप क्या जानना चाहते हैं?',
    suggestedPromptsTitle: 'अक्सर पूछे जाने वाले सवाल',
    prompt1: 'क्या कल सुबह दिल्ली में दौड़ने या वॉक पर जाना सुरक्षित है?',
    prompt2: 'आज रात प्रदूषण का स्तर अचानक क्यों बढ़ रहा है?',
    prompt3: 'वर्तमान में कौन सा GRAP चरण लागू है और क्या पाबंदियां हैं?',
    prompt4: 'बुजुर्गों और सांस के मरीजों को कौन सी सावधानियां बरतनी चाहिए?',

    // Component & Dynamic Keys
    sourcesVerified: 'आधिकारिक CPCB, DPCC, IITM SAFAR एवं नासा VIIRS फीड्स सक्रिय',
    aiSummarySub: 'वायुमंडलीय गतिशीलता एवं थर्मल इन्वर्जन फंसाव विश्लेषण',
    regenerate: 'पुनः उत्पन्न करें',
    keyAtmosphericDrivers: 'मुख्य वायुमंडलीय कारक एवं इन्वर्जन प्रभाव',
    criticalPeakWindow: 'चरम स्मॉग एवं इन्वर्जन समय-विंडो',
    tierGood: 'अच्छा (Good)',
    tierSatisfactory: 'संतोषजनक (Satisfactory)',
    tierModerate: 'मध्यम (Moderate)',
    tierPoor: 'खराब (Poor)',
    tierVeryPoor: 'बहुत खराब (Very Poor)',
    tierSevere: 'गंभीर (Severe)',
    lastUpdated: 'अंतिम अपडेट',
    currentAqi: 'वर्तमान AQI',
    twelveHourProjection: '12-घंटे का अनुमान',
    officialSpectrum: 'आधिकारिक CPCB AQI स्पेक्ट्रम',
    exploreFactors: 'वायुमंडलीय कारणों को समझें',
    pollutantBreakdown: 'प्रमुख प्रदूषक तत्व विश्लेषण',
    pollutantBreakdownSub: 'सेंसर टेलीमेट्री बनाम CPCB 24 घंटे के सुरक्षित मानक एवं WHO दिशानिर्देश',
    collapseDetails: 'विवरण छिपाएं',
    showDetails: 'विवरण देखें',
    standard: 'मानक',
    configure: 'कॉन्फ़िगर करें',
    viewForecast: 'पूर्वानुमान देखें',
    weatherConditions: 'स्थानीय वायुमंडलीय साउंडिंग',
    weatherSub: 'बाउंड्री लेयर मिक्सिंग, सतही हवा की गति एवं इन्वर्जन सूचकांक',
    trappingIndex: 'थर्मल इन्वर्जन फंसाव',
    temperature: 'तापमान',
    humidity: 'सापेक्षिक आर्द्रता',
    windSpeed: 'हवा की दिशा एवं गति',
    mixingHeight: 'PBL मिक्सिंग ऊंचाई',
    precipitation: 'वर्षा की संभावना',
    visibility: 'दृश्यता',
    dispersionDiagnosis: 'वायुमंडलीय फैलाव निदान',
    ventilationIndex: 'वेंटिलेशन सूचकांक',
  },

  pa: {
    appName: 'ਏਅਰਸੈਂਸ NCR',
    appSubtitle: 'ਦਿੱਲੀ-ਐਨਸੀਆਰ ਹਵਾ ਪ੍ਰਦੂਸ਼ਣ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਪੂਰਵ ਅਨੁਮਾਨ',
    tagline: 'ਪ੍ਰਦੂਸ਼ਣ ਦਾ ਅਨੁਮਾਨ ਲਗਾਓ। ਕਾਰਨਾਂ ਨੂੰ ਸਮਝੋ। ਸਥਿਤੀ ਵਿਗੜਨ ਤੋਂ ਪਹਿਲਾਂ ਕਦਮ ਚੁੱਕੋ।',
    zoneLabel: 'ਖੇਤਰ',
    liveSourcesActive: 'ਲਾਈਵ ਸਰਕਾਰੀ ਫੀਡ ਸਰਗਰਮ',
    ndtvRef: 'NDTV ਹਵਾਲਾ',

    language: 'ਭਾਸ਼ਾ (Language)',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',

    tabOverview: 'ਸੰਖੇਪ',
    tabStations: 'ਦਿੱਲੀ ਸਟੇਸ਼ਨ',
    tabHeatmap: 'AQI ਹੀਟ ਮੈਪ',
    tabForecast: '72 ਘੰਟੇ ਭਵਿੱਖਬਾਣੀ',
    tabCauses: 'ਕਿਉਂ ਵਧ ਰਿਹਾ ਹੈ?',
    tabPlume: 'ਧੂੰਆਂ ਅਤੇ ਪਰਾਲੀ',
    tabHealth: 'ਸਿਹਤ ਸਲਾਹ',
    tabCloudburst: 'ਕਲਾਊਡਬਰਸਟ ਪੂਰਵ ਅਨੁਮਾਨ',

    monitoringZones: 'ਦਿੱਲੀ ਐਨਸੀਆਰ ਨਿਗਰਾਨੀ ਖੇਤਰ',
    refreshTooltip: 'ਤਾਜ਼ਾ ਮੌਸਮੀ ਡੇਟਾ ਪ੍ਰਾਪਤ ਕਰੋ',
    alertsTooltip: 'ਪੂਰਵ ਅਨੁਮਾਨ ਚੇਤਾਵਨੀਆਂ',
    settingsTooltip: 'ਸੈਟਿੰਗਾਂ ਅਤੇ ਤਰਜੀਹਾਂ',
    scienceTooltip: 'ਵਿਗਿਆਨਕ ਮਾਡਲ ਜਾਣਕਾਰੀ',
    provenanceTooltip: 'ਡੇਟਾ ਭਰੋਸੇਯੋਗਤਾ ਅਤੇ ਅਧਿਕਾਰਤ ਸਰੋਤ',
    updatedAt: 'ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ',

    currentAqiTitle: 'ਮੌਜੂਦਾ ਹਵਾ ਗੁਣਵੱਤਾ ਸੂਚਕਾਂਕ (AQI)',
    expected12h: 'ਅਗਲੇ 12 ਘੰਟਿਆਂ ਵਿੱਚ ਸੰਭਾਵੀ',
    confidenceScore: 'ਭਰੋਸੇਯੋਗਤਾ ਸਕੋਰ',
    primaryPollutant: 'ਮੁੱਖ ਪ੍ਰਦੂਸ਼ਕ',
    trendWorsening: 'ਤੇਜ਼ੀ ਨਾਲ ਵਿਗੜ ਰਿਹਾ ਹੈ',
    trendImproving: 'ਹੌਲੀ-ਹੌਲੀ ਸੁਧਾਰ ਹੋ ਰਿਹਾ ਹੈ',
    trendStable: 'ਕਾਫ਼ੀ ਹੱਦ ਤੱਕ ਸਥਿਰ',
    exploreWhyBtn: 'ਬਦਲਾਅ ਦੇ ਕਾਰਨ ਜਾਣੋ',
    viewForecastBtn: '72 ਘੰਟਿਆਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਦੇਖੋ',
    officialStandard: 'CPCB ਰਾਸ਼ਟਰੀ ਮਿਆਰ',
    whoLimitCompare: 'WHO ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼ਾਂ ਦੇ ਮੁਕਾਬਲੇ',
    cpcbLimitCompare: 'CPCB 24 ਘੰਟੇ ਸੁਰੱਖਿਅਤ ਸੀਮਾ ਮੁਕਾਬਲੇ',

    catGood: 'ਵਧੀਆ (Good)',
    catSatisfactory: 'ਸੰਤੋਖਜਨਕ (Satisfactory)',
    catModerate: 'ਦਰਮਿਆਨਾ (Moderate)',
    catPoor: 'ਮਾੜਾ (Poor)',
    catVeryPoor: 'ਬਹੁਤ ਮਾੜਾ (Very Poor)',
    catSevere: 'ਗੰਭੀਰ (Severe)',
    catHazardous: 'ਐਮਰਜੈਂਸੀ / ਬਹੁਤ ਖ਼ਤਰਨਾਕ (Hazardous)',

    meaningGood: 'ਜ਼ਿਆਦਾਤਰ ਲੋਕਾਂ ਲਈ ਸੁਰੱਖਿਅਤ ਹਵਾ।',
    meaningSatisfactory: 'ਆਮ ਤੌਰ \'ਤੇ ਠੀਕ, ਪਰ ਸੰਵੇਦਨਸ਼ੀਲ ਲੋਕਾਂ ਨੂੰ ਕੁਝ ਤਕਲੀਫ ਹੋ ਸਕਦੀ ਹੈ।',
    meaningModerate: 'ਦਮੇ ਜਾਂ ਸਾਹ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਵਾਲਿਆਂ ਨੂੰ ਸਾਹ ਲੈਣ ਵਿੱਚ ਦਿੱਕਤ ਹੋ ਸਕਦੀ ਹੈ।',
    meaningPoor: 'ਲੰਮਾ ਸਮਾਂ ਬਾਹਰ ਰਹਿਣ ਨਾਲ ਆਮ ਲੋਕਾਂ ਨੂੰ ਵੀ ਸਾਹ ਦੀ ਤਕਲੀਫ ਹੋ ਸਕਦੀ ਹੈ।',
    meaningVeryPoor: 'ਲੰਮਾ ਸਮਾਂ ਸੰਪਰਕ ਵਿੱਚ ਰਹਿਣ ਨਾਲ ਸਾਹ ਦੀਆਂ ਗੰਭੀਰ ਬਿਮਾਰੀਆਂ ਹੋ ਸਕਦੀਆਂ ਹਨ।',
    meaningSevere: 'ਸਿਹਤਮੰਦ ਲੋਕਾਂ ਦੀ ਸਿਹਤ \'ਤੇ ਵੀ ਅਸਰ ਪੈਂਦਾ ਹੈ; ਬਿਮਾਰਾਂ ਲਈ ਗੰਭੀਰ ਖਤਰਾ।',
    meaningHazardous: 'ਸਿਹਤ ਐਮਰਜੈਂਸੀ: ਬਾਹਰੀ ਗਤੀਵਿਧੀਆਂ ਬੰਦ ਰੱਖੋ, N95 ਮਾਸਕ ਲਾਜ਼ਮੀ।',

    aiSummaryTitle: 'ਏਆਈ ਮੌਸਮੀ ਵਿਸ਼ਲੇਸ਼ਣ ਸੰਖੇਪ',
    aiSubtitle: 'ਸੈਂਸਰਾਂ, ਤਾਪਮਾਨ ਉਲਟਾਅ ਅਤੇ ਸੈਟੇਲਾਈਟ ਡੇਟਾ ਦਾ ਵਿਗਿਆਨਕ ਵਿਸ਼ਲੇਸ਼ਣ',
    aiGroundedBadge: 'ਵਿਗਿਆਨਕ ਭੌਤਿਕ ਵਿਸ਼ਲੇਸ਼ਣ',
    aiRegenerateBtn: 'ਦੁਬਾਰਾ ਸੰਖੇਪ ਬਣਾਓ',
    aiKeyDriversTitle: 'ਮੁੱਖ ਵਾਯੂਮੰਡਲੀ ਕਾਰਨ',
    aiPeakPeriodTitle: 'ਵੱਧ ਖ਼ਤਰੇ ਦਾ ਸਮਾਂ',
    aiAskFollowUp: 'ਏਆਈ ਸਹਾਇਕ ਤੋਂ ਸਲਾਹ ਲਓ',
    aiThinking: 'ਵਾਯੂਮੰਡਲੀ ਹਾਲਾਤਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...',

    whyRisingTitle: 'ਵਾਯੂਮੰਡਲੀ ਵਿਸ਼ਲੇਸ਼ਣ: AQI ਕਿਉਂ ਬਦਲ ਰਿਹਾ ਹੈ?',
    whyRisingSubtitle: 'ਤਾਪਮਾਨ ਉਲਟਾਅ (ਇਨਵਰਸ਼ਨ), ਹਵਾ ਦੀ ਗਤੀ ਅਤੇ ਖੇਤਰੀ ਸਰੋਤਾਂ ਦਾ ਅਸਰ',
    inversionTitle: 'ਰਾਤ ਦਾ ਥਰਮਲ ਇਨਵਰਸ਼ਨ',
    inversionDesc: 'ਠੰਢੀ ਹਵਾ ਧਰਤੀ ਦੀ ਸਤਹ ਕੋਲ ਧੂੰਏਂ ਅਤੇ ਪ੍ਰਦੂਸ਼ਣ ਨੂੰ ਕੈਦ ਕਰ ਲੈਂਦੀ ਹੈ।',
    windTitle: 'ਸ਼ਾਂਤ ਹਵਾ ਦੀ ਗਤੀ (<2 ਮੀ/ਸੈ)',
    windDesc: 'ਹਵਾ ਦੀ ਮੱਠੀ ਚਾਲ ਕਾਰਨ ਪ੍ਰਦੂਸ਼ਣ ਦਿੱਲੀ-ਐਨਸੀਆਰ ਦੀ ਘਾਟੀ ਵਿੱਚ ਹੀ ਜੰਮਿਆ ਰਹਿੰਦਾ ਹੈ।',
    stubbleTitle: 'ਪਰਾਲੀ ਦਾ ਧੂੰਆਂ (ਬਾਇਓਮਾਸ)',
    stubbleDesc: 'ਉੱਤਰ-ਪੱਛਮੀ ਹਵਾਵਾਂ ਖੇਤਾਂ ਵਿੱਚੋਂ ਪਰਾਲੀ ਸਾੜਨ ਦਾ ਧੂੰਆਂ ਐਨਸੀਆਰ ਵੱਲ ਲਿਆਉਂਦੀਆਂ ਹਨ।',
    vehicleTitle: 'ਗੱਡੀਆਂ ਅਤੇ ਸ਼ਹਿਰੀ ਧੂੰਆਂ',
    vehicleDesc: 'ਸ਼ਾਮ ਦੇ ਜਾਮ ਦੌਰਾਨ ਨਿਕਲਣ ਵਾਲਾ ਗੱਡੀਆਂ ਦਾ ਧੂੰਆਂ ਜ਼ਮੀਨੀ ਪੱਧਰ \'ਤੇ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ।',
    weatherTitle: 'ਮੌਜੂਦਾ ਮੌਸਮੀ ਸੂਚਕ',

    healthAdviceTitle: 'ਸਿਹਤ ਪ੍ਰਭਾਵ ਅਤੇ ਬਚਾਅ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼',
    healthSubtitle: 'CPCB ਅਤੇ WHO ਦੇ ਮਾਪਦੰਡਾਂ \'ਤੇ ਆਧਾਰਿਤ ਡਾਕਟਰੀ ਸਲਾਹ',
    generalPublic: 'ਆਮ ਲੋਕ',
    sensitiveGroups: 'ਸੰਵੇਦਨਸ਼ੀਲ ਸਮੂਹ (ਬੱਚੇ, ਬਜ਼ੁਰਗ, ਦਮੇ ਦੇ ਮਰੀਜ਼)',
    wearMasks: 'N95 / FFP2 ਮਾਸਕ ਲਾਜ਼ਮੀ ਹੈ',
    wearMasksDesc: 'ਆਮ ਕੱਪੜੇ ਦਾ ਮਾਸਕ PM2.5 ਨੂੰ ਨਹੀਂ ਰੋਕਦਾ। ਬਾਹਰ ਨਿਕਲਣ ਵੇਲੇ ਸਹੀ ਫਿਟਿੰਗ ਵਾਲਾ N95 ਮਾਸਕ ਪਾਓ।',
    avoidOutdoors: 'ਸਵੇਰ-ਸ਼ਾਮ ਬਾਹਰੀ ਕਸਰਤ ਤੋਂ ਪਰਹੇਜ਼ ਕਰੋ',
    avoidOutdoorsDesc: 'ਤੇਜ਼ ਸਾਹ ਲੈਣ ਨਾਲ ਜ਼ਹਿਰੀਲੇ ਕਣ ਫੇਫੜਿਆਂ ਦੇ ਅੰਦਰ ਤੱਕ ਪਹੁੰਚ ਜਾਂਦੇ ਹਨ।',
    airPurifiers: 'ਕਮਰਿਆਂ ਵਿੱਚ ਏਅਰ ਪਿਊਰੀਫਾਇਰ ਚਲਾਓ',
    airPurifiersDesc: 'ਖਿੜਕੀਆਂ ਬੰਦ ਰੱਖੋ ਅਤੇ HEPA ਫਿਲਟਰ ਦੀ ਸਮੇਂ ਸਿਰ ਜਾਂਚ ਕਰੋ।',
    schoolsAdvisory: 'ਸਕੂਲਾਂ ਦੀਆਂ ਬਾਹਰੀ ਗਤੀਵਿਧੀਆਂ ਰੋਕੋ',
    schoolsAdvisoryDesc: 'ਖੇਡਾਂ, ਪੀਟੀ ਕਲਾਸਾਂ ਅਤੇ ਸਵੇਰ ਦੀ ਸਭਾ ਖੁੱਲ੍ਹੇ ਮੈਦਾਨ ਵਿੱਚ ਨਾ ਕਰਵਾਈ ਜਾਵੇ।',

    stubbleTrackingTitle: 'ਖੇਤਰੀ ਪਰਾਲੀ ਦਹਿਨ ਅਤੇ ਧੂੰਏਂ ਦਾ ਵਹਾਅ',
    activeFiresPunjab: 'ਪੰਜਾਬ ਵਿੱਚ ਸਰਗਰਮ ਅੱਗਾਂ',
    activeFiresHaryana: 'ਹਰਿਆਣਾ ਵਿੱਚ ਸਰਗਰਮ ਅੱਗਾਂ',
    windVectorTitle: 'ਵਾਯੂਮੰਡਲੀ ਹਵਾ ਦਾ ਰੁਖ',
    plumeEtaTitle: 'ਧੂੰਏਂ ਦੇ ਪਹੁੰਚਣ ਦਾ ਸੰਭਾਵੀ ਸਮਾਂ',

    stationsTableTitle: 'ਲਾਈਵ CAAQMS ਸਟੇਸ਼ਨ ਡੇਟਾ',
    searchStationsPlaceholder: 'ਸਟੇਸ਼ਨ ਜਾਂ ਇਲਾਕੇ ਦੇ ਨਾਮ ਨਾਲ ਖੋਜ ਕਰੋ (ਜਿਵੇਂ ਆਨੰਦ ਵਿਹਾਰ)...',
    filterByCity: 'ਸ਼ਹਿਰ ਮੁਤਾਬਕ ਫਿਲਟਰ ਕਰੋ:',
    allCities: 'ਸਾਰੇ 28+ ਸਟੇਸ਼ਨ',
    stationColumn: 'ਸਟੇਸ਼ਨ ਅਤੇ ਇਲਾਕਾ',
    cityColumn: 'ਸ਼ਹਿਰ / ਰਾਜ',
    aqiColumn: 'AQI ਸਕੋਰ',
    categoryColumn: 'ਗੰਭੀਰਤਾ ਸ਼੍ਰੇਣੀ',
    pm25Column: 'PM2.5 (µg/m³)',
    pm10Column: 'PM10 (µg/m³)',

    chatTitle: 'ਏਅਰਸੈਂਸ ਏਆਈ ਸਹਾਇਕ',
    chatSubtitle: 'CPCB ਡੇਟਾ, GRAP ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼ ਅਤੇ ਮੌਸਮੀ ਜਾਣਕਾਰੀ \'ਤੇ ਆਧਾਰਿਤ',
    chatPlaceholder: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ, ਮਾਸਕ ਜਾਂ ਸਿਹਤ ਸਲਾਹ ਬਾਰੇ ਪੁੱਛੋ...',
    chatSendBtn: 'ਭੇਜੋ',
    chatWelcomeMessage: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਏਅਰਸੈਂਸ NCR ਵਾਯੂਮੰਡਲੀ ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਦੇ ਪ੍ਰਦੂਸ਼ਣ ਜਾਂ ਸਿਹਤ ਸੰਬੰਧੀ ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    suggestedPromptsTitle: 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ',
    prompt1: 'ਕੀ ਕੱਲ੍ਹ ਸਵੇਰੇ ਦਿੱਲੀ ਵਿੱਚ ਸੈਰ ਕਰਨਾ ਸੁਰੱਖਿਅਤ ਹੈ?',
    prompt2: 'ਅੱਜ ਰਾਤ ਪ੍ਰਦੂਸ਼ਣ ਕਿਉਂ ਅਚਾਨਕ ਵਧ ਰਿਹਾ ਹੈ?',
    prompt3: 'ਮੌਜੂਦਾ ਸਮੇਂ ਕਿਹੜਾ GRAP ਪੜਾਅ ਲਾਗੂ ਹੈ?',
    prompt4: 'ਬਜ਼ੁਰਗਾਂ ਅਤੇ ਮਰੀਜ਼ਾਂ ਨੂੰ ਕਿਹੜੇ ਬਚਾਅ ਉਪਾਅ ਕਰਨੇ ਚਾਹੀਦੇ ਹਨ?',

    // Component & Dynamic Keys
    sourcesVerified: 'ਅਧਿਕਾਰਤ CPCB, DPCC, IITM SAFAR ਅਤੇ ਨਾਸਾ VIIRS ਫੀਡ ਸਰਗਰਮ',
    aiSummarySub: 'ਵਾਯੂਮੰਡਲੀ ਗਤੀਵਿਧੀਆਂ ਅਤੇ ਥਰਮਲ ਇਨਵਰਜ਼ਨ ਵਿਸ਼ਲੇਸ਼ਣ',
    regenerate: 'ਮੁੜ ਤਿਆਰ ਕਰੋ',
    keyAtmosphericDrivers: 'ਮੁੱਖ ਵਾਯੂਮੰਡਲੀ ਕਾਰਕ ਅਤੇ ਪ੍ਰਭਾਵ',
    criticalPeakWindow: 'ਸਭ ਤੋਂ ਵੱਧ ਪ੍ਰਦੂਸ਼ਣ ਵਾਲਾ ਸੰਭਾਵੀ ਸਮਾਂ',
    tierGood: 'ਚੰਗਾ (Good)',
    tierSatisfactory: 'ਸੰਤੋਸ਼ਜਨਕ (Satisfactory)',
    tierModerate: 'ਦਰਮਿਆਨਾ (Moderate)',
    tierPoor: 'ਖ਼ਰਾਬ (Poor)',
    tierVeryPoor: 'ਬਹੁਤ ਖ਼ਰਾਬ (Very Poor)',
    tierSevere: 'ਗੰਭੀਰ (Severe)',
    lastUpdated: 'ਆਖ਼ਰੀ ਅੱਪਡੇਟ',
    currentAqi: 'ਮੌਜੂਦਾ AQI',
    twelveHourProjection: '12-ਘੰਟੇ ਦਾ ਅਨੁਮਾਨ',
    officialSpectrum: 'ਅਧਿਕਾਰਤ CPCB AQI ਸਪੈਕਟ੍ਰਮ',
    exploreFactors: 'ਵਾਯੂਮੰਡਲੀ ਕਾਰਨਾਂ ਨੂੰ ਸਮਝੋ',
    pollutantBreakdown: 'ਮੁੱਖ ਪ੍ਰਦੂਸ਼ਕ ਤੱਤ ਵਿਸ਼ਲੇਸ਼ਣ',
    pollutantBreakdownSub: 'ਸੈਂਸਰ ਡੇਟਾ ਬਨਾਮ CPCB 24 ਘੰਟੇ ਸੁਰੱਖਿਅਤ ਮਿਆਰ ਅਤੇ WHO ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼',
    collapseDetails: 'ਵੇਰਵੇ ਲੁਕਾਓ',
    showDetails: 'ਵੇਰਵੇ ਦੇਖੋ',
    standard: 'ਮਿਆਰ',
    configure: 'ਸੈੱਟ ਕਰੋ',
    viewForecast: 'ਭਵਿੱਖਬਾਣੀ ਦੇਖੋ',
    weatherConditions: 'ਸਥਾਨਕ ਮੌਸਮ ਜਾਣਕਾਰੀ',
    weatherSub: 'ਬਾਊਂਡਰੀ ਲੇਅਰ, ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ਅਤੇ ਇਨਵਰਜ਼ਨ ਸੂਚਕਾਂਕ',
    trappingIndex: 'ਥਰਮਲ ਇਨਵਰਜ਼ਨ',
    temperature: 'ਤਾਪਮਾਨ',
    humidity: 'ਨਮੀ',
    windSpeed: 'ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ਅਤੇ ਦਿਸ਼ਾ',
    mixingHeight: 'PBL ਮਿਕਸਿੰਗ ਉਚਾਈ',
    precipitation: 'ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ',
    visibility: 'ਦ੍ਰਿਸ਼ਟੀਗੋਚਰਤਾ',
    dispersionDiagnosis: 'ਵਾਯੂਮੰਡਲੀ ਫੈਲਾਅ ਵਿਸ਼ਲੇਸ਼ਣ',
    ventilationIndex: 'ਵੈਂਟੀਲੇਸ਼ਨ ਸੂਚਕਾਂਕ',
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en' as const, name: 'English', nativeName: 'English', shortLabel: 'EN' },
  { code: 'hi' as const, name: 'Hindi', nativeName: 'हिन्दी', shortLabel: 'हिं' },
  { code: 'pa' as const, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', shortLabel: 'ਪੰ' }
];

export function getTranslation(lang: SupportedLanguage): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

export function getCategoryLabel(category: AQICategory | string, lang: SupportedLanguage): string {
  const t = getTranslation(lang);
  switch (category) {
    case 'Good': return t.catGood;
    case 'Satisfactory': return t.catSatisfactory;
    case 'Moderate': return t.catModerate;
    case 'Poor': return t.catPoor;
    case 'Very Poor': return t.catVeryPoor;
    case 'Severe': return t.catSevere;
    case 'Hazardous': return t.catHazardous;
    default: return category;
  }
}

export function getCategoryMeaning(category: AQICategory | string, lang: SupportedLanguage): string {
  const t = getTranslation(lang);
  switch (category) {
    case 'Good': return t.meaningGood;
    case 'Satisfactory': return t.meaningSatisfactory;
    case 'Moderate': return t.meaningModerate;
    case 'Poor': return t.meaningPoor;
    case 'Very Poor': return t.meaningVeryPoor;
    case 'Severe': return t.meaningSevere;
    case 'Hazardous': return t.meaningHazardous;
    default: return '';
  }
}

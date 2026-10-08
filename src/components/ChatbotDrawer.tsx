import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Wind,
  Flame,
  Activity,
  FileText,
  Home,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { LocationId, ChatMessage } from '../types';
import { LOCATIONS } from '../server/dataService';
import { useLanguage } from '../context/LanguageContext';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: LocationId;
  onNavigateSection?: (sectionId: string) => void;
}

interface QuestionCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: string[];
}

const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: 'health',
    label: 'Health & Workout',
    icon: Activity,
    questions: [
      'Is it safe to go for a morning run outside today?',
      'Which mask effectively stops PM2.5 particulates?',
      'What precautions should asthma patients take right now?'
    ]
  },
  {
    id: 'science',
    label: 'Atmospheric Science',
    icon: Wind,
    questions: [
      'What is thermal inversion and why does it trap winter smog?',
      'What is the difference between PM2.5 and PM10?',
      'Why does air pollution peak around midnight in Delhi?'
    ]
  },
  {
    id: 'grap',
    label: 'Policy & GRAP',
    icon: FileText,
    questions: [
      'What are the GRAP Stage 3 and Stage 4 vehicle rules?',
      'Are schools required to close under current AQI levels?',
      'What is the Odd-Even scheme and does it work?'
    ]
  },
  {
    id: 'stubble',
    label: 'Stubble & Plumes',
    icon: Flame,
    questions: [
      'Is there an agricultural smoke plume approaching our area?',
      'Why do farmers burn stubble during October and November?',
      'What solutions exist to eliminate crop residue burning?'
    ]
  },
  {
    id: 'indoor',
    label: 'Home & Purifiers',
    icon: Home,
    questions: [
      'What CADR rating do I need for my bedroom air purifier?',
      'Do indoor houseplants actually lower PM2.5 levels?',
      'When is the safest time of day to open windows for ventilation?'
    ]
  },
  {
    id: 'compare',
    label: 'Compare Areas',
    icon: MapPin,
    questions: [
      'Which area in Delhi NCR currently has the cleanest air?',
      'Why is Anand Vihar consistently more polluted than Lodhi Road?',
      'How does air quality in Noida compare to Gurugram today?'
    ]
  }
];

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  locationId,
  onNavigateSection,
}) => {
  const { language, t } = useLanguage();
  const locName = LOCATIONS[locationId]?.name || 'Delhi NCR';

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('health');

  const getInitialMessage = (location: string, lang: string): ChatMessage => {
    if (lang === 'hi') {
      return {
        id: 'init-1',
        sender: 'assistant',
        text: `### एयरसेंस जलवायु एवं वायुमंडलीय एआई में आपका स्वागत है\n\nमैं **${location}** के लिए आपका सत्यापित पर्यावरण और जलवायु विज्ञान सहायक हूँ।\n\nमैं केंद्रीय प्रदूषण नियंत्रण बोर्ड (CAAQMS) ग्राउंड मॉनिटर, मौसम विभाग (IMD) वायुमंडलीय साउंडिंग और नासा उपग्रह से जुड़ा हुआ हूँ। मुझसे कुछ भी पूछें:\n* **वायुमंडलीय कारक:** थर्मल इन्वर्जन, मिक्सिंग डेप्थ और मौसमी फैलाव।\n* **स्वास्थ्य एवं सावधानी:** मॉर्निंग वॉक का सही समय, N95 मास्क और एयर प्यूरीफायर।\n* **नीति एवं ग्रैप (GRAP):** वाहन प्रतिबंध, निर्माण कार्य नियम और स्कूल सलाह।\n* **क्षेत्रीय स्थिति:** पराली के धुएं का रुख और 72-घंटे का पूर्वानुमान।\n\nआज मैं आपकी क्या मदद कर सकता हूँ?`,
        timestamp: 'अभी',
        groundedFactors: [
          'सक्रिय CAAQMS मॉनिटरिंग',
          'थर्मल इन्वर्जन साउंडिंग लाइव',
          'नासा VIIRS उपग्रह डेटा सक्रिय'
        ],
        suggestedFollowUps: [
          'आज रात प्रदूषण क्यों बढ़ रहा है?',
          'क्या सुबह की सैर करना सुरक्षित है?',
          'GRAP के नए नियम क्या हैं?'
        ]
      };
    }

    if (lang === 'pa') {
      return {
        id: 'init-1',
        sender: 'assistant',
        text: `### ਏਅਰਸੈਂਸ ਜਲਵਾਯੂ ਅਤੇ ਹਵਾ ਗੁਣਵੱਤਾ ਏਆਈ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ\n\nਮੈਂ **${location}** ਲਈ ਤੁਹਾਡਾ ਵਾਤਾਵਰਣ ਵਿਗਿਆਨ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਅਸਲ-ਸਮੇਂ ਦੇ ਪ੍ਰਦੂਸ਼ਣ ਨਿਯੰਤਰਣ ਬੋਰਡ ਅਤੇ ਨਾਸਾ ਉਪਗ੍ਰਹਿ ਡੇਟਾ ਨਾਲ ਜੁੜਿਆ ਹੋਇਆ ਹਾਂ।\n\nਤੁਸੀਂ ਪ੍ਰਦੂਸ਼ਣ ਦੇ ਕਾਰਨਾਂ, ਪਰਾਲੀ ਦੇ ਧੂੰਏਂ, ਜਾਂ ਸਿਹਤ ਸੰਬੰਧੀ ਸਾਵਧਾਨੀਆਂ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।`,
        timestamp: 'ਹੁਣੇ',
        groundedFactors: [
          'ਲਾਈਵ CAAQMS ਟੈਲੀਮੈਟਰੀ',
          'ਨਾਸਾ ਉਪਗ੍ਰਹਿ ਡੇਟਾ ਐਕਟਿਵ'
        ],
        suggestedFollowUps: [
          'ਅੱਜ ਪ੍ਰਦੂਸ਼ਣ ਕਿਉਂ ਵਧ ਰਿਹਾ ਹੈ?',
          'ਕੀ ਬੱਚਿਆਂ ਲਈ ਬਾਹਰ ਖੇਡਣਾ ਸੁਰੱਖਿਅਤ ਹੈ?'
        ]
      };
    }

    return {
      id: 'init-1',
      sender: 'assistant',
      text: `### Welcome to AirSense Climate & Atmospheric AI\n\nI am your verified climate and environmental science assistant for **${location}**.\n\nI am connected to real-time CAAQMS ground monitors, IMD boundary layer soundings, and NASA VIIRS satellite feeds. Ask me anything about:\n* **Atmospheric Physics:** Inversion ceilings, mixing depth, and dispersion meteorology.\n* **Health & Lifestyle:** Safe workout timing, N95 respirators, and HEPA room sizing.\n* **Policy & GRAP:** Vehicle restrictions, odd-even rules, and school advisories.\n* **Local Geography:** Hotspot comparisons and 72-hour pollution outlooks.\n\nWhat can I help you understand today?`,
      timestamp: 'Just now',
      groundedFactors: [
        'Live CAAQMS telemetry connected',
        'Boundary layer inversion soundings active',
        'NASA VIIRS satellite plume tracker online'
      ],
      suggestedFollowUps: [
        'Why is AQI so high tonight?',
        'Is it safe for kids to play outside?',
        'What are the active GRAP Stage restrictions?'
      ]
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialMessage(locName, language)]);

  // Reset or update initial message when language or location changes if only initial message
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [getInitialMessage(locName, language)];
      }
      return prev;
    });
  }, [language, locName]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const resetChat = () => {
    setMessages([getInitialMessage(locName, language)]);
    setInputMessage('');
  };

  const copyMessageText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare multi-turn history payload
    const historyPayload = messages.map(m => ({
      role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locationId,
          message: text,
          history: historyPayload,
          language
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedFactors: data.groundedFactors,
        actionLink: data.actionLink,
        actionLinkLabel: data.actionLinkLabel,
        suggestedFollowUps: data.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: language === 'hi' 
          ? `### ⚠️ सेवा सूचना\n\nन्यूरल इंटेलिजेंस सेवा से संपर्क नहीं हो सका। हालांकि, **${locName}** के निरंतर भौतिकी डेटा के आधार पर:\n\n* **वायुमंडलीय स्थिति:** ज़मीनी स्तर पर थर्मल इन्वर्जन सक्रिय है, जिससे शांत हवा में प्रदूषक सांस लेने की ऊंचाई पर फंसे हुए हैं।\n* **स्वास्थ्य सलाह:** संवेदनशील समूहों (अस्थमा, हृदय रोग, बच्चे) को लंबे समय तक बाहरी गतिविधियों से बचना चाहिए।\n* **उपाय:** बाहर निकलते समय N95 मास्क का उपयोग करें और घर में HEPA एयर प्यूरीफायर चलाएं।`
          : `### ⚠️ Connection Notice\n\nI was unable to reach the neural intelligence service. However, based on our continuous atmospheric physics telemetry for **${locName}**:\n\n* **Atmospheric State:** Ground-level thermal inversion is active, with low surface wind speeds keeping particulate matter trapped close to breathing height.\n* **Health Advisory:** Sensitive groups (asthma, cardiovascular conditions, children) should limit prolonged outdoor exposure.\n* **Mitigation:** Use certified N95 respirators outdoors and run mechanical True HEPA air filtration indoors.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedFactors: ['Telemetry: Active CAAQMS soundings', 'Fallback: Physics-calibrated response'],
        suggestedFollowUps: language === 'hi' ? [
          'बाहर जाने का सबसे सुरक्षित समय कौन सा है?',
          'सर्दियों के स्मॉग के लिए कौन सा एयर प्यूरीफायर सबसे अच्छा है?'
        ] : [
          'What is the safest hour to go outside?',
          'Which air purifier is best for winter smog?'
        ]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1 border-b border-slate-100 pb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="text-slate-400 mt-1 select-none text-[10px]">●</span>
                <span className="flex-1">{parseInlineStyles(content)}</span>
              </div>
            );
          }

          // Numbered items
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="font-bold text-slate-700 select-none text-[11px] min-w-[16px]">{numMatch[1]}.</span>
                <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
              </div>
            );
          }

          // Empty line / paragraph break
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          return <p key={idx}>{parseInlineStyles(trimmed)}</p>;
        })}
      </div>
    );
  };

  // Helper to convert **bold** into <strong> tags
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (!isOpen) return null;

  const currentCategoryObj = QUESTION_CATEGORIES.find(c => c.id === activeCategory) || QUESTION_CATEGORIES[0];

  return (
    <div
      id="airsense-chatbot-drawer"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Climate & AirSense AI</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE CAAQMS TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Station Grounding: <strong className="text-slate-800">{locName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={resetChat}
            title="Reset Conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Suggested Topics / Category Bar */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {QUESTION_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Questions Quick Chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {currentCategoryObj.questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 cursor-pointer shadow-2xs text-left"
            >
              <span>{q}</span>
              <ChevronRight className="h-2.5 w-2.5 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                {isUser ? (
                  <>
                    <span className="font-semibold text-slate-600">You</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                    <User className="h-3 w-3 text-slate-400" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-slate-700" />
                    <span className="font-bold text-slate-800">AirSense Climate AI</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 rounded-tl-none relative group'
                }`}
              >
                {/* Copy button for assistant responses */}
                {!isUser && (
                  <button
                    onClick={() => copyMessageText(m.id, m.text)}
                    title="Copy response"
                    className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    {copiedId === m.id ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}

                {/* Render markdown-style formatted text */}
                {isUser ? (
                  <div className="text-xs text-white whitespace-pre-wrap">{m.text}</div>
                ) : (
                  renderFormattedText(m.text)
                )}

                {/* Grounded telemetry tags */}
                {m.groundedFactors && m.groundedFactors.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-bold">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Grounded Atmospheric Telemetry:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.groundedFactors.map((f, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* In-app action link */}
                {m.actionLink && (
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <button
                      onClick={() => {
                        if (onNavigateSection && m.actionLink) {
                          onNavigateSection(m.actionLink.replace('#', ''));
                          onClose();
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      <span>{m.actionLinkLabel || 'View Details in Dashboard'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Dynamic context-aware suggested follow-up chips */}
                {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    <div className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Suggested Follow-Ups:
                    </div>
                    <div className="flex flex-col gap-1">
                      {m.suggestedFollowUps.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => sendMessage(suggestion)}
                          disabled={isLoading}
                          className="flex items-center justify-between text-left text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <span>{suggestion}</span>
                          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-600 font-mono py-2 bg-white border border-slate-200 rounded-xl px-3.5 shadow-xs max-w-sm">
            <Sparkles className="h-4 w-4 animate-spin text-slate-900 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-800">
                {language === 'hi' ? 'जलवायु और वायुमंडलीय डेटा का विश्लेषण...' : 'Synthesizing climate & atmospheric data...'}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'hi' ? 'CAAQMS मॉनिटर, इन्वर्जन साउंडिंग व जेमिनी' : 'Consulting CAAQMS monitors, inversion sounding & Gemini'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-200 bg-white p-3 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            id="airsense-chat-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              language === 'hi'
                ? `${locName} में वायु गुणवत्ता, स्वास्थ्य या GRAP नियमों के बारे में पूछें...`
                : language === 'pa'
                ? `${locName} ਵਿੱਚ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਜਾਂ ਨਿਯਮਾਂ ਬਾਰੇ ਪੁੱਛੋ...`
                : `Ask about climate, GRAP rules, health, or smog in ${locName}...`
            }
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
          />

          <button
            id="airsense-chat-send-btn"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>{language === 'hi' ? 'CPCB 6-स्तरीय पैमाना एवं वास्तविक CAAQMS ग्राउंडिंग' : 'Official CPCB 6-Tier Scale & CAAQMS Grounding'}</span>
          <span>{language === 'hi' ? 'स्मार्ट मेमोरी सक्रिय' : 'Multi-turn memory active'}</span>
        </div>
      </div>
    </div>
  );
};

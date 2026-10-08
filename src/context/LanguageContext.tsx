import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, AQICategory } from '../types';
import {
  TranslationDictionary,
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  getTranslation,
  getCategoryLabel,
  getCategoryMeaning
} from '../utils/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationDictionary | string, fallback?: string) => string;
  getCategoryName: (category: AQICategory | string) => string;
  getCategoryExplanation: (category: AQICategory | string) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'airsense_user_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'pa') {
        return saved;
      }
      // Check browser language
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('hi')) return 'hi';
      if (browserLang.startsWith('pa')) return 'pa';
    } catch {
      // LocalStorage unavailable
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const t = (key: keyof TranslationDictionary, fallback?: string): string => {
    const dict = getTranslation(language);
    return dict[key] || fallback || (TRANSLATIONS.en[key] as string) || '';
  };

  const getCategoryName = (category: AQICategory | string): string => {
    return getCategoryLabel(category, language);
  };

  const getCategoryExplanation = (category: AQICategory | string): string => {
    return getCategoryMeaning(category, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getCategoryName,
        getCategoryExplanation,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

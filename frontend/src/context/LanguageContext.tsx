import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  languageNames: Record<SupportedLanguage, { label: string; native: string; flag: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const languageNames: Record<SupportedLanguage, { label: string; native: string; flag: string }> = {
  en: { label: 'English', native: 'English', flag: '🌐' },
  hi: { label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  ta: { label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  kn: { label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ml: { label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('skillbridge_language') as SupportedLanguage) || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('skillbridge_language', lang);
  };

  const t = (key: string): string => {
    const currentDict = translations[language] || translations.en;
    if (currentDict[key]) return currentDict[key];
    return translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, detectLanguage, rtlLanguages } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first, then detect from browser
    const saved = localStorage.getItem('babywish-language');
    return saved || detectLanguage();
  });

  const t = translations[language] || translations.de;
  const isRTL = rtlLanguages.includes(language);

  useEffect(() => {
    localStorage.setItem('babywish-language', language);
    // Set document direction for RTL languages
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

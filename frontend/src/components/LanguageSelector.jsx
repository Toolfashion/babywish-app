import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { languageNames } from '../translations';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
        data-testid="language-selector"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageNames[language]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
            {Object.entries(languageNames).map(([code, name]) => (
              <button
                key={code}
                onClick={() => {
                  changeLanguage(code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                  language === code ? 'text-primary bg-white/5' : 'text-white'
                }`}
                data-testid={`lang-option-${code}`}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;

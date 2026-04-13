import { useState, useEffect } from 'react';

// Free IP geolocation API
const GEOIP_API = 'https://ipapi.co/json/';

export const useCountryDetection = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // First try to get from localStorage cache (valid for 24 hours)
        const cached = localStorage.getItem('user_country');
        const cachedTime = localStorage.getItem('user_country_time');
        
        if (cached && cachedTime) {
          const cacheAge = Date.now() - parseInt(cachedTime);
          if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
            setCountryCode(cached);
            setLoading(false);
            return;
          }
        }

        // Fetch from IP geolocation API
        const response = await fetch(GEOIP_API);
        if (!response.ok) throw new Error('Failed to fetch location');
        
        const data = await response.json();
        const country = data.country_code || data.country;
        
        if (country) {
          setCountryCode(country);
          localStorage.setItem('user_country', country);
          localStorage.setItem('user_country_time', Date.now().toString());
        }
      } catch (err) {
        console.error('Country detection error:', err);
        setError(err.message);
        
        // Fallback: try to detect from browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const langCountryMap = {
          'el': 'GR', 'de': 'DE', 'en-US': 'US', 'en-GB': 'GB',
          'es': 'ES', 'fr': 'FR', 'it': 'IT', 'pt': 'PT', 'pt-BR': 'BR',
          'ru': 'RU', 'zh': 'CN', 'ja': 'JP', 'ko': 'KR',
          'ar': 'SA', 'hi': 'IN', 'tr': 'TR', 'pl': 'PL', 'cs': 'CZ',
          'sr': 'RS', 'sv': 'SE', 'no': 'NO', 'da': 'DK', 'fi': 'FI',
        };
        
        const langCode = browserLang.split('-')[0];
        const fallbackCountry = langCountryMap[browserLang] || langCountryMap[langCode] || 'US';
        setCountryCode(fallbackCountry);
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  return { countryCode, loading, error };
};

export default useCountryDetection;

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const DescriptionPickerWheel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('in');
  const { t } import { useLanguage } from '../context/LanguageContext';

const AppFooter = () => {
  const { language } = useLanguage();

  // Slogan translations - "Love, invincible in battle!" from Antigone by Sophocles
  const sloganTranslations = {
    en: "Love, invincible in battle!",
    el: "Ἔρως ἀνίκατε μάχαν!",
    de: "Eros, unbesiegbar im Kampf!",
    fr: "Éros, invincible au combat!",
    es: "¡Eros, invencible en batalla!",
    it: "Eros, invincibile in battaglia!",
    pt: "Eros, invencível na batalha!",
    nl: "Eros, onoverwinnelijk in de strijd!",
    pl: "Eros, niezwyciężony w walce!",
    ru: "Эрос, непобедимый в битве!",
    uk: "Ерос, непереможний у битві!",
    zh: "爱神，战无不胜！",
    ja: "エロス、戦いに無敵！",
    ko: "에로스, 전투에서 무적!",
    ar: "إيروس، الذي لا يُقهر في المعركة!",
    hi: "इरोस, युद्ध में अजेय!",
    tr: "Eros, savaşta yenilmez!",
    vi: "Eros, bất khả chiến bại!",
    fa: "اروس، شکست‌ناپذیر در نبرد!",
    sv: "Eros, oövervinnelig i strid!",
    sr: "Ерос, непобедив у боју!",
    cs: "Eros, nepřemožitelný v boji!"
  };

  const slogan = sloganTranslations[language] || sloganTranslations.en;

  return (
    <>
      {/* Bottom Footer Bar - Transparent */}
      <footer 
        className="relative w-full z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 5px)',
          background: 'transparent',
        }}
      >
        <div className="flex items-center justify-center py-2 px-4">
          <p 
            className="font-semibold tracking-wide"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '13px',
              color: '#40E0D0',
              textShadow: '0 0 10px rgba(64, 224, 208, 0.5), 0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {slogan}
          </p>
        </div>
      </footer>
    </>
  );
};

export default AppFooter;
 useLanguage();

  // Description texts array with translations
  const descriptions = [
    {
      text: t.desc1 || 'Enter the parents\' birthdays and let AI reveal the gender of your future child.',
      highlight: null
    },
  
      text: t.desc2 || 'Through the first and only',
      highlight: 'Data-Driven Baby Gender',
      highlight2: 'AI Agenten mindjerrs',
    },
    {
      text: t.desc3 || 'algorithm that analyzes the biological and statistical cycles of the couple for gender prediction.',
      highlight: null
    },
  ];

  // Auto-rotate descriptions every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('out');
      
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % descriptions.length);
        setSlideDirection('in');
      }, 600);
    }, 5000);

    return () => clearInterval(interval);
  }, [descriptions.length]);

  const currentDesc = descriptions[activeIndex];

  return (
    <div 
      className="relative mx-auto rounded-2xl overflow-hidden"
      style={{
        width: '90%',
        maxWidth: '550px',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '15px 12px',
        minHeight: '110px',
      }}
    >
      {/* CSS for vertical slide animation and rainbow */}
      <style>{`
        @keyframes descSlideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes descSlideOutToTop {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        @keyframes rainbowMoveDesc {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .desc-slide-in {
          animation: descSlideInFromBottom 0.6s ease-out forwards;
        }
        .desc-slide-out {
          animation: descSlideOutToTop 0.6s ease-in forwards;
        }
        .rainbow-text-desc {
          background: linear-gradient(90deg, #f472b6, #c084fc, #60a5fa, #22d3ee, #2dd4bf, #fbbf24, #f472b6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: rainbowMoveDesc 4s linear infinite;
        }
      `}</style>

      {/* Description content with vertical slide */}
      <div 
        className={`flex flex-col items-center justify-center w-full text-center px-2 ${
          slideDirection === 'in' ? 'desc-slide-in' : 'desc-slide-out'
        }`}
      >
        {currentDesc.highlight ? (
          <>
            <p 
              className="text-sm md:text-base leading-relaxed font-semibold"
              style={{ 
                color: '#ffffff',
                textShadow: '0 0 15px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.8)',
                margin: 0,
              }}
            >
              {currentDesc.text}
            </p>
            <p 
              className="font-bold mt-2 text-base md:text-lg"
              style={{ 
                color: '#22d3ee',
                textShadow: '0 0 25px rgba(34, 211, 238, 1), 0 0 50px rgba(96, 165, 250, 0.8), 0 4px 15px rgba(0,0,0,0.9)',
                margin: 0,
              }}
            >
              {currentDesc.highlight}
            </p>
            {currentDesc.highlight2 && (
              <p 
                className="font-bold mt-1 text-base md:text-lg rainbow-text-desc"
                style={{ 
                  textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  margin: 0,
                }}
              >
                {currentDesc.highlight2}
              </p>
            )}
          </>
        ) : (
          <p 
            className="text-sm md:text-base text-center leading-relaxed font-semibold"
            style={{ 
              color: '#ffffff',
              textShadow: '0 0 15px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.8)',
              margin: 0,
            }}
          >
            {currentDesc.text}
          </p>
        )}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-3">
        {descriptions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSlideDirection('out');
              setTimeout(() => {
                setActiveIndex(idx);
                setSlideDirection('in');
              }, 300);
            }}
            className={`rounded-full transition-all duration-300 ${
              idx === activeIndex 
                ? 'w-4 h-2 bg-cyan-400' 
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DescriptionPickerWheel;

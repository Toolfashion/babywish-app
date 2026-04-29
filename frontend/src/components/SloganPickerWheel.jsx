import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const SloganPickerWheel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('in');
  const { t } = useLanguage();

  // Slogans array with translations
  const slogans = [
    {
      line1: t.slogan1Line1 || 'The science of probability, at the service of',
      highlight1: t.slogan1Highlight || 'your family!',
    },
    {
      line1: t.slogan2Line1 || 'Plan your future, based on your own',
      highlight1: t.slogan2Highlight || 'biological clock!',
    },
    {
      line1: 'Data-Driven Baby Gender',
      highlight1: 'AI Agenten Mindjerrs',
    },
  ];

  // Auto-rotate slogans every 6 seconds (slower)
  useEffect(() => {
    const interval = setInterval(() => {
      // Slide out
      setSlideDirection('out');
      
      // After slide out animation, change slogan and slide in
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slogans.length);
        setSlideDirection('in');
      }, 800); // Match the CSS transition duration
    }, 6000); // 6 seconds between changes

    return () => clearInterval(interval);
  }, [slogans.length]);

  const currentSlogan = slogans[activeIndex];

  return (
    <div 
      className="relative mx-auto rounded-2xl overflow-hidden"
      style={{
        width: '90%',
        maxWidth: '520px',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px 15px',
        minHeight: '120px',
      }}
    >
      {/* CSS for vertical slide animation and rainbow gradient */}
      <style>{`
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToTop {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        @keyframes rainbowMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .slogan-slide-in {
          animation: slideInFromBottom 0.8s ease-out forwards;
        }
        .slogan-slide-out {
          animation: slideOutToTop 0.8s ease-in forwards;
        }
        .rainbow-text {
          background: linear-gradient(90deg, #f472b6, #c084fc, #60a5fa, #22d3ee, #2dd4bf, #fbbf24, #f472b6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: rainbowMove 4s linear infinite;
        }
        .rainbow-highlight {
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.5), 0 4px 15px rgba(0,0,0,0.9);
        }
      `}</style>

      {/* Slogan content with vertical slide */}
      <div 
        className={`flex flex-col items-center justify-center w-full text-center ${
          slideDirection === 'in' ? 'slogan-slide-in' : 'slogan-slide-out'
        }`}
      >
        <p 
          className="text-base md:text-lg lg:text-xl leading-tight tracking-wide rainbow-text"
          style={{ 
            fontFamily: "'Cinzel', serif", 
            fontWeight: 700,
            textShadow: '0 4px 15px rgba(0,0,0,0.5)',
            margin: 0,
          }}
        >
          {currentSlogan.line1}
        </p>
        <p 
          className="text-xl md:text-2xl lg:text-3xl font-bold mt-2 rainbow-highlight"
          style={{ 
            fontFamily: "'Cinzel', serif",
            textShadow: '0 4px 15px rgba(0,0,0,0.5)',
            margin: 0,
          }}
        >
          {currentSlogan.highlight1}
        </p>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {slogans.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSlideDirection('out');
              setTimeout(() => {
                setActiveIndex(idx);
                setSlideDirection('in');
              }, 400);
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

export default SloganPickerWheel;

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

const SloganPickerWheel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLanguage();

  // Slogans array with translations
  const slogans = [
    {
      line1: t.slogan1Line1 || 'The science of probability, at the service of',
      highlight1: t.slogan1Highlight || 'your family!',
      gradient: 'linear-gradient(90deg, #f472b6, #c084fc, #60a5fa, #22d3ee, #2dd4bf)'
    },
    {
      line1: t.slogan2Line1 || 'Plan your future, based on your own',
      highlight1: t.slogan2Highlight || 'biological clock!',
      gradient: 'linear-gradient(90deg, #22d3ee, #60a5fa, #a78bfa, #f472b6, #fb923c)'
    },
    {
      line1: 'Data-Driven Baby Gender',
      highlight1: 'AI',
      gradient: 'linear-gradient(90deg, #fbbf24, #f59e0b, #22d3ee, #60a5fa)',
      sameColorHighlight: true
    },
  ];

  return (
    <div 
      className="relative mx-auto rounded-2xl overflow-hidden"
      style={{
        width: '90%',
        maxWidth: '520px',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* CSS Animation for gradient */}
      <style>{`
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .slogan-swiper,
        .slogan-swiper .swiper-wrapper,
        .slogan-swiper .swiper-slide {
          width: 100% !important;
        }
        .slogan-swiper .swiper-slide {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
        }
        .slogan-swiper .swiper-slide > div {
          width: 100% !important;
          text-align: center !important;
        }
        .slogan-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
        }
        .slogan-swiper .swiper-pagination-bullet-active {
          background: #22d3ee;
          width: 16px;
          border-radius: 4px;
        }
      `}</style>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent z-20 pointer-events-none" />

      <Swiper
        modules={[EffectCreative, Pagination, Autoplay]}
        effect="creative"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        creativeEffect={{
          prev: {
            translate: [0, '-100%', 0],
            opacity: 0,
          },
          next: {
            translate: [0, '100%', 0],
            opacity: 0,
          },
        }}
        speed={800}
        pagination={{ 
          clickable: true,
          dynamicBullets: true,
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="slogan-swiper"
        style={{ paddingBottom: '40px', height: '100px' }}
      >
        {slogans.map((slogan, index) => (
          <SwiperSlide key={index}>
            <div 
              className="flex flex-col items-center justify-center w-full"
              style={{ textAlign: 'center', width: '100%', padding: '0 15px', boxSizing: 'border-box' }}
            >
              <p 
                className="text-sm md:text-lg lg:text-xl leading-tight tracking-wide"
                style={{ 
                  fontFamily: "'Cinzel', serif", 
                  fontWeight: 700,
                  background: slogan.gradient,
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientMove 4s ease-in-out infinite',
                  textAlign: 'center',
                  width: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {slogan.line1}
              </p>
              <p 
                className="text-lg md:text-xl lg:text-2xl font-bold mt-1"
                style={{ 
                  fontFamily: "'Cinzel', serif",
                  ...(slogan.sameColorHighlight ? {
                    background: slogan.gradient,
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientMove 4s ease-in-out infinite'
                  } : {
                    color: 'white',
                    textShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                  })
                }}
              >
                {slogan.highlight1}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SloganPickerWheel;

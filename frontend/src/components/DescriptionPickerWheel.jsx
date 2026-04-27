import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

const DescriptionPickerWheel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLanguage();

  // Description texts array with translations
  const descriptions = [
    {
      text: t.desc1 || 'Enter the parents\' birthdays and let AI reveal the gender of your future child.',
      highlight: null
    },
    {
      text: t.desc2 || 'Through the first and only',
      highlight: 'Data-Driven Baby Gender AI',
      highlightOnNewLine: true
    },
    {
      text: t.desc3 || 'algorithm that analyzes the biological and statistical cycles of the couple for gender prediction.',
      highlight: null
    },
  ];

  return (
    <div 
      className="relative mx-auto rounded-2xl overflow-hidden"
      style={{
        width: '90%',
        maxWidth: '550px',
        minHeight: '100px',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* CSS Animation for gradient */}
      <style>{`
        @keyframes gradientMoveDesc {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .desc-swiper,
        .desc-swiper .swiper-wrapper,
        .desc-swiper .swiper-slide {
          width: 100% !important;
        }
        .desc-swiper .swiper-wrapper {
          -webkit-transform-style: preserve-3d !important;
          transform-style: preserve-3d !important;
        }
        .desc-swiper .swiper-slide {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          -webkit-transform: translate3d(0,0,0) !important;
        }
        .desc-swiper .swiper-slide > div {
          width: 100% !important;
          text-align: center !important;
        }
        .desc-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
        }
        .desc-swiper .swiper-pagination-bullet-active {
          background: #22d3ee;
          width: 16px;
          border-radius: 4px;
        }
      `}</style>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent z-20 pointer-events-none" />

      <Swiper
        modules={[EffectCreative, Pagination, Autoplay]}
        effect="creative"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        creativeEffect={{
          prev: {
            translate: [0, '-80%', 0],
            opacity: 0,
            scale: 0.9,
          },
          next: {
            translate: [0, '80%', 0],
            opacity: 0,
            scale: 0.9,
          },
        }}
        speed={600}
        pagination={{ 
          clickable: true,
          dynamicBullets: true,
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="desc-swiper"
        style={{ paddingBottom: '35px', height: '120px' }}
      >
        {descriptions.map((desc, index) => (
          <SwiperSlide key={index}>
            <div 
              className="flex flex-col items-center justify-center w-full px-4 py-2"
            >
              {desc.highlight ? (
                <div className="text-center w-full">
                  <p className="text-lg md:text-xl leading-relaxed font-semibold"
                    style={{ 
                      color: '#ffffff',
                      textShadow: '0 0 15px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.8)'
                    }}
                  >
                    {desc.text}
                  </p>
                  <p 
                    className="font-bold mt-2 text-xl md:text-2xl"
                    style={{ 
                      color: '#22d3ee',
                      textShadow: '0 0 25px rgba(34, 211, 238, 1), 0 0 50px rgba(96, 165, 250, 0.8), 0 4px 15px rgba(0,0,0,0.9)'
                    }}
                  >
                    {desc.highlight}
                  </p>
                </div>
              ) : (
                <p className="text-lg md:text-xl text-center leading-relaxed font-semibold"
                  style={{ 
                    color: '#ffffff',
                    textShadow: '0 0 15px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.8)'
                  }}
                >
                  {desc.text}
                </p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default DescriptionPickerWheel;

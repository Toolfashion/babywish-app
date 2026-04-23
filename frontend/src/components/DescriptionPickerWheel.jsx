
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const DescriptionPickerWheel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLanguage();

  const descriptions = [
    { text: t.desc1 || 'Enter the parents\' birthdays and let AI reveal the gender of your future child.', highlight: null },
    { text: t.desc2 || 'Through the first and only', highlight: 'Data-Driven Baby Gender AI' },
    { text: t.desc3 || 'algorithm that analyzes the biological and statistical cycles of the couple for gender prediction.', highlight: null },
  ];

  return (
    <div className="relative mx-auto rounded-2xl overflow-hidden" style={{ width: '100%', maxWidth: '700px', background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <style>{`
        @keyframes gradientMoveDesc { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .desc-swiper .swiper-slide { opacity: 0.4; transform: scale(0.85); transition: all 0.3s ease; }
        .desc-swiper .swiper-slide-active { opacity: 1; transform: scale(1); }
        .desc-swiper .swiper-pagination-bullet { background: rgba(255, 255, 255, 0.3); opacity: 1; }
        .desc-swiper .swiper-pagination-bullet-active { background: #22d3ee; width: 16px; border-radius: 4px; }
      `}</style>
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent z-20 pointer-events-none" />
      <Swiper modules={[EffectCoverflow, Pagination, Autoplay]} effect="coverflow" grabCursor={true} centeredSlides={true} slidesPerView={1.3} loop={true} autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }} coverflowEffect={{ rotate: 20, stretch: 0, depth: 120, modifier: 1, slideShadows: false }} pagination={{ clickable: true, dynamicBullets: true }} onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} className="desc-swiper py-5" style={{ paddingBottom: '35px' }}>
        {descriptions.map((desc, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col items-center justify-center px-6 py-4 min-h-[80px]">
              {desc.highlight ? (
                <div className="text-center">
                  <p className="text-sm md:text-base leading-relaxed text-gray-300">{desc.text}</p>
                  <p className="font-bold mt-1 text-base md:text-lg" style={{ background: 'linear-gradient(90deg, #22d3ee, #60a5fa, #a78bfa, #f472b6)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradientMoveDesc 4s ease-in-out infinite' }}>{desc.highlight}</p>
                </div>
              ) : (
                <p className="text-sm md:text-base text-center leading-relaxed text-gray-300">{desc.text}</p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default DescriptionPickerWheel;

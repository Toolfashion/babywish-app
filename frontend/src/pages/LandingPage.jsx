import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// TikTok Icon Component
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// Facebook Icon Component
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Single Floating Button Component
const FloatingReelButton = ({ 
  type, // 'tiktok' or 'facebook'
  videos,
  initialPosition,
  t
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isWheelDragging, setIsWheelDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Position state - using left positioning
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  
  const wheelRef = useRef(null);
  const startY = useRef(0);
  const startIndex = useRef(0);

  const ITEM_HEIGHT = 70;
  const VISIBLE_ITEMS = 5;

  const isTikTok = type === 'tiktok';
  const label = isTikTok ? 'Reels' : 'Faceb.';
  const Icon = isTikTok ? TikTokIcon : FacebookIcon;
  // Same gradient for both buttons
  const gradientClass = 'from-cyan-600 to-purple-600';

  // Wheel scroll handler for the picker
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    setSelectedIndex(prev => {
      const newIndex = prev + delta;
      if (newIndex < 0) return 0;
      if (newIndex >= videos.length) return videos.length - 1;
      return newIndex;
    });
  };

  // Wheel/picker drag handlers (for scrolling through videos)
  const handleWheelDragStart = (e) => {
    setIsWheelDragging(true);
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    startIndex.current = selectedIndex;
  };

  const handleWheelDragMove = (e) => {
    if (!isWheelDragging) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = startY.current - currentY;
    const indexDiff = Math.round(diff / ITEM_HEIGHT);
    let newIndex = startIndex.current + indexDiff;
    newIndex = Math.max(0, Math.min(videos.length - 1, newIndex));
    setSelectedIndex(newIndex);
  };

  const handleWheelDragEnd = () => {
    setIsWheelDragging(false);
  };

  // Button drag handlers (for moving the closed button around the screen)
  const handleButtonDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    hasMoved.current = false;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = { x: clientX, y: clientY };
    dragStartOffset.current = { x: position.x, y: position.y };
  };

  const handleButtonDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    // Check if we've moved enough to consider it a drag (increased threshold)
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      hasMoved.current = true;
    }
    
    // Only move if we've actually dragged
    if (hasMoved.current) {
      // Calculate new position using left positioning
      const newX = Math.max(16, Math.min(window.innerWidth - 120, dragStartOffset.current.x + deltaX));
      const newY = Math.max(80, Math.min(window.innerHeight - 80, dragStartOffset.current.y + deltaY));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleButtonDragEnd = (e) => {
    // If we didn't move, trigger click to open
    if (!hasMoved.current && isDragging) {
      setIsOpen(true);
    }
    setIsDragging(false);
  };

  const handleButtonClick = (e) => {
    // This is a fallback for when drag handlers don't fire
    if (!isDragging && !hasMoved.current) {
      setIsOpen(true);
    }
  };

  // Global mouse/touch move and up handlers
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handleButtonDragMove(e);
      const handleGlobalEnd = () => handleButtonDragEnd();
      
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('touchend', handleGlobalEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
      };
    }
  }, [isDragging, position]);

  // Auto-rotate through videos when open
  useEffect(() => {
    if (isOpen && !isWheelDragging) {
      const interval = setInterval(() => {
        setSelectedIndex(prev => (prev + 1) % videos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isWheelDragging, videos.length]);

  const getItemStyle = (index) => {
    const diff = index - selectedIndex;
    const absD = Math.abs(diff);
    
    const rotateX = diff * 30;
    const translateZ = absD * -30;
    const translateY = diff * ITEM_HEIGHT * 0.5;
    const opacity = Math.max(0, 1 - absD * 0.4);
    const scale = Math.max(0.6, 1 - absD * 0.2);
    
    return {
      transform: `perspective(400px) rotateX(${rotateX}deg) translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale})`,
      opacity,
      zIndex: 10 - absD,
    };
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {!isOpen ? (
        // Closed state - Draggable button
        <motion.div
          key={`closed-${type}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: isDragging ? 1.1 : 1,
            boxShadow: isDragging ? '0 0 30px rgba(34, 211, 238, 0.5)' : '0 0 20px rgba(34, 211, 238, 0.3)'
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed z-50 bg-gradient-to-r ${gradientClass} rounded-full ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2'} flex items-center gap-1.5 shadow-lg transition-shadow ios-fixed ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 9998,
            userSelect: 'none',
            touchAction: 'none',
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitPerspective: 1000,
            perspective: 1000,
            willChange: 'transform'
          }}
          onMouseDown={handleButtonDragStart}
          onTouchStart={handleButtonDragStart}
          onClick={handleButtonClick}
        >
          <Icon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white pointer-events-none`} />
          <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'} font-bold pointer-events-none`}>{label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            className="ml-0.5 text-cyan-200 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-0.5 transition-colors"
          >
            <X className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
          </button>
        </motion.div>
      ) : (
        // Open state - Carousel at dragged position
        <motion.div
          key={`open-${type}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50 rounded-3xl shadow-2xl border border-white/20 overflow-hidden ios-fixed"
          style={{
            position: 'fixed',
            left: `${Math.min(position.x, window.innerWidth - 160)}px`,
            top: `${Math.min(position.y, window.innerHeight - 450)}px`,
            width: '140px',
            zIndex: 9998,
            background: 'rgba(0, 0, 0, 0.85)',
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.2), 0 0 80px rgba(168, 85, 247, 0.1)',
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitPerspective: 1000,
            perspective: 1000,
            willChange: 'transform'
          }}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} px-3 py-1.5 flex items-center justify-between`}>
            <span className="text-white text-xs font-bold flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {label}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-cyan-200 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* iOS Picker Wheel with Thumbnails */}
          <div className="relative">
            <div 
              ref={wheelRef}
              className="relative overflow-hidden cursor-ns-resize"
              style={{ height: `${ITEM_HEIGHT * VISIBLE_ITEMS}px` }}
              onWheel={handleWheel}
              onMouseDown={handleWheelDragStart}
              onMouseMove={handleWheelDragMove}
              onMouseUp={handleWheelDragEnd}
              onMouseLeave={handleWheelDragEnd}
              onTouchStart={handleWheelDragStart}
              onTouchMove={handleWheelDragMove}
              onTouchEnd={handleWheelDragEnd}
            >
              {/* Gradient overlays */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent z-20 pointer-events-none" />
              
              {/* Selection highlight */}
              <div 
                className="absolute inset-x-3 z-10 pointer-events-none rounded-xl border-2 border-cyan-400/70 bg-cyan-400/5"
                style={{
                  top: `${ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)}px`,
                  height: `${ITEM_HEIGHT}px`
                }}
              />

              {/* Thumbnail Items */}
              <div 
                className="absolute inset-0 flex flex-col items-center"
                style={{ paddingTop: `${ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)}px` }}
              >
                {videos.map((video, index) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute w-full px-3 transition-all duration-150"
                    style={{
                      height: `${ITEM_HEIGHT}px`,
                      top: '50%',
                      marginTop: `-${ITEM_HEIGHT / 2}px`,
                      ...getItemStyle(index)
                    }}
                    onClick={(e) => {
                      if (index !== selectedIndex) {
                        e.preventDefault();
                        setSelectedIndex(index);
                      }
                    }}
                  >
                    {/* Thumbnail Card */}
                    <div 
                      className={`relative w-full h-full rounded-lg overflow-hidden ${
                        index === selectedIndex ? 'ring-2 ring-cyan-400 shadow-cyan-500/30 shadow-lg' : ''
                      }`}
                      style={{
                        background: video.thumbnail ? `url(${video.thumbnail}) center/cover` : 'linear-gradient(135deg, #06b6d4, #8b5cf6)'
                      }}
                    >
                      {/* Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className={`bg-black/50 rounded-full p-2 ${index === selectedIndex ? 'scale-110' : 'scale-90'} transition-transform`}>
                          <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                      </div>
                      
                      {/* Number Overlay */}
                      <div className="absolute bottom-1 right-2 text-cyan-300 text-lg font-black drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                        {video.label}
                      </div>
                      
                      {/* Platform Badge */}
                      <div className="absolute top-1 left-1 bg-black/50 rounded-full p-0.5">
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom action */}
            <a
              href={videos[selectedIndex]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block bg-gradient-to-r ${gradientClass} hover:opacity-90 py-2.5 text-center transition-colors`}
            >
              <span className="text-white text-xs font-bold flex items-center justify-center gap-1">
                <Play className="w-3 h-3" fill="white" />
                {t.watchReel || 'Watch Reel'}
              </span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main component that renders both buttons
const FloatingVideoCarousel = () => {
  const { t } = useLanguage();

  // TikTok videos
  const tiktokVideos = [
    { id: 1, url: 'https://vm.tiktok.com/ZGdH8Yabj/', label: '1', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/oxbjiq84_IMG_5930.jpeg' },
    { id: 2, url: 'https://vm.tiktok.com/ZGdHR7d8g/', label: '2', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/pjwbilpb_IMG_5931.jpeg' },
    { id: 3, url: 'https://vm.tiktok.com/ZGdHRnKqD/', label: '3', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/d9p8e2mj_IMG_5932.jpeg' },
    { id: 4, url: 'https://vm.tiktok.com/ZGdHRvWjn/', label: '4', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/o0lfvl81_IMG_5933.jpeg' },
    { id: 5, url: 'https://vm.tiktok.com/ZGdH8L2xC/', label: '5', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/0frrsvhw_IMG_5934.jpeg' },
    { id: 6, url: 'https://vm.tiktok.com/ZGdH8NFef/', label: '6', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/9wcnvyra_IMG_5935.jpeg' },
  ];

  // Facebook videos/reels
  const facebookVideos = [
    { id: 1, url: 'https://www.facebook.com/share/r/1E2aAgDZxZ/?mibextid=wwXIfr', label: '1', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/oxbjiq84_IMG_5930.jpeg' },
    { id: 2, url: 'https://www.facebook.com/share/r/1QLS5U73Eq/?mibextid=wwXIfr', label: '2', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/pjwbilpb_IMG_5931.jpeg' },
    { id: 3, url: 'https://www.facebook.com/share/r/1BqqNuHvGu/?mibextid=wwXIfr', label: '3', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/d9p8e2mj_IMG_5932.jpeg' },
    { id: 4, url: 'https://www.facebook.com/share/r/1Efwdv5fgw/?mibextid=wwXIfr', label: '4', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/o0lfvl81_IMG_5933.jpeg' },
    { id: 5, url: 'https://www.facebook.com/share/v/1BAJnfbpAa/?mibextid=wwXIfr', label: '5', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/0frrsvhw_IMG_5934.jpeg' },
  ];

  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <>
      {/* TikTok Reels Button - Left side, adjusted for mobile */}
      <FloatingReelButton 
        type="tiktok"
        videos={tiktokVideos}
        initialPosition={{ x: 16, y: isMobile ? 70 : 130 }}
        t={t}
      />
      
      {/* Facebook Reels Button - Left side, below TikTok */}
      <FloatingReelButton 
        type="facebook"
        videos={facebookVideos}
        initialPosition={{ x: 16, y: isMobile ? 120 : 185 }}
        t={t}
      />
    </>
  );
};

export default FloatingVideoCarousel;

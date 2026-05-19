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

// Instagram Icon Component
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// X (Twitter) Icon Component
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// YouTube Icon Component
const YouTubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Single Floating Button Component
const FloatingReelButton = ({ 
  type, // 'tiktok', 'facebook', 'instagram', or 'twitter'
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
  const isFacebook = type === 'facebook';
  const isInstagram = type === 'instagram';
  const isTwitter = type === 'twitter';
  const isYouTube = type === 'youtube';
  
  const label = isTikTok ? 'Reels.' : isFacebook ? 'Faceb.' : isInstagram ? 'Insta.' : isYouTube ? 'YouTb.' : 'X-Twi.';
  const Icon = isTikTok ? TikTokIcon : isFacebook ? FacebookIcon : isInstagram ? InstagramIcon : isYouTube ? YouTubeIcon : XIcon;
  // Same gradient for all buttons
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
        // Closed state - Circular icon button (social media style)
        <motion.div
          key={`closed-${type}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: isDragging ? 1.1 : 1,
            boxShadow: isDragging ? '0 0 30px rgba(34, 211, 238, 0.5)' : '0 0 15px rgba(34, 211, 238, 0.3)'
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed z-50 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center shadow-lg transition-shadow ios-fixed ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '44px',
            height: '44px',
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
          <Icon className="w-5 h-5 text-white pointer-events-none" />
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

// Main component that renders all 4 buttons
const FloatingVideoCarousel = () => {
  const { t } = useLanguage();
  
  // Calculate positions - 2 rows layout
  // Row 1: YouTube (left) | Facebook (center) | TikTok (right)
  // Row 2: Instagram (left) | X-Twitter (right)
  const calculatePositions = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
    
    // Button size
    const buttonSize = 44;
    
    // LEFT side position
    const leftPosition = isMobile ? 15 : 19;
    
    // RIGHT side position - ensure button is visible (button width + margin from edge)
    const rightPosition = screenWidth - buttonSize - (isMobile ? 15 : 60);
    
    // CENTER position (exactly between left and right buttons)
    const centerPosition = Math.floor((leftPosition + rightPosition) / 2);
    
    // Y positions
    const row1Y = isMobile ? 140 : 131;
    const row2Y = row1Y + 99;
    
    return {
      // Row 1: YouTube (left), Facebook (center), TikTok (right)
      youtube: { x: leftPosition, y: row1Y },
      facebook: { x: centerPosition, y: row1Y },
      tiktok: { x: rightPosition, y: row1Y },
      // Row 2: Instagram (left, below YouTube), Twitter (right, below TikTok)
      instagram: { x: leftPosition, y: row2Y },
      twitter: { x: rightPosition, y: row2Y }
    };
  };
  
  const [positions, setPositions] = useState(() => calculatePositions());
  
  // Calculate positions on mount AND resize
  useEffect(() => {
    // Calculate immediately on mount
    const newPositions = calculatePositions();
    setPositions(newPositions);
    
    // Also recalculate on resize
    const handleResize = () => {
      const newPos = calculatePositions();
      setPositions(newPos);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Instagram reels - using profile link for now, can be updated with specific reel links
  const instagramVideos = [
    { id: 1, url: 'https://www.instagram.com/getbabywish/', label: '1', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/oxbjiq84_IMG_5930.jpeg' },
    { id: 2, url: 'https://www.instagram.com/getbabywish/', label: '2', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/pjwbilpb_IMG_5931.jpeg' },
    { id: 3, url: 'https://www.instagram.com/getbabywish/', label: '3', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/d9p8e2mj_IMG_5932.jpeg' },
    { id: 4, url: 'https://www.instagram.com/getbabywish/', label: '4', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/o0lfvl81_IMG_5933.jpeg' },
    { id: 5, url: 'https://www.instagram.com/getbabywish/', label: '5', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/0frrsvhw_IMG_5934.jpeg' },
  ];

  // X/Twitter videos - using profile link for now, can be updated with specific video links
  const twitterVideos = [
    { id: 1, url: 'https://x.com/getbabywish', label: '1', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/oxbjiq84_IMG_5930.jpeg' },
    { id: 2, url: 'https://x.com/getbabywish', label: '2', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/pjwbilpb_IMG_5931.jpeg' },
    { id: 3, url: 'https://x.com/getbabywish', label: '3', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/d9p8e2mj_IMG_5932.jpeg' },
    { id: 4, url: 'https://x.com/getbabywish', label: '4', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/o0lfvl81_IMG_5933.jpeg' },
    { id: 5, url: 'https://x.com/getbabywish', label: '5', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/0frrsvhw_IMG_5934.jpeg' },
  ];

  // YouTube videos - channel @getbabywish
  const youtubeVideos = [
    { id: 1, url: 'https://www.youtube.com/@getbabywish', label: '1', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/oxbjiq84_IMG_5930.jpeg' },
    { id: 2, url: 'https://www.youtube.com/@getbabywish', label: '2', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/pjwbilpb_IMG_5931.jpeg' },
    { id: 3, url: 'https://www.youtube.com/@getbabywish', label: '3', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/d9p8e2mj_IMG_5932.jpeg' },
    { id: 4, url: 'https://www.youtube.com/@getbabywish', label: '4', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/o0lfvl81_IMG_5933.jpeg' },
    { id: 5, url: 'https://www.youtube.com/@getbabywish', label: '5', thumbnail: 'https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/0frrsvhw_IMG_5934.jpeg' },
  ];
  
  return (
    <>
      {/* ROW 1: YouTube (left), Facebook (center), TikTok (right) */}
      <FloatingReelButton 
        type="youtube"
        videos={youtubeVideos}
        initialPosition={positions.youtube}
        t={t}
      />
      
      <FloatingReelButton 
        type="facebook"
        videos={facebookVideos}
        initialPosition={positions.facebook}
        t={t}
      />
      
      <FloatingReelButton 
        type="tiktok"
        videos={tiktokVideos}
        initialPosition={positions.tiktok}
        t={t}
      />
      
      {/* ROW 2: Instagram (left), X/Twitter (right) */}
      <FloatingReelButton 
        type="instagram"
        videos={instagramVideos}
        initialPosition={positions.instagram}
        t={t}
      />
      
      <FloatingReelButton 
        type="twitter"
        videos={twitterVideos}
        initialPosition={positions.twitter}
        t={t}
      />
    </>
  );
};

export default FloatingVideoCarousel;

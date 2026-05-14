import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import SpotifyMiniPlayer from './SpotifyMiniPlayer';

// Social Media Icons
const SpotifyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YouTubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// Social items
const socialItems = [
  { id: 'spotify', icon: SpotifyIcon, color: '#1DB954', url: null, isSpotify: true },
  { id: 'facebook', icon: FacebookIcon, color: '#1877F2', url: 'https://www.facebook.com/getbabywish' },
  { id: 'tiktok', icon: TikTokIcon, color: '#ffffff', url: 'https://www.tiktok.com/@getbabywish' },
  { id: 'instagram', icon: InstagramIcon, color: '#E1306C', url: 'https://www.instagram.com/getbabywish/' },
  { id: 'twitter', icon: TwitterIcon, color: '#ffffff', url: 'https://x.com/getbabywish' },
  { id: 'youtube', icon: YouTubeIcon, color: '#FF0000', url: 'https://youtube.com/@getbabywish' },
  { id: 'email', icon: MailIcon, color: '#a855f7', url: 'mailto:getbabywish@protonmail.com' },
];

const SocialPickerWheel = () => {
  const { language } = useLanguage();
  const scrollRef = useRef(null);
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleItemClick = (item, index) => {
    if (item.isSpotify) {
      // Always show the player when clicking Spotify icon
      setIsMinimized(false);
      setShowSpotifyPlayer(true);
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMinimize = () => {
    // Keep player mounted but hidden - music continues
    setIsMinimized(true);
    // Don't set showSpotifyPlayer to false - keep it true so iframe stays mounted
  };

  const handleClose = () => {
    // Fully close - stops music
    setIsMinimized(false);
    setShowSpotifyPlayer(false);
  };

  // Swipe handlers
  const touchStartX = useRef(0);
  
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < socialItems.length - 1) {
        // Swipe left - go to next
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - go to previous
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // Mouse drag handlers
  const mouseStartX = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < socialItems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // Get visible items (3 items: prev, current, next)
  const getVisibleItems = () => {
    const items = [];
    for (let i = -1; i <= 1; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < socialItems.length) {
        items.push({ ...socialItems[index], position: i, realIndex: index });
      } else {
        items.push({ isEmpty: true, position: i });
      }
    }
    return items;
  };

  return (
    <div className="relative w-full">
      {/* Narrow Wheel Container - Shows only 3 icons */}
      <div 
        ref={scrollRef}
        className="flex justify-center items-center py-2 mx-auto overflow-hidden"
        style={{
          width: '200px',
          height: '44px',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(20,20,40,0.5) 50%, rgba(0,0,0,0.4) 100%)',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'grab',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isDragging.current = false}
      >
        <div className="flex items-center justify-center gap-2">
          {getVisibleItems().map((item, idx) => {
            const isCenter = item.position === 0;
            
            if (item.isEmpty) {
              return (
                <div 
                  key={`empty-${idx}`}
                  className="flex-shrink-0"
                  style={{ width: '32px', height: '32px' }}
                />
              );
            }
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item, item.realIndex)}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: isCenter ? 1.2 : 0.85,
                  opacity: isCenter ? 1 : 0.5,
                }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 flex items-center justify-center rounded-full transition-all relative"
                style={{
                  width: isCenter ? '38px' : '30px',
                  height: isCenter ? '38px' : '30px',
                  background: isCenter ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isCenter ? `2px solid ${item.color}` : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <item.icon 
                  className={isCenter ? "w-5 h-5" : "w-4 h-4"}
                  style={{ color: item.color }}
                />
                {/* Playing indicator on Spotify icon when minimized */}
                {item.isSpotify && isMinimized && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1DB954] rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-[5px] text-white">♪</span>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Swipe hint & current icon name */}
      <p className="text-center text-white/50 text-xs mt-2">
        {isMinimized 
          ? <span className="text-[#1DB954]">♪ {language === 'el' ? 'Παίζει...' : 'Playing...'}</span>
          : <>← {socialItems[currentIndex]?.id} →</>
        }
      </p>

      {/* Floating Spotify Mini Player */}
      {(showSpotifyPlayer || isMinimized) && (
        <SpotifyMiniPlayer 
          onClose={handleClose}
          onMinimize={handleMinimize}
          isMinimized={isMinimized}
        />
      )}
    </div>
  );
};

export default SocialPickerWheel;

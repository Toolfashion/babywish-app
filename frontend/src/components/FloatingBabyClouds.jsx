import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Unique baby images
const BABY_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&h=200&fit=crop&crop=face", gender: 'boy' },
  { url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200&h=200&fit=crop&crop=face", gender: 'girl' },
  { url: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=200&h=200&fit=crop&crop=face", gender: 'boy' },
  { url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop&crop=face", gender: 'girl' },
  { url: "https://images.unsplash.com/photo-1596463531892-a29c2a78ef69?w=200&h=200&fit=crop&crop=face", gender: 'boy' },
  { url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop&crop=face", gender: 'girl' },
];

// Alternating positions
const POSITIONS = [
  { left: '8%' },
  { right: '8%' },
  { left: '15%' },
  { right: '15%' },
  { left: '5%' },
  { right: '5%' },
  { left: '20%' },
  { right: '20%' },
  { left: '10%' },
  { right: '10%' },
];

// Cloud sequence with direction and fade point
// fadeAt: 'full' = goes all the way, '75' = fades at 75% of journey
const CLOUD_SEQUENCE = [
  { hasPhoto: false, gender: 'boy', direction: 'down', fadeAt: 'full' },   // Goes all the way DOWN
  { hasPhoto: false, gender: 'girl', direction: 'down', fadeAt: '75' },    // Fades at 75%
  { hasPhoto: true, photoIndex: 0, direction: 'down', fadeAt: 'full' },    // Photo goes all the way DOWN
  { hasPhoto: false, gender: 'boy', direction: 'down', fadeAt: 'full' },   // Goes all the way DOWN
  { hasPhoto: false, gender: 'girl', direction: 'down', fadeAt: '75' },    // Fades at 75%
  { hasPhoto: false, gender: 'boy', direction: 'down', fadeAt: '75' },     // Fades at 75%
  { hasPhoto: true, photoIndex: 1, direction: 'down', fadeAt: 'full' },    // Photo goes all the way DOWN
  { hasPhoto: false, gender: 'girl', direction: 'down', fadeAt: 'full' },  // Goes all the way DOWN
  { hasPhoto: false, gender: 'boy', direction: 'down', fadeAt: '75' },     // Fades at 75%
  { hasPhoto: true, photoIndex: 2, direction: 'down', fadeAt: 'full' },    // Photo goes all the way DOWN
];

const CloudBaby = ({ hasPhoto, imageUrl, gender, position, fadeAt }) => {
  const isBoy = gender === 'boy';
  const cloudColor = isBoy ? 'rgba(147, 197, 253, 0.6)' : 'rgba(251, 207, 232, 0.6)';
  const cloudColorLight = isBoy ? 'rgba(191, 219, 254, 0.4)' : 'rgba(252, 231, 243, 0.4)';
  const borderColor = isBoy ? 'rgba(147, 197, 253, 0.6)' : 'rgba(251, 182, 206, 0.6)';
  const gradientId = `cloud-gradient-${Date.now()}-${Math.random()}`;

  // Calculate end position: full = 110% (off screen), 75 = 75% down
  const endPosition = fadeAt === 'full' ? '110%' : '75%';
  const duration = fadeAt === 'full' ? 20 : 15;

  return (
    <motion.div
      className="absolute"
      style={{ ...position }}
      initial={{ top: '-100px', opacity: 0 }}
      animate={{ top: endPosition, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{
        top: { duration: duration, ease: "linear" },
        opacity: { duration: 0.5 },
      }}
    >
      {/* Blinking animation */}
      <motion.div
        animate={{ opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Gentle horizontal sway */}
        <motion.div
          animate={{ x: [0, 5, -5, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative flex items-center justify-center">
            {/* Cloud */}
            <svg 
              width="70" 
              height="45" 
              viewBox="0 0 70 45" 
              className="absolute"
              style={{ 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                filter: 'blur(1px)',
                zIndex: 1
              }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={cloudColorLight} />
                  <stop offset="100%" stopColor={cloudColor} />
                </linearGradient>
              </defs>
              <ellipse cx="35" cy="27" rx="28" ry="15" fill={`url(#${gradientId})`} />
              <ellipse cx="18" cy="25" rx="15" ry="12" fill={`url(#${gradientId})`} />
              <ellipse cx="52" cy="25" rx="15" ry="12" fill={`url(#${gradientId})`} />
              <ellipse cx="28" cy="18" rx="12" ry="9" fill={`url(#${gradientId})`} />
              <ellipse cx="42" cy="18" rx="12" ry="9" fill={`url(#${gradientId})`} />
            </svg>
            
            {/* Content: Photo or "!" */}
            <div className="relative" style={{ zIndex: 10 }}>
              {hasPhoto ? (
                // Baby Photo
                <>
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `2px solid ${borderColor}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <img 
                      src={imageUrl} 
                      alt="Baby"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div 
                    className="absolute flex items-center justify-center text-white font-bold"
                    style={{
                      bottom: '-1px',
                      right: '-1px',
                      width: '14px',
                      height: '14px',
                      fontSize: '8px',
                      borderRadius: '50%',
                      backgroundColor: isBoy ? 'rgba(96, 165, 250, 0.8)' : 'rgba(244, 114, 182, 0.8)',
                      border: '1px solid rgba(255,255,255,0.7)',
                    }}
                  >
                    {isBoy ? '♂' : '♀'}
                  </div>
                </>
              ) : (
                // Exclamation mark "!"
                <div 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isBoy ? 'rgba(96, 165, 250, 0.3)' : 'rgba(244, 114, 182, 0.3)',
                    border: `2px solid ${borderColor}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold',
                      color: isBoy ? 'rgba(96, 165, 250, 1)' : 'rgba(244, 114, 182, 1)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    !
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const FloatingBabyClouds = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCloud, setShowCloud] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCloud(false);
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % CLOUD_SEQUENCE.length);
        setShowCloud(true);
      }, 500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const cloudData = CLOUD_SEQUENCE[currentIndex];
  const position = POSITIONS[currentIndex % POSITIONS.length];
  
  let imageUrl = null;
  let gender = cloudData.gender || 'boy';
  
  if (cloudData.hasPhoto) {
    const photo = BABY_PHOTOS[cloudData.photoIndex];
    imageUrl = photo.url;
    gender = photo.gender;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 15 }}
      data-testid="floating-baby-clouds"
    >
      <AnimatePresence mode="wait">
        {showCloud && (
          <CloudBaby
            key={currentIndex}
            hasPhoto={cloudData.hasPhoto}
            imageUrl={imageUrl}
            gender={gender}
            position={position}
            fadeAt={cloudData.fadeAt}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingBabyClouds

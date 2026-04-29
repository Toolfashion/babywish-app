imrt { useEffect, useRef, useState } from 'react';

const StarField = () => {
  const containerRef = useRef(null);
  const [isNight, setIsNight] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(0);

  // 6-DAY ROTATION + Sunday default
  // ========================================
  const BACKGROUND_ENABLED = true;
  
  // Day backgrounds with photographer credits
  // Sunday (0) = default beach image, Monday-Saturday (1-6) = metropolis photos
  const dayBackgrounds = [
    // Sunday (0) - Default romantic beach sunset
    { 
      url: "https://images.unsplash.com/photo-1566942482387-e8dc927e5829?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
      photographer: null 
    },
    // Monday (1) - New York
    { 
      url: "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/zgqu5kiy_IMG_6219.jpeg",
      photographer: "Tom Fournier" 
    },
    // Tuesday (2) - Tokyo
    { 
      url: "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/r9c3ce75_IMG_6220.jpeg",
      photographer: "Phil Evenden" 
    },
    // Wednesday (3) - Paris
    { 
      url: "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/iiezny83_IMG_6221.jpeg",
      photographer: "Bento Justin" 
    },
    // Thursday (4) - Moscow
    { 
      url: "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/e2cuw5kz_IMG_6222.jpeg",
      photographer: "Roman Verton" 
    },
    // Friday (5) - New Delhi
    { 
      url: "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/a968q913_IMG_6223.jpeg",
      photographer: "Monojit Dutta" 
    },
    // Saturday (6) - Sydney
    { 
      url: "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/ejojxhx3_IMG_6224.jpeg",
      photographer: "Adrian Rubiales" 
    },
  ];

  // Get current day's background and photographer (with safeguard)
  const currentBackground = dayBackgrounds[dayOfWeek] || dayBackgrounds[0];

  // Check if it's day or night based on user's local time
  useEffect(() => {
    const checkDayNight = () => {
      const now = new Date();
      const hour = now.getHours();
      // Night: 18:00 - 06:00, Day: 06:00 - 18:00
      setIsNight(hour < 6 || hour >= 18);
      // Set day of week (0 = Sunday, 1 = Monday, etc.)
      setDayOfWeek(now.getDay());
    };

    checkDayNight();
    // Check every minute for time changes
    const interval = setInterval(checkDayNight, 60000);

    return () => clearInterval(interval);
  }, []);

  // Create and animate stars
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing stars
    container.innerHTML = '';

    // Create moving stars
    const starCount = isNight ? 150 : 30; // More stars at night, fewer during day
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random initial position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Random size (bigger at night)
      const size = isNight 
        ? Math.random() * 3 + 1 
        : Math.random() * 1.5 + 0.5;
      
      // Random speed for movement
      const speed = Math.random() * 0.02 + 0.005;
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      star.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: ${isNight ? 'white' : 'rgba(255, 255, 255, 0.4)'};
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px ${isNight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)'};
        opacity: ${Math.random() * 0.5 + 0.5};
        transition: opacity 0.5s ease;
      `;
      
      container.appendChild(star);
      stars.push({ 
        element: star, 
        x, 
        y, 
        speed, 
        direction,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Animation loop for moving stars
    let animationId;
    let time = 0;
    
    const animate = () => {
      time += 0.016; // ~60fps
      
      stars.forEach((star) => {
        // Slow horizontal drift
        star.x += star.speed * star.direction;
        
        // Wrap around screen
        if (star.x > 102) star.x = -2;
        if (star.x < -2) star.x = 102;
        
        // Gentle vertical wave motion
        const yOffset = Math.sin(time * 0.5 + star.twinklePhase) * 0.1;
        
        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase);
        const opacity = 0.4 + (twinkle + 1) * 0.3;
        
        star.element.style.left = `${star.x}%`;
        star.element.style.top = `${star.y + yOffset}%`;
        star.element.style.opacity = opacity;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      container.innerHTML = '';
    };
  }, [isNight]);

  // Night background - galaxy/nebula
  const nightBackground = {
    backgroundImage: `url('https://images.unsplash.com/photo-1638189330012-44e36a97312a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxkZWVwJTIwcHVycGxlJTIwbmVidWxhJTIwc3BhY2UlMjBiYWNrZ3JvdW5kJTIwc2VhbWxlc3MlMjB0ZXh0dXJlfGVufDB8fHx8MTc3MjY5MTg5Mnww&ixlib=rb-4.1.0&q=85')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // Day background - changes based on day of week
  const dayBackground = {
    backgroundImage: `url('${currentBackground.url}')`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <>
      {/* Background with smooth day/night transition */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={isNight ? nightBackground : dayBackground}
      >
        {/* Overlay - darker at night, subtle during day */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 ${
            isNight ? 'bg-[#05020D]/80' : 'bg-black/20'
          }`} 
        />
        
        {/* Photographer credit - bottom left, handwritten style */}
        {!isNight && currentBackground.photographer && (
          <div 
            className="absolute z-50"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 60px)',
              left: '12px',
              fontFamily: "'Dancing Script', cursive",
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)',
              letterSpacing: '0.5px',
            }}
          >
            📷 {currentBackground.photographer}
          </div>
        )}
        
        {/* Moon for nighttime */}
        {isNight && (
          <div 
            className="absolute top-16 right-24 w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #FFFACD 0%, #F0E68C 50%, #DAA520 100%)',
              boxShadow: '0 0 40px 10px rgba(255, 250, 205, 0.3)',
            }}
          />
        )}
      </div>
      
      {/* Animated stars */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />
      
      {/* Shooting stars (night only) */}
      {isNight && <ShootingStars />}
    </>
  );
};

// Shooting stars component for extra magic at night
const ShootingStars = () => {
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    const createShootingStar = () => {
      const id = Date.now();
      const star = {
        id,
        startX: Math.random() * 100,
        startY: Math.random() * 30,
        duration: Math.random() * 1 + 0.5,
      };
      
      setShootingStars(prev => [...prev, star]);
      
      // Remove after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, star.duration * 1000 + 100);
    };

    // Random shooting stars every 3-8 seconds
    const scheduleNext = () => {
      const delay = Math.random() * 5000 + 3000;
      return setTimeout(() => {
        createShootingStar();
        scheduleNext();
      }, delay);
    };

    const timeoutId = scheduleNext();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {shootingStars.map(star => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: '100px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, white, transparent)',
            transform: 'rotate(45deg)',
            animation: `shootingStar ${star.duration}s linear forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes shootingStar {
          0% {
            opacity: 1;
            transform: rotate(45deg) translateX(0);
          }
          100% {
            opacity: 0;
            transform: rotate(45deg) translateX(300px);
          }
        }
      `}</style>
    </div>
  );
};

export default StarField;

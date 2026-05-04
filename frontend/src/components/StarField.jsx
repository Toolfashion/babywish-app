import { useEffect, useRef, useState } from 'react';

const StarField = () => {
  const containerRef = useRef(null);
  const [isNight, setIsNight] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [sunTimes, setSunTimes] = useState({ sunrise: '07:00', sunset: '20:30' });

  // 6-DAY ROTATION PROGRAM (Monday-Saturday)
  // ========================================
  // Sunday shows Monday's image (no separate Sunday)
  const BACKGROUND_ENABLED = true;
  
  // Day backgrounds with photographer credits
  // Monday (1) to Saturday (6) - 6 Metropolis Photos
  // URLs point to LOCAL files in /public folder
  const dayBackgrounds = [
    // Index 0 - Used for Sunday, shows Monday's image
    { 
      url: "/IMG_6219.jpeg",
      city: "New York",
      photographer: "Tom Fournier"
    },
    // Monday (1) - New York
    { 
      url: "/IMG_6219.jpeg",
      city: "New York",
      photographer: "Tom Fournier"
    },
    // Tuesday (2) - Tokyo
    { 
      url: "/IMG_6220.jpeg",
      city: "Tokyo",
      photographer: "Phil Evenden"
    },
    // Wednesday (3) - Paris
    { 
      url: "/IMG_6221.jpeg",
      city: "Paris",
      photographer: "Bente Justin"
    },
    // Thursday (4) - Moscow
    { 
      url: "/IMG_6222.jpeg",
      city: "Moscow",
      photographer: "Roman Verton"
    },
    // Friday (5) - New Delhi
    { 
      url: "/IMG_6223.jpeg",
      city: "New Delhi",
      photographer: "Monojit Dutta"
    },
    // Saturday (6) - Sydney
    { 
      url: "/IMG_6224.jpeg",
      city: "Sydney",
      photographer: "Adrian Rubiales"
    },
  ];

  // Get current day's background and photographer (with safeguard)
  const currentBackground = dayBackgrounds[dayOfWeek] || dayBackgrounds[0];

  // Fetch sunrise/sunset times based on user's location (IP-based)
  useEffect(() => {
    const fetchSunTimes = async () => {
      try {
        // First get user's location from IP
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData = await geoResponse.json();
        const { latitude, longitude } = geoData;
        
        if (latitude && longitude) {
          // Get sunrise/sunset times for that location
          const sunResponse = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
          );
          const sunData = await sunResponse.json();
          
          if (sunData.status === 'OK') {
            // Convert UTC times to local time
            const sunrise = new Date(sunData.results.sunrise);
            const sunset = new Date(sunData.results.sunset);
            
            setSunTimes({
              sunrise: `${sunrise.getHours().toString().padStart(2, '0')}:${sunrise.getMinutes().toString().padStart(2, '0')}`,
              sunset: `${sunset.getHours().toString().padStart(2, '0')}:${sunset.getMinutes().toString().padStart(2, '0')}`,
              sunriseHour: sunrise.getHours(),
              sunriseMinute: sunrise.getMinutes(),
              sunsetHour: sunset.getHours(),
              sunsetMinute: sunset.getMinutes()
            });
            
            console.log(`[StarField] Location: ${geoData.city}, ${geoData.country_name}`);
            console.log(`[StarField] Sunrise: ${sunrise.toLocaleTimeString()}, Sunset: ${sunset.toLocaleTimeString()}`);
          }
        }
      } catch (error) {
        console.log('[StarField] Using default times (07:00-20:30)', error.message);
        // Keep default times on error
        setSunTimes({
          sunrise: '07:00',
          sunset: '20:30',
          sunriseHour: 7,
          sunriseMinute: 0,
          sunsetHour: 20,
          sunsetMinute: 30
        });
      }
    };
    
    fetchSunTimes();
  }, []);

  // Check if it's day or night based on sunrise/sunset times
  useEffect(() => {
    const checkDayNight = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // Minutes since midnight
      
      const sunriseTime = (sunTimes.sunriseHour || 7) * 60 + (sunTimes.sunriseMinute || 0);
      const sunsetTime = (sunTimes.sunsetHour || 20) * 60 + (sunTimes.sunsetMinute || 30);
      
      // It's night if before sunrise or after sunset
      const isNightTime = currentTime < sunriseTime || currentTime >= sunsetTime;
      setIsNight(isNightTime);
      
      // Set day of week (0 = Sunday, 1 = Monday, etc.)
      setDayOfWeek(now.getDay());
    };

    checkDayNight();
    // Check every minute for time changes
    const interval = setInterval(checkDayNight, 60000);

    return () => clearInterval(interval);
  }, [sunTimes]);

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

  // Night background video URL - MP4 format for better browser compatibility
  const nightVideoUrl = "/galaxy-bg.mp4";

  // Day background - changes based on day of week
  // Use 'cover' and clip bottom to hide photographer watermark in image
  const dayBackground = {
    backgroundImage: `url('${currentBackground.url}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <>
      {/* Background with smooth day/night transition */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={!isNight ? dayBackground : {}}
      >
        {/* Night Background Image */}
        {isNight && (
          <div
            className="absolute inset-0"
            style={{ 
              zIndex: -1,
              backgroundImage: 'url(/night-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
        
        {/* Overlay - darker at night, subtle during day */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 ${
            isNight ? 'bg-[#05020D]/30' : 'bg-black/20'
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

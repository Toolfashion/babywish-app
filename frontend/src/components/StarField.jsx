import { useEffect, useRef, useState } from 'react';

const StarField = () => {
  const containerRef = useRef(null);
  const [isNight, setIsNight] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(0);

  // 7 beautiful beach photos - one for each day of the week
  const dayBackgrounds = [
    // Sunday (0) - Silhouette couple on beach at golden hour
    "https://images.unsplash.com/photo-1566942482387-e8dc927e5829?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
    // Monday (1) - Couple at sunset with dramatic sky
    "https://images.unsplash.com/photo-1771598570855-0421b0533184?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwzfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
    // Tuesday (2) - Two people walking on tranquil beach with chapel
    "https://images.pexels.com/photos/33792345/pexels-photo-33792345.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    // Wednesday (3) - Couple walking at sunset with reflective shoreline
    "https://images.pexels.com/photos/32645048/pexels-photo-32645048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    // Thursday (4) - Couple on beach wide view
    "https://images.unsplash.com/photo-1652096540895-476d7a710e9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
    // Friday (5) - Purple/pink sky with couple silhouette
    "https://images.unsplash.com/photo-1691683931140-97c696a257a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwyfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2glMjBkaXN0YW50JTIwc21hbGwlMjBzaWxob3VldHRlJTIwdHJvcGljYWwlMjBzdW5zZXQlMjB3aWRlJTIwbGFuZHNjYXBlJTIwc2t5JTIwc2VhfGVufDB8fHx8MTc3NzAxOTA3Mnww&ixlib=rb-4.1.0&q=85",
    // Saturday (6) - Romantic Maldives beach sunset with couple
    "https://images.pexels.com/photos/34260948/pexels-photo-34260948.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ];

  // Check if it's day or night based on user's local time
  useEffect(() => {
    const checkDayNight = () => {
      const now = new Date();
      const hour = now.getHours();
      // Night: 18:00 - 06:00, Day: 06:00 - 18:00
      setIsNight(hour < 6 || hour >= 18);
      // Get day of week (0 = Sunday, 6 = Saturday)
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
    backgroundImage: `url('${dayBackgrounds[dayOfWeek]}')`,
    backgroundSize: '100% 100%', // Zoom out - show full image
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

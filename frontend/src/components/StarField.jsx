import { useEffect, useRef } from 'react';

const StarField = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing stars
    container.innerHTML = '';

    // Create stars
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star animate-twinkle';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${Math.random() * 3 + 1}px`;
      star.style.height = star.style.width;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${Math.random() * 2 + 2}s`;
      container.appendChild(star);
    }

    // Cleanup
    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <>
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1638189330012-44e36a97312a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxkZWVwJTIwcHVycGxlJTIwbmVidWxhJTIwc3BhY2UlMjBiYWNrZ3JvdW5kJTIwc2VhbWxlc3MlMjB0ZXh0dXJlfGVufDB8fHx8MTc3MjY5MTg5Mnww&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#05020D]/80" />
      </div>
      
      {/* Animated stars */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />
    </>
  );
};

export default StarField;

import { motion } from 'framer-motion';

const HandsWithEarth = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Earth Globe */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", damping: 10 }}
        className="relative"
      >
        {/* Cosmic glow behind Earth */}
        <div 
          className="absolute -inset-8 md:-inset-12 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(217, 70, 239, 0.2) 40%, transparent 70%)',
            filter: 'blur(15px)'
          }}
        />
        
        {/* Rotating Earth */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden"
          style={{
            boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(217, 70, 239, 0.3)'
          }}
        >
          <img
            src="https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/7he002t2_IMG_5309.jpeg"
            alt="Earth"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
            data-testid="hero-earth-image"
          />
        </motion.div>
        
        {/* Sun flare on top right */}
        <motion.div
          className="absolute -top-2 -right-2 w-10 h-10 md:w-14 md:h-14"
          animate={{ 
            opacity: [0.6, 1, 0.6],
            scale: [0.9, 1.15, 0.9]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,230,100,1) 0%, rgba(255,180,50,0.6) 40%, transparent 70%)'
            }}
          />
        </motion.div>

        {/* Pulsing outer ring */}
        <motion.div
          className="absolute -inset-3 rounded-full border border-cyan-400/30 pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Floating sparkles around Earth */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 60}%`,
            background: i % 2 === 0 ? '#FFD700' : '#06B6D4'
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.3, 0.5],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default HandsWithEarth;

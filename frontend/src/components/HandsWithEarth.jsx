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
        
        {/* Rotating Earth - Video */}
        <motion.div
          className="relative w-52 h-52 md:w-72 md:h-72 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(217, 70, 239, 0.3)'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
            data-testid="hero-earth-video"
          >
            <source src="https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/0cqx2ba0_ReactNativeBlobUtilTmp_arrhaygkshus8ga2oozzf.MP4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Pulsing outer ring */}
        <motion.div
          className="absolute -inset-3 rounded-full border border-cyan-400/30 pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
};

export default HandsWithEarth;

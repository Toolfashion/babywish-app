import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const AILoadingAnimation = () => {
  const { t } = useLanguage();
  
  const loadingMessages = [
    t.aiAnalyzing || "Analyzing biological cycles...",
    t.aiCalculating || "Calculating probabilities...",
    t.aiProcessing || "Processing cosmic alignments...",
    t.aiGenerating || "Generating prediction...",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center p-8 max-w-md">
        {/* DNA Helix Animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle rotating ring (opposite direction) */}
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-pink-400 border-l-blue-500"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner pulsing core */}
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                rotateY: [0, 180, 360],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl"
            >
              🧬
            </motion.div>
          </div>
          
          {/* Orbiting particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: i % 2 === 0 ? '#60a5fa' : '#f472b6',
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        
        {/* Loading Text */}
        <motion.h2
          className="text-2xl font-bold text-white mb-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {t.aiPredicting || "AI is predicting..."}
        </motion.h2>
        
        {/* Animated Messages */}
        <div className="h-8 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -32, -64, -96, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          >
            {loadingMessages.map((msg, i) => (
              <p key={i} className="h-8 text-cyan-300 text-sm flex items-center justify-center">
                {msg}
              </p>
            ))}
          </motion.div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
        
        {/* Tips */}
        <motion.p
          className="mt-6 text-xs text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {t.aiTip || "Tip: Our AI analyzes 50+ biological factors for accurate predictions"}
        </motion.p>
      </div>
    </motion.div>
  );
};

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Instagram, Facebook, Twitter, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';

const GenderRevealCard = ({ prediction, onClose }) => {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isBoy = prediction?.gender?.toLowerCase() === 'boy' || 
                prediction?.gender?.toLowerCase() === 'αγόρι' ||
                prediction?.gender?.toLowerCase() === 'male';

  const genderText = isBoy ? 'ΑΓΟΡΙ' : 'ΚΟΡΙΤΣΙ';
  const genderEmoji = isBoy ? '👦' : '👧';
  const probability = prediction?.probability || 85;

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `babywish-gender-reveal-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `🎉 Η Τεχνητή Νοημοσύνη του BabyWish προέβλεψε: ${probability}% Πιθανότητα για ${genderText}! ${genderEmoji}\n\n✨ Ανακάλυψε κι εσύ το φύλο του μελλοντικού σου παιδιού!\n👉 getbabywish.com\n\n#BabyWish #GenderReveal #AIprediction #Pregnancy`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const shareToSocial = (platform) => {
    const url = 'https://getbabywish.com';
    const encodedText = encodeURIComponent(shareText);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      instagram: 'https://instagram.com/getbabywish', // Opens our Instagram profile
      tiktok: 'https://tiktok.com/@getbabywish' // Opens our TikTok profile
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Shareable Card */}
        <div
          ref={cardRef}
          className={`relative overflow-hidden rounded-3xl p-8 ${
            isBoy 
              ? 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800' 
              : 'bg-gradient-to-br from-pink-500 via-rose-600 to-purple-700'
          }`}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Card Content */}
          <div className="relative z-10 text-center text-white">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span className="text-lg font-bold tracking-wider">BABYWISH</span>
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>

            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-cyan-300 font-semibold">AI-Driven Statistics</span>
              <span className="text-xs">🤖</span>
            </div>

            {/* Main Prediction */}
            <div className="mb-6">
              <p className="text-white/80 text-sm mb-2">Η Τεχνητή Νοημοσύνη προέβλεψε:</p>
              <div className="text-7xl mb-4">{genderEmoji}</div>
              <h2 className="text-4xl font-black mb-2">{genderText}</h2>
              <div className="flex items-center justify-center gap-2">
                <div className={`text-5xl font-black ${isBoy ? 'text-cyan-300' : 'text-pink-300'}`}>
                  {probability}%
                </div>
                <span className="text-white/80 text-lg">πιθανότητα</span>
              </div>
            </div>

            {/* Decorative Line */}
            <div className={`h-1 w-32 mx-auto rounded-full mb-6 ${isBoy ? 'bg-cyan-400' : 'bg-pink-400'}`} />

            {/* Call to Action */}
            <p className="text-white/70 text-sm mb-2">
              Ανακάλυψε κι εσύ το φύλο του μελλοντικού σου παιδιού!
            </p>
            <p className={`font-bold ${isBoy ? 'text-cyan-300' : 'text-pink-300'}`}>
              getbabywish.com
            </p>

            {/* Watermark */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-xs text-white/50">
                #BabyWish #GenderReveal #AIprediction
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          {/* Download Button */}
          <Button
            onClick={downloadCard}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 py-6 text-lg rounded-xl"
          >
            {downloading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Κατέβασμα...
              </span>
            ) : (
              <>
                <Download className="mr-2 w-5 h-5" />
                Κατέβασε για Instagram Story
              </>
            )}
          </Button>

          {/* Share Buttons */}
          <div className="grid grid-cols-5 gap-2">
            <Button
              onClick={() => shareToSocial('facebook')}
              className="bg-[#1877F2] hover:bg-[#1864D9] py-4"
              title="Share on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => shareToSocial('twitter')}
              className="bg-black hover:bg-gray-800 py-4"
              title="Share on X"
            >
              <Twitter className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => shareToSocial('instagram')}
              className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 py-4"
              title="Visit our Instagram"
            >
              <Instagram className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => shareToSocial('tiktok')}
              className="bg-black hover:bg-gray-800 py-4"
              title="Visit our TikTok"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </Button>
            <Button
              onClick={copyToClipboard}
              className="bg-gray-700 hover:bg-gray-600 py-4"
              title="Copy text"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-white/60 hover:text-white hover:bg-white/10"
          >
            Κλείσιμο
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GenderRevealCard;



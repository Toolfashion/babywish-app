import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Star, Sparkles, Moon, Sun, Heart, RefreshCw, Share2, Check, Copy, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

// Social media icons as SVG components
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const PredictionResult = ({ prediction, onReset, showNewPredictionButton = true }) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const genderEmoji = prediction.predicted_gender === 'boy' ? '👶💙' : '👶💗';
  const genderColor = prediction.predicted_gender === 'boy' ? 'from-cyan-400 to-blue-500' : 'from-pink-400 to-rose-500';
  const genderText = prediction.predicted_gender === 'boy' ? t.boy : t.girl;

  // Get zodiac name (translated if available)
  const zodiacName = prediction.zodiac_sign.translated_name || prediction.zodiac_sign.name;

  // Share text
  const shareText = `✨ Babywish: ${genderText} - ${prediction.suggested_name} ${prediction.zodiac_sign.symbol} ${prediction.chinese_zodiac?.symbol || ''} 🔮`;
  const shareUrl = window.location.origin;

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareToTikTok = async () => {
    try {
      await navigator.clipboard.writeText(shareText + ' ' + shareUrl);
      toast.success('✓ Copied! Opening TikTok...');
      window.open('https://www.tiktok.com/upload', '_blank');
    } catch (err) {
      window.open('https://www.tiktok.com', '_blank');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText + ' ' + shareUrl);
      setCopied(true);
      toast.success('✓');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-6"
      data-testid="prediction-result"
    >
      {/* Main Reveal Card */}
      <motion.div variants={itemVariants} className="relative glass rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-4 right-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <Sun className="w-12 h-12 text-amber-400/30" />
          </motion.div>
        </div>

        <div className="text-center space-y-6 relative z-10">
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold gradient-text">
            {t.yourBaby}
          </motion.h2>

          {/* Gender & Name */}
          <motion.div variants={itemVariants} className="pt-4">
            <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${genderColor} shadow-lg`}>
              <p className="text-white text-lg font-medium">{genderText} {genderEmoji}</p>
              <p className="text-white/90 text-2xl md:text-3xl font-bold mt-1">{prediction.suggested_name}</p>
            </div>
          </motion.div>

          {/* Birth Date */}
          <motion.div variants={itemVariants}>
            <p className="text-2xl md:text-3xl font-semibold text-white">
              {format(new Date(prediction.predicted_birth_date), "dd/MM/yyyy")}
            </p>
          </motion.div>

          {/* Western & Chinese Zodiac */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <div className="glass rounded-2xl px-6 py-4 inline-flex items-center gap-3">
              <span className="text-4xl">{prediction.zodiac_sign.symbol}</span>
              <div className="text-left">
                <p className="text-lg font-bold text-white">{zodiacName}</p>
                <p className="text-xs text-muted-foreground">{t.zodiacSign}</p>
              </div>
            </div>
            
            {prediction.chinese_zodiac && (
              <div className="glass rounded-2xl px-6 py-4 inline-flex items-center gap-3">
                <span className="text-4xl">{prediction.chinese_zodiac.symbol}</span>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">{prediction.chinese_zodiac.name}</p>
                  <p className="text-xs text-muted-foreground">Chinese Zodiac</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Parent Compatibility */}
      {prediction.parent_compatibility && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6" data-testid="compatibility-card">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            Parent Compatibility
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-3xl">{prediction.parent1_zodiac.symbol}</span>
                <p className="text-sm text-white">{prediction.parent1_zodiac.translated_name || prediction.parent1_zodiac.name}</p>
                {prediction.parent1_zodiac.chinese_zodiac && (
                  <p className="text-xs text-muted-foreground">{prediction.parent1_zodiac.chinese_zodiac.symbol} {prediction.parent1_zodiac.chinese_zodiac.name}</p>
                )}
              </div>
              <Sparkles className="w-6 h-6 text-primary" />
              <div className="text-center">
                <span className="text-3xl">{prediction.parent2_zodiac.symbol}</span>
                <p className="text-sm text-white">{prediction.parent2_zodiac.translated_name || prediction.parent2_zodiac.name}</p>
                {prediction.parent2_zodiac.chinese_zodiac && (
                  <p className="text-xs text-muted-foreground">{prediction.parent2_zodiac.chinese_zodiac.symbol} {prediction.parent2_zodiac.chinese_zodiac.name}</p>
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-3xl font-bold text-white">{prediction.parent_compatibility.score_percentage}%</span>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  {prediction.parent_compatibility.level}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{prediction.parent_compatibility.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Zodiac Profile (Expandable) */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            {zodiacName} Profile
          </h3>
          {showDetails ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </button>
        
        {showDetails && prediction.zodiac_sign.description && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-4"
          >
            <p className="text-muted-foreground italic">"{prediction.zodiac_sign.description}"</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction.zodiac_sign.strengths?.length > 0 && (
                <div>
                  <p className="text-sm text-green-400 font-semibold mb-2">💪 Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.zodiac_sign.strengths.map((s, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {prediction.zodiac_sign.weaknesses?.length > 0 && (
                <div>
                  <p className="text-sm text-orange-400 font-semibold mb-2">⚠️ Challenges</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.zodiac_sign.weaknesses.map((w, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs">{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {prediction.zodiac_sign.best_match?.length > 0 && (
              <div>
                <p className="text-sm text-pink-400 font-semibold mb-2">💕 Best Match</p>
                <p className="text-white">{prediction.zodiac_sign.best_match.join(", ")}</p>
              </div>
            )}

            {prediction.zodiac_sign.ruling_planet && (
              <p className="text-sm text-muted-foreground">
                🪐 Ruling Planet: <span className="text-white">{prediction.zodiac_sign.ruling_planet}</span>
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{prediction.cosmic_harmony_score}%</p>
          <p className="text-xs text-muted-foreground">Cosmic Harmony</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
            <span className="text-xl font-bold text-white">{prediction.numerology_number}</span>
          </div>
          <p className="text-2xl font-bold text-white">{t.luckyNumber}</p>
          <p className="text-xs text-muted-foreground">Numerology</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-3">
            <Moon className="w-7 h-7 text-white" />
          </div>
          <p className="text-lg font-bold text-white">{prediction.zodiac_sign.element}</p>
          <p className="text-xs text-muted-foreground">Element</p>
        </motion.div>
      </div>

      {/* Personality Traits */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          {t.personality}
        </h3>
        <div className="flex flex-wrap gap-2">
          {prediction.personality_traits.map((trait, index) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm capitalize"
            >
              {trait}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Lucky Elements */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6" data-testid="lucky-elements">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          {t.feature3}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-xs mb-1">{t.luckyColor}</p>
            <p className="text-white font-medium text-sm">
              {Array.isArray(prediction.lucky_elements?.colors) 
                ? prediction.lucky_elements.colors.join(", ") 
                : prediction.lucky_elements?.color || "Gold"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">{t.luckyNumber}</p>
            <p className="text-white font-medium text-sm">
              {Array.isArray(prediction.lucky_elements?.numbers)
                ? prediction.lucky_elements.numbers.slice(0, 3).join(", ")
                : prediction.lucky_elements?.number || "7"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">{t.luckyDay}</p>
            <p className="text-white font-medium text-sm">{prediction.lucky_elements?.day || "Monday"}</p>
          </div>
          {prediction.lucky_elements?.gemstone && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">{t.luckyGemstone || "Lucky Gemstone"}</p>
              <p className="text-white font-medium text-sm flex items-center justify-center gap-1">
                <span>{prediction.lucky_elements.gemstone.symbol}</span>
                <span>{prediction.lucky_elements.gemstone.name}</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Baby Shopping Links */}
      {prediction.shopping_links && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6" data-testid="shopping-links">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-400" />
            {t.babyGifts || "Baby Gifts"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gemstone Gifts */}
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {prediction.lucky_elements?.gemstone?.symbol} {t.luckyGemstone || "Gemstone"} {t.gifts || "Gifts"}
              </p>
              <div className="flex gap-2 justify-center">
                <a 
                  href={prediction.shopping_links.gemstone?.amazon} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/80 active:scale-95 text-black text-sm font-semibold rounded-full transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Amazon
                </a>
                <a 
                  href={prediction.shopping_links.gemstone?.ebay} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#E53238] hover:bg-[#E53238]/80 active:scale-95 text-white text-sm font-semibold rounded-full transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  eBay
                </a>
              </div>
            </div>
            
            {/* Zodiac Gifts */}
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {prediction.zodiac_sign?.symbol} {t.zodiacSign} {t.gifts || "Gifts"}
              </p>
              <div className="flex gap-2 justify-center">
                <a 
                  href={prediction.shopping_links.zodiac?.amazon} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/80 active:scale-95 text-black text-sm font-semibold rounded-full transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Amazon
                </a>
                <a 
                  href={prediction.shopping_links.zodiac?.ebay} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#E53238] hover:bg-[#E53238]/80 active:scale-95 text-white text-sm font-semibold rounded-full transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  eBay
                </a>
              </div>
            </div>
            
            {/* Baby Clothes */}
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                👶 {t.babyClothes || "Baby Clothes"}
              </p>
              <div className="flex gap-2 justify-center">
                <a 
                  href={prediction.shopping_links.clothes?.amazon} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/80 active:scale-95 text-black text-sm font-semibold rounded-full transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Amazon
                </a>
                <a 
                  href={prediction.shopping_links.clothes?.ebay} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#E53238] hover:bg-[#E53238]/80 active:scale-95 text-white text-sm font-semibold rounded-full transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  eBay
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Share Buttons */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={shareToFacebook} className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white px-4 py-2 rounded-full">
            <FacebookIcon /><span className="hidden sm:inline ml-2">Facebook</span>
          </Button>
          <Button onClick={shareToWhatsApp} className="bg-[#25D366] hover:bg-[#25D366]/90 text-white px-4 py-2 rounded-full">
            <WhatsAppIcon /><span className="hidden sm:inline ml-2">WhatsApp</span>
          </Button>
          <Button onClick={shareToTwitter} className="bg-black hover:bg-black/80 text-white px-4 py-2 rounded-full">
            <TwitterIcon /><span className="hidden sm:inline ml-2">X</span>
          </Button>
          <Button onClick={shareToTikTok} className="bg-gradient-to-r from-[#00f2ea] via-[#ff0050] to-[#00f2ea] text-white px-4 py-2 rounded-full">
            <TikTokIcon /><span className="hidden sm:inline ml-2">TikTok</span>
          </Button>
          <Button onClick={copyToClipboard} variant="outline" className="border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-full">
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
      </motion.div>

      {/* Reset Button */}
      {showNewPredictionButton && onReset && (
        <motion.div variants={itemVariants} className="flex justify-center pt-4">
          <Button onClick={onReset} variant="outline" className="px-8 py-6 text-lg rounded-full border-white/20 hover:bg-white/10">
            <RefreshCw className="w-5 h-5 mr-2" />
            {t.makePrediction}
          </Button>
        </motion.div>
      )}

      <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground/60">
        {t.footer}
      </motion.p>
    </motion.div>
  );
};

export default PredictionResult;

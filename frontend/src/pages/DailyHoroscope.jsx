import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Briefcase, Activity, Sparkles, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://getbabywish.com';

// Social Share Component for Horoscope
const HoroscopeShare = ({ zodiac, message }) => {
  const shareText = `${zodiac.symbol} ${zodiac.zodiac} - Today's Horoscope: "${message}" ✨ Check yours at ${SITE_URL}/horoscope #DailyHoroscope #${zodiac.zodiac} #Astrology`;
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL + '/horoscope')}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    tiktok: `https://www.tiktok.com/share?url=${encodeURIComponent(SITE_URL + '/horoscope')}&text=${encodeURIComponent(shareText)}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    alert('Copied to clipboard! 📋');
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <span className="text-muted-foreground text-sm mr-2">Share:</span>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" 
         className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#1877F2]/80 flex items-center justify-center transition-all hover:scale-110">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
         className="w-9 h-9 rounded-full bg-black hover:bg-black/80 flex items-center justify-center transition-all hover:scale-110">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
         className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#25D366]/80 flex items-center justify-center transition-all hover:scale-110">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
      <button onClick={copyToClipboard}
         className="w-9 h-9 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all hover:scale-110">
        <Share2 className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

const ZodiacCard = ({ horoscope, isSelected, onClick, t }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 ${
        isSelected 
          ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-2 border-purple-400' 
          : 'bg-white/5 hover:bg-white/10 border border-white/10'
      }`}
    >
      <div className="text-center">
        <span className="text-4xl">{horoscope.symbol}</span>
        <p className="text-white font-medium mt-2">{horoscope.zodiac}</p>
      </div>
    </motion.div>
  );
};

const StarRating = ({ score, label, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center">
      <Icon className="w-5 h-5 text-pink-400 mb-1" />
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const DailyHoroscope = () => {
  const { t } = useLanguage();
  const [horoscopes, setHoroscopes] = useState([]);
  const [selectedZodiac, setSelectedZodiac] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchHoroscopes();
  }, []);

  const fetchHoroscopes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/horoscope/all`);
      const data = await response.json();
      setHoroscopes(data);
      if (data.length > 0) {
        setSelectedZodiac(data[0]);
      }
    } catch (error) {
      console.error('Error fetching horoscopes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZodiacSelect = (horoscope) => {
    setSelectedZodiac(horoscope);
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 4 >= horoscopes.length ? 0 : prev + 4));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 4 < 0 ? Math.max(0, horoscopes.length - 4) : prev - 4));
  };

  const visibleHoroscopes = horoscopes.slice(carouselIndex, carouselIndex + 6);

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'positive': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'challenging': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'positive': return '✨';
      case 'neutral': return '☯️';
      case 'challenging': return '💪';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" data-testid="daily-horoscope-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            {t.dailyHoroscope || "Daily Horoscope"}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Zodiac Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-3">
              {visibleHoroscopes.map((horoscope) => (
                <ZodiacCard
                  key={horoscope.zodiac}
                  horoscope={horoscope}
                  isSelected={selectedZodiac?.zodiac === horoscope.zodiac}
                  onClick={() => handleZodiacSelect(horoscope)}
                  t={t}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </motion.div>

        {/* Selected Horoscope Detail */}
        {selectedZodiac && (
          <motion.div
            key={selectedZodiac.zodiac}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{selectedZodiac.symbol}</span>
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedZodiac.zodiac}</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className={getMoodColor(selectedZodiac.mood)}>
                    {getMoodEmoji(selectedZodiac.mood)} {selectedZodiac.mood.charAt(0).toUpperCase() + selectedZodiac.mood.slice(1)} Day
                  </span>
                  <span>•</span>
                  <span>{selectedZodiac.element} Element</span>
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <p className="text-lg text-white leading-relaxed italic">
                "{selectedZodiac.message}"
              </p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StarRating score={selectedZodiac.scores.love} label={t.love || "Love"} icon={Heart} />
              <StarRating score={selectedZodiac.scores.career} label={t.career || "Career"} icon={Briefcase} />
              <StarRating score={selectedZodiac.scores.health} label={t.health || "Health"} icon={Activity} />
            </div>

            {/* Lucky Items */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-xs mb-1">{t.luckyNumber || "Lucky Number"}</p>
                <p className="text-2xl font-bold text-amber-400">{selectedZodiac.lucky_number}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-xs mb-1">{t.luckyColor || "Lucky Color"}</p>
                <p className="text-white font-medium">{selectedZodiac.lucky_color}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-xs mb-1">{t.luckyActivity || "Lucky Activity"}</p>
                <p className="text-white font-medium capitalize">{selectedZodiac.lucky_activity}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-xs mb-1">{t.compatible || "Compatible"}</p>
                <p className="text-white font-medium">{selectedZodiac.compatible_signs.join(", ")}</p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">{t.overallScore || "Overall Score"}</p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-6 py-3 rounded-full">
                <span className="text-3xl font-bold text-white">{selectedZodiac.scores.overall}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <HoroscopeShare zodiac={selectedZodiac} message={selectedZodiac.message} />
          </motion.div>
        )}

        {/* All Zodiac Signs Grid (for mobile - shows all) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 md:hidden"
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {t.allSigns || "All Zodiac Signs"}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {horoscopes.map((horoscope) => (
              <motion.button
                key={horoscope.zodiac}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleZodiacSelect(horoscope)}
                className={`p-3 rounded-xl text-center ${
                  selectedZodiac?.zodiac === horoscope.zodiac
                    ? 'bg-purple-600/40 border border-purple-400'
                    : 'bg-white/5'
                }`}
              >
                <span className="text-2xl">{horoscope.symbol}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyHoroscope;

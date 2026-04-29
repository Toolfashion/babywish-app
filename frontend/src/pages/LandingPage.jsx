import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Star, Moon, Sparkles, ArrowRight, Instagram, Facebook, Twitter, Gift, Video, MessageSquare, Mail } from 'lucide-react';
import StarField from '../components/StarField';
import HandsWithEarth from '../components/HandsWithEarth';
import LanguageSelector from '../components/LanguageSelector';
import FloatingBabyClouds from '../components/FloatingBabyClouds';
import SloganPickerWheel from '../components/SloganPickerWheel';
import DescriptionPickerWheel from '../components/DescriptionPickerWheel';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/start'); // Quick 3-step flow
    }
  };

  // Dynamic features based on language with icons and actions
  const showComingSoonMessage = () => {
    alert(t.featureComingSoon || "This feature is coming soon! Our software is being updated. 🚀");
  };

  const features = [
    { name: t.feature1, icon: "👶", action: () => navigate('/names') },
    { name: t.feature2, icon: "🏥", action: showComingSoonMessage },
    { name: t.feature3, icon: "🏠", action: showComingSoonMessage },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="landing-page">
      <StarField />
      <FloatingBabyClouds />
      
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Promo Banner - Special Offers */}
        <div
          className="relative px-4 py-1 overflow-hidden"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/an1bcvnx_IMG_5821.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3,
            }}
          />
          
          {/* Soft Rainbow Moving Overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <style>{`
              @keyframes rainbowMove {
                0% { background-position: 0% 50%; }
                100% { background-position: 200% 50%; }
              }
            `}</style>
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, 
                  rgba(255,182,193,0.4), 
                  rgba(255,218,185,0.4), 
                  rgba(255,255,200,0.4), 
                  rgba(200,255,200,0.4), 
                  rgba(200,220,255,0.4), 
                  rgba(220,200,255,0.4), 
                  rgba(255,182,193,0.4), 
                  rgba(255,218,185,0.4), 
                  rgba(255,255,200,0.4)
                )`,
                backgroundSize: '200% 100%',
                animation: 'rainbowMove 6s linear infinite',
              }}
            />
          </div>

          {/* Content - Compact */}
          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-0">
            {/* Offer 1 - 50% Discount */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🎁</span>
              <span className="font-bold text-xs text-white drop-shadow-lg">
                {t.promoFreeFirst10 || "50% OFF - Launch Offer!"}
              </span>
              <span className="text-xs text-white/90 drop-shadow-lg">
                21 {t.promoPeople || "people"} • {t.promoVideos || "3 videos"} + {t.promoReview || "1 review"}
              </span>
            </div>
            
            {/* Offer 2 - FREE €25 */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🌟</span>
              <span className="font-bold text-xs text-white drop-shadow-lg">
                {t.promoFreeSubscription || "50% Discount!"}
              </span>
              <span className="text-xs text-white/90 drop-shadow-lg">
                3 {t.promoPeople || "people"} • 21 {t.promoVideos || "videos"} + {t.promoReview || "1 review"}
              </span>
            </div>

            {/* Contact Button */}
            <Button
              onClick={() => window.location.href = 'mailto:getbabywish@hotmail.com'}
              size="sm"
              className="font-semibold text-xs px-3 py-0 h-5 bg-white/95 text-gray-800 hover:bg-white rounded-full shadow-md"
            >
              {t.promoContactUs || "Contact us"}
            </Button>
          </div>
        </div>

        {/* Header */}
        <header className="py-6 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Star className="w-6 h-6 text-amber-400 animate-pulse-slow" />
              <h1 className="text-xl md:text-2xl font-bold gradient-text" data-testid="app-title">
                {t.appTitle}
              </h1>
              {/* Beta Badge */}
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-black rounded-full animate-pulse">
                BETA
              </span>
              <Moon className="w-6 h-6 text-purple-400 animate-pulse-slow" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-4"
            >
              <Button
                data-testid="horoscope-nav-btn"
                onClick={() => navigate('/horoscope')}
                variant="ghost"
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 hidden sm:inline-flex"
              >
                🔮 {t.dailyHoroscope || "Horoscope"}
              </Button>
              
              <Button
                data-testid="best-timing-nav-btn"
                onClick={() => navigate('/best-timing')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 hidden sm:inline-flex"
              >
                ⏰ Best Timing
              </Button>
              
              <Button
                data-testid="gender-reveal-nav-btn"
                onClick={() => navigate('/gender-reveal')}
                variant="ghost"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 hidden sm:inline-flex"
              >
                🎉 Share
              </Button>
              
              <LanguageSelector />
              
              {!loading && (
                isAuthenticated ? (
                  <Button
                    data-testid="dashboard-btn"
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    {t.dashboard}
                  </Button>
                ) : (
                  <>
                    <Button
                      data-testid="login-nav-btn"
                      onClick={() => navigate('/login')}
                      variant="ghost"
                      className="text-muted-foreground hover:text-white hidden sm:inline-flex"
                    >
                      {t.login}
                    </Button>
                    <Button
                      data-testid="register-nav-btn"
                      onClick={() => navigate('/register')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {t.register}
                    </Button>
                  </>
                )
              )}
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center max-w-4xl">
            {/* Hands with Earth Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <HandsWithEarth />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            >
              <span className="gradient-text">{t.heroTitle1}</span>
              <br />
              <span className="text-white">{t.heroTitle2}</span>
            </motion.h2>

            {/* Slogan - iOS Picker Wheel Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <SloganPickerWheel />
            </motion.div>

            {/* Guarantee Banner - Moved up */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 max-w-xl mx-auto mb-6 border border-amber-500/30"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-3xl">🎯</span>
                <span className="text-2xl md:text-3xl font-black text-amber-400">95%</span>
                <span className="text-white font-semibold text-lg">{t.accuracy}</span>
              </div>
              <p className="text-white text-center font-medium mb-2">
                {t.guaranteeText} <span className="text-amber-400 font-bold">{t.guaranteeBold}</span> {t.guaranteeEnd}
              </p>
              <p className="text-center text-sm text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <span>💰</span>
                {t.moneyBack}
              </p>
            </motion.div>

            {/* Description - iOS Picker Wheel Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <DescriptionPickerWheel />
            </motion.div>

            {/* Features - Interactive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              {features.map((feature) => (
                <motion.button
                  key={feature.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={feature.action}
                  className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 active:bg-white/30 transition-all cursor-pointer touch-manipulation select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  data-testid={`feature-btn-${feature.name}`}
                >
                  <span className="mr-2">{feature.icon}</span>
                  <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                  {feature.name}
                </motion.button>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                data-testid="get-started-btn"
                onClick={handleGetStarted}
                className="px-10 py-6 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-purple-500/25 btn-glow animate-glow-pulse"
              >
                <span className="flex items-center gap-3">
                  {t.getStarted}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </motion.div>

            {/* Pricing Preview */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mt-6"
            >
              {t.priceFrom}
            </motion.p>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            {/* Social Media Links */}
            <div className="flex justify-center gap-6 mb-4">
              <a
                href="https://instagram.com/getbabywish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-pink-400 transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/babywish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-blue-400 transition-colors"
                data-testid="social-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/getbabywish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-sky-400 transition-colors"
                data-testid="social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@getbabywish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                data-testid="social-tiktok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a
                href="mailto:getbabywish@hotmail.com"
                className="text-white/60 hover:text-cyan-400 transition-colors"
                data-testid="social-email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground/50 text-center">
              {t.footer}
            </p>
            <button 
              onClick={() => navigate('/terms')}
              className="text-xs text-purple-400 hover:text-purple-300 underline mt-1 block mx-auto text-center"
            >
              Terms & Conditions | Refund Policy
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

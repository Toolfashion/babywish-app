import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Star, Moon, Sparkles, ArrowRight } from 'lucide-react';
import StarField from '../components/StarField';
import HandsWithEarth from '../components/HandsWithEarth';
import LanguageSelector from '../components/LanguageSelector';
import FloatingBabyClouds from '../components/FloatingBabyClouds';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Dynamic features based on language with icons and actions
  const features = [
    { name: t.feature1, icon: "👶", action: () => navigate('/names') },
    { name: t.feature2, icon: "♈", action: () => navigate('/horoscope') },
    { name: t.feature3, icon: "🍀", action: () => navigate('/lucky-elements') },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="landing-page">
      <StarField />
      <FloatingBabyClouds />
      
      <div className="relative z-20 min-h-screen flex flex-col">
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

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed"
            >
              {t.heroDescription}
            </motion.p>

            {/* Guarantee Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6 max-w-xl mx-auto mb-8 border border-amber-500/30"
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
        <footer className="py-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            {t.footer}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

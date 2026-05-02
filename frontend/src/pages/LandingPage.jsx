import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Star, Moon, Sparkles, ArrowRight, Instagram, Facebook, Twitter, Gift, Video, MessageSquare, Mail, X } from 'lucide-react';
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
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoFormData, setPromoFormData] = useState({
    email: '',
    offerType: 'launch50',
    videoLinks: '',
    reviewLink: '',
    socialPlatform: 'tiktok'
  });
  const [promoSubmitting, setPromoSubmitting] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

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
          {/* Animated Rainbow Background */}
          <div className="absolute inset-0 overflow-hidden">
            <style>{`
              @keyframes rainbowShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, 
                  rgba(255,100,150,0.6), 
                  rgba(255,180,100,0.6), 
                  rgba(255,255,120,0.6), 
                  rgba(120,255,150,0.6), 
                  rgba(120,200,255,0.6), 
                  rgba(200,150,255,0.6), 
                  rgba(255,100,200,0.6),
                  rgba(255,100,150,0.6)
                )`,
                backgroundSize: '300% 100%',
                animation: 'rainbowShift 8s ease-in-out infinite',
              }}
            />
          </div>

          {/* Content - Promo Offers - Compact 2 Lines */}
          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-1 py-1 px-3">
            {/* Line 1 - Launch 50% */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-sm">🎁</span>
              <span className="font-bold text-xs text-yellow-300 drop-shadow-lg">Launch 50%</span>
              <span className="text-xs text-white/80">5 videos + review</span>
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">4/9</span>
            </div>
            
            {/* Line 2 - Free Pass 100% */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-sm">🌟</span>
              <span className="font-bold text-xs text-green-300 drop-shadow-lg">Free Pass 100%</span>
              <span className="text-xs text-white/80">9 videos + review</span>
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">0/3</span>
              <Button
                onClick={() => setShowPromoForm(true)}
                size="sm"
                className="font-semibold text-[10px] px-2 py-0.5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 rounded-full shadow-md ml-1"
              >
                📝 Αίτηση
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="py-6 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5"
            >
              <Star className="w-5 h-5 text-amber-400 animate-pulse-slow" />
              <h1 className="text-lg md:text-xl font-bold gradient-text" data-testid="app-title">
                {t.appTitle}
              </h1>
              {/* Beta Badge */}
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded-full animate-pulse">
                BETA
              </span>
              <Moon className="w-5 h-5 text-purple-400 animate-pulse-slow" />
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
                  className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 active:bg-white/30 transition-all cursor-pointer touch-manipulation select-none min-w-[140px]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  data-testid={`feature-btn-${feature.name}`}
                >
                  <span className="text-xl mb-1 block">{feature.icon}</span>
                  <span className="whitespace-pre-line text-xs leading-tight">{feature.name}</span>
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
      {/* Promo Application Modal */}
      <PromoApplicationModal
        isOpen={showPromoForm}
        onClose={() => setShowPromoForm(false)}
        formData={promoFormData}
        setFormData={setPromoFormData}
        isSubmitting={promoSubmitting}
        setIsSubmitting={setPromoSubmitting}
        onSuccess={() => {
          setPromoSuccess(true);
          setShowPromoForm(false);
          alert('✅ Η αίτησή σας υποβλήθηκε επιτυχώς! Θα λάβετε email εντός 24-48 ωρών.');
        }}
      />
    </div>
  );
};

// Promo Application Modal Component
const PromoApplicationModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  isSubmitting, 
  setIsSubmitting,
  onSuccess 
}) => {
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/promo/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          offer_type: formData.offerType,
          video_links: formData.videoLinks.split('\n').filter(link => link.trim()),
          review_link: formData.reviewLink,
          social_platform: formData.socialPlatform
        })
      });
      
      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.detail || 'Σφάλμα κατά την υποβολή. Δοκιμάστε ξανά.');
      }
    } catch (err) {
      alert('Σφάλμα σύνδεσης. Δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20" />
          <div className="relative flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              Αίτηση Προσφοράς
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Offer Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Επιλέξτε Προσφορά</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, offerType: 'launch50' }))}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.offerType === 'launch50'
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-1">🎁</div>
                <div className="text-sm font-bold text-yellow-300">50% Έκπτωση</div>
                <div className="text-xs text-white/60">5 videos + review</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, offerType: 'freepass100' }))}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.offerType === 'freepass100'
                    ? 'border-green-400 bg-green-400/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className="text-2xl mb-1">🌟</div>
                <div className="text-sm font-bold text-green-300">100% ΔΩΡΕΑΝ</div>
                <div className="text-xs text-white/60">9 videos + review</div>
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Social Platform */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Πλατφόρμα</label>
            <div className="flex gap-2">
              {['tiktok', 'facebook', 'instagram'].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, socialPlatform: platform }))}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                    formData.socialPlatform === platform
                      ? 'border-purple-400 bg-purple-400/20 text-white'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  {platform === 'tiktok' && '🎵 TikTok'}
                  {platform === 'facebook' && '📘 Facebook'}
                  {platform === 'instagram' && '📸 Instagram'}
                </button>
              ))}
            </div>
          </div>

          {/* Video Links */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              <Video className="w-4 h-4 inline mr-1" />
              Links Videos (ένα ανά γραμμή)
            </label>
            <textarea
              required
              value={formData.videoLinks}
              onChange={(e) => setFormData(prev => ({ ...prev, videoLinks: e.target.value }))}
              placeholder="https://tiktok.com/@user/video/123&#10;https://tiktok.com/@user/video/456"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none text-sm"
            />
            <p className="text-xs text-white/50">
              {formData.offerType === 'launch50' ? '5 videos απαιτούνται' : '9 videos απαιτούνται'}
            </p>
          </div>

          {/* Review Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Link Αξιολόγησης (Google/App Store)
            </label>
            <input
              type="url"
              required
              value={formData.reviewLink}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewLink: e.target.value }))}
              placeholder="https://g.page/r/..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Υποβολή...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                📤 Υποβολή Αίτησης
              </span>
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-white/50 text-center">
            Η αίτησή σας θα ελεγχθεί και θα λάβετε email με τον κωδικό έκπτωσης εντός 24-48 ωρών.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LandingPage;

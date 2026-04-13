import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Star, Moon, Check, Sparkles, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import StarField from '../components/StarField';
import LanguageSelector from '../components/LanguageSelector';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubscribePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    // Check if user already has active subscription
    if (user?.has_active_subscription && !user?.prediction_used) {
      navigate('/dashboard');
    }
  }, [user, navigate, user?.has_active_subscription, user?.prediction_used]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API}/packages`);
        setPackages(response.data);
        // Pre-select middle package
        if (response.data.length > 0) {
          setSelectedPackage(response.data[1]?.id || response.data[0].id);
        }
      } catch (err) {
        // Silent fail - packages will show empty
      }
    };
    fetchPackages();
  }, [API]);

  const handleSubscribe = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API}/checkout/create`,
        {
          package_id: selectedPackage,
          origin_url: window.location.origin
        },
        { withCredentials: true }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || t.errorOccurred);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        <Sparkles className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-20 min-h-screen flex flex-col px-4 py-8">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        {/* Header */}
        <header className="py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Star className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold gradient-text">{t.appTitle}</h1>
            <Moon className="w-6 h-6 text-purple-400" />
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.choosePlan}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t.chooseSubtitle}
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {packages.map((pkg, index) => {
              const isSelected = selectedPackage === pkg.id;
              const isPopular = pkg.id === '9_months';
              const isBestValue = pkg.id === '18_months';
              
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`
                    relative glass rounded-2xl p-6 cursor-pointer transition-all duration-300
                    ${isSelected ? 'ring-2 ring-primary scale-105' : 'hover:scale-102'}
                    ${isPopular ? 'md:-mt-4 md:mb-4' : ''}
                  `}
                  data-testid={`package-card-${pkg.id}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                        {t.mostPopular}
                      </span>
                    </div>
                  )}

                  {isBestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                        {t.bestValue}
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {pkg.duration_months} {t.months}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-black text-white">€{pkg.amount.toFixed(0)}</span>
                    </div>

                    <ul className="space-y-3 text-left mb-6">
                      <li className="flex items-center gap-2 text-white">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{t.onePrediction}</span>
                      </li>
                      <li className="flex items-center gap-2 text-white">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{t.feature2}</span>
                      </li>
                      <li className="flex items-center gap-2 text-white">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{t.moneyBackGuarantee}</span>
                      </li>
                    </ul>

                    <div className={`
                      w-full h-10 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground'}
                    `}>
                      {isSelected ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" /> ✓
                        </span>
                      ) : (
                        t.selectPlan
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Subscribe Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <Button
              data-testid="subscribe-btn"
              onClick={handleSubscribe}
              disabled={!selectedPackage || isProcessing}
              className="px-12 py-6 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 btn-glow"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Stripe
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground/60 mt-4 text-center">
            Stripe ✓
          </p>
        </main>
      </div>
    </div>
  );
};

export default SubscribePage;

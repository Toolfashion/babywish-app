import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Star, Moon, Sparkles, LogOut, CreditCard, History, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import StarField from '../components/StarField';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';
import LanguageSelector from '../components/LanguageSelector';
import useCountryDetection from '../hooks/useCountryDetection';
import TestimonialBar from '../components/TestimonialBar';
import AILoadingAnimation from '../components/AILoadingAnimation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser, loading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { countryCode } = useCountryDetection();
  const [prediction, setPrediction] = useState(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState(null);
  const [checkingPrediction, setCheckingPrediction] = useState(true);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchExistingPrediction = async () => {
      try {
        const response = await axios.get(`${API}/my-prediction`, {
          withCredentials: true
        });
        if (response.data) {
          // Check if prediction is pending approval
          if (response.data.status === 'pending') {
            setIsPendingApproval(true);
            setExistingPrediction(response.data);
          } else {
            setExistingPrediction(response.data);
            setPrediction(response.data);
          }
        }
        
        // Fetch prediction history
        try {
          const historyResponse = await axios.get(`${API}/my-predictions`, {
            withCredentials: true
          });
          if (historyResponse.data) {
            setPredictionHistory(historyResponse.data);
          }
        } catch (historyErr) {
          // History endpoint might not exist yet
        }
      } catch (err) {
        // No existing prediction
      } finally {
        setCheckingPrediction(false);
      }
    };

    if (isAuthenticated) {
      fetchExistingPrediction();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSubmit = async (data) => {
    setIsLoadingPrediction(true);
    try {
      // Include country code for region-specific names
      const requestData = {
        ...data,
        country_code: countryCode
      };
      
      const response = await axios.post(`${API}/predict`, requestData, {
        withCredentials: true
      });
      setPrediction(response.data);
      await refreshUser();
      toast.success('✓');
    } catch (error) {
      const message = error.response?.data?.detail || t.errorOccurred;
      toast.error(message);
      
      if (error.response?.status === 403) {
        // Subscription issue - redirect to subscribe
        setTimeout(() => navigate('/subscribe'), 2000);
      }
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  if (loading || checkingPrediction) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        <Sparkles className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const canMakePrediction = user?.has_active_subscription && !user?.prediction_used;

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="dashboard-page">
      <StarField />
      
      {/* AI Loading Animation */}
      <AnimatePresence>
        {isLoadingPrediction && <AILoadingAnimation />}
      </AnimatePresence>
      
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Star className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl md:text-2xl font-bold gradient-text">{t.appTitle}</h1>
              <Moon className="w-6 h-6 text-purple-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-4"
            >
              <LanguageSelector />
              {/* History Button */}
              {predictionHistory.length > 0 && (
                <Button
                  data-testid="history-btn"
                  onClick={() => setShowHistory(!showHistory)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-white"
                >
                  <History className="w-4 h-4" />
                </Button>
              )}
              <span className="text-white text-sm hidden md:block">
                {user?.name || user?.email}
              </span>
              <Button
                data-testid="logout-btn"
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Pending Approval State */}
            {isPendingApproval ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg"
              >
                <div className="glass rounded-2xl p-8 md:p-12 text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mb-6"
                  >
                    <Clock className="w-20 h-20 text-amber-400 mx-auto" />
                  </motion.div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {t.predictionProcessing || 'Η πρόβλεψή σου επεξεργάζεται'}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6 text-lg">
                    {t.predictionPendingMessage || 'Η τεχνητή νοημοσύνη μας αναλύει τα δεδομένα σου. Θα λάβεις το αποτέλεσμα στο email σου σύντομα!'}
                  </p>
                  
                  <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-purple-300">
                      <Mail className="w-5 h-5" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>{t.checkEmailSoon || 'Θα σε ειδοποιήσουμε με email όταν είναι έτοιμη!'}</span>
                  </div>
                </div>
              </motion.div>
            ) : prediction ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <PredictionResult 
                  prediction={prediction} 
                  onReset={null}
                  showNewPredictionButton={false}
                />
                
                {/* Buy new subscription prompt */}
                {user?.prediction_used && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8"
                  >
                    <Button
                      data-testid="buy-new-subscription-btn"
                      onClick={() => navigate('/subscribe')}
                      className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-purple-600"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t.subscribe}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : canMakePrediction ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl"
              >
                {/* Welcome Message */}
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t.welcomeUser}, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      {t.makePrediction}
                    </p>
                  </motion.div>
                </div>

                <PredictionForm onSubmit={handleSubmit} isLoading={isLoadingPrediction} />
              </motion.div>
            ) : (
              <motion.div
                key="subscribe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="glass rounded-2xl p-8 md:p-12 max-w-md">
                  <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {t.subscribe}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {t.chooseSubtitle}
                  </p>
                  <Button
                    data-testid="subscribe-prompt-btn"
                    onClick={() => navigate('/subscribe')}
                    className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-primary to-purple-600 btn-glow"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t.subscribe}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground/50">
            {t.footer}
          </p>
        </footer>

        {/* Testimonial Button - Shows when user has prediction */}
        {prediction && (
          <TestimonialBar prediction={prediction} t={t} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

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

const API = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const [existingPrediction, setExistingPrediction] = useState(null);
  const [checkingPrediction, setCheckingPrediction] = useState(true);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchExistingPrediction = async () => {
      try {
        const response = await axios.get(`${API}/api/my-prediction`, {
          withCredentials: true
        });
        if (response.data) {
          if (response.data.status === 'pending') {
            setIsPendingApproval(true);
            setExistingPrediction(response.data);
          } else {
            setExistingPrediction(response.data);
            setPrediction(response.data);
          }
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

  if (loading || checkingPrediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StarField />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">BabyWish</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-white">
            <LogOut className="w-4 h-4 mr-2" /> {t.logout || 'Logout'}
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {isPendingApproval ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
              >
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 md:p-12 text-center border border-white/10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="mb-6"
                  >
                    <Clock className="w-20 h-20 text-amber-400 mx-auto" />
                  </motion.div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {t.predictionProcessing || 'Your prediction is being processed'}
                  </h2>
                  
                  <p className="text-white/60 mb-6 text-lg">
                    {t.predictionPendingMessage || 'Our AI is analyzing your data. You will receive your result via email soon!'}
                  </p>
                  
                  <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-purple-300">
                      <Mail className="w-5 h-5" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>{t.checkEmailSoon || 'We will notify you by email when ready!'}</span>
                  </div>
                </div>
              </motion.div>
            ) : prediction ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
              >
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {t.yourPrediction || 'Your Prediction'}
                  </h2>
                  <div className="text-6xl mb-4">
                    {prediction.gender === 'Boy' ? '👦' : '👧'}
                  </div>
                  <p className="text-3xl font-bold text-purple-400 mb-2">
                    {prediction.gender}
                  </p>
                  <p className="text-xl text-white mb-4">
                    {prediction.suggested_name}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                    <div><Star className="w-4 h-4 inline mr-1" /> {prediction.zodiac_sign}</div>
                    <div><Moon className="w-4 h-4 inline mr-1" /> {prediction.lucky_number}</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-prediction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg text-center"
              >
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {t.noPredictionYet || 'No prediction yet'}
                  </h2>
                  <p className="text-white/60 mb-6">
                    {t.getPredictionNow || 'Get your baby prediction now!'}
                  </p>
                  <Button 
                    onClick={() => navigate('/subscribe')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t.subscribe || 'Subscribe Now'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

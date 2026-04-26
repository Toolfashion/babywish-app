import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { 
  Check, X, Clock, User, Calendar, Mail, 
  RefreshCw, ChevronDown, ChevronUp, Shield,
  Baby, Star, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import StarField from '../components/StarField';
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

const API = process.env.REACT_APP_BACKEND_URL;

const AdminApprovalDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, all
  const [expandedId, setExpandedId] = useState(null);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPredictions();
    }
  }, [isAuthenticated, filter]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'pending' 
        ? '/admin/pending-predictions'
        : '/admin/all-predictions';
      
      const response = await axios.get(`${API}${endpoint}`, {
        withCredentials: true
      });
      
      let data = response.data || [];
      
      // Filter based on selection
      if (filter === 'approved') {
        data = data.filter(p => p.status === 'approved');
      } else if (filter === 'pending') {
        data = data.filter(p => p.status === 'pending');
      }
      
      setPredictions(data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load predictions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (predictionId) => {
    setApproving(predictionId);
    try {
      await axios.post(`${API}/admin/approve-prediction/${predictionId}`, {}, {
        withCredentials: true
      });
      
      toast.success('✅ Prediction approved & user notified!');
      fetchPredictions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (predictionId) => {
    const reason = prompt('Rejection reason (optional):');
    
    try {
      await axios.post(`${API}/admin/reject-prediction/${predictionId}?reason=${encodeURIComponent(reason || '')}`, {}, {
        withCredentials: true
      });
      
      toast.success('Prediction rejected');
      fetchPredictions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1"><X className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const getGenderIcon = (gender) => {
    if (gender === 'Boy') return <span className="text-2xl">👦</span>;
    if (gender === 'Girl') return <span className="text-2xl">👧</span>;
    return <Baby className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="admin-approval-page">
      <StarField />
      
      <div className="relative z-20 min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/60 text-sm">Prediction Approval Center</p>
              </div>
            </div>
            
            <Button
              onClick={fetchPredictions}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['pending', 'approved', 'all'].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                className={filter === f 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }
              >
                {f === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                {f === 'approved' && <Check className="w-4 h-4 mr-1" />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && predictions.length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">
                    {predictions.filter(p => p.status === 'pending').length}
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {/* Predictions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading predictions...</p>
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-white/60">No {filter} predictions found</p>
              </div>
            ) : (
              <AnimatePresence>
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
                  >
                    {/* Prediction Header */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                      onClick={() => setExpandedId(expandedId === prediction.id ? null : prediction.id)}
                    >
                      <div className="flex items-center gap-4">
                        {getGenderIcon(prediction.gender)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {prediction.gender} - {prediction.suggested_name}
                            </span>
                            {getStatusBadge(prediction.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {prediction.user_email || 'No email'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(prediction.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {prediction.status === 'pending' && (
                          <>
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleApprove(prediction.id); }}
                              disabled={approving === prediction.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {approving === prediction.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve & Send
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleReject(prediction.id); }}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {expandedId === prediction.id ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === prediction.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* AI Prediction Details */}
                            <div className="bg-white/5 rounded-xl p-4">
                              <h4 className="text-white/60 text-xs uppercase mb-2">AI Prediction</h4>
                              <div className="space-y-2">
                                <p className="text-white"><strong>Gender:</strong> {prediction.gender}</p>
                                <p className="text-white"><strong>Name:</strong> {prediction.suggested_name}</p>
                                <p className="text-white"><strong>Zodiac:</strong> {prediction.zodiac_sign}</p>
                                <p className="text-white"><strong>Personality:</strong> {prediction.personality}</p>
                              </div>
                            </div>
                            
                            {/* Lucky Elements */}
                            <div className="bg-white/5 rounded-xl p-4">
                              <h4 className="text-white/60 text-xs uppercase mb-2">Lucky Elements</h4>
                              <div className="space-y-2">
                                <p className="text-white"><strong>Number:</strong> {prediction.lucky_number}</p>
                                <p className="text-white"><strong>Color:</strong> {prediction.lucky_color}</p>
                                <p className="text-white"><strong>Day:</strong> {prediction.lucky_day}</p>
                                <p className="text-white"><strong>Gemstone:</strong> {prediction.lucky_gemstone}</p>
                              </div>
                            </div>
                            
                            {/* User Info */}
                            <div className="bg-white/5 rounded-xl p-4">
                              <h4 className="text-white/60 text-xs uppercase mb-2">User Info</h4>
                              <div className="space-y-2">
                                <p className="text-white"><strong>Email:</strong> {prediction.user_email}</p>
                                <p className="text-white"><strong>User ID:</strong> {prediction.user_id?.slice(0, 8)}...</p>
                                <p className="text-white"><strong>Mother DOB:</strong> {prediction.parent1_birthday}</p>
                                <p className="text-white"><strong>Father DOB:</strong> {prediction.parent2_birthday}</p>
                              </div>
                            </div>
                          </div>
                          
                          {prediction.status === 'approved' && (
                            <div className="px-4 pb-4">
                              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 text-sm">
                                  Approved on {new Date(prediction.approved_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalDashboard;

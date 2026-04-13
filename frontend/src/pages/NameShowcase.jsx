import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ArrowLeft, Baby, Sparkles, MapPin, Globe } from 'lucide-react';
import StarField from '../components/StarField';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const NameShowcase = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [names, setNames] = useState({ boy: [], girl: [] });
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      const response = await fetch(`${API_URL}/api/names/showcase`);
      if (response.ok) {
        const data = await response.json();
        setNames({ boy: data.boy_names, girl: data.girl_names });
        setRegion(data.region);
        setCountry(data.country);
      }
    } catch (error) {
      console.error('Error fetching names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPrediction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="name-showcase-page">
      <StarField />
      
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t.back || "Back"}
            </Button>
            
            <h1 className="text-xl font-bold gradient-text">{t.appTitle}</h1>
            
            <div className="w-20" /> {/* Spacer */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Baby className="w-10 h-10 text-pink-400" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {t.namesFromYourRegion || "Names from Your Region"}
                </h1>
                <Baby className="w-10 h-10 text-cyan-400" />
              </div>
              
              {country && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{t.basedOnLocation || "Based on your location"}: </span>
                  <span className="text-white font-semibold">{country}</span>
                </motion.div>
              )}
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Boy Names */}
                <motion.div variants={itemVariants} className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-2xl">👶</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{t.boyNames || "Boy Names"}</h2>
                      <p className="text-sm text-cyan-400">{t.boy || "Boy"} 💙</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {names.boy.map((name, index) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center"
                      >
                        <span className="text-white font-medium">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Girl Names */}
                <motion.div variants={itemVariants} className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                      <span className="text-2xl">👶</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{t.girlNames || "Girl Names"}</h2>
                      <p className="text-sm text-pink-400">{t.girl || "Girl"} 💗</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {names.girl.map((name, index) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-4 py-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center"
                      >
                        <span className="text-white font-medium">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <div className="glass rounded-2xl p-6 max-w-xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">
                    {t.wantPersonalizedName || "Want a Personalized Name?"}
                  </h3>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {t.getPredictionDesc || "Get a complete prediction with the perfect name for your future baby based on cosmic alignment!"}
                </p>
                
                <Button
                  onClick={handleGetPrediction}
                  className="px-8 py-6 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-purple-500/25"
                  data-testid="get-prediction-btn"
                >
                  <span className="flex items-center gap-2">
                    {t.getPrediction || "Get Your Prediction"}
                    <Sparkles className="w-5 h-5" />
                  </span>
                </Button>
              </div>
            </motion.div>

            {/* Region Info */}
            {region && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {t.namesCulture || "Names from"}: <span className="text-white capitalize">{region}</span> {t.culture || "culture"}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NameShowcase;

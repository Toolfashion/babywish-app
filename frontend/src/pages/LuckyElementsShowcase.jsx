import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ArrowLeft, Gem, Sparkles, ExternalLink, ShoppingBag } from 'lucide-react';
import StarField from '../components/StarField';

const LUCKY_ELEMENTS = [
  {
    id: 'amethyst',
    name: { en: 'Amethyst', el: 'Αμέθυστος', de: 'Amethyst' },
    description: { 
      en: 'Stone of peace and spirituality', 
      el: 'Πέτρα της ειρήνης και πνευματικότητας',
      de: 'Stein des Friedens und der Spiritualität'
    },
    color: '#9966CC',
    emoji: '💜',
    amazonSearch: 'amethyst+crystal+stone',
    ebaySearch: 'amethyst+crystal'
  },
  {
    id: 'rose-quartz',
    name: { en: 'Rose Quartz', el: 'Ροζ Χαλαζίας', de: 'Rosenquarz' },
    description: { 
      en: 'Stone of unconditional love', 
      el: 'Πέτρα της άνευ όρων αγάπης',
      de: 'Stein der bedingungslosen Liebe'
    },
    color: '#FFB6C1',
    emoji: '💗',
    amazonSearch: 'rose+quartz+crystal',
    ebaySearch: 'rose+quartz+stone'
  },
  {
    id: 'citrine',
    name: { en: 'Citrine', el: 'Κιτρίνης', de: 'Citrin' },
    description: { 
      en: 'Stone of abundance and joy', 
      el: 'Πέτρα της αφθονίας και χαράς',
      de: 'Stein des Überflusses und der Freude'
    },
    color: '#FFD700',
    emoji: '💛',
    amazonSearch: 'citrine+crystal+stone',
    ebaySearch: 'citrine+crystal'
  },
  {
    id: 'turquoise',
    name: { en: 'Turquoise', el: 'Τυρκουάζ', de: 'Türkis' },
    description: { 
      en: 'Stone of protection and healing', 
      el: 'Πέτρα της προστασίας και θεραπείας',
      de: 'Stein des Schutzes und der Heilung'
    },
    color: '#40E0D0',
    emoji: '💙',
    amazonSearch: 'turquoise+stone+natural',
    ebaySearch: 'turquoise+stone'
  },
  {
    id: 'jade',
    name: { en: 'Jade', el: 'Νεφρίτης', de: 'Jade' },
    description: { 
      en: 'Stone of luck and prosperity', 
      el: 'Πέτρα της τύχης και ευημερίας',
      de: 'Stein des Glücks und Wohlstands'
    },
    color: '#00A86B',
    emoji: '💚',
    amazonSearch: 'jade+stone+natural',
    ebaySearch: 'jade+stone+green'
  },
  {
    id: 'moonstone',
    name: { en: 'Moonstone', el: 'Σεληνίτης', de: 'Mondstein' },
    description: { 
      en: 'Stone of new beginnings', 
      el: 'Πέτρα των νέων αρχών',
      de: 'Stein der Neuanfänge'
    },
    color: '#E6E6FA',
    emoji: '🤍',
    amazonSearch: 'moonstone+crystal',
    ebaySearch: 'moonstone+natural'
  },
  {
    id: 'tigers-eye',
    name: { en: "Tiger's Eye", el: 'Μάτι της Τίγρης', de: 'Tigerauge' },
    description: { 
      en: 'Stone of courage and strength', 
      el: 'Πέτρα του θάρρους και δύναμης',
      de: 'Stein des Mutes und der Stärke'
    },
    color: '#B8860B',
    emoji: '🧡',
    amazonSearch: 'tigers+eye+stone',
    ebaySearch: 'tigers+eye+crystal'
  }
];

const LuckyElementsShowcase = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handleGetPrediction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const getLocalizedText = (textObj) => {
    return textObj[language] || textObj['en'];
  };

  const openAmazon = (searchTerm) => {
    window.open(`https://www.amazon.com/s?k=${searchTerm}`, '_blank');
  };

  const openEbay = (searchTerm) => {
    window.open(`https://www.ebay.com/sch/i.html?_nkw=${searchTerm}`, '_blank');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="lucky-elements-page">
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
            
            <div className="w-20" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gem className="w-10 h-10 text-purple-400" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {t.luckyElements || "Lucky Elements"}
                </h1>
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-muted-foreground">
                {t.luckyElementsDesc || "Discover powerful gemstones to enhance your baby's destiny"}
              </p>
            </motion.div>

            {/* Elements Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {LUCKY_ELEMENTS.map((element, index) => (
                <motion.div
                  key={element.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-5 hover:bg-white/10 transition-all"
                >
                  {/* Element Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${element.color}30`, border: `2px solid ${element.color}` }}
                    >
                      {element.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{getLocalizedText(element.name)}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {getLocalizedText(element.description)}
                  </p>

                  {/* Shopping Links */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openAmazon(element.amazonSearch)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium transition-colors"
                      data-testid={`amazon-${element.id}`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Amazon
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => openEbay(element.ebaySearch)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium transition-colors"
                      data-testid={`ebay-${element.id}`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      eBay
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
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
                    {t.wantPersonalizedElements || "Want Personalized Lucky Elements?"}
                  </h3>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {t.getElementsDesc || "Get a complete prediction with lucky elements specifically chosen for your future baby!"}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default LuckyElementsShowcase;

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, Sparkles, Share2, Calendar, Baby, Heart, Download, Apple, Ruler } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Zodiac signs data (same as InteractiveQuiz for consistency)
const zodiacSigns = [
  { id: 'aries', symbol: '♈', name: 'Κριός', nameEn: 'Aries', color: '#FF6B6B' },
  { id: 'taurus', symbol: '♉', name: 'Ταύρος', nameEn: 'Taurus', color: '#4ECDC4' },
  { id: 'gemini', symbol: '♊', name: 'Δίδυμοι', nameEn: 'Gemini', color: '#FFE66D' },
  { id: 'cancer', symbol: '♋', name: 'Καρκίνος', nameEn: 'Cancer', color: '#95E1D3' },
  { id: 'leo', symbol: '♌', name: 'Λέων', nameEn: 'Leo', color: '#F9A826' },
  { id: 'virgo', symbol: '♍', name: 'Παρθένος', nameEn: 'Virgo', color: '#A8E6CF' },
  { id: 'libra', symbol: '♎', name: 'Ζυγός', nameEn: 'Libra', color: '#DDA0DD' },
  { id: 'scorpio', symbol: '♏', name: 'Σκορπιός', nameEn: 'Scorpio', color: '#C44569' },
  { id: 'sagittarius', symbol: '♐', name: 'Τοξότης', nameEn: 'Sagittarius', color: '#F8B500' },
  { id: 'capricorn', symbol: '♑', name: 'Αιγόκερως', nameEn: 'Capricorn', color: '#6B5B95' },
  { id: 'aquarius', symbol: '♒', name: 'Υδροχόος', nameEn: 'Aquarius', color: '#45B7D1' },
  { id: 'pisces', symbol: '♓', name: 'Ιχθύες', nameEn: 'Pisces', color: '#96CEB4' },
];

// Fruit/size comparisons for each week (fun data)
const weeklyFruitData = {
  4: { fruit: '🌰', fruitName: { el: 'σπόρος παπαρούνας', en: 'poppy seed' }, size: '1-2mm' },
  5: { fruit: '🫘', fruitName: { el: 'σπόρος σουσαμιού', en: 'sesame seed' }, size: '2mm' },
  6: { fruit: '🫐', fruitName: { el: 'φακή', en: 'lentil' }, size: '4mm' },
  7: { fruit: '🫐', fruitName: { el: 'μύρτιλο', en: 'blueberry' }, size: '8mm' },
  8: { fruit: '🫒', fruitName: { el: 'φασόλι', en: 'kidney bean' }, size: '1.6cm' },
  9: { fruit: '🍇', fruitName: { el: 'σταφύλι', en: 'grape' }, size: '2.3cm' },
  10: { fruit: '🍓', fruitName: { el: 'φράουλα', en: 'strawberry' }, size: '3cm' },
  11: { fruit: '🍋', fruitName: { el: 'λάιμ', en: 'lime' }, size: '4cm' },
  12: { fruit: '🍑', fruitName: { el: 'δαμάσκηνο', en: 'plum' }, size: '5cm' },
  13: { fruit: '🍋', fruitName: { el: 'λεμόνι', en: 'lemon' }, size: '7cm' },
  14: { fruit: '🍊', fruitName: { el: 'ροδάκινο', en: 'peach' }, size: '8.5cm' },
  15: { fruit: '🍎', fruitName: { el: 'μήλο', en: 'apple' }, size: '10cm' },
  16: { fruit: '🥑', fruitName: { el: 'αβοκάντο', en: 'avocado' }, size: '11.5cm' },
  17: { fruit: '🍐', fruitName: { el: 'αχλάδι', en: 'pear' }, size: '13cm' },
  18: { fruit: '🫑', fruitName: { el: 'πιπεριά', en: 'bell pepper' }, size: '14cm' },
  19: { fruit: '🥭', fruitName: { el: 'μάνγκο', en: 'mango' }, size: '15cm' },
  20: { fruit: '🍌', fruitName: { el: 'μπανάνα', en: 'banana' }, size: '16cm' },
  21: { fruit: '🥕', fruitName: { el: 'καρότο', en: 'carrot' }, size: '27cm' },
  22: { fruit: '🥒', fruitName: { el: 'αγγούρι', en: 'cucumber' }, size: '28cm' },
  23: { fruit: '🥭', fruitName: { el: 'μεγάλο μάνγκο', en: 'large mango' }, size: '29cm' },
  24: { fruit: '🌽', fruitName: { el: 'καλαμπόκι', en: 'corn' }, size: '30cm' },
  25: { fruit: '🥬', fruitName: { el: 'κουνουπίδι', en: 'cauliflower' }, size: '34cm' },
  26: { fruit: '🥬', fruitName: { el: 'μαρούλι', en: 'lettuce' }, size: '35cm' },
  27: { fruit: '🥦', fruitName: { el: 'μπρόκολο', en: 'broccoli' }, size: '36cm' },
  28: { fruit: '🍆', fruitName: { el: 'μελιτζάνα', en: 'eggplant' }, size: '37cm' },
  29: { fruit: '🎃', fruitName: { el: 'μικρή κολοκύθα', en: 'small squash' }, size: '38cm' },
  30: { fruit: '🥬', fruitName: { el: 'λάχανο', en: 'cabbage' }, size: '40cm' },
  31: { fruit: '🥥', fruitName: { el: 'καρύδα', en: 'coconut' }, size: '41cm' },
  32: { fruit: '🍍', fruitName: { el: 'ανανάς', en: 'pineapple' }, size: '42cm' },
  33: { fruit: '🍈', fruitName: { el: 'πεπόνι', en: 'honeydew' }, size: '44cm' },
  34: { fruit: '🍈', fruitName: { el: 'κανταλούπ', en: 'cantaloupe' }, size: '45cm' },
  35: { fruit: '🥥', fruitName: { el: 'μεγάλη καρύδα', en: 'large coconut' }, size: '46cm' },
  36: { fruit: '🥬', fruitName: { el: 'ρομέν', en: 'romaine lettuce' }, size: '47cm' },
  37: { fruit: '🥬', fruitName: { el: 'σέσκουλα', en: 'swiss chard' }, size: '48cm' },
  38: { fruit: '🍉', fruitName: { el: 'μικρό καρπούζι', en: 'mini watermelon' }, size: '49cm' },
  39: { fruit: '🍉', fruitName: { el: 'καρπούζι', en: 'watermelon' }, size: '50cm' },
  40: { fruit: '🎃', fruitName: { el: 'κολοκύθα', en: 'pumpkin' }, size: '51cm' },
  41: { fruit: '🎃', fruitName: { el: 'μεγάλη κολοκύθα', en: 'large pumpkin' }, size: '51-52cm' },
  42: { fruit: '🎃', fruitName: { el: 'κολοκύθα Halloween', en: 'Halloween pumpkin' }, size: '52cm+' },
};

// Translations for UI
const translations = {
  el: {
    title: 'Milestone Predictor',
    subtitle: 'Μάθε τι κάνει το μωρό σου τώρα!',
    weekLabel: 'Εβδομάδα Κύησης',
    orLabel: 'ή',
    lmpLabel: 'Ημερομηνία Τελευταίας Περιόδου',
    calculate: 'Δες το Milestone!',
    loading: 'Το AI ετοιμάζει την απάντηση...',
    week: 'Εβδομάδα',
    babySize: 'Το μωρό σου έχει το μέγεθος',
    developing: 'Τι αναπτύσσεται τώρα',
    funFact: 'Fun Fact',
    zodiacConnection: 'Σύνδεση με το Ζώδιο',
    share: 'Μοιράσου το!',
    download: 'Κατέβασε',
    newPrediction: 'Νέα Πρόβλεψη',
    close: 'Κλείσιμο',
    disclaimer: 'Για διασκέδαση μόνο - δεν αντικαθιστά ιατρική συμβουλή',
    selectWeek: 'Επίλεξε εβδομάδα',
    inputMethod: 'Πώς θέλεις να υπολογίσουμε;',
    byWeek: 'Ξέρω την εβδομάδα',
    byLMP: 'Από την τελευταία περίοδο',
    yourBabyAt: 'Το μωρό σου στην',
  },
  en: {
    title: 'Milestone Predictor',
    subtitle: 'Discover what your baby is doing now!',
    weekLabel: 'Pregnancy Week',
    orLabel: 'or',
    lmpLabel: 'Last Menstrual Period Date',
    calculate: 'See Milestone!',
    loading: 'AI is preparing your answer...',
    week: 'Week',
    babySize: 'Your baby is the size of',
    developing: 'What\'s developing now',
    funFact: 'Fun Fact',
    zodiacConnection: 'Zodiac Connection',
    share: 'Share it!',
    download: 'Download',
    newPrediction: 'New Prediction',
    close: 'Close',
    disclaimer: 'For entertainment only - not medical advice',
    selectWeek: 'Select week',
    inputMethod: 'How do you want to calculate?',
    byWeek: 'I know the week',
    byLMP: 'From last period',
    yourBabyAt: 'Your baby at',
  },
  de: {
    title: 'Milestone Predictor',
    subtitle: 'Erfahre, was dein Baby jetzt macht!',
    weekLabel: 'Schwangerschaftswoche',
    calculate: 'Milestone anzeigen!',
    loading: 'KI bereitet Antwort vor...',
    week: 'Woche',
    babySize: 'Dein Baby hat die Größe von',
    developing: 'Was sich jetzt entwickelt',
    funFact: 'Fun Fact',
    zodiacConnection: 'Sternzeichen-Verbindung',
    share: 'Teilen!',
    download: 'Herunterladen',
    newPrediction: 'Neue Vorhersage',
    close: 'Schließen',
    disclaimer: 'Nur zur Unterhaltung - kein medizinischer Rat',
    selectWeek: 'Woche auswählen',
    inputMethod: 'Wie möchtest du berechnen?',
    byWeek: 'Ich kenne die Woche',
    byLMP: 'Ab letzter Periode',
    yourBabyAt: 'Dein Baby in',
  },
  fr: {
    title: 'Prédicteur de Milestone',
    subtitle: 'Découvrez ce que fait votre bébé maintenant!',
    weekLabel: 'Semaine de grossesse',
    calculate: 'Voir le Milestone!',
    loading: 'L\'IA prépare votre réponse...',
    week: 'Semaine',
    babySize: 'Votre bébé a la taille d\'un(e)',
    developing: 'Ce qui se développe maintenant',
    funFact: 'Fun Fact',
    zodiacConnection: 'Connexion Zodiacale',
    share: 'Partager!',
    download: 'Télécharger',
    newPrediction: 'Nouvelle Prédiction',
    close: 'Fermer',
    disclaimer: 'Pour le divertissement uniquement - pas un avis médical',
    selectWeek: 'Sélectionner la semaine',
    inputMethod: 'Comment voulez-vous calculer?',
    byWeek: 'Je connais la semaine',
    byLMP: 'À partir des dernières règles',
    yourBabyAt: 'Votre bébé à',
  },
  es: {
    title: 'Predictor de Hitos',
    subtitle: '¡Descubre qué está haciendo tu bebé ahora!',
    weekLabel: 'Semana de embarazo',
    calculate: '¡Ver Hito!',
    loading: 'La IA está preparando tu respuesta...',
    week: 'Semana',
    babySize: 'Tu bebé tiene el tamaño de',
    developing: 'Qué se está desarrollando ahora',
    funFact: 'Dato Curioso',
    zodiacConnection: 'Conexión Zodiacal',
    share: '¡Comparte!',
    download: 'Descargar',
    newPrediction: 'Nueva Predicción',
    close: 'Cerrar',
    disclaimer: 'Solo para entretenimiento - no es consejo médico',
    selectWeek: 'Seleccionar semana',
    inputMethod: '¿Cómo quieres calcular?',
    byWeek: 'Sé la semana',
    byLMP: 'Desde el último período',
    yourBabyAt: 'Tu bebé en',
  },
};

// Get translation with fallback to English
const getT = (lang) => translations[lang] || translations.en;

const MilestonePredictor = ({ onClose }) => {
  const { language } = useLanguage();
  const t = getT(language);
  const resultCardRef = useRef(null);
  
  const [inputMethod, setInputMethod] = useState(null); // 'week' or 'lmp'
  const [selectedWeek, setSelectedWeek] = useState('');
  const [lmpDate, setLmpDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Calculate week from LMP
  const calculateWeekFromLMP = (lmp) => {
    const lmpDateObj = new Date(lmp);
    const today = new Date();
    const diffTime = today - lmpDateObj;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return Math.min(Math.max(weeks, 4), 42); // Clamp between 4-42
  };

  // Calculate expected due date and zodiac from week
  const calculateDueDateAndZodiac = (week) => {
    const today = new Date();
    const weeksRemaining = 40 - week;
    const dueDate = new Date(today.getTime() + (weeksRemaining * 7 * 24 * 60 * 60 * 1000));
    const month = dueDate.getMonth() + 1;
    const day = dueDate.getDate();
    
    // Determine zodiac based on due date
    let zodiac;
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiac = 'aries';
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiac = 'taurus';
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiac = 'gemini';
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiac = 'cancer';
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiac = 'leo';
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiac = 'virgo';
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiac = 'libra';
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiac = 'scorpio';
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiac = 'sagittarius';
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiac = 'capricorn';
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiac = 'aquarius';
    else zodiac = 'pisces';
    
    return { dueDate, zodiac };
  };

  // Handle prediction generation
  const handlePredict = async () => {
    let week = selectedWeek;
    
    if (inputMethod === 'lmp' && lmpDate) {
      week = calculateWeekFromLMP(lmpDate);
    }
    
    if (!week || week < 4 || week > 42) {
      alert(language === 'el' ? 'Παρακαλώ επίλεξε εβδομάδα 4-42' : 'Please select week 4-42');
      return;
    }

    setIsLoading(true);
    
    try {
      const { dueDate, zodiac } = calculateDueDateAndZodiac(parseInt(week));
      const zodiacData = zodiacSigns.find(z => z.id === zodiac);
      const fruitData = weeklyFruitData[week] || weeklyFruitData[40];
      
      // Call backend API for AI-generated content
      const response = await fetch(`${API_URL}/api/milestone/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week: parseInt(week),
          zodiac: zodiac,
          zodiacName: language === 'el' ? zodiacData.name : zodiacData.nameEn,
          language: language,
          fruitName: fruitData.fruitName[language] || fruitData.fruitName.en,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          week: parseInt(week),
          fruit: fruitData.fruit,
          fruitName: fruitData.fruitName[language] || fruitData.fruitName.en,
          size: fruitData.size,
          zodiac: zodiacData,
          dueDate: dueDate.toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US'),
          developing: data.developing,
          funFact: data.funFact,
          zodiacTip: data.zodiacTip,
        });
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (error) {
      console.error('Error generating milestone:', error);
      // Fallback with basic data
      const week_num = parseInt(week);
      const { dueDate, zodiac } = calculateDueDateAndZodiac(week_num);
      const zodiacData = zodiacSigns.find(z => z.id === zodiac);
      const fruitData = weeklyFruitData[week_num] || weeklyFruitData[40];
      
      setResult({
        week: week_num,
        fruit: fruitData.fruit,
        fruitName: fruitData.fruitName[language] || fruitData.fruitName.en,
        size: fruitData.size,
        zodiac: zodiacData,
        dueDate: dueDate.toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US'),
        developing: language === 'el' 
          ? 'Το μωρό σου αναπτύσσεται υπέροχα! Τα όργανα σχηματίζονται και η καρδιά χτυπά δυνατά.'
          : 'Your baby is developing wonderfully! Organs are forming and the heart beats strong.',
        funFact: language === 'el'
          ? 'Ήξερες ότι το μωρό μπορεί να ακούσει τη φωνή σου;'
          : 'Did you know your baby can hear your voice?',
        zodiacTip: language === 'el'
          ? `Ως ${zodiacData.name}, το μωρό σου θα έχει μοναδικά χαρακτηριστικά!`
          : `As a ${zodiacData.nameEn}, your baby will have unique traits!`,
      });
    }
    
    setIsLoading(false);
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: `${t.yourBabyAt} ${t.week} ${result.week}! ${result.fruit}`,
          text: `${t.babySize} ${result.fruitName}! ${result.funFact}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  // Download as image (using html2canvas)
  const handleDownload = async () => {
    if (!resultCardRef.current) return;
    setIsGeneratingImage(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `babywish-week-${result.week}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    }
    
    setIsGeneratingImage(false);
  };

  // Reset for new prediction
  const handleReset = () => {
    setResult(null);
    setSelectedWeek('');
    setLmpDate('');
    setInputMethod(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5, 2, 13, 0.95)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
          >
            ✕
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🤰✨</div>
              <h2 className="text-2xl font-bold text-white mb-1">{t.title}</h2>
              <p className="text-white/60 text-sm">{t.subtitle}</p>
            </div>

            {!result ? (
              <>
                {/* Input Method Selection */}
                {!inputMethod && (
                  <div className="space-y-4">
                    <p className="text-white/80 text-center mb-4">{t.inputMethod}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInputMethod('week')}
                        className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white"
                      >
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                        <span className="text-sm">{t.byWeek}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInputMethod('lmp')}
                        className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-amber-500/20 border border-pink-500/30 text-white"
                      >
                        <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                        <span className="text-sm">{t.byLMP}</span>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Week Input */}
                {inputMethod === 'week' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <label className="block text-white/80 text-sm mb-2">{t.weekLabel}</label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white text-lg"
                    >
                      <option value="" className="bg-gray-900">{t.selectWeek}</option>
                      {Array.from({ length: 39 }, (_, i) => i + 4).map(week => (
                        <option key={week} value={week} className="bg-gray-900">
                          {t.week} {week} {weeklyFruitData[week]?.fruit || '🍼'}
                        </option>
                      ))}
                    </select>
                    
                    <Button
                      onClick={handlePredict}
                      disabled={!selectedWeek || isLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5 animate-spin" />
                          {t.loading}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {t.calculate}
                        </span>
                      )}
                    </Button>
                    
                    <button
                      onClick={() => setInputMethod(null)}
                      className="w-full text-white/50 text-sm hover:text-white/80"
                    >
                      ← {language === 'el' ? 'Πίσω' : 'Back'}
                    </button>
                  </motion.div>
                )}

                {/* LMP Input */}
                {inputMethod === 'lmp' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <label className="block text-white/80 text-sm mb-2">{t.lmpLabel}</label>
                    <input
                      type="date"
                      value={lmpDate}
                      onChange={(e) => setLmpDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white text-lg"
                    />
                    
                    {lmpDate && (
                      <div className="text-center text-white/60 text-sm">
                        ≈ {t.week} {calculateWeekFromLMP(lmpDate)}
                      </div>
                    )}
                    
                    <Button
                      onClick={handlePredict}
                      disabled={!lmpDate || isLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5 animate-spin" />
                          {t.loading}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {t.calculate}
                        </span>
                      )}
                    </Button>
                    
                    <button
                      onClick={() => setInputMethod(null)}
                      className="w-full text-white/50 text-sm hover:text-white/80"
                    >
                      ← {language === 'el' ? 'Πίσω' : 'Back'}
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              /* Result Card - Instagram-ready */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div 
                  ref={resultCardRef}
                  className="rounded-2xl p-6 text-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.4)',
                  }}
                >
                  {/* Week Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-semibold">{t.week} {result.week}</span>
                  </div>
                  
                  {/* Fruit Comparison - BIG */}
                  <div className="mb-4">
                    <div className="text-7xl mb-2">{result.fruit}</div>
                    <p className="text-white/80 text-lg">
                      {t.babySize} <span className="text-amber-400 font-bold">{result.fruitName}</span>
                    </p>
                    <p className="text-white/50 text-sm flex items-center justify-center gap-1">
                      <Ruler className="w-4 h-4" /> ~{result.size}
                    </p>
                  </div>
                  
                  {/* Developing Section */}
                  <div className="bg-white/5 rounded-xl p-4 mb-4 text-left">
                    <h3 className="text-pink-400 font-semibold mb-2 flex items-center gap-2">
                      <Baby className="w-4 h-4" /> {t.developing}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">{result.developing}</p>
                  </div>
                  
                  {/* Fun Fact */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 mb-4 text-left border border-amber-500/20">
                    <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> {t.funFact}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">{result.funFact}</p>
                  </div>
                  
                  {/* Zodiac Connection */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 mb-4 text-left border border-purple-500/20">
                    <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-xl">{result.zodiac.symbol}</span> {t.zodiacConnection}
                    </h3>
                    <p className="text-white/60 text-xs mb-1">
                      {language === 'el' ? 'Πιθανό ζώδιο:' : 'Probable zodiac:'} {' '}
                      <span className="text-white font-medium">
                        {language === 'el' ? result.zodiac.name : result.zodiac.nameEn}
                      </span>
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed">{result.zodiacTip}</p>
                  </div>
                  
                  {/* Due Date */}
                  <p className="text-white/50 text-xs">
                    {language === 'el' ? 'Αναμενόμενη ημερομηνία:' : 'Expected date:'} {result.dueDate}
                  </p>
                  
                  {/* Branding */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-purple-400 text-sm font-medium">✨ BabyWish.ai</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleShare}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {t.share}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={isGeneratingImage}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGeneratingImage ? '...' : t.download}
                  </Button>
                </div>
                
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                >
                  {t.newPrediction}
                </Button>
                
                {/* Disclaimer */}
                <p className="text-white/30 text-xs text-center">{t.disclaimer}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MilestonePredictor;

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, Sparkles, Share2, Calendar, Baby, Heart, Palette, Star, Download, Target } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Zodiac signs data
const zodiacSigns = [
  { id: 'aries', symbol: '♈', name: 'Κριός', nameEn: 'Aries', color: '#FF6B6B', months: [3, 4] },
  { id: 'taurus', symbol: '♉', name: 'Ταύρος', nameEn: 'Taurus', color: '#4ECDC4', months: [4, 5] },
  { id: 'gemini', symbol: '♊', name: 'Δίδυμοι', nameEn: 'Gemini', color: '#FFE66D', months: [5, 6] },
  { id: 'cancer', symbol: '♋', name: 'Καρκίνος', nameEn: 'Cancer', color: '#95E1D3', months: [6, 7] },
  { id: 'leo', symbol: '♌', name: 'Λέων', nameEn: 'Leo', color: '#F9A826', months: [7, 8] },
  { id: 'virgo', symbol: '♍', name: 'Παρθένος', nameEn: 'Virgo', color: '#A8E6CF', months: [8, 9] },
  { id: 'libra', symbol: '♎', name: 'Ζυγός', nameEn: 'Libra', color: '#DDA0DD', months: [9, 10] },
  { id: 'scorpio', symbol: '♏', name: 'Σκορπιός', nameEn: 'Scorpio', color: '#C44569', months: [10, 11] },
  { id: 'sagittarius', symbol: '♐', name: 'Τοξότης', nameEn: 'Sagittarius', color: '#F8B500', months: [11, 12] },
  { id: 'capricorn', symbol: '♑', name: 'Αιγόκερως', nameEn: 'Capricorn', color: '#6B5B95', months: [12, 1] },
  { id: 'aquarius', symbol: '♒', name: 'Υδροχόος', nameEn: 'Aquarius', color: '#45B7D1', months: [1, 2] },
  { id: 'pisces', symbol: '♓', name: 'Ιχθύες', nameEn: 'Pisces', color: '#96CEB4', months: [2, 3] },
];

// Month options for baby expected date
const monthOptions = [
  { id: 1, el: 'Ιανουάριος', en: 'January' },
  { id: 2, el: 'Φεβρουάριος', en: 'February' },
  { id: 3, el: 'Μάρτιος', en: 'March' },
  { id: 4, el: 'Απρίλιος', en: 'April' },
  { id: 5, el: 'Μάιος', en: 'May' },
  { id: 6, el: 'Ιούνιος', en: 'June' },
  { id: 7, el: 'Ιούλιος', en: 'July' },
  { id: 8, el: 'Αύγουστος', en: 'August' },
  { id: 9, el: 'Σεπτέμβριος', en: 'September' },
  { id: 10, el: 'Οκτώβριος', en: 'October' },
  { id: 11, el: 'Νοέμβριος', en: 'November' },
  { id: 12, el: 'Δεκέμβριος', en: 'December' },
];

const InteractiveQuiz = ({ onClose, onComplete }) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const resultCardRef = useRef(null);
  
  // Initialize answers from localStorage if available (Data Sync)
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('babywish_quiz_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          motherBirthday: parsed.motherBirthday || '',
          fatherBirthday: parsed.fatherBirthday || '',
          expectedBirthMonth: parsed.expectedBirthMonth || '',
          expectedBirthYear: parsed.expectedBirthYear || new Date().getFullYear() + 1,
          preferredGender: '',
          nameStyle: '',
          futureDream: '',
          aesthetic: '',
        };
      } catch (e) {
        console.log('Could not parse saved quiz data');
      }
    }
    return {
      motherBirthday: '',
      fatherBirthday: '',
      expectedBirthMonth: '',
      expectedBirthYear: new Date().getFullYear() + 1,
      preferredGender: '',
      nameStyle: '',
      futureDream: '',
      aesthetic: '',
    };
  });

  // Save important dates to localStorage for Premium flow (Data Sync)
  const saveToLocalStorage = (data) => {
    const toSave = {
      motherBirthday: data.motherBirthday,
      fatherBirthday: data.fatherBirthday,
      expectedBirthMonth: data.expectedBirthMonth,
      expectedBirthYear: data.expectedBirthYear,
    };
    localStorage.setItem('babywish_quiz_data', JSON.stringify(toSave));
  };

  // Current and next year options
  const yearOptions = [
    new Date().getFullYear(),
    new Date().getFullYear() + 1,
    new Date().getFullYear() + 2,
  ];

  // Quiz questions configuration - UPDATED
  const questions = [
    {
      id: 'birthdays',
      title: language === 'el' ? 'Ημερομηνίες Γέννησης Γονέων' : 'Parents\' Birthdays',
      subtitle: language === 'el' ? 'Για αστρολογική συναστρία και ανάλυση' : 'For astrological compatibility analysis',
      type: 'dates',
      icon: Calendar,
    },
    {
      id: 'babyExpected',
      title: language === 'el' ? 'Πότε περιμένετε το μωρό;' : 'When do you expect the baby?',
      subtitle: language === 'el' ? 'Αυτό καθορίζει το ζώδιο του μωρού σας' : 'This determines your baby\'s zodiac sign',
      type: 'babyDate',
      icon: Baby,
    },
    {
      id: 'gender',
      title: language === 'el' ? 'Τι φύλο προτιμάτε;' : 'What gender do you prefer?',
      subtitle: language === 'el' ? 'Επιλέξτε ή αφήστε το στην τύχη!' : 'Choose or leave it to fate!',
      type: 'cards',
      icon: Baby,
      options: [
        { id: 'boy', label: language === 'el' ? 'Αγόρι' : 'Boy', emoji: '👦', color: '#54a0ff' },
        { id: 'girl', label: language === 'el' ? 'Κορίτσι' : 'Girl', emoji: '👧', color: '#ff6b9d' },
        { id: 'surprise', label: language === 'el' ? 'Έκπληξη' : 'Surprise', emoji: '🎁', color: '#feca57' },
      ],
    },
    {
      id: 'nameStyle',
      title: language === 'el' ? 'Τι στυλ ονόματος σας αρέσει;' : 'What name style do you like?',
      subtitle: language === 'el' ? 'Επιλέξτε αυτό που σας εκφράζει' : 'Choose what expresses you',
      type: 'cards',
      icon: Sparkles,
      options: [
        { id: 'classic', label: language === 'el' ? 'Κλασικό' : 'Classic', emoji: '🏛️', color: '#6c5ce7' },
        { id: 'modern', label: language === 'el' ? 'Μοντέρνο' : 'Modern', emoji: '✨', color: '#00d2d3' },
        { id: 'exotic', label: language === 'el' ? 'Εξωτικό' : 'Exotic', emoji: '🌍', color: '#ff9f43' },
        { id: 'family', label: language === 'el' ? 'Οικογενειακό' : 'Family', emoji: '👨‍👩‍👧', color: '#ee5a24' },
      ],
    },
    {
      id: 'futureDream',
      title: language === 'el' ? 'Τι ονειρεύεστε να γίνει το παιδί σας;' : 'What do you dream your child will become?',
      subtitle: language === 'el' ? 'Τα όνειρά σας μας εμπνέουν!' : 'Your dreams inspire us!',
      type: 'cards',
      icon: Target,
      options: [
        { id: 'leader', label: language === 'el' ? 'Ηγέτης' : 'Leader', emoji: '👑', color: '#f9a826', desc: language === 'el' ? 'CEO, Πολιτικός' : 'CEO, Politician' },
        { id: 'artist', label: language === 'el' ? 'Καλλιτέχνης' : 'Artist', emoji: '🎨', color: '#dda0dd', desc: language === 'el' ? 'Μουσικός, Ζωγράφος' : 'Musician, Painter' },
        { id: 'scientist', label: language === 'el' ? 'Επιστήμονας' : 'Scientist', emoji: '🔬', color: '#45b7d1', desc: language === 'el' ? 'Γιατρός, Ερευνητής' : 'Doctor, Researcher' },
        { id: 'athlete', label: language === 'el' ? 'Αθλητής' : 'Athlete', emoji: '🏆', color: '#ff6b6b', desc: language === 'el' ? 'Πρωταθλητής' : 'Champion' },
        { id: 'caregiver', label: language === 'el' ? 'Φροντιστής' : 'Caregiver', emoji: '❤️', color: '#ff6b9d', desc: language === 'el' ? 'Δάσκαλος, Νοσοκόμα' : 'Teacher, Nurse' },
        { id: 'explorer', label: language === 'el' ? 'Εξερευνητής' : 'Explorer', emoji: '🌍', color: '#4ecdc4', desc: language === 'el' ? 'Ταξιδιώτης, Επιχειρηματίας' : 'Traveler, Entrepreneur' },
      ],
    },
    {
      id: 'aesthetic',
      title: language === 'el' ? 'Ποια αισθητική σας εκφράζει;' : 'Which aesthetic expresses you?',
      subtitle: language === 'el' ? 'Αυτό θα επηρεάσει τις προτάσεις μας' : 'This will influence our suggestions',
      type: 'cards',
      icon: Palette,
      options: [
        { id: 'boho', label: 'Boho', emoji: '🌿', color: '#a8e6cf' },
        { id: 'minimal', label: 'Minimal', emoji: '⬜', color: '#dfe6e9' },
        { id: 'luxury', label: 'Luxury', emoji: '👑', color: '#f9a826' },
        { id: 'playful', label: 'Playful', emoji: '🌈', color: '#ff6b9d' },
      ],
    },
  ];

  const handleAnswer = (questionId, value) => {
    const keyMap = {
      'birthdays': 'motherBirthday',
      'gender': 'preferredGender',
      'nameStyle': 'nameStyle',
      'futureDream': 'futureDream',
      'aesthetic': 'aesthetic',
    };
    const stateKey = keyMap[questionId] || questionId;
    
    setAnswers(prev => ({
      ...prev,
      [stateKey]: value,
    }));
  };

  const handleDateChange = (field, value) => {
    const newAnswers = {
      ...answers,
      [field]: value,
    };
    setAnswers(newAnswers);
    
    // Save dates to localStorage for Premium flow sync
    if (['motherBirthday', 'fatherBirthday', 'expectedBirthMonth', 'expectedBirthYear'].includes(field)) {
      saveToLocalStorage(newAnswers);
    }
  };

  const canProceed = () => {
    const q = questions[currentStep];
    switch (q.id) {
      case 'birthdays':
        return answers.motherBirthday && answers.fatherBirthday;
      case 'babyExpected':
        return answers.expectedBirthMonth;
      case 'gender':
        return answers.preferredGender;
      case 'nameStyle':
        return answers.nameStyle;
      case 'futureDream':
        return answers.futureDream;
      case 'aesthetic':
        return answers.aesthetic;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await generateResult();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Calculate baby's zodiac based on expected birth month
  const calculateBabyZodiac = (month) => {
    const zodiacByMonth = {
      1: 'capricorn', 2: 'aquarius', 3: 'pisces', 4: 'aries',
      5: 'taurus', 6: 'gemini', 7: 'cancer', 8: 'leo',
      9: 'virgo', 10: 'libra', 11: 'scorpio', 12: 'sagittarius'
    };
    return zodiacByMonth[month] || 'leo';
  };

  const generateResult = async () => {
    setIsLoading(true);
    try {
      // Calculate zodiac from expected birth month
      const babyZodiac = calculateBabyZodiac(parseInt(answers.expectedBirthMonth));
      
      const response = await fetch(`${API_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          babyZodiac: babyZodiac,
          language: language,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        console.error('Failed to generate result');
      }
    } catch (error) {
      console.error('Error generating result:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate shareable image using html2canvas
  const generateShareImage = async () => {
    setIsGeneratingImage(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      if (resultCardRef.current) {
        const canvas = await html2canvas(resultCardRef.current, {
          backgroundColor: '#1a1a2e',
          scale: 2,
          useCORS: true,
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `babywish-${result.topName.toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/png');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to native share
      handleShare();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'A BabyWish - My Baby Prediction',
          text: `${result.topName} - ${result.zodiacName}\n${result.babyAnalysis?.substring(0, 100)}...`,
          url: 'https://getbabywish.com',
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const renderQuestion = () => {
    const q = questions[currentStep];
    const Icon = q.icon;

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {/* Question Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{q.title}</h3>
          <p className="text-white/60">{q.subtitle}</p>
        </div>

        {/* Question Content */}
        {q.type === 'dates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-4">
              <label className="block text-white/80 mb-2 text-sm">
                {language === 'el' ? 'Ημ/νία Γέννησης Μητέρας' : 'Mother\'s Birthday'}
              </label>
              <input
                type="date"
                value={answers.motherBirthday}
                onChange={(e) => handleDateChange('motherBirthday', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="glass rounded-xl p-4">
              <label className="block text-white/80 mb-2 text-sm">
                {language === 'el' ? 'Ημ/νία Γέννησης Πατέρα' : 'Father\'s Birthday'}
              </label>
              <input
                type="date"
                value={answers.fatherBirthday}
                onChange={(e) => handleDateChange('fatherBirthday', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {q.type === 'babyDate' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-4">
              <label className="block text-white/80 mb-2 text-sm">
                {language === 'el' ? 'Μήνας Γέννησης Μωρού' : 'Baby\'s Birth Month'}
              </label>
              <select
                value={answers.expectedBirthMonth}
                onChange={(e) => handleDateChange('expectedBirthMonth', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="" className="bg-gray-900">{language === 'el' ? 'Επιλέξτε μήνα...' : 'Select month...'}</option>
                {monthOptions.map(month => (
                  <option key={month.id} value={month.id} className="bg-gray-900">
                    {language === 'el' ? month.el : month.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="glass rounded-xl p-4">
              <label className="block text-white/80 mb-2 text-sm">
                {language === 'el' ? 'Έτος' : 'Year'}
              </label>
              <select
                value={answers.expectedBirthYear}
                onChange={(e) => handleDateChange('expectedBirthYear', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year} className="bg-gray-900">{year}</option>
                ))}
              </select>
            </div>
            {/* Show predicted zodiac */}
            {answers.expectedBirthMonth && (
              <div className="md:col-span-2 text-center mt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                >
                  <span className="text-3xl">
                    {zodiacSigns.find(z => z.id === calculateBabyZodiac(parseInt(answers.expectedBirthMonth)))?.symbol}
                  </span>
                  <span className="text-white font-medium">
                    {language === 'el' ? 'Το μωρό σας θα είναι' : 'Your baby will be'}{' '}
                    <span className="text-amber-400 font-bold">
                      {language === 'el' 
                        ? zodiacSigns.find(z => z.id === calculateBabyZodiac(parseInt(answers.expectedBirthMonth)))?.name
                        : zodiacSigns.find(z => z.id === calculateBabyZodiac(parseInt(answers.expectedBirthMonth)))?.nameEn
                      }
                    </span>
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {q.type === 'cards' && (
          <div className={`grid gap-4 ${q.options.length === 3 ? 'grid-cols-3' : q.options.length === 6 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {q.options.map((option) => {
              const isSelected = answers[q.id === 'futureDream' ? 'futureDream' : q.id === 'gender' ? 'preferredGender' : q.id] === option.id;
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(q.id, option.id)}
                  className={`p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-white bg-white/20 shadow-lg'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 30px ${option.color}40` : 'none',
                  }}
                >
                  <div className="text-3xl md:text-4xl mb-2">{option.emoji}</div>
                  <div className="text-white font-semibold text-sm md:text-base">{option.label}</div>
                  {option.desc && (
                    <div className="text-white/50 text-xs mt-1">{option.desc}</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  const renderResult = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {/* Shareable Result Card */}
      <div 
        ref={resultCardRef}
        className="glass rounded-3xl p-6 md:p-8 max-w-lg mx-auto border border-purple-500/30"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
      >
        {/* Zodiac Symbol */}
        <div className="text-6xl mb-4">{result.zodiacSymbol}</div>
        
        {/* Top Name - Primary Suggestion */}
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 mb-1">
          {result.topName}
        </h2>
        <p className="text-white/50 text-sm mb-4">{language === 'el' ? 'Κορυφαία Επιλογή' : 'Top Pick'}</p>
        
        {/* Zodiac Name */}
        <div className="text-xl text-amber-400 font-semibold mb-4">
          {result.zodiacName}
        </div>
        
        {/* Alternative Names */}
        {result.alternativeNames && result.alternativeNames.length > 0 && (
          <div className="flex justify-center gap-4 mb-6">
            {result.alternativeNames.map((name, idx) => (
              <div key={idx} className="px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <span className="text-white/80 text-sm">{name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Baby Analysis - How they'll be as a baby */}
        <div className="bg-white/10 rounded-xl p-4 mb-4 text-left">
          <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
            <Baby className="w-4 h-4" />
            {language === 'el' ? 'Πώς θα είναι ως μωρό' : 'As a Baby'}
          </h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {result.babyAnalysis}
          </p>
        </div>
        
        {/* Personality Description - Personalized */}
        <div className="bg-white/10 rounded-xl p-4 mb-4 text-left">
          <h4 className="text-pink-300 font-semibold mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {language === 'el' ? 'Προσωπικότητα' : 'Personality'}
          </h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {result.personality}
          </p>
        </div>
        
        {/* Name-Zodiac Connection */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-purple-200 italic">
            "{result.nameZodiacConnection}"
          </p>
        </div>

        {/* Branding */}
        <div className="text-white/40 text-xs">
          getbabywish.com
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <Button
          onClick={generateShareImage}
          disabled={isGeneratingImage}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2"
        >
          {isGeneratingImage ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
              {language === 'el' ? 'Δημιουργία...' : 'Creating...'}
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {language === 'el' ? 'Κατέβασε για Instagram' : 'Download for Instagram'}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="border-white/20 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          {language === 'el' ? 'Κοινοποίηση' : 'Share'}
        </Button>
      </div>
      
      {/* CTA for Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass rounded-2xl p-6 border border-amber-500/30"
      >
        <p className="text-white mb-4">
          {language === 'el' 
            ? '🎯 Θέλετε το πλήρες αποτέλεσμα με ακριβείς ημερομηνίες σύλληψης;'
            : '🎯 Want the full result with exact conception dates?'}
        </p>
        <Button
          onClick={() => onComplete && onComplete(result)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold"
        >
          {language === 'el' ? 'Δείτε τα Πακέτα μας' : 'View Our Packages'}
        </Button>
      </motion.div>
    </motion.div>
  );

  const renderLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="relative inline-block">
        <div className="w-24 h-24 border-4 border-purple-500/30 rounded-full"></div>
        <div className="w-24 h-24 border-4 border-transparent border-t-purple-500 rounded-full absolute top-0 left-0 animate-spin"></div>
        <Sparkles className="w-10 h-10 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h3 className="text-2xl font-bold text-white mt-6 mb-2">
        {language === 'el' ? 'Το AI αναλύει τα όνειρά σας...' : 'AI is analyzing your dreams...'}
      </h3>
      <p className="text-white/60">
        {language === 'el' 
          ? 'Δημιουργούμε 3 μοναδικές προτάσεις ονομάτων'
          : 'Creating 3 unique name suggestions'}
      </p>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-3xl p-6 md:p-8 my-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl z-10"
        >
          ×
        </button>

        {/* Progress Bar */}
        {!result && !isLoading && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>{language === 'el' ? 'Βήμα' : 'Step'} {currentStep + 1}/{questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? renderLoading() : result ? renderResult() : renderQuestion()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!result && !isLoading && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="ghost"
              className="text-white/60 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              {language === 'el' ? 'Πίσω' : 'Back'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full disabled:opacity-50"
            >
              {currentStep === questions.length - 1 
                ? (language === 'el' ? 'Δημιουργία' : 'Generate')
                : (language === 'el' ? 'Επόμενο' : 'Next')}
              {currentStep < questions.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
              {currentStep === questions.length - 1 && <Sparkles className="w-5 h-5 ml-1" />}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InteractiveQuiz;


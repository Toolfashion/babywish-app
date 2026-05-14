import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Upload, Sparkles, Share2, Download, Baby, Heart, Star, Camera, X } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Zodiac data for certificate
const zodiacSigns = [
  { id: 'aries', symbol: '♈', name: 'Κριός', nameEn: 'Aries' },
  { id: 'taurus', symbol: '♉', name: 'Ταύρος', nameEn: 'Taurus' },
  { id: 'gemini', symbol: '♊', name: 'Δίδυμοι', nameEn: 'Gemini' },
  { id: 'cancer', symbol: '♋', name: 'Καρκίνος', nameEn: 'Cancer' },
  { id: 'leo', symbol: '♌', name: 'Λέων', nameEn: 'Leo' },
  { id: 'virgo', symbol: '♍', name: 'Παρθένος', nameEn: 'Virgo' },
  { id: 'libra', symbol: '♎', name: 'Ζυγός', nameEn: 'Libra' },
  { id: 'scorpio', symbol: '♏', name: 'Σκορπιός', nameEn: 'Scorpio' },
  { id: 'sagittarius', symbol: '♐', name: 'Τοξότης', nameEn: 'Sagittarius' },
  { id: 'capricorn', symbol: '♑', name: 'Αιγόκερως', nameEn: 'Capricorn' },
  { id: 'aquarius', symbol: '♒', name: 'Υδροχόος', nameEn: 'Aquarius' },
  { id: 'pisces', symbol: '♓', name: 'Ιχθύες', nameEn: 'Pisces' },
];

// Fun certification stamps
const certificationStamps = {
  en: [
    "Certified Future Rockstar",
    "Officially Adorable",
    "Licensed to be Loved",
    "Certified Bundle of Joy",
    "Future World Changer",
    "Approved Miracle in Progress",
  ],
  el: [
    "Πιστοποιημένο Μελλοντικό Αστέρι",
    "Επίσημα Αξιαγάπητο",
    "Άδεια να Αγαπηθεί",
    "Πιστοποιημένη Χαρά",
    "Μελλοντικός Αλλαξοκόσμος",
    "Εγκεκριμένο Θαύμα σε Εξέλιξη",
  ]
};

// Translations
const translations = {
  el: {
    title: 'Πιστοποιητικό Αναμονής',
    subtitle: 'Δημιούργησε το δικό σου αναμνηστικό!',
    uploadPhoto: 'Ανέβασε Φωτογραφία',
    uploadHint: 'Υπερηχογράφημα ή φωτογραφία κοιλιάς',
    momName: 'Όνομα Μαμάς',
    babyNickname: 'Υποκοριστικό Μωρού',
    week: 'Εβδομάδα Κύησης',
    gender: 'Φύλο Μωρού',
    boy: 'Αγόρι',
    girl: 'Κορίτσι',
    surprise: 'Έκπληξη',
    generate: 'Δημιούργησε το Πιστοποιητικό!',
    loading: 'Το AI δημιουργεί το πιστοποιητικό...',
    certifiedText: 'Πιστοποιείται ότι',
    weekText: 'διανύει την εβδομάδα',
    withSuccess: 'με επιτυχία!',
    babyText: 'Το μωρό',
    developingText: 'αναπτύσσεται υπέροχα',
    approvedBy: 'Εγκεκριμένο από τ\' Αστέρια',
    share: 'Μοιράσου το!',
    download: 'Κατέβασε',
    newCertificate: 'Νέο Πιστοποιητικό',
    close: 'Κλείσιμο',
    changePhoto: 'Άλλαξε φωτογραφία',
    slogan: 'Ἔρως ἀνίκατε μάχαν',
    furnitureHint: 'Προετοιμάστε το δωμάτιο για τον μικρό σας',
    seeIdeas: 'Δείτε ιδέες',
  },
  en: {
    title: 'Journey Certificate',
    subtitle: 'Create your own keepsake!',
    uploadPhoto: 'Upload Photo',
    uploadHint: 'Ultrasound or belly photo',
    momName: 'Mom\'s Name',
    babyNickname: 'Baby\'s Nickname',
    week: 'Pregnancy Week',
    gender: 'Baby\'s Gender',
    boy: 'Boy',
    girl: 'Girl',
    surprise: 'Surprise',
    generate: 'Create Certificate!',
    loading: 'AI is creating your certificate...',
    certifiedText: 'This certifies that',
    weekText: 'is in week',
    withSuccess: 'with flying colors!',
    babyText: 'Baby',
    developingText: 'is developing wonderfully',
    approvedBy: 'Approved by the Stars',
    share: 'Share it!',
    download: 'Download',
    newCertificate: 'New Certificate',
    close: 'Close',
    changePhoto: 'Change photo',
    slogan: 'Love, invincible in battle',
    furnitureHint: 'Prepare the nursery for your little',
    seeIdeas: 'See ideas',
  },
};

const getT = (lang) => translations[lang] || translations.en;

const BabyCertificate = ({ onClose }) => {
  const { language } = useLanguage();
  const t = getT(language);
  const certificateRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    momName: '',
    babyNickname: '',
    week: '',
    gender: 'surprise',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate zodiac from week
  const calculateZodiac = (week) => {
    const today = new Date();
    const weeksRemaining = 40 - parseInt(week);
    const dueDate = new Date(today.getTime() + (weeksRemaining * 7 * 24 * 60 * 60 * 1000));
    const month = dueDate.getMonth() + 1;
    const day = dueDate.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    return 'pisces';
  };

  // Generate certificate
  const handleGenerate = async () => {
    if (!formData.momName || !formData.week) {
      alert(language === 'el' ? 'Συμπλήρωσε το όνομα και την εβδομάδα' : 'Please fill in name and week');
      return;
    }

    setIsLoading(true);
    
    try {
      const zodiacId = calculateZodiac(formData.week);
      const zodiac = zodiacSigns.find(z => z.id === zodiacId);
      const stamps = certificationStamps[language] || certificationStamps.en;
      const randomStamp = stamps[Math.floor(Math.random() * stamps.length)];
      
      // Call backend for AI-generated message
      const response = await fetch(`${API_URL}/api/certificate/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momName: formData.momName,
          babyNickname: formData.babyNickname || (language === 'el' ? 'Μωράκι' : 'Little One'),
          week: parseInt(formData.week),
          gender: formData.gender,
          zodiac: zodiacId,
          zodiacName: language === 'el' ? zodiac.name : zodiac.nameEn,
          language: language,
        }),
      });
      
      const data = await response.json();
      
      setCertificate({
        momName: formData.momName,
        babyNickname: formData.babyNickname || (language === 'el' ? 'Μωράκι' : 'Little One'),
        week: formData.week,
        gender: formData.gender,
        zodiac: zodiac,
        stamp: randomStamp,
        aiMessage: data.message || (language === 'el' 
          ? 'Συνεχίστε το υπέροχο ταξίδι σας!' 
          : 'Keep going on your wonderful journey!'),
        specialTrait: data.specialTrait || (language === 'el'
          ? 'Γεμάτο αγάπη και όνειρα'
          : 'Full of love and dreams'),
        date: new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US'),
      });
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Fallback certificate
      const zodiacId = calculateZodiac(formData.week);
      const zodiac = zodiacSigns.find(z => z.id === zodiacId);
      const stamps = certificationStamps[language] || certificationStamps.en;
      
      setCertificate({
        momName: formData.momName,
        babyNickname: formData.babyNickname || (language === 'el' ? 'Μωράκι' : 'Little One'),
        week: formData.week,
        gender: formData.gender,
        zodiac: zodiac,
        stamp: stamps[Math.floor(Math.random() * stamps.length)],
        aiMessage: language === 'el' 
          ? 'Συνεχίστε το υπέροχο ταξίδι σας!' 
          : 'Keep going on your wonderful journey!',
        specialTrait: language === 'el'
          ? 'Γεμάτο αγάπη και όνειρα'
          : 'Full of love and dreams',
        date: new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US'),
      });
    }
    
    setIsLoading(false);
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share && certificate) {
      try {
        await navigator.share({
          title: `${certificate.babyNickname} - ${t.title}`,
          text: `${t.certifiedText} ${certificate.momName} ${t.weekText} ${certificate.week}! ✨`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  // Download as image
  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsGeneratingImage(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `babywish-certificate-${certificate.babyNickname}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    }
    
    setIsGeneratingImage(false);
  };

  // Reset
  const handleReset = () => {
    setCertificate(null);
    setPhoto(null);
    setPhotoPreview(null);
    setFormData({ momName: '', babyNickname: '', week: '', gender: 'surprise' });
  };

  // Get cupid based on gender
  const getCupidImage = () => {
    if (certificate?.gender === 'girl') {
      return '/cupid-right.png'; // Female cupid with ribbons
    }
    return '/cupid-left.png'; // Male Eros
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
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
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
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📜✨</div>
              <h2 className="text-2xl font-bold text-white mb-1">{t.title}</h2>
              <p className="text-white/60 text-sm">{t.subtitle}</p>
            </div>

            {!certificate ? (
              /* Input Form */
              <div className="space-y-4">
                {/* Photo Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">{t.changePhoto}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-colors">
                      <Camera className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                      <p className="text-white font-medium">{t.uploadPhoto}</p>
                      <p className="text-white/50 text-sm">{t.uploadHint}</p>
                    </div>
                  )}
                </div>

                {/* Mom's Name */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">{t.momName} *</label>
                  <input
                    type="text"
                    value={formData.momName}
                    onChange={(e) => setFormData({...formData, momName: e.target.value})}
                    placeholder={language === 'el' ? 'π.χ. Μαρία' : 'e.g. Maria'}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30"
                  />
                </div>

                {/* Baby Nickname */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">{t.babyNickname}</label>
                  <input
                    type="text"
                    value={formData.babyNickname}
                    onChange={(e) => setFormData({...formData, babyNickname: e.target.value})}
                    placeholder={language === 'el' ? 'π.χ. Φασολάκι' : 'e.g. Peanut'}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30"
                  />
                </div>

                {/* Week & Gender Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">{t.week} *</label>
                    <select
                      value={formData.week}
                      onChange={(e) => setFormData({...formData, week: e.target.value})}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                    >
                      <option value="" className="bg-gray-900">-</option>
                      {Array.from({ length: 39 }, (_, i) => i + 4).map(week => (
                        <option key={week} value={week} className="bg-gray-900">{week}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">{t.gender}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                    >
                      <option value="surprise" className="bg-gray-900">{t.surprise}</option>
                      <option value="boy" className="bg-gray-900">{t.boy}</option>
                      <option value="girl" className="bg-gray-900">{t.girl}</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!formData.momName || !formData.week || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold rounded-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      {t.loading}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {t.generate}
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              /* Certificate Result */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* The Certificate Card */}
                <div 
                  ref={certificateRef}
                  className="rounded-3xl p-6 text-center relative overflow-hidden"
                  style={{ 
                    background: certificate.gender === 'girl' 
                      ? 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 30%, #f48fb1 70%, #f06292 100%)'
                      : certificate.gender === 'boy'
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 30%, #90caf9 70%, #64b5f6 100%)'
                      : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 30%, #ce93d8 70%, #ba68c8 100%)',
                    border: '3px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Decorative corners */}
                  <div className="absolute top-2 left-2 text-2xl opacity-50">✿</div>
                  <div className="absolute top-2 right-2 text-2xl opacity-50">✿</div>
                  <div className="absolute bottom-2 left-2 text-2xl opacity-50">✿</div>
                  <div className="absolute bottom-2 right-2 text-2xl opacity-50">✿</div>

                  {/* Certificate Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 tracking-widest uppercase">
                      {language === 'el' ? '~ Πιστοποιητικό ~' : '~ Certificate ~'}
                    </h3>
                    <p className="text-gray-600 text-xs">{certificate.date}</p>
                  </div>

                  {/* Photo Frame */}
                  {photoPreview && (
                    <div className="mx-auto mb-4 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img src={photoPreview} alt="Baby" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Main Certificate Text */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm mb-1">{t.certifiedText}</p>
                    <p className="text-2xl font-bold text-gray-800 mb-1">{certificate.momName}</p>
                    <p className="text-gray-700 text-sm">
                      {t.weekText} <span className="font-bold text-xl text-purple-700">{certificate.week}</span> {t.withSuccess}
                    </p>
                  </div>

                  {/* Baby Info */}
                  <div className="bg-white/50 rounded-xl p-3 mb-4">
                    <p className="text-gray-700 text-sm">
                      {t.babyText} <span className="font-bold text-pink-600">{certificate.babyNickname}</span>
                    </p>
                    <p className="text-gray-600 text-sm">{t.developingText} ✨</p>
                    <p className="text-gray-500 text-xs italic mt-1">"{certificate.aiMessage}"</p>
                  </div>

                  {/* Zodiac Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 mb-3">
                    <span className="text-2xl">{certificate.zodiac.symbol}</span>
                    <span className="text-gray-700 text-sm">
                      {t.approvedBy}: <strong>{language === 'el' ? certificate.zodiac.name : certificate.zodiac.nameEn}</strong>
                    </span>
                  </div>

                  {/* Stamp */}
                  <div 
                    className="inline-block px-4 py-2 rounded-lg transform -rotate-6 mb-3"
                    style={{
                      background: 'rgba(220, 38, 38, 0.1)',
                      border: '2px solid rgba(220, 38, 38, 0.5)',
                    }}
                  >
                    <p className="text-red-600 font-bold text-sm uppercase tracking-wide">
                      ★ {certificate.stamp} ★
                    </p>
                  </div>

                  {/* Cupid + Slogan */}
                  <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-white/30">
                    <img 
                      src={getCupidImage()} 
                      alt="Cupid" 
                      className="w-10 h-10 object-contain"
                    />
                    <p 
                      className="text-gray-700 font-semibold text-sm italic"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {t.slogan}
                    </p>
                    <img 
                      src={certificate.gender === 'girl' ? '/cupid-left.png' : '/cupid-right.png'} 
                      alt="Cupid" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>

                  {/* BabyWish Branding */}
                  <p className="text-gray-500 text-xs mt-3">✨ BabyWish.ai</p>
                </div>

                {/* Affiliate Banner */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <p className="text-white/80 text-sm mb-2">
                    🏠 {t.furnitureHint} {certificate.zodiac.symbol} {language === 'el' ? certificate.zodiac.name : certificate.zodiac.nameEn}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-sm border-purple-400 text-purple-300 hover:bg-purple-500/20"
                    onClick={() => alert(language === 'el' ? 'Σύντομα διαθέσιμο!' : 'Coming soon!')}
                  >
                    {t.seeIdeas} →
                  </Button>
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
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
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
                  {t.newCertificate}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BabyCertificate;

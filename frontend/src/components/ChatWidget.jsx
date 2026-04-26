import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Galaxy/Milky Way background for night theme
const GALAXY_URL = "https://images.unsplash.com/photo-1638189330012-44e36a97312a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxkZWVwJTIwcHVycGxlJTIwbmVidWxhJTIwc3BhY2UlMjBiYWNrZ3JvdW5kJTIwc2VhbWxlc3MlMjB0ZXh0dXJlfGVufDB8fHx8MTc3MjY5MTg5Mnww&ixlib=rb-4.1.0&q=85";

const DATA_SPHERE_URL = "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/htnzuozv_IMG_5952.jpeg";

// Angel images - line drawings (new versions)
const ANGEL_BOY_URL = "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/nva1ylbn_IMG_5956.jpeg";
const ANGEL_GIRL_URL = "https://customer-assets.emergentagent.com/job_parent-to-baby-1/artifacts/udsslgan_IMG_5955.jpeg";

// ============================================
// GENDER-SPECIFIC WELCOME MESSAGES
// ============================================

// Female-focused welcome messages (mindjerry's)
const welcomeMessagesFemale = {
  en: "Hello! 🌸 I'm mindjerry's, your nurturing companion for the beautiful journey to motherhood. I'm here to support you with understanding about your body, emotions, and preparation. How are you feeling today?",
  el: "Γεια σας! 🌸 Είμαι η mindjerry's, η υποστηρικτική σύντροφός σας στο όμορφο ταξίδι προς τη μητρότητα. Είμαι εδώ για να σας βοηθήσω με το σώμα, τα συναισθήματα και την προετοιμασία σας. Πώς νιώθετε σήμερα;",
  de: "Hallo! 🌸 Ich bin mindjerry's, Ihre fürsorgliche Begleiterin auf der wunderschönen Reise zur Mutterschaft. Ich bin hier, um Sie zu unterstützen. Wie fühlen Sie sich heute?",
  es: "¡Hola! 🌸 Soy mindjerry's, tu compañera cariñosa en el hermoso viaje hacia la maternidad. Estoy aquí para apoyarte. ¿Cómo te sientes hoy?",
  fr: "Bonjour! 🌸 Je suis mindjerry's, votre compagne bienveillante pour le beau voyage vers la maternité. Comment vous sentez-vous aujourd'hui?",
  it: "Ciao! 🌸 Sono mindjerry's, la tua compagna premurosa nel bellissimo viaggio verso la maternità. Come ti senti oggi?",
  pt: "Olá! 🌸 Sou mindjerry's, sua companheira carinhosa na bela jornada para a maternidade. Como você está se sentindo hoje?",
  ru: "Привет! 🌸 Я mindjerry's, ваша заботливая спутница на прекрасном пути к материнству. Как вы себя чувствуете сегодня?",
  zh: "你好！🌸 我是mindjerry's，在您美丽的母亲之旅中的贴心伙伴。您今天感觉如何？",
  ja: "こんにちは！🌸 私はmindjerry's、母親への美しい旅路でのあなたの心強い仲間です。今日の気分はいかがですか？"
};

// Male-focused welcome messages (mindjerry)
const welcomeMessagesMale = {
  en: "Hey! 💪 I'm mindjerry, your practical guide to fatherhood. I help men understand how to support their partners and prepare for the amazing journey ahead. What's on your mind?",
  el: "Γεια! 💪 Είμαι ο mindjerry, ο πρακτικός οδηγός σου για την πατρότητα. Βοηθάω τους άντρες να καταλάβουν πώς να στηρίξουν τις συντρόφους τους. Τι σε απασχολεί;",
  de: "Hey! 💪 Ich bin mindjerry, Ihr praktischer Guide zur Vaterschaft. Ich helfe Männern zu verstehen, wie sie ihre Partner unterstützen können. Was beschäftigt Sie?",
  es: "¡Hey! 💪 Soy mindjerry, tu guía práctico hacia la paternidad. Ayudo a los hombres a entender cómo apoyar a sus parejas. ¿Qué tienes en mente?",
  fr: "Salut! 💪 Je suis mindjerry, votre guide pratique vers la paternité. J'aide les hommes à comprendre comment soutenir leurs partenaires. Qu'est-ce qui vous préoccupe?",
  it: "Ciao! 💪 Sono mindjerry, la tua guida pratica verso la paternità. Aiuto gli uomini a capire come supportare le loro partner. Cosa hai in mente?",
  pt: "Ei! 💪 Sou mindjerry, seu guia prático para a paternidade. Ajudo os homens a entender como apoiar suas parceiras. O que está em sua mente?",
  ru: "Привет! 💪 Я mindjerry, ваш практический гид к отцовству. Я помогаю мужчинам понять, как поддержать своих партнеров. Что у вас на у|ме?",
  zh: "嘿！💪 我是mindjerry，您通往父亲之路的实用指南。我帮助男性了解如何支持他们的伴侣。你在想什么？",
  ja: "やあ！💪 私はmindjerry、父親への道のりの実践的なガイドです。パートナーをサポートする方法を理解するお手伝いをします。何か気になることは？"
};

// Female-focused suggested questions
const suggestedQuestionsFemale = {
  en: ['How do I track my fertile window?', 'What foods help with fertility?', 'Managing pregnancy anxiety', 'Self-care tips for conception'],
  el: ['Πώς παρακολουθώ το γόνιμο παράθυρο;', 'Ποιες τροφές βοηθούν τη γονιμότητα;', 'Διαχείριση άγχους εγκυμοσύνης', 'Συμβουλές αυτοφροντίδας'],
  de: ['Wie verfolge ich mein fruchtbares Fenster?', 'Welche Lebensmittel fördern die Fruchtbarkeit?', 'Umgang mit Schwangerschaftsangst', 'Selbstpflege-Tipps'],
  es: ['¿Cómo rastreo mi ventana fértil?', '¿Qué alimentos ayudan a la fertilidad?', 'Manejar la ansiedad del embarazo', 'Consejos de autocuidado'],
  fr: ['Comment suivre ma fenêtre fertile?', 'Quels aliments aident la fertilité?', 'Gérer l\'anxiété de grossesse', 'Conseils d\'autosoins'],
  it: ['Come monitorare la finestra fertile?', 'Quali cibi aiutano la fertilità?', 'Gestire l\'ansia da gravidanza', 'Consigli per la cura di sé'],
  pt: ['Como rastrear minha janela fértil?', 'Quais alimentos ajudam na fertilidade?', 'Gerenciando ansiedade da gravidez', 'Dicas de autocuidado'],
  ru: ['Как отслеживать фертильное окно?', 'Какие продукты помогают фертильности?', 'Управление тревогой беременности', 'Советы по уходу за собой'],
  zh: ['如何追踪我的受孕窗口？', '哪些食物有助于生育？', '管理怀孕焦虑', '备孕自我护理建议'],
  ja: ['妊娠可能な時期の追跡方法は？', '妊活に良い食べ物は？', '妊娠中の不安の対処法', 'セルフケアのヒント']
};

// Male-focused suggested questions
const suggestedQuestionsMale = {
  en: ['How can I support my partner?', 'Preparing the home for baby', 'Understanding her mood changes', 'Practical fatherhood tips'],
  el: ['Πώς μπορώ να στηρίξω τη σύντροφό μου;', 'Προετοιμασία σπιτιού για το μωρό', 'Κατανόηση αλλαγών διάθεσης', 'Πρακτικές συμβουλές πατρότητας'],
  de: ['Wie kann ich meine Partnerin unterstützen?', 'Das Zuhause für Baby vorbereiten', 'Ihre Stimmungsschwankungen verstehen', 'Praktische Vatertipps'],
  es: ['¿Cómo puedo apoyar a mi pareja?', 'Preparar el hogar para el bebé', 'Entender sus cambios de humor', 'Consejos prácticos de paternidad'],
  fr: ['Comment soutenir ma partenaire?', 'Préparer la maison pour bébé', 'Comprendre ses changements d\'humeur', 'Conseils pratiques de paternité'],
  it: ['Come posso supportare la mia partner?', 'Preparare casa per il bambino', 'Capire i suoi cambiamenti d\'umore', 'Consigli pratici per papà'],
  pt: ['Como posso apoiar minha parceira?', 'Preparando a casa para o bebê', 'Entendendo as mudanças de humor', 'Dicas práticas de paternidade'],
  ru: ['Как поддержать партнершу?', 'Подготовка дома для малыша', 'Понимание перепадов настроения', 'Практические советы отцам'],
  zh: ['如何支持我的伴侣？', '为宝宝准备家', '理解她的情绪变化', '实用的父亲建议'],
  ja: ['パートナーをどうサポートする？', '赤ちゃんのための家の準備', '彼女の気分の変化を理解する', '実践的な父親のヒント']
};

// Multilingual placeholders by gender
const placeholderFemale = {
  en: "Ask mindjerry's...",
  el: "Ρωτήστε την mindjerry's...",
  de: "Fragen Sie mindjerry's...",
  es: "Pregunta a mindjerry's...",
  fr: "Demandez à mindjerry's...",
  it: "Chiedi a mindjerry's...",
  pt: "Pergunte à mindjerry's...",
  ru: "Спросите mindjerry's...",
  zh: "询问mindjerry's...",
  ja: "mindjerry'sに聞く..."
};

const placeholderMale = {
  en: "Ask mindjerry...",
  el: "Ρωτήστε τον mindjerry...",
  de: "Fragen Sie mindjerry...",
  es: "Pregunta a mindjerry...",
  fr: "Demandez à mindjerry...",
  it: "Chiedi a mindjerry...",
  pt: "Pergunte ao mindjerry...",
  ru: "Спросите mindjerry...",
  zh: "询问mindjerry...",
  ja: "mindjerryに聞く..."
};

// Legacy fallbacks
const welcomeMessages = welcomeMessagesMale;
const suggestedQuestionsMap = suggestedQuestionsMale;
const placeholderMap = placeholderMale;

const ChatWidget = ({ gender = 'male', side = 'right' }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentBaby, setCurrentBaby] = useState(gender === 'male' ? 'boy' : 'girl');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const messagesEndRef = useRef(null);
  
  // Color based on gender
  const accentColor = gender === 'male' ? '#00D4FF' : '#FF69B4'; // Blue for male, Pink for female
  const widgetName = gender === 'male' ? 'mindjerry' : "mindjerry's";
  const indicatorColor = gender === 'male' ? 'bg-green-500' : 'bg-yellow-400'; // Green for male, Yellow for female
  
  // Draggable position state - positioned at bottom of screen (~2cm from bottom)
  const getInitialPosition = () => {
    if (typeof window === 'undefined') return { x: 20, y: 500 };
    const isMobile = window.innerWidth < 768;
    // Position ~75px from bottom (approximately 2cm)
    const bottomOffset = 75;
    if (side === 'left') {
      return {
        x: isMobile ? 20 : 20,
        y: window.innerHeight - bottomOffset
      };
    }
    return {
      x: isMobile ? window.innerWidth - 70 : window.innerWidth - 80,
      y: window.innerHeight - bottomOffset
    };
  };
  
  const [position, setPosition] = useState(getInitialPosition);
  
  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const bottomOffset = 75; // ~2cm from bottom
      if (side === 'left') {
        setPosition({
          x: isMobile ? 20 : 20,
          y: window.innerHeight - bottomOffset
        });
      } else {
        setPosition({
          x: isMobile ? window.innerWidth - 70 : window.innerWidth - 80,
          y: window.innerHeight - bottomOffset
        });
      }
    };
    
    // Set initial position
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [side]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartMousePos = useRef({ x: 0, y: 0 });

  // Set welcome message based on language and gender
  useEffect(() => {
    const welcomeText = gender === 'female'
      ? (welcomeMessagesFemale[language] || welcomeMessagesFemale.en)
      : (welcomeMessagesMale[language] || welcomeMessagesMale.en);
    setMessages([{ type: 'assistant', text: welcomeText }]);
  }, [language, gender]);

  // Alternate angel every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBaby(prev => prev === 'boy' ? 'girl' : 'boy');
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // Loading circle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Drag handlers
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: position.x, y: position.y };
    dragStartMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartMousePos.current.x;
    const deltaY = clientY - dragStartMousePos.current.y;
    
    const newX = Math.max(10, Math.min(window.innerWidth - 60, dragStartPos.current.x + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 60, dragStartPos.current.y + deltaY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add/remove drag event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get language-specific content based on gender
  const suggestedQuestions = gender === 'female' 
    ? (suggestedQuestionsFemale[language] || suggestedQuestionsFemale.en)
    : (suggestedQuestionsMale[language] || suggestedQuestionsMale.en);
  
  const placeholder = gender === 'female'
    ? (placeholderFemale[language] || placeholderFemale.en)
    : (placeholderMale[language] || placeholderMale.en);
  
  const welcomeMessage = gender === 'female'
    ? (welcomeMessagesFemale[language] || welcomeMessagesFemale.en)
    : (welcomeMessagesMale[language] || welcomeMessagesMale.en);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { type: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          session_id: sessionId,
          gender: gender  // Send gender for personality selection
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setSessionId(data.session_id);
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: data.response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: 'Συγγνώμη, υπήρξε ένα πρόβλημα. Παρακαλώ δοκιμάστε ξανά.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  // Calculate circle dash offset for loading animation
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (loadingProgress / 100) * circumference;

  return (
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes rotateGlow {
          0% { filter: hue-rotate(0deg) drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)); }
          50% { filter: hue-rotate(180deg) drop-shadow(0 0 12px rgba(255, 105, 180, 0.6)); }
          100% { filter: hue-rotate(360deg) drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes dataSphereRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Chat Toggle Button - AI Mindjerry - Draggable */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isDragging ? 1.1 : 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed z-50 group"
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 9999,
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              userSelect: 'none'
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            data-testid="chat-widget-toggle"
          >
            {/* Click area for opening chat */}
            <div 
              onClick={() => !isDragging && setIsOpen(true)}
              className="relative w-12 h-12 flex items-center justify-center"
            >  
              {/* Data Sphere Background */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background: `url(${DATA_SPHERE_URL}) center/cover`,
                  animation: 'dataSphereRotate 20s linear infinite',
                  opacity: 0.7
                }}
              />
              
              {/* Outer Loading Circle */}
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(128, 0, 128, 0.3)"
                  strokeWidth="3"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#FF69B4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Baby image - fills to outer circle */}
              <div 
                className="absolute inset-1 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: `url(${DATA_SPHERE_URL}) center/cover`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentBaby}
                    src={currentBaby === 'boy' ? ANGEL_BOY_URL : ANGEL_GIRL_URL}
                    alt={currentBaby === 'boy' ? 'Angel Boy' : 'Angel Girl'}
                    className="w-9 h-9 object-cover rounded-full"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ 
                      duration: 2.5,
                      ease: "easeInOut"
                    }}
                    style={{
                      filter: 'invert(1) contrast(1.5)',
                      mixBlendMode: 'screen'
                    }}
                  />
                </AnimatePresence>
              </div>

              {/* Small Inner Loading Circle - Color based on gender */}
              <svg 
                className="absolute w-5 h-5"
                viewBox="0 0 100 100"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={(2 * Math.PI * 40) - (loadingProgress / 100) * (2 * Math.PI * 40)}
                  style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                />
              </svg>
              
              {/* Online indicator */}
              <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 ${indicatorColor} rounded-full border border-black animate-pulse`} />
            </div>
            
            {/* Tooltip on hover */}
            <div className={`absolute ${side === 'left' ? 'left-full ml-3' : 'right-full mr-3'} top-1/2 -translate-y-1/2 text-white px-3 py-2 rounded-xl shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-bold`}
              style={{ background: gender === 'male' ? 'linear-gradient(to right, #0891b2, #0ea5e9)' : 'linear-gradient(to right, #db2777, #ec4899)' }}
            >
              {widgetName} {gender === 'male' ? '👨' : '👩'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-32 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col overflow-hidden ios-fixed"
            style={{
              position: 'fixed',
              right: '16px',
              bottom: '128px',
              zIndex: 9999,
              background: 'linear-gradient(180deg, rgba(15, 10, 30, 0.98) 0%, rgba(30, 20, 50, 0.98) 100%)',
              WebkitTransform: 'translate3d(0,0,0)',
              transform: 'translate3d(0,0,0)',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              WebkitPerspective: 1000,
              perspective: 1000,
              willChange: 'transform'
            }}
            data-testid="chat-widget-window"
          >
            {/* Header with Galaxy/Milky Way */}
            <div 
              className="relative p-4 flex items-center justify-between overflow-hidden"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(30,20,50,0.85) 100%), url(${GALAXY_URL}) center/cover`,
              }}
            >
              {/* Animated galaxy overlay */}
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  background: `url(${GALAXY_URL}) center/cover`,
                  animation: 'dataSphereRotate 60s linear infinite'
                }}
              />
              
              <div className="relative flex items-center gap-3 z-10">
                {/* Avatar with alternating baby */}
                <div className="relative w-14 h-14">
                  {/* Loading ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="4"/>
                    <circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke="url(#headerGradient)" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />
                    <defs>
                      <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00D4FF"/>
                        <stop offset="100%" stopColor="#FF69B4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Angel icon with data sphere background - inverted */}
                  <div 
                    className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: `url(${DATA_SPHERE_URL}) center/cover`,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentBaby}
                        src={currentBaby === 'boy' ? ANGEL_BOY_URL : ANGEL_GIRL_URL}
                        alt={widgetName}
                        className="w-12 h-12 object-cover rounded-full"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        style={{ 
                          filter: 'invert(1) contrast(1.5)',
                          mixBlendMode: 'screen'
                        }}
                      />
                    </AnimatePresence>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span style={{ textTransform: 'none', fontVariant: 'normal' }}>{widgetName}</span>
                    <span className="text-xs bg-gradient-to-r from-cyan-400 to-purple-500 px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-cyan-300/70 text-xs">{gender === 'male' ? 'Data-Driven Baby Gender AI' : 'Family Psychology AI'}</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-2 hover:bg-white/20"
                data-testid="chat-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'assistant' && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden"
                      style={{
                        background: `url(${DATA_SPHERE_URL}) center/cover`,
                      }}
                    >
                      <img 
                        src={currentBaby === 'boy' ? ANGEL_BOY_URL : ANGEL_GIRL_URL}
                        alt=""
                        className="w-7 h-7 object-cover rounded-full"
                        style={{ 
                          filter: 'invert(1) contrast(1.5)',
                          mixBlendMode: 'screen'
                        }}
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                        : 'bg-white/10 text-white rounded-bl-md border border-purple-500/20'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mr-2">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl rounded-bl-md border border-purple-500/20">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-purple-300/60 text-xs mb-2">Προτεινόμενες ερωτήσεις:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-xs bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-white/80 px-3 py-1.5 rounded-full transition-all border border-purple-500/20 hover:border-purple-500/40"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-purple-500/20 bg-black/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-500/20"
                  disabled={isLoading}
                  data-testid="chat-input"
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 p-0 border-0"
                  data-testid="chat-send-btn"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Branding */}
              <div className="flex justify-center items-center gap-2 mt-3 pt-2 border-t border-purple-500/10">
                <span className="text-[10px] text-purple-400/60">Powered by</span>
                <span className="text-[10px] font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  AI Mindjerry
                </span>
                <span className="text-[10px] text-purple-400/60">• Data-Driven Baby Gender AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

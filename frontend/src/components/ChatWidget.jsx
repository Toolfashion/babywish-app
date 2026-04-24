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

// Multilingual welcome messages (18 languages)
const welcomeMessages = {
  en: "Hello! 👋 I'm AI Mindjerry, your personal Family Psychologist & Probability Consultant. I understand your desire to know your future child's gender. How can I help you today?",
  de: "Hallo! 👋 Ich bin AI Mindjerry, Ihr persönlicher Familienpsychologe & Wahrscheinlichkeitsberater. Ich verstehe Ihren Wunsch, das Geschlecht Ihres zukünftigen Kindes zu erfahren. Wie kann ich Ihnen heute helfen?",
  el: "Γεια σας! 👋 Είμαι ο AI Mindjerry, ο προσωπικός σας Family Psychologist & Probability Consultant. Καταλαβαίνω την επιθυμία σας να γνωρίζετε το φύλο του μελλοντικού σας παιδιού. Πώς μπορώ να σας βοηθήσω σήμερα;",
  es: "¡Hola! 👋 Soy AI Mindjerry, tu Psicólogo Familiar y Consultor de Probabilidad personal. Entiendo tu deseo de conocer el género de tu futuro hijo. ¿Cómo puedo ayudarte hoy?",
  fr: "Bonjour! 👋 Je suis AI Mindjerry, votre Psychologue Familial et Consultant en Probabilité personnel. Je comprends votre désir de connaître le sexe de votre futur enfant. Comment puis-je vous aider aujourd'hui?",
  it: "Ciao! 👋 Sono AI Mindjerry, il tuo Psicologo Familiare e Consulente di Probabilità personale. Capisco il tuo desiderio di conoscere il sesso del tuo futuro bambino. Come posso aiutarti oggi?",
  pt: "Olá! 👋 Sou o AI Mindjerry, seu Psicólogo Familiar e Consultor de Probabilidade pessoal. Entendo seu desejo de saber o gênero do seu futuro filho. Como posso ajudá-lo hoje?",
  ru: "Привет! 👋 Я AI Mindjerry, ваш личный Семейный Психолог и Консультант по Вероятностям. Я понимаю ваше желание узнать пол вашего будущего ребенка. Чем я могу помочь вам сегодня?",
  zh: "你好！👋 我是AI Mindjerry，您的私人家庭心理学家和概率顾问。我理解您想知道未来孩子性别的愿望。今天我能帮您什么？",
  hi: "नमस्ते! 👋 मैं AI Mindjerry हूं, आपका व्यक्तिगत पारिवारिक मनोवैज्ञानिक और संभावना सलाहकार। मैं आपके भविष्य के बच्चे का लिंग जानने की आपकी इच्छा को समझता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
  ar: "مرحباً! 👋 أنا AI Mindjerry، مستشارك الشخصي في علم نفس الأسرة والاحتمالات. أفهم رغبتك في معرفة جنس طفلك المستقبلي. كيف يمكنني مساعدتك اليوم؟",
  tr: "Merhaba! 👋 Ben AI Mindjerry, kişisel Aile Psikoloğunuz ve Olasılık Danışmanınız. Gelecekteki çocuğunuzun cinsiyetini bilme arzunuzu anlıyorum. Bugün size nasıl yardımcı olabilirim?",
  fa: "سلام! 👋 من AI Mindjerry هستم، روانشناس خانواده و مشاور احتمالات شخصی شما. من میل شما به دانستن جنسیت فرزند آینده‌تان را درک می‌کنم. امروز چطور می‌توانم به شما کمک کنم؟",
  ja: "こんにちは！👋 私はAI Mindjerry、あなたの専属ファミリーサイコロジスト＆確率コンサルタントです。将来のお子様の性別を知りたいというあなたの願望を理解しています。今日はどのようにお手伝いできますか？",
  sv: "Hej! 👋 Jag är AI Mindjerry, din personliga familjepsykolog och sannolikhetskonsult. Jag förstår din önskan att veta ditt framtida barns kön. Hur kan jag hjälpa dig idag?",
  sr: "Здраво! 👋 Ја сам AI Mindjerry, ваш лични породични психолог и консултант за вероватноћу. Разумем вашу жељу да сазнате пол вашег будућег детета. Како вам могу помоћи данас?",
  pl: "Cześć! 👋 Jestem AI Mindjerry, Twoim osobistym Psychologiem Rodzinnym i Konsultantem ds. Prawdopodobieństwa. Rozumiem Twoje pragnienie poznania płci Twojego przyszłego dziecka. Jak mogę Ci dziś pomóc?",
  cs: "Ahoj! 👋 Jsem AI Mindjerry, váš osobní rodinný psycholog a konzultant pravděpodobnosti. Chápu vaši touhu znát pohlaví vašeho budoucího dítěte. Jak vám dnes mohu pomoci?"
};

// Multilingual suggested questions
const suggestedQuestionsMap = {
  en: ['How far back should I know dates?', 'How much does father\'s age affect?', 'How accurate is the prediction?', 'How does Data-Driven AI work?'],
  de: ['Wie weit zurück sollte ich Daten kennen?', 'Wie viel beeinflusst das Alter des Vaters?', 'Wie genau ist die Vorhersage?', 'Wie funktioniert Data-Driven AI?'],
  el: ['Πόσο πίσω πρέπει να ξέρω τις ημερομηνίες;', 'Πόσο επηρεάζει η ηλικία του πατέρα;', 'Πόσο ακριβής είναι η πρόβλεψη;', 'Πώς λειτουργεί το Data-Driven AI;'],
  es: ['¿Hasta cuándo debo conocer las fechas?', '¿Cuánto afecta la edad del padre?', '¿Qué tan precisa es la predicción?', '¿Cómo funciona Data-Driven AI?'],
  fr: ['Jusqu\'où dois-je connaître les dates?', 'L\'âge du père affecte-t-il beaucoup?', 'Quelle est la précision de la prédiction?', 'Comment fonctionne Data-Driven AI?'],
  it: ['Quanto indietro devo conoscere le date?', 'Quanto influisce l\'età del padre?', 'Quanto è accurata la previsione?', 'Come funziona Data-Driven AI?'],
  pt: ['Até onde preciso saber as datas?', 'Quanto a idade do pai afeta?', 'Quão precisa é a previsão?', 'Como funciona o Data-Driven AI?'],
  ru: ['Как далеко назад нужно знать даты?', 'Как влияет возраст отца?', 'Насколько точен прогноз?', 'Как работает Data-Driven AI?'],
  zh: ['我需要知道多久以前的日期？', '父亲的年龄影响多大？', '预测有多准确？', 'Data-Driven AI如何工作？'],
  hi: ['मुझे कितने पीछे तक तारीखें पता होनी चाहिए?', 'पिता की उम्र कितना प्रभावित करती है?', 'भविष्यवाणी कितनी सटीक है?', 'Data-Driven AI कैसे काम करता है?'],
  ar: ['إلى أي مدى يجب أن أعرف التواريخ؟', 'كم يؤثر عمر الأب؟', 'ما مدى دقة التنبؤ؟', 'كيف يعمل Data-Driven AI؟'],
  tr: ['Tarihleri ne kadar geriye bilmeliyim?', 'Babanın yaşı ne kadar etkiler?', 'Tahmin ne kadar doğru?', 'Data-Driven AI nasıl çalışır?'],
  fa: ['تا چه زمانی باید تاریخ‌ها را بدانم؟', 'سن پدر چقدر تأثیر دارد؟', 'پیش‌بینی چقدر دقیق است؟', 'Data-Driven AI چگونه کار می‌کند؟'],
  ja: ['どこまで遡って日付を知る必要がありますか？', '父親の年齢はどれくらい影響しますか？', '予測はどれくらい正確ですか？', 'Data-Driven AIはどのように機能しますか？'],
  sv: ['Hur långt tillbaka ska jag känna till datum?', 'Hur mycket påverkar faderns ålder?', 'Hur exakt är förutsägelsen?', 'Hur fungerar Data-Driven AI?'],
  sr: ['Колико уназад треба да знам датуме?', 'Колико утиче очева старост?', 'Колико је тачно предвиђање?', 'Како ради Data-Driven AI?'],
  pl: ['Jak daleko wstecz powinienem znać daty?', 'Jak bardzo wpływa wiek ojca?', 'Jak dokładna jest prognoza?', 'Jak działa Data-Driven AI?'],
  cs: ['Jak daleko zpět bych měl znát data?', 'Jak moc ovlivňuje věk otce?', 'Jak přesná je predikce?', 'Jak funguje Data-Driven AI?']
};

// Multilingual placeholders
const placeholderMap = {
  en: "Ask AI Mindjerry...",
  de: "Fragen Sie AI Mindjerry...",
  el: "Ρωτήστε τον AI Mindjerry...",
  es: "Pregunta a AI Mindjerry...",
  fr: "Demandez à AI Mindjerry...",
  it: "Chiedi a AI Mindjerry...",
  pt: "Pergunte ao AI Mindjerry...",
  ru: "Спросите AI Mindjerry...",
  zh: "询问AI Mindjerry...",
  hi: "AI Mindjerry से पूछें...",
  ar: "اسأل AI Mindjerry...",
  tr: "AI Mindjerry'ye sorun...",
  fa: "از AI Mindjerry بپرسید...",
  ja: "AI Mindjerryに聞く...",
  sv: "Fråga AI Mindjerry...",
  sr: "Питајте AI Mindjerry...",
  pl: "Zapytaj AI Mindjerry...",
  cs: "Zeptejte se AI Mindjerry..."
};

const ChatWidget = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentBaby, setCurrentBaby] = useState('boy'); // 'boy' or 'girl'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const messagesEndRef = useRef(null);
  
  // Draggable position state - positioned for visibility on all devices
  const getInitialPosition = () => {
    if (typeof window === 'undefined') return { x: 300, y: 500 };
    const isMobile = window.innerWidth < 768;
    return {
      x: isMobile ? window.innerWidth - 70 : window.innerWidth - 80,
      y: isMobile ? window.innerHeight - 150 : 480 // More visible on mobile - bottom area
    };
  };
  
  const [position, setPosition] = useState(getInitialPosition);
  
  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setPosition({
        x: isMobile ? window.innerWidth - 70 : window.innerWidth - 80,
        y: isMobile ? window.innerHeight - 150 : 480
      });
    };
    
    // Set initial position
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartMousePos = useRef({ x: 0, y: 0 });

  // Set welcome message based on language
  useEffect(() => {
    const welcomeText = welcomeMessages[language] || welcomeMessages.en;
    setMessages([{ type: 'assistant', text: welcomeText }]);
  }, [language]);

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

  // Get language-specific content
  const suggestedQuestions = suggestedQuestionsMap[language] || suggestedQuestionsMap.en;
  const placeholder = placeholderMap[language] || placeholderMap.en;

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
          session_id: sessionId
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

              {/* Small Inner Loading Circle - Pink/Blue only - CENTERED */}
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
                  stroke={currentBaby === 'boy' ? '#00D4FF' : '#FF69B4'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={(2 * Math.PI * 40) - (loadingProgress / 100) * (2 * Math.PI * 40)}
                  style={{ transition: 'stroke-dashoffset 0.1s ease, stroke 2.5s ease' }}
                />
              </svg>
              
              {/* Online indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-pulse" />
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-xl shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-bold">
              AI Mindjerry 🧠
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
                        alt="AI Mindjerry"
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
                    AI Mindjerry
                    <span className="text-xs bg-gradient-to-r from-cyan-400 to-purple-500 px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-cyan-300/70 text-xs">Data-Driven Baby Gender AI</p>
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

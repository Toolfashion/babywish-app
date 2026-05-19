import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Volume2, VolumeX, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Fallback gradient for sphere backgrounds (no external images)
const SPHERE_GRADIENT = "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)";

// Angel images for chat widget avatars (transparent background, blinking effect)
const ANGEL_FEMALE = "/angel-female-transparent.png"; // mindjerry's
const ANGEL_MALE = "/angel-male-transparent.png";     // mindjerry

// Video background is now /datasphere-bg.mp4 in public folder

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
  ja: "こんにちは！🌸 私はmindjerry's、母親への美しい旅路でのあなたの心強い仲間です。今日の気分はいかがですか？",
  nl: "Hallo! 🌸 Ik ben mindjerry's, je zorgzame metgezel op de prachtige reis naar het moederschap. Hoe voel je je vandaag?",
  pl: "Cześć! 🌸 Jestem mindjerry's, twoja troskliwa towarzyszka w pięknej podróży do macierzyństwa. Jak się dziś czujesz?",
  ko: "안녕하세요! 🌸 저는 mindjerry's입니다. 아름다운 모성의 여정에서 당신의 다정한 동반자예요. 오늘 기분이 어떠세요?",
  ar: "مرحباً! 🌸 أنا mindjerry's، رفيقتك الحنونة في رحلة الأمومة الجميلة. كيف تشعرين اليوم؟",
  hi: "नमस्ते! 🌸 मैं mindjerry's हूं, मातृत्व की खूबसूरत यात्रा में आपकी देखभाल करने वाली साथी। आज आप कैसा महसूस कर रही हैं?",
  tr: "Merhaba! 🌸 Ben mindjerry's, anneliğe giden güzel yolculuğunuzda şefkatli yol arkadaşınız. Bugün kendinizi nasıl hissediyorsunuz?",
  sv: "Hej! 🌸 Jag är mindjerry's, din omtänksamma följeslagare på den vackra resan mot moderskapet. Hur mår du idag?",
  he: "שלום! 🌸 אני mindjerry's, המלווה האכפתית שלך במסע היפה לאמהות. איך את מרגישה היום?"
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
  ja: "やあ！💪 私はmindjerry、父親への道のりの実践的なガイドです。パートナーをサポートする方法を理解するお手伝いをします。何か気になることは？",
  nl: "Hey! 💪 Ik ben mindjerry, je praktische gids naar het vaderschap. Ik help mannen begrijpen hoe ze hun partners kunnen ondersteunen. Wat houdt je bezig?",
  pl: "Hej! 💪 Jestem mindjerry, twój praktyczny przewodnik po ojcostwie. Pomagam mężczyznom zrozumieć, jak wspierać swoje partnerki. Co masz na myśli?",
  ko: "안녕! 💪 나는 mindjerry야, 아버지가 되는 길의 실용적인 가이드야. 남성들이 파트너를 어떻게 지원할 수 있는지 이해하도록 도와줘. 무슨 생각이야?",
  ar: "مرحباً! 💪 أنا mindjerry، دليلك العملي نحو الأبوة. أساعد الرجال على فهم كيفية دعم شريكاتهم. ما الذي يشغل بالك؟",
  hi: "हे! 💪 मैं mindjerry हूं, पितृत्व के लिए आपका व्यावहारिक मार्गदर्शक। मैं पुरुषों को यह समझने में मदद करता हूं कि अपने साथी का समर्थन कैसे करें। आपके मन में क्या है?",
  tr: "Selam! 💪 Ben mindjerry, babalığa giden yolda pratik rehberin. Erkeklerin partnerlerini nasıl destekleyeceklerini anlamalarına yardımcı oluyorum. Aklında ne var?",
  sv: "Hej! 💪 Jag är mindjerry, din praktiska guide till faderskap. Jag hjälper män att förstå hur de kan stödja sina partners. Vad tänker du på?",
  he: "היי! 💪 אני mindjerry, המדריך המעשי שלך לאבהות. אני עוזר לגברים להבין איך לתמוך בבנות הזוג שלהם. מה עובר לך בראש?"
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
  ja: ['妊娠可能な時期の追跡方法は？', '妊活に良い食べ物は？', '妊娠中の不安の対処法', 'セルフケアのヒント'],
  nl: ['Hoe volg ik mijn vruchtbare periode?', 'Welke voeding helpt bij vruchtbaarheid?', 'Omgaan met zwangerschapsangst', 'Zelfzorgtips'],
  pl: ['Jak śledzić okres płodny?', 'Jakie jedzenie pomaga w płodności?', 'Radzenie sobie z lękiem ciążowym', 'Porady dotyczące samoopieki'],
  ko: ['가임기를 어떻게 추적하나요?', '임신에 도움이 되는 음식은?', '임신 불안 관리', '임신 준비 자기 관리 팁'],
  ar: ['كيف أتتبع فترة الخصوبة؟', 'ما الأطعمة التي تساعد على الخصوبة؟', 'إدارة قلق الحمل', 'نصائح للعناية بالنفس'],
  hi: ['मैं अपनी प्रजनन अवधि को कैसे ट्रैक करूं?', 'कौन से खाद्य पदार्थ प्रजनन में मदद करते हैं?', 'गर्भावस्था की चिंता का प्रबंधन', 'गर्भधारण के लिए स्व-देखभाल युक्तियाँ'],
  tr: ['Doğurgan dönemimi nasıl takip ederim?', 'Hangi yiyecekler doğurganlığa yardımcı olur?', 'Hamilelik kaygısını yönetmek', 'Gebe kalma için öz bakım ipuçları'],
  sv: ['Hur spårar jag min fertila period?', 'Vilka livsmedel hjälper fertiliteten?', 'Hantera graviditetsångest', 'Egenvårdstips'],
  he: ['איך אני עוקבת אחרי תקופת הפוריות?', 'אילו מאכלים עוזרים לפוריות?', 'ניהול חרדת הריון', 'טיפים לטיפול עצמי']
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
  ja: ['パートナーをどうサポートする？', '赤ちゃんのための家の準備', '彼女の気分の変化を理解する', '実践的な父親のヒント'],
  nl: ['Hoe kan ik mijn partner ondersteunen?', 'Het huis voorbereiden voor de baby', 'Haar stemmingswisselingen begrijpen', 'Praktische vaderschapstips'],
  pl: ['Jak mogę wspierać moją partnerkę?', 'Przygotowanie domu dla dziecka', 'Zrozumienie jej zmian nastroju', 'Praktyczne porady ojcowskie'],
  ko: ['파트너를 어떻게 지원할 수 있나요?', '아기를 위한 집 준비', '그녀의 기분 변화 이해하기', '실용적인 아버지 팁'],
  ar: ['كيف يمكنني دعم شريكتي؟', 'تجهيز المنزل للطفل', 'فهم تقلبات مزاجها', 'نصائح عملية للأبوة'],
  hi: ['मैं अपने साथी का समर्थन कैसे कर सकता हूं?', 'बच्चे के लिए घर तैयार करना', 'उसके मूड में बदलाव को समझना', 'व्यावहारिक पितृत्व युक्तियाँ'],
  tr: ['Partnerimi nasıl destekleyebilirim?', 'Bebek için evi hazırlamak', 'Onun ruh hali değişimlerini anlamak', 'Pratik babalık ipuçları'],
  sv: ['Hur kan jag stödja min partner?', 'Förbereda hemmet för bebisen', 'Förstå hennes humörsvängningar', 'Praktiska pappatips'],
  he: ['איך אני יכול לתמוך בבת הזוג שלי?', 'הכנת הבית לתינוק', 'הבנת שינויי מצב הרוח שלה', 'טיפים מעשיים לאבהות']
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
  ja: "mindjerry'sに聞く...",
  nl: "Vraag mindjerry's...",
  pl: "Zapytaj mindjerry's...",
  ko: "mindjerry's에게 물어보세요...",
  ar: "اسألي mindjerry's...",
  hi: "mindjerry's से पूछें...",
  tr: "mindjerry's'e sor...",
  sv: "Fråga mindjerry's...",
  he: "שאלי את mindjerry's..."
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
  ja: "mindjerryに聞く...",
  nl: "Vraag mindjerry...",
  pl: "Zapytaj mindjerry...",
  ko: "mindjerry에게 물어보세요...",
  ar: "اسأل mindjerry...",
  hi: "mindjerry से पूछें...",
  tr: "mindjerry'e sor...",
  sv: "Fråga mindjerry...",
  he: "שאל את mindjerry..."
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
  const [showAngel, setShowAngel] = useState(false);
  // Different starting positions: Male starts at 0, Female starts at 50 (opposite side)
  const [loadingProgress, setLoadingProgress] = useState(gender === 'male' ? 0 : 50);
  const messagesEndRef = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);
  
  // TTS Audio State
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(null); // Index of message loading TTS
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true); // Auto-play TTS on new messages
  const [userHasInteracted, setUserHasInteracted] = useState(false); // Track user interaction for autoplay
  const audioRef = useRef(null);
  const pendingAutoPlayRef = useRef(null); // Track pending auto-play message
  
  // iOS video autoplay fix - try to play videos on any user interaction
  useEffect(() => {
    const playVideos = () => {
      [videoRef1, videoRef2, videoRef3].forEach(ref => {
        if (ref.current) {
          ref.current.play().catch(() => {});
        }
      });
    };
    
    // Try to play on first touch/click
    document.addEventListener('touchstart', playVideos, { once: true });
    document.addEventListener('click', playVideos, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', playVideos);
      document.removeEventListener('click', playVideos);
    };
  }, []);
  
  // Color based on gender
  const accentColor = gender === 'male' ? '#00D4FF' : '#FF69B4'; // Blue for male, Pink for female
  const widgetName = gender === 'male' ? 'mindjerry' : "mindjerry's";
  const indicatorColor = gender === 'male' ? 'bg-green-500' : 'bg-yellow-400'; // Green for male, Yellow for female
  
  // Draggable position state - positioned at bottom of screen (~2cm from bottom)
  // iOS Safari fix: Use CSS env() for safe area and fixed positioning
  const getInitialPosition = () => {
    if (typeof window === 'undefined') return { x: 20, y: 500 };
    const isMobile = window.innerWidth < 768;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // iOS needs more bottom offset due to home indicator
    const bottomOffset = isIOS ? 120 : 75;
    
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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const bottomOffset = isIOS ? 120 : 75; // iOS needs more space for home indicator
      
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

  // Angel visibility cycle: Hidden 12s -> Visible 5s -> Hidden 12s -> etc
  // Different start delays per gender so they don't sync
  useEffect(() => {
    const hideTime = 12000; // 12 seconds hidden
    const showTime = 5000;  // 5 seconds visible
    const initialDelay = gender === 'male' ? 0 : 6000; // Female starts 6s later
    
    let showTimeout;
    let hideTimeout;
    
    const startCycle = () => {
      // Show angel after hideTime
      showTimeout = setTimeout(() => {
        setShowAngel(true);
        // Also switch which angel (boy/girl)
        setCurrentBaby(prev => prev === 'boy' ? 'girl' : 'boy');
        
        // Hide angel after showTime
        hideTimeout = setTimeout(() => {
          setShowAngel(false);
          // Restart cycle
          startCycle();
        }, showTime);
      }, hideTime);
    };
    
    // Initial delay before first cycle
    const initialTimeout = setTimeout(() => {
      startCycle();
    }, initialDelay);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [gender]);

  // Loading circle animation - VERY different speeds per gender
  // Male: slow (150ms per step), Female: fast (70ms per step)
  // Starting positions also different (0 vs 50) so they never sync
  useEffect(() => {
    const loadingSpeed = gender === 'male' ? 150 : 70;
    const interval = setInterval(() => {
      setLoadingProgress(prev => (prev + 1) % 100);
    }, loadingSpeed);
    return () => clearInterval(interval);
  }, [gender]);

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

    // Mark user interaction for autoplay permission
    setUserHasInteracted(true);

    const userMessage = { type: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          message: text.trim(),
          session_id: sessionId,
          gender: gender  // Send gender for personality selection
        }),
        cache: 'no-store'
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setSessionId(data.session_id);
      
      // Calculate the new message index
      const newMessageIndex = messages.length + 1; // +1 because user message was just added
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: data.response
      }]);
      
      // Auto-play TTS for the new message if enabled and user has interacted
      if (autoPlayEnabled && userHasInteracted && data.response) {
        // Small delay to ensure message is rendered
        setTimeout(() => {
          playTTS(data.response, newMessageIndex, true); // true = isAutoPlay
        }, 300);
      }
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

  // TTS Audio Playback Function - Supports streaming for faster start
  const playTTS = useCallback(async (messageText, messageIndex, isAutoPlay = false) => {
    // If already playing this message, stop it
    if (currentlyPlayingIndex === messageIndex) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentlyPlayingIndex(null);
      return;
    }
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsLoadingTTS(messageIndex);
    
    try {
      // For long texts, use only first ~200 chars for faster TTS
      // This gives instant response while keeping it meaningful
      const maxChars = 500;
      const textToSpeak = messageText.length > maxChars 
        ? messageText.substring(0, maxChars) + '...'
        : messageText;
      
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          gender: gender,
          language: language || 'el'
        })
      });
      
      if (!response.ok) {
        throw new Error('TTS generation failed');
      }
      
      const data = await response.json();
      
      // Create audio from base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setCurrentlyPlayingIndex(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setCurrentlyPlayingIndex(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      setCurrentlyPlayingIndex(messageIndex);
      setIsLoadingTTS(null);
      await audio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoadingTTS(null);
      setCurrentlyPlayingIndex(null);
    }
  }, [currentlyPlayingIndex, gender, language]);

  // Cleanup audio on unmount or chat close
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when chat closes
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentlyPlayingIndex(null);
    }
  }, [isOpen]);

  // Calculate circle dash offset for loading animation
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (loadingProgress / 100) * circumference;
  
  // Different animation speeds for male/female widgets
  const rotationSpeed = gender === 'male' ? '12s' : '8s';
  const pulseSpeed = gender === 'male' ? '3s' : '2.5s';
  const sphereRotateSpeed = gender === 'male' ? '25s' : '20s';

  return (
    <>
      {/* CSS for animations - different speeds per gender */}
      <style>{`
        @keyframes rotateGlow${gender} {
          0% { filter: hue-rotate(0deg) drop-shadow(0 0 8px ${gender === 'male' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(249, 115, 22, 0.6)'}); }
          50% { filter: hue-rotate(180deg) drop-shadow(0 0 12px ${gender === 'male' ? 'rgba(6, 182, 212, 0.6)' : 'rgba(236, 72, 153, 0.6)'}); }
          100% { filter: hue-rotate(360deg) drop-shadow(0 0 8px ${gender === 'male' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(249, 115, 22, 0.6)'}); }
        }
        @keyframes pulseRing${gender} {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes dataSphereRotate${gender} {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .rotate-glow-${gender} {
          animation: rotateGlow${gender} ${rotationSpeed} linear infinite;
        }
        .pulse-ring-${gender} {
          animation: pulseRing${gender} ${pulseSpeed} ease-in-out infinite;
        }
        .sphere-rotate-${gender} {
          animation: dataSphereRotate${gender} ${sphereRotateSpeed} linear infinite;
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
              {/* Background Container - New datasphere video */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
              >
                {/* Fallback gradient background for iOS */}
                <div 
                  className="absolute inset-0"
                  style={{ background: SPHERE_GRADIENT }}
                />
                <video
                  ref={videoRef1}
                  autoPlay
                  loop
                  muted
                  playsInline
                  webkit-playsinline="true"
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: 'scale(2)',
                    WebkitTransform: 'scale(2)',
                  }}
                >
                  <source src="/datasphere-bg.mp4" type="video/mp4" />
                </video>
              </div>
              
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
              
              {/* Sphere video background only - no angels */}
              <div 
                className="absolute inset-1 rounded-full flex items-center justify-center overflow-hidden"
              >
                {/* Fallback gradient background for iOS */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ background: SPHERE_GRADIENT }}
                />
                {/* Data Sphere Video Background */}
                <video
                  ref={videoRef2}
                  autoPlay
                  loop
                  muted
                  playsInline
                  webkit-playsinline="true"
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  style={{
                    transform: 'scale(2)',
                    WebkitTransform: 'scale(2)',
                  }}
                >
                  <source src="/datasphere-bg.mp4" type="video/mp4" />
                </video>
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
            
            {/* Tooltip on hover with brain background */}
            <div className={`absolute ${side === 'left' ? 'left-full ml-3' : 'right-full mr-3'} top-1/2 -translate-y-1/2 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden`}
              style={{ 
                backgroundImage: gender === 'male' 
                  ? 'url(/brain-blue.jpg)'
                  : 'url(/brain-pink.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontWeight: '800',
                textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)',
                letterSpacing: '0.5px'
              }}
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
            className={`fixed bottom-32 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col overflow-hidden ios-fixed ${side === 'left' ? 'left-4' : 'right-4'}`}
            style={{
              position: 'fixed',
              ...(side === 'left' ? { left: '16px' } : { right: '16px' }),
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
            {/* Header with cosmic gradient */}
            <div 
              className="relative p-4 flex items-center justify-between overflow-hidden"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(30,20,50,0.85) 100%), ${SPHERE_GRADIENT}`,
              }}
            >
              {/* Animated cosmic overlay */}
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  background: SPHERE_GRADIENT,
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
                  {/* Sphere video background with blinking angel */}
                  <div 
                    className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    {/* Fallback gradient background for iOS */}
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{ background: SPHERE_GRADIENT }}
                    />
                    {/* Data Sphere Video Background */}
                    <video
                      ref={videoRef3}
                      autoPlay
                      loop
                      muted
                      playsInline
                      webkit-playsinline="true"
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      style={{
                        transform: 'scale(2)',
                        WebkitTransform: 'scale(2)',
                      }}
                    >
                      <source src="/datasphere-bg.mp4" type="video/mp4" />
                    </video>
                    {/* Blinking Angel Overlay - 9 seconds on, 9 seconds off */}
                    <motion.img
                      src={gender === 'female' ? ANGEL_FEMALE : ANGEL_MALE}
                      alt="Angel"
                      className="absolute w-10 h-10 object-contain z-10"
                      style={{ 
                        filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))'
                      }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 18,
                        times: [0, 0.5, 0.5, 1],
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </div>
                
                {/* Name only - datasphere moved to message area */}
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span style={{ textTransform: 'none', fontVariant: 'normal' }}>{widgetName}</span>
                    <span className="text-xs bg-gradient-to-r from-cyan-400 to-purple-500 px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-cyan-300/70 text-xs">Family Psychology AI</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Auto-play Toggle */}
                <button
                  onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  className={`relative z-10 transition-colors rounded-full p-2 ${
                    autoPlayEnabled 
                      ? 'text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30' 
                      : 'text-white/50 bg-white/10 hover:bg-white/20'
                  }`}
                  title={autoPlayEnabled ? 'Αυτόματη αναπαραγωγή: ON' : 'Αυτόματη αναπαραγωγή: OFF'}
                  data-testid="auto-play-toggle"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="relative z-10 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-2 hover:bg-white/20"
                  data-testid="chat-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden relative"
                    >
                      {/* Gradient fallback */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{ background: SPHERE_GRADIENT }}
                      />
                      {/* Mini video background */}
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover rounded-full"
                        style={{ transform: 'scale(2)' }}
                      >
                        <source src="/datasphere-bg.mp4" type="video/mp4" />
                      </video>
                      {/* Blinking Angel in message avatar */}
                      <motion.img
                        src={gender === 'female' ? ANGEL_FEMALE : ANGEL_MALE}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain p-0.5 z-10"
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{
                          duration: 18,
                          times: [0, 0.5, 0.5, 1],
                          repeat: Infinity,
                          ease: "easeInOut"
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
                    {/* TTS Audio Button - Only for assistant messages */}
                    {msg.type === 'assistant' && (
                      <button
                        onClick={() => playTTS(msg.text, index)}
                        disabled={isLoadingTTS === index}
                        className={`mt-2 flex items-center gap-1.5 text-xs transition-all ${
                          currentlyPlayingIndex === index 
                            ? 'text-cyan-400' 
                            : 'text-purple-300/70 hover:text-purple-200'
                        }`}
                        data-testid={`tts-btn-${index}`}
                      >
                        {isLoadingTTS === index ? (
                          <>
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                            <span>Φόρτωση...</span>
                          </>
                        ) : currentlyPlayingIndex === index ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Διακοπή</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Ακούστε</span>
                          </>
                        )}
                      </button>
                    )}
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
                <span className="text-[10px] font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                  AI The Mindjerrs
                </span>
                <span className="text-[10px] text-purple-400/60">• Data-Driven Baby Gender Agenten</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

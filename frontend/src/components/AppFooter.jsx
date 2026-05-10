import { useLanguage } from '../context/LanguageContext';

const AppFooter = () => {
  const { language } = useLanguage();

  // Slogan translations - "Love, invincible in battle!" from Antigone by Sophocles
  const sloganTranslations = {
    en: "Love, invincible in battle!",
    el: "Ἔρως ἀνίκατε μάχαν!",
    de: "Eros, unbesiegbar im Kampf!",
    fr: "Éros, invincible au combat!",
    es: "¡Eros, invencible en batalla!",
    it: "Eros, invincibile in battaglia!",
    pt: "Eros, invencível na batalha!",
    nl: "Eros, onoverwinnelijk in de strijd!",
    pl: "Eros, niezwyciężony w walce!",
    ru: "Эрос, непобедимый в битве!",
    uk: "Ерос, непереможний у битві!",
    zh: "爱神，战无不胜！",
    ja: "エロス、戦いに無敵！",
    ko: "에로스, 전투에서 무적!",
    ar: "إيروس، الذي لا يُقهر في المعركة!",
    hi: "इरोस, युद्ध में अजेय!",
    tr: "Eros, savaşta yenilmez!",
    vi: "Eros, bất khả chiến bại!",
    fa: "اروس، شکست‌ناپذیر در نبرد!",
    sv: "Eros, oövervinnelig i strid!",
    sr: "Ерос, непобедив у боју!",
    cs: "Eros, nepřemožitelný v boji!"
  };

  // Artist credits translations - "From Antigone by Sophocles"
  const creditTranslations = {
    en: "From Antigone by Sophocles",
    el: "Από την Αντιγόνη του Σοφοκλή",
    de: "Aus Antigone von Sophokles",
    fr: "D'Antigone de Sophocle",
    es: "De Antígona de Sófocles",
    it: "Da Antigone di Sofocle",
    pt: "De Antígona de Sófocles",
    nl: "Uit Antigone van Sophocles",
    pl: "Z Antygony Sofoklesa",
    ru: "Из Антигоны Софокла",
    uk: "З Антігони Софокла",
    zh: "出自索福克勒斯《安提戈涅》",
    ja: "ソポクレス『アンティゴネー』より",
    ko: "소포클레스의 안티고네에서",
    ar: "من أنتيجون لسوفوكليس",
    hi: "सोफोक्लीस की एंटीगोन से",
    tr: "Sofokles'in Antigone'sinden",
    vi: "Từ Antigone của Sophocles",
    fa: "از آنتیگون اثر سوفوکل",
    sv: "Från Antigone av Sofokles",
    sr: "Из Антигоне Софокла",
    cs: "Z Antigony od Sofokla"
  };

  const slogan = sloganTranslations[language] || sloganTranslations.en;
  const credit = creditTranslations[language] || creditTranslations.en;

  return (
    <>
      {/* Bottom Footer Bar - Transparent */}
      <footer 
        className="relative w-full z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 5px)',
          background: 'transparent',
        }}
      >
        <div className="flex items-center justify-center py-2 px-4 gap-3">
          {/* Left Cupid */}
          <div 
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{
              background: 'radial-gradient(circle, rgba(64, 224, 208, 0.2) 0%, transparent 70%)',
            }}
          >
            <img 
              src="/cupid-left.jpg" 
              alt="Cupid" 
              className="w-full h-full object-cover"
              style={{
                mixBlendMode: 'lighten',
              }}
            />
          </div>
          
          {/* Slogan with underline and credit */}
          <div className="flex flex-col items-center">
            <p 
              className="font-bold tracking-wide text-center"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '16px',
                color: '#40E0D0',
                textShadow: '0 0 15px rgba(64, 224, 208, 0.6), 0 0 30px rgba(64, 224, 208, 0.3), 0 2px 4px rgba(0,0,0,0.7)',
                borderBottom: '1px solid #40E0D0',
                paddingBottom: '4px',
              }}
            >
              {slogan}
            </p>
            <p 
              className="text-center mt-1"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '9px',
                color: 'rgba(64, 224, 208, 0.7)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                fontStyle: 'italic',
              }}
            >
              {credit}
            </p>
          </div>
          
          {/* Right Cupid */}
          <div 
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{
              background: 'radial-gradient(circle, rgba(64, 224, 208, 0.2) 0%, transparent 70%)',
            }}
          >
            <img 
              src="/cupid-right.jpg" 
              alt="Cupid" 
              className="w-full h-full object-cover"
              style={{
                mixBlendMode: 'lighten',
              }}
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default AppFooter;

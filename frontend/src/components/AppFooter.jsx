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

  const slogan = sloganTranslations[language] || sloganTranslations.en;

  return (
    <>
      {/* Bottom Footer Bar */}
      <footer 
        className="relative w-full z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 5px)',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center justify-center py-2 px-4">
          <p 
            className="font-semibold tracking-wide"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '13px',
              color: '#40E0D0',
              textShadow: '0 0 10px rgba(64, 224, 208, 0.5), 0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {slogan}
          </p>
        </div>
      </footer>

      {/* Right Side Slogan - iOS Safari Compatible with CSS Transform */}
      <div
        id="slogan-badge"
        data-testid="slogan-badge-vertical"
        style={{
          position: 'fixed',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 99999,
          pointerEvents: 'none',
          WebkitTransform: 'translateY(-50%)',
        }}
      >
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#40E0D0',
            textShadow: '0 0 15px rgba(64, 224, 208, 0.8), 0 0 30px rgba(64, 224, 208, 0.5), 2px 2px 4px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            letterSpacing: '2px',
            margin: 0,
            transform: 'rotate(90deg)',
            WebkitTransform: 'rotate(90deg)',
            transformOrigin: 'center center',
            WebkitTransformOrigin: 'center center',
            display: 'inline-block',
          }}
        >
          {slogan}
        </p>
      </div>
    </>
  );
};

export default AppFooter;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight, Check, Sparkles, CreditCard, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import StarField from '../components/StarField';

const API = process.env.REACT_APP_BACKEND_URL;

const QuickStartPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const [step, setStep] = useState(isAuthenticated ? 2 : 1); // Skip step 1 if logged in
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2: Birthdays
  const [motherBirthday, setMotherBirthday] = useState(null);
  const [fatherBirthday, setFatherBirthday] = useState(null);
  
  // Validation
  const isStep1Valid = email.includes('@') && password.length >= 6;
  const isStep2Valid = motherBirthday && fatherBirthday;
  
  const handleQuickRegister = async () => {
    setIsLoading(true);
    try {
      // Register
      await axios.post(`${API}/auth/register`, {
        email,
        password,
        name: email.split('@')[0]
      });
      
      // Auto login
      await login(email, password);
      
      toast.success(t.accountCreated || 'Account created!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProceedToPayment = () => {
    // Store birthdays in session for after payment
    sessionStorage.setItem('motherBirthday', motherBirthday.toISOString());
    sessionStorage.setItem('fatherBirthday', fatherBirthday.toISOString());
    setStep(3);
  };
  
  const steps = [
    { num: 1, label: t.account || 'Account', icon: User },
    { num: 2, label: t.birthdays || 'Birthdays', icon: CalendarIcon },
    { num: 3, label: t.payment || 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="quickstart-page">
      <StarField />
      
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: step === s.num ? 1.1 : 1,
                  backgroundColor: step >= s.num ? '#8b5cf6' : 'rgba(255,255,255,0.2)'
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </motion.div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-1 mx-1 rounded ${step > s.num ? 'bg-purple-500' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
            <AnimatePresence mode="wait">
              {/* Step 1: Quick Account */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                    <h2 className="text-2xl font-bold text-white">{t.createAccount || 'Create Account'}</h2>
                    <p className="text-white/60 text-sm mt-2">{t.quickSignup || 'Quick signup - 30 seconds'}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder={t.email || 'Email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      data-testid="email-input"
                    />
                    <Input
                      type="password"
                      placeholder={t.password || 'Password (min 6 chars)'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      data-testid="password-input"
                    />
                  </div>
                  
                  <Button
                    onClick={handleQuickRegister}
                    disabled={!isStep1Valid || isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="continue-btn"
                  >
                    {isLoading ? '...' : (t.continue || 'Continue')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-center text-white/50 text-xs">
                    {t.hasAccount || 'Already have an account?'}{' '}
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-purple-400 hover:underline"
                    >
                      {t.loginHere || 'Login here'}
                    </button>
                  </p>
                </motion.div>
              )}
              
              {/* Step 2: Birthdays */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <CalendarIcon className="w-12 h-12 mx-auto text-cyan-400 mb-3" />
                    <h2 className="text-2xl font-bold text-white">{t.enterBirthdays || 'Enter Birthdays'}</h2>
                    <p className="text-white/60 text-sm mt-2">{t.birthdayInfo || 'We need both parents\' birthdays'}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Mother's Birthday */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t.motherBirthday || "Mother's Birthday"}</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left bg-white/10 border-white/20 text-white hover:bg-white/20"
                            data-testid="mother-birthday-btn"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-pink-400" />
                            {motherBirthday ? format(motherBirthday, 'PPP') : (t.selectDate || 'Select date')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border-white/20">
                          <Calendar
                            mode="single"
                            selected={motherBirthday}
                            onSelect={setMotherBirthday}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1940}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Father's Birthday */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t.fatherBirthday || "Father's Birthday"}</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left bg-white/10 border-white/20 text-white hover:bg-white/20"
                            data-testid="father-birthday-btn"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                            {fatherBirthday ? format(fatherBirthday, 'PPP') : (t.selectDate || 'Select date')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border-white/20">
                          <Calendar
                            mode="single"
                            selected={fatherBirthday}
                            onSelect={setFatherBirthday}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1940}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!isStep2Valid}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    data-testid="proceed-payment-btn"
                  >
                    {t.proceedToPayment || 'Proceed to Payment'}
                    <CreditCard className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
              
              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Sparkles className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                    <h2 className="text-2xl font-bold text-white">{t.almostThere || 'Almost There!'}</h2>
                    <p className="text-white/60 text-sm mt-2">{t.unlockPrediction || 'Unlock your baby prediction'}</p>
                  </div>
                  
                  {/* Price Card */}
                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-semibold">{t.babyPrediction || 'Baby Prediction'}</span>
                      <span className="text-2xl font-bold text-white">€10</span>
                    </div>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        {t.genderPrediction || 'Gender prediction'}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        {t.suggestedNames || 'Suggested names'}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        {t.zodiacPersonality || 'Zodiac & personality'}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        {t.luckyElements || 'Lucky elements'}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        {t.moneyBackGuarantee || '95% accuracy or money back'}
                      </li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => navigate('/subscribe')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-lg py-6"
                    data-testid="pay-now-btn"
                  >
                    {t.payNow || 'Pay Now'} - €10
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <p className="text-center text-white/40 text-xs">
                    🔒 {t.securePayment || 'Secure payment via Stripe'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickStartPage;



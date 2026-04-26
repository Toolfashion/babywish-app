import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CalendarIcon, ArrowRight, Check, Sparkles, CreditCard, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import StarField from '../components/StarField';

const API = process.env.REACT_APP_BACKEND_URL;

const QuickStartPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const [step, setStep] = useState(isAuthenticated ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [motherBirthday, setMotherBirthday] = useState('');
  const [fatherBirthday, setFatherBirthday] = useState('');
  
  const isStep1Valid = email.includes('@') && password.length >= 6;
  const isStep2Valid = motherBirthday && fatherBirthday;
  
  const handleQuickRegister = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, {
        email,
        password,
        name: email.split('@')[0]
      });
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
    sessionStorage.setItem('motherBirthday', motherBirthday);
    sessionStorage.setItem('fatherBirthday', fatherBirthday);
    setStep(3);
  };
  
  const steps = [
    { num: 1, label: 'Account', icon: User },
    { num: 2, label: 'Birthdays', icon: CalendarIcon },
    { num: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: step === s.num ? 1.1 : 1,
                  backgroundColor: step >= s.num ? '#8b5cf6' : 'rgba(255,255,255,0.2)'
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
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
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-white/60 text-sm mt-2">Quick signup - 30 seconds</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <Input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  <Button
                    onClick={handleQuickRegister}
                    disabled={!isStep1Valid || isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isLoading ? '...' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-center text-white/50 text-xs">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-purple-400 hover:underline">
                      Login here
                    </button>
                  </p>
                </motion.div>
              )}
              
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
                    <h2 className="text-2xl font-bold text-white">Enter Birthdays</h2>
                    <p className="text-white/60 text-sm mt-2">We need both parents' birthdays</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Mother's Birthday</label>
                      <Input
                        type="date"
                        value={motherBirthday}
                        onChange={(e) => setMotherBirthday(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Father's Birthday</label>
                      <Input
                        type="date"
                        value={fatherBirthday}
                        onChange={(e) => setFatherBirthday(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!isStep2Valid}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                  >
                    Proceed to Payment
                    <CreditCard className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
              
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
                    <h2 className="text-2xl font-bold text-white">Almost There!</h2>
                    <p className="text-white/60 text-sm mt-2">Unlock your baby prediction</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-semibold">Baby Prediction</span>
                      <span className="text-2xl font-bold text-white">€10</span>
                    </div>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />Gender prediction</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />Suggested names</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />Zodiac & personality</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />Lucky elements</li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => navigate('/subscribe')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-lg py-6"
                  >
                    Pay Now - €10
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

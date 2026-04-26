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
await axios.post(`${API}/api/auth/register`, { email, password, name: email.split('@')[0] }); 
await login(email, password); 
toast.success('Account created!'); 
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

return ( 
<div className="min-h-screen relative overflow-hidden"> 
<StarField /> 
<div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8"> 
<div className="flex items-center gap-2 mb-8"> 
{[1, 2, 3].map((s, i) => ( 
<div key={s} className="flex items-center"> 
<div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step >= s ? 'bg-purple-600' : 'bg-white/20'}`}> 
{step > s ? <Check className="w-5 h-5" /> : s} 
</div> 
{i < 2 && <div className={`w-8 h-1 mx-1 rounded ${step > s ? 'bg-purple-500' : 'bg-white/20'}`} />} 
</div> 
))} 
</div> 

<div className="w-full max-w-md backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10"> 
<AnimatePresence mode="wait"> 
{step === 1 && ( 
<motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6"> 
<div className="text-center"> 
<User className="w-12 h-12 mx-auto text-purple-400 mb-3" /> 
<h2 className="text-2xl font-bold text-white">Create Account</h2> 
</div> 
<Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white" /> 
<Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/10 border-white/20 text-white" /> 
<Button onClick={handleQuickRegister} disabled={!isStep1Valid || isLoading} className="w-full bg-purple-600"> 
{isLoading ? '...' : 'Continue'} <ArrowRight className="w-4 h-4 ml-2" /> 
</Button> 
</motion.div> 
)} 

{step === 2 && ( 
<motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6"> 
<div className="text-center"> 
<CalendarIcon className="w-12 h-12 mx-auto text-cyan-400 mb-3" /> 
<h2 className="text-2xl font-bold text-white">Enter Birthdays</h2> 
</div> 
<div> 
<label className="text-white/70 text-sm block mb-1">Mother's Birthday</label> 
<Input type="date" value={motherBirthday} onChange={(e) => setMotherBirthday(e.target.value)} className="bg-white/10 border-white/20 text-white" /> 
</div> 
<div> 
<label className="text-white/70 text-sm block mb-1">Father's Birthday</label> 
<Input type="date" value={fatherBirthday} onChange={(e) => setFath

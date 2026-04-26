import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { LogOut, CreditCard, Clock, Mail, Sparkles, Star, Moon } from 'lucide-react';
import axios from 'axios';
import StarField from '../components/StarField';

const API = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [checkingPrediction, setCheckingPrediction] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await axios.get(API + '/api/my-prediction', { withCredentials: true });
        if (response.data) {
          if (response.data.status === 'pending') {
            setIsPending(true);
          } else {
            setPrediction(response.data);
          }
        }
      } catch (err) {
        console.log('No prediction');
      }
      setCheckingPrediction(false);
    };
    if (isAuthenticated) fetchPrediction();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading || checkingPrediction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">BabyWish</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-white">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          {isPending ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center border border-white/10 max-w-lg">
              <Clock className="w-20 h-20 text-amber-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Your prediction is being processed</h2>
              <p className="text-white/60 mb-6">You will receive your result via email soon!</p>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-purple-300">
                  <Mail className="w-5 h-5" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          ) : prediction ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center border border-white/10 max-w-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Your Prediction</h2>
              <div className="text-6xl mb-4">{prediction.gender === 'Boy' ? '👦' : '👧'}</div>
              <p className="text-3xl font-bold text-purple-400 mb-2">{prediction.gender}</p>
              <p className="text-xl text-white mb-4">{prediction.suggested_name}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                <div><Star className="w-4 h-4 inline mr-1" />{prediction.zodiac_sign}</div>
                <div><Moon className="w-4 h-4 inline mr-1" />{prediction.lucky_number}</div>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center border border-white/10 max-w-lg">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">No prediction yet</h2>
              <p className="text-white/60 mb-6">Get your baby prediction now!</p>
              <Button onClick={() => navigate('/subscribe')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                <CreditCard className="w-4 h-4 mr-2" /> Subscribe Now
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

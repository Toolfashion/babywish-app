import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { LogOut, CreditCard, Sparkles } from 'lucide-react';
import StarField from '../components/StarField';

const API = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
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
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center border border-white/10 max-w-lg">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Welcome {user?.email}</h2>
            <p className="text-white/60 mb-6">Get your baby prediction now!</p>
            <Button onClick={() => navigate('/subscribe')} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <CreditCard className="w-4 h-4 mr-2" /> Subscribe Now
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

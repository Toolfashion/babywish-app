import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        try {
          await handleGoogleCallback(sessionId);
          // Clear hash and redirect to dashboard
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center cosmic-bg">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

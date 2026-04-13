import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import StarField from '../components/StarField';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const checkPayment = async () => {
      try {
        const response = await axios.get(
          `${API}/checkout/status/${sessionId}`,
          { withCredentials: true }
        );

        if (response.data.payment_status === 'paid') {
          setStatus('success');
          await refreshUser();
        } else if (response.data.status === 'expired') {
          setStatus('error');
        } else if (attempts < maxAttempts) {
          // Continue polling
          setTimeout(() => setAttempts(a => a + 1), 2000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        // Payment check failed
        if (attempts < maxAttempts) {
          setTimeout(() => setAttempts(a => a + 1), 2000);
        } else {
          setStatus('error');
        }
      }
    };

    checkPayment();
  }, [searchParams, attempts, refreshUser, API, maxAttempts]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 md:p-12 text-center max-w-md w-full"
        >
          {status === 'checking' && (
            <>
              <Sparkles className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">...</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.paymentSuccess}</h2>
              <p className="text-muted-foreground mb-8">
                {t.thankYou}
              </p>
              <Button
                data-testid="go-to-prediction-btn"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-primary to-purple-600"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t.goToDashboard}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">{t.errorOccurred}</h2>
              <p className="text-muted-foreground mb-8">
                {t.tryAgain}
              </p>
              <Button
                onClick={() => navigate('/subscribe')}
                variant="outline"
                className="px-8 py-4 rounded-full border-white/20"
              >
                ←
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

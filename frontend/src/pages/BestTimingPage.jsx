import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Baby, Sparkles, Target, Clock, X, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BestTimingPage = () => {
  const [step, setStep] = useState(1);
  const [motherBirthday, setMotherBirthday] = useState('');
  const [fatherBirthday, setFatherBirthday] = useState('');
  const [desiredGender, setDesiredGender] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!motherBirthday || !fatherBirthday || !desiredGender) {
      setError('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/best-timing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mother_birthday: motherBirthday,
          father_birthday: fatherBirthday,
          desired_gender: desiredGender,
          language: 'el'
        })
      });

      if (!response.ok) throw new Error('Failed to calculate');

      const data = await response.json();
      setResult(data);
      setStep(4);
    } catch (err) {
      setError('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setMotherBirthday('');
    setFatherBirthday('');
    setDesiredGender('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="py-8 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Clock className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Best Timing AI
          </h1>
          <Sparkles className="w-8 h-8 text-pink-400" />
        </motion.div>
        <p className="text-white/70 max-w-xl mx-auto">
          Ανακαλύψτε τον ιδανικό μήνα για σύλληψη βασισμένο στην αστρολογία, 
          την αριθμολογία και το αρχαίο κινεζικό ημερολόγιο.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {/* Step 1: Mother's Birthday */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">👩</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Ημερομηνία Γέννησης Μητέρας</h2>
                  <p className="text-white/50 text-sm">Βήμα 1 από 3</p>
                </div>
              </div>

              <input
                type="date"
                value={motherBirthday}
                onChange={(e) => setMotherBirthday(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                data-testid="mother-birthday-input"
              />

              <Button
                onClick={() => motherBirthday && setStep(2)}
                disabled={!motherBirthday}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg rounded-xl"
              >
                Συνέχεια <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Father's Birthday */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">👨</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Ημερομηνία Γέννησης Πατέρα</h2>
                  <p className="text-white/50 text-sm">Βήμα 2 από 3</p>
                </div>
              </div>

              <input
                type="date"
                value={fatherBirthday}
                onChange={(e) => setFatherBirthday(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                data-testid="father-birthday-input"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 py-6"
                >
                  Πίσω
                </Button>
                <Button
                  onClick={() => fatherBirthday && setStep(3)}
                  disabled={!fatherBirthday}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg rounded-xl"
                >
                  Συνέχεια <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Desired Gender */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Baby className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Επιθυμητό Φύλο</h2>
                  <p className="text-white/50 text-sm">Βήμα 3 από 3</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setDesiredGender('boy')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    desiredGender === 'boy'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-blue-500/50'
                  }`}
                  data-testid="select-boy"
                >
                  <div className="text-4xl mb-2">👦</div>
                  <div className="font-semibold text-blue-400">Αγόρι</div>
                </button>

                <button
                  onClick={() => setDesiredGender('girl')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    desiredGender === 'girl'
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-white/20 hover:border-pink-500/50'
                  }`}
                  data-testid="select-girl"
                >
                  <div className="text-4xl mb-2">👧</div>
                  <div className="font-semibold text-pink-400">Κορίτσι</div>
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 py-6"
                >
                  Πίσω
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!desiredGender || isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg rounded-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Υπολογισμός...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      Υπολογισμός
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && result && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Main Result Card */}
              <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-purple-300" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Ο Καλύτερος Μήνας</h2>
                
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent my-4">
                  {result.best_month}
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-semibold text-green-400">{result.probability}%</span>
                  <span className="text-white/60">πιθανότητα επιτυχίας</span>
                </div>

                <p className="text-white/70 text-sm leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Second Best Option */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">🥈</span>
                  Δεύτερη Καλύτερη Επιλογή
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-300">{result.second_best_month}</span>
                  <span className="text-lg text-green-400">{result.second_probability}%</span>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Συμβουλές
                </h3>
                <ul className="space-y-3">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/70">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 py-6"
                >
                  <X className="mr-2 w-4 h-4" />
                  Νέος Υπολογισμός
                </Button>
                <Button
                  onClick={() => window.location.href = '/subscribe'}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
                >
                  <Baby className="mr-2 w-4 h-4" />
                  Πλήρης Πρόβλεψη
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BestTimingPage;



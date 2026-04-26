import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Sparkles, Baby } from 'lucide-react';
import { Button } from '../components/ui/button';
import GenderRevealCard from '../components/GenderRevealCard';

const GenderRevealPage = () => {
  const [showCard, setShowCard] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [probability, setProbability] = useState(85);

  const handleShowCard = (gender) => {
    setSelectedGender(gender);
    setProbability(Math.floor(Math.random() * 15) + 80);
    setShowCard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Share2 className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Gender Reveal Card
          </h1>
          <Sparkles className="w-8 h-8 text-pink-400" />
        </motion.div>
        <p className="text-white/70 max-w-xl mx-auto">
          Δημιουργήστε ένα όμορφο card για να μοιραστείτε την πρόβλεψή σας στα social media!
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-xl font-semibold mb-6 text-center">
            Δοκιμάστε το Gender Reveal Card
          </h2>

          <p className="text-white/60 text-center mb-8">
            Επιλέξτε φύλο για να δείτε πώς θα φαίνεται το card σας:
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleShowCard('boy')}
              className="p-8 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all"
            >
              <div className="text-6xl mb-4">👦</div>
              <div className="text-xl font-bold text-cyan-400">Αγόρι</div>
              <p className="text-white/50 text-sm mt-2">Δημιουργία Blue Card</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleShowCard('girl')}
              className="p-8 rounded-2xl bg-gradient-to-br from-pink-600/30 to-rose-700/30 border-2 border-pink-500/50 hover:border-pink-400 transition-all"
            >
              <div className="text-6xl mb-4">👧</div>
              <div className="text-xl font-bold text-pink-400">Κορίτσι</div>
              <p className="text-white/50 text-sm mt-2">Δημιουργία Pink Card</p>
            </motion.button>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Baby className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cyan-400 mb-1">Πώς λειτουργεί;</h3>
                <p className="text-white/60 text-sm">
                  Μετά την πρόβλεψή σας, θα μπορείτε να δημιουργήσετε ένα όμορφο card 
                  για να το μοιραστείτε στο Instagram, Facebook ή Twitter. 
                  Κατεβάστε το ως εικόνα ή μοιραστείτε απευθείας!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm text-white/60">Ιδανικό για Instagram Stories</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-sm text-white/60">Αυτόματα χρώματα</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm text-white/60">AI Branding</p>
          </div>
        </div>
      </div>

      {showCard && (
        <GenderRevealCard
          prediction={{
            gender: selectedGender,
            probability: probability
          }}
          onClose={() => setShowCard(false)}
        />
      )}
    </div>
  );
};

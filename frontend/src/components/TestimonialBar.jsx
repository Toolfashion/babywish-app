import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Heart, MessageCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TestimonialBar = ({ prediction, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [testimonialText, setTestimonialText] = useState('');
  const [babyBorn, setBabyBorn] = useState(null); // null, 'correct', 'wrong'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if this is near the predicted birth date (within 3 months)
  const predictedDate = new Date(prediction?.predicted_birth_date);
  const today = new Date();
  const monthsUntilBirth = (predictedDate - today) / (1000 * 60 * 60 * 24 * 30);
  const showTestimonialPrompt = monthsUntilBirth <= 3 || monthsUntilBirth < 0;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t?.pleaseRate || 'Please give a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/testimonial`, {
        rating,
        text: testimonialText,
        prediction_correct: babyBorn,
        predicted_gender: prediction?.predicted_gender,
      }, { withCredentials: true });

      toast.success(t?.thankYou || 'Thank you for sharing your experience! 💕');
      setHasSubmitted(true);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error(t?.errorSubmitting || 'Error submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted || !prediction) return null;

  return (
    <>
      {/* Floating Testimonial Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          data-testid="testimonial-btn"
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm font-medium">
            {t?.shareExperience || "Share Your Experience"}
          </span>
        </motion.button>
      </motion.div>

      {/* Testimonial Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-pink-400" />
                  {t?.shareYourStory || "Share Your Story"}
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Baby Born Question */}
              <div className="mb-6">
                <p className="text-white text-sm mb-3">
                  {t?.hasBabyBeenBorn || "Has your baby been born?"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBabyBorn('yes')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      babyBorn === 'yes' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    ✅ {t?.yes || "Yes"}
                  </button>
                  <button
                    onClick={() => setBabyBorn('no')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      babyBorn === 'no' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    ⏳ {t?.notYet || "Not Yet"}
                  </button>
                </div>
              </div>

              {/* Prediction Accuracy (only if baby born) */}
              {babyBorn === 'yes' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6"
                >
                  <p className="text-white text-sm mb-3">
                    {t?.wasPredictionCorrect || "Was our prediction correct?"}
                    <span className="text-muted-foreground ml-2">
                      ({t?.wePredicted || "We predicted"}: {prediction?.predicted_gender === 'boy' ? '👦 Boy' : '👧 Girl'})
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBabyBorn('correct')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        babyBorn === 'correct' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      🎯 {t?.yesCorrect || "Yes, Correct!"}
                    </button>
                    <button
                      onClick={() => setBabyBorn('wrong')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        babyBorn === 'wrong' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      ❌ {t?.noWrong || "No, Wrong"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Star Rating */}
              <div className="mb-6">
                <p className="text-white text-sm mb-3">
                  {t?.rateExperience || "Rate your experience"}
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <div className="mb-6">
                <p className="text-white text-sm mb-3">
                  {t?.tellUsMore || "Tell us about your experience"} ({t?.optional || "optional"})
                </p>
                <textarea
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  placeholder={t?.testimonialPlaceholder || "Share your thoughts..."}
                  className="w-full h-24 bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-medium"
                data-testid="submit-testimonial-btn"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⭐
                    </motion.div>
                    {t?.submitting || "Submitting..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {t?.submitTestimonial || "Submit"}
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TestimonialBar;

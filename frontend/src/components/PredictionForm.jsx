import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Button } from '../components/ui/button';
import { CalendarDays, Sparkles, Star, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const PredictionForm = ({ onSubmit, isLoading }) => {
  const { t } = useLanguage();
  const [parent1Date, setParent1Date] = useState(null);
  const [parent2Date, setParent2Date] = useState(null);
  const [parent1Open, setParent1Open] = useState(false);
  const [parent2Open, setParent2Open] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parent1Date && parent2Date) {
      onSubmit({
        parent1_birthday: format(parent1Date, 'yyyy-MM-dd'),
        parent2_birthday: format(parent2Date, 'yyyy-MM-dd'),
      });
    }
  };

  const canSubmit = parent1Date && parent2Date && !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Parents' Birthday Inputs Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Connection line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-8 h-8 text-pink-400 fill-pink-400/30" />
            </motion.div>
          </div>

          {/* Parent 1 - Mother */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 card-lift"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t.motherBirthday}</h3>
            </div>
            
            <Popover open={parent1Open} onOpenChange={setParent1Open}>
              <PopoverTrigger asChild>
                <Button
                  data-testid="parent1-date-trigger"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-300",
                    !parent1Date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                  {parent1Date ? (
                    <span className="text-white">{format(parent1Date, "dd/MM/yyyy")}</span>
                  ) : (
                    <span>📅</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1a103c] border-white/10" align="start">
                <Calendar
                  mode="single"
                  selected={parent1Date}
                  onSelect={(date) => {
                    setParent1Date(date);
                    setParent1Open(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Parent 2 - Father */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 card-lift"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t.fatherBirthday}</h3>
            </div>
            
            <Popover open={parent2Open} onOpenChange={setParent2Open}>
              <PopoverTrigger asChild>
                <Button
                  data-testid="parent2-date-trigger"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-secondary/50 transition-all duration-300",
                    !parent2Date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-3 h-5 w-5 text-secondary" />
                  {parent2Date ? (
                    <span className="text-white">{format(parent2Date, "dd/MM/yyyy")}</span>
                  ) : (
                    <span>📅</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1a103c] border-white/10" align="start">
                <Calendar
                  mode="single"
                  selected={parent2Date}
                  onSelect={(date) => {
                    setParent2Date(date);
                    setParent2Open(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>

        {/* Mobile Heart */}
        <div className="flex md:hidden justify-center -my-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400/30" />
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-4"
        >
          <Button
            data-testid="prediction-submit-btn"
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "relative px-12 py-6 text-lg font-bold rounded-full transition-all duration-500",
              "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90",
              "shadow-lg shadow-purple-500/25",
              canSubmit && "btn-glow animate-glow-pulse",
              !canSubmit && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="flex items-center gap-3">
              <Sparkles className={cn("w-5 h-5", isLoading && "animate-spin")} />
              {isLoading ? t.predicting : t.predictButton}
              <Sparkles className={cn("w-5 h-5", isLoading && "animate-spin")} />
            </span>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default PredictionForm;

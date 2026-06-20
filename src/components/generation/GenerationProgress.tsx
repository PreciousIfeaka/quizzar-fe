import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  'Reading your content...',
  'Analyzing questions...',
  'Generating answer options...',
  'Suggesting timing...',
  'Finalizing your quiz...',
];

export function GenerationProgress() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(p => {
        if (p >= steps.length - 1) { clearInterval(interval); return p; }
        return p + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Animated rings */}
      <div className="relative w-32 h-32 mb-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-[#00bcd4]/30"
            animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand-lg animate-float">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-800 mb-2">Your Quiz is being generated</h2>
      <p className="text-muted-foreground mb-8 text-sm">This usually takes 15–30 seconds</p>

      {/* Step progress */}
      <div className="space-y-2 w-full max-w-xs">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= stepIndex ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              i < stepIndex ? 'bg-green-500' : i === stepIndex ? 'bg-[#00bcd4] animate-pulse' : 'bg-slate-200'
            }`} />
            <span className={i <= stepIndex ? 'text-slate-700 font-medium' : 'text-muted-foreground'}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

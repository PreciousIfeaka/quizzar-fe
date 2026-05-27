import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface OptionButtonProps {
  label:    string;
  text:     string;
  selected: boolean;
  onClick:  () => void;
  correct?: boolean | null;   // Only shown on result screen
  disabled?: boolean;
}
export function OptionButton({
  label: _label, text, selected, onClick, correct, disabled
}: OptionButtonProps) {
  const isResult = correct !== undefined && correct !== null;

  // Strips prefixes like "A. ", "B) ", "c. ", etc.
  const cleanedText = text.replace(/^[A-Da-d][.)\-\s]+\s*/, '').trim();

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, y: -3, rotate: 0.5 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-center p-5 rounded-2xl border-2 text-center transition-all duration-300 font-extrabold text-base relative overflow-hidden group',
        !isResult && !selected && 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#00bcd4]/80 hover:bg-[#00bcd4]/5 hover:text-[#00bcd4] hover:shadow-[0_8px_30px_rgba(0,188,212,0.1)]',
        !isResult && selected && 'border-[#00bcd4] bg-[#00bcd4]/10 text-[#00bcd4] shadow-[0_0_30px_rgba(0,188,212,0.15)]',
        isResult && correct  && selected && 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.15)]',
        isResult && !correct && selected && 'border-red-500 bg-red-500/10 text-red-600 shadow-[0_0_30px_rgba(239,68,68,0.15)]',
        isResult && correct  && !selected && 'border-emerald-300 bg-emerald-50/50 text-emerald-600',
        disabled && 'cursor-not-allowed'
      )}
    >
      {/* Decorative spotlight glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      <span className="relative z-10 tracking-tight leading-snug">
        {cleanedText}
      </span>

      {/* Result indicators at the right corner if needed */}
      {isResult && correct && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#00d68f] flex items-center justify-center text-white shadow-md">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      )}
      {isResult && !correct && selected && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-black shadow-md">
          ✕
        </span>
      )}
    </motion.button>
  );
}

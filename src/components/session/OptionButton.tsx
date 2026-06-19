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
  const cleanedText = text.replace(/^[A-Da-d][.)\ -\s]+\s*/, '').trim();

  // For T/F questions, label is a full word ("True"/"False"). Show only the
  // first letter in the badge so the full word isn't rendered twice.
  const badgeLabel = _label.length > 1 ? _label[0] : _label;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-300 font-bold text-base relative overflow-hidden group',
        !isResult && !selected && 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#0A99AB]/85 hover:bg-[#0A99AB]/5 hover:text-[#0A99AB] hover:shadow-[0_8px_30px_rgba(10,153,171,0.06)]',
        !isResult && selected && 'border-[#0A99AB] bg-[#0A99AB]/10 text-slate-900 shadow-[0_0_30px_rgba(10,153,171,0.1)]',
        isResult && correct  && selected && 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.1)]',
        isResult && !correct && selected && 'border-red-500 bg-red-50 text-red-650 shadow-[0_0_30px_rgba(239,68,68,0.1)]',
        isResult && correct  && !selected && 'border-emerald-250 bg-emerald-50/50 text-emerald-600',
        isResult && !correct && !selected && 'border-slate-100 bg-slate-50 text-slate-400 opacity-60',
        disabled && 'cursor-not-allowed'
      )}
    >
      {/* Decorative spotlight glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Letter indicator bubble on left */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-base transition-colors duration-300',
        !isResult && !selected && 'bg-slate-200/50 text-slate-500 group-hover:bg-[#0A99AB]/20 group-hover:text-[#0A99AB]',
        !isResult && selected && 'bg-[#0A99AB] text-white',
        isResult && correct && 'bg-emerald-500 text-white',
        isResult && !correct && selected && 'bg-red-500 text-white',
        isResult && !correct && !selected && 'bg-slate-200/30 text-slate-400'
      )}>
        {badgeLabel}
      </div>

      <span className={cn(
        'ml-4 relative z-10 tracking-tight leading-snug flex-grow',
        selected && 'font-extrabold text-slate-900'
      )}>
        {cleanedText}
      </span>

      {/* Result indicators at the right corner if needed */}
      {isResult && correct && (
        <span className="ml-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      )}
      {isResult && !correct && selected && (
        <span className="ml-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0">
          ✕
        </span>
      )}
    </motion.button>
  );
}

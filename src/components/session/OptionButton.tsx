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
  label, text, selected, onClick, correct, disabled
}: OptionButtonProps) {
  const isResult = correct !== undefined && correct !== null;

  return (
    <motion.button
      whileHover={!disabled ? { x: 4 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
        !isResult && !selected && 'border-slate-100 bg-white hover:border-brand-300 hover:bg-brand-50/40',
        !isResult && selected && 'border-brand-500 bg-brand-50 shadow-brand-sm',
        isResult && correct  && selected && 'border-green-500 bg-green-50',
        isResult && !correct && selected && 'border-red-400 bg-red-50',
        isResult && correct  && !selected && 'border-green-200 bg-green-50/50',
        disabled && 'cursor-not-allowed'
      )}
    >
      <span className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-all',
        !isResult && !selected && 'bg-slate-100 text-slate-500',
        !isResult && selected  && 'bg-brand-500 text-white',
        isResult && correct  && selected  && 'bg-green-500 text-white',
        isResult && !correct && selected  && 'bg-red-400 text-white',
        isResult && correct  && !selected && 'bg-green-100 text-green-700',
      )}>
        {isResult && correct && selected
          ? <Check className="w-4 h-4" />
          : label
        }
      </span>
      <span className={cn(
        'text-sm font-medium leading-snug flex-1',
        selected && !isResult ? 'text-brand-700' : 'text-slate-700'
      )}>
        {text}
      </span>
    </motion.button>
  );
}

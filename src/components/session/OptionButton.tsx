import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { MathText } from '../common/MathText';

interface OptionButtonProps {
  label: string;
  text: string;
  selected: boolean;
  onClick: () => void;
  correct?: boolean | null;
  disabled?: boolean;
}

export function OptionButton({
  label: _label, text, selected, onClick, correct, disabled
}: OptionButtonProps) {
  const isResult = correct !== undefined && correct !== null;

  const cleanedText = typeof text === 'string' ? text.replace(/^[A-Da-d][.)\ -\s]+\s*/, '').trim() : String(text ?? '');

  const badgeLabel = typeof _label === 'string' && _label.length > 1 ? _label[0] : String(_label ?? '');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center p-4 md:p-5 rounded-2xl border-2 text-left font-bold text-base relative overflow-hidden',
        'transition-[border-color,background-color,box-shadow,color] duration-150',
        !isResult && !selected && 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#0A99AB]/70 hover:bg-[#0A99AB]/5 hover:text-[#0A99AB]',
        !isResult && selected && 'border-[#0A99AB] bg-[#0A99AB]/10 text-slate-900 shadow-[0_0_20px_rgba(10,153,171,0.1)]',
        isResult && correct && selected && 'border-emerald-500 bg-emerald-50 text-emerald-700',
        isResult && !correct && selected && 'border-red-500 bg-red-50 text-red-700',
        isResult && correct && !selected && 'border-emerald-200 bg-emerald-50/50 text-emerald-600',
        isResult && !correct && !selected && 'border-slate-100 bg-slate-50 text-slate-400 opacity-60',
        disabled && 'cursor-not-allowed'
      )}
    >
      {/* Letter indicator bubble */}
      <div className={cn(
        'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm transition-colors duration-150',
        !isResult && !selected && 'bg-slate-200/50 text-slate-500',
        !isResult && selected && 'bg-[#0A99AB] text-white',
        isResult && correct && 'bg-emerald-500 text-white',
        isResult && !correct && selected && 'bg-red-500 text-white',
        isResult && !correct && !selected && 'bg-slate-200/30 text-slate-400'
      )}>
        {badgeLabel}
      </div>

      <span className={cn(
        'ml-3 relative z-10 tracking-tight leading-snug flex-grow text-sm md:text-base',
        selected && !isResult && 'font-extrabold text-slate-900'
      )}>
        <MathText text={cleanedText} />
      </span>

      {/* Result indicators */}
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
    </button>
  );
}

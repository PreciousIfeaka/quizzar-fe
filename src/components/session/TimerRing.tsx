import { motion } from 'framer-motion';
import { useTimer } from '../../hooks/useTimer';
import { cn } from '../../lib/utils';

interface TimerRingProps {
  seconds:  number;
  onExpire: () => void;
  size?:    'sm' | 'lg';
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (h > 0) {
    return `${h}h ${m}m ${sec}s`;
  }
  if (m > 0) {
    return `${m}m ${sec}s`;
  }
  return `${sec}s`;
}

export function TimerRing({ seconds, onExpire, size = 'lg' }: TimerRingProps) {
  const { seconds: remaining, percentage, isUrgent } = useTimer(seconds, onExpire);

  // For sm ring, widen slightly when showing Mm Ss so the text doesn't overflow
  const hasMinutes = remaining >= 60;
  const hasHours   = remaining >= 3600;
  const lgDim = hasHours ? 112 : hasMinutes ? 96 : 80;
  const smDim = hasHours ? 72  : hasMinutes ? 60 : 48;
  const dim   = size === 'lg' ? lgDim : smDim;
  const stroke = size === 'lg' ? 5 : 3;
  const r = (dim - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100"
        />
        {/* Progress ring */}
        <motion.circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-all duration-1000',
            isUrgent ? 'stroke-red-500' : 'stroke-[#0A99AB]'
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          'font-black tabular-nums text-center leading-none',
          size === 'lg'
            ? (hasHours ? 'text-[11px]' : hasMinutes ? 'text-sm' : 'text-xl') + ' text-slate-800'
            : (hasHours ? 'text-[8px]'  : hasMinutes ? 'text-[9px]' : 'text-[11px]') + ' text-slate-700',
          isUrgent && 'text-red-500 animate-pulse',
        )}>
          {formatTime(remaining)}
        </span>
      </div>
    </div>
  );
}

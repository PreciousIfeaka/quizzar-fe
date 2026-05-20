import { motion } from 'framer-motion';
import { useTimer } from '../../hooks/useTimer';
import { cn } from '../../lib/utils';

interface TimerRingProps {
  seconds:  number;
  onExpire: () => void;
  size?:    'sm' | 'lg';
  key?:     number;
}

export function TimerRing({ seconds, onExpire, size = 'lg' }: TimerRingProps) {
  const { seconds: remaining, percentage, isUrgent } = useTimer(seconds, onExpire);

  const dim = size === 'lg' ? 100 : 52;
  const stroke = size === 'lg' ? 6 : 4;
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
            isUrgent ? 'stroke-red-500' : 'stroke-brand-500'
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          'font-black tabular-nums',
          size === 'lg' ? 'text-2xl' : 'text-sm',
          isUrgent ? 'text-red-500' : 'text-slate-800',
          isUrgent && 'animate-pulse'
        )}>
          {remaining}
        </span>
      </div>
    </div>
  );
}

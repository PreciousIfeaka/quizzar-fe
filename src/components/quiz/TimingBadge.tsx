import { Clock, Timer, Ban, Zap } from 'lucide-react';
import type { TimingMode } from '../../types/quiz.types';
import { formatSeconds } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface TimingBadgeProps {
  timingMode: TimingMode;
  timerSeconds?: number;
}

const config: Record<TimingMode, {
  label: string; icon: typeof Clock; color: string
}> = {
  NONE: { label: 'No Timer', icon: Ban, color: 'bg-slate-100 text-slate-600' },
  PER_QUESTION: { label: 'Per Question', icon: Timer, color: 'bg-blue-100 text-blue-700' },
  OVERALL: { label: 'Overall Timer', icon: Clock, color: 'bg-[#ff9100]/10 text-[#ff9100]' },
  AI_SUGGESTED: { label: 'AI Suggested', icon: Zap, color: 'bg-[#00bcd4]/10 text-[#00bcd4]' },
};

export function TimingBadge({ timingMode, timerSeconds }: TimingBadgeProps) {
  const badgeConfig = config[timingMode] || config.NONE;
  const { label, icon: Icon, color } = badgeConfig;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl',
      color
    )}>
      <Icon className="w-3.5 h-3.5" />
      {label}
      {timerSeconds && timingMode !== 'NONE' && (
        <span className="opacity-70">· {formatSeconds(timerSeconds)}</span>
      )}
    </span>
  );
}

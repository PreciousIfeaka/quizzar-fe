import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { QuizAnalytics } from '../../types/analytics.types';
import { cn } from '../../lib/utils';

interface AnalyticsSummaryProps {
  analytics: QuizAnalytics;
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  const { averageScore, highestScore, lowestScore, passRate, completedAttempts } = analytics;

  const scoreDelta = highestScore - lowestScore;
  const volatility = scoreDelta > 40 ? 'high' : scoreDelta > 20 ? 'medium' : 'low';

  const volatilityConfig = {
    high: { label: 'High variance', icon: TrendingUp, color: 'text-red-500' },
    medium: { label: 'Medium variance', icon: Minus, color: 'text-yellow-500' },
    low: { label: 'Low variance', icon: TrendingDown, color: 'text-green-600' },
  };

  const { label: varLabel, icon: VarIcon, color: varColor } = volatilityConfig[volatility];

  if (completedAttempts === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 text-center">
        <p className="text-muted-foreground text-sm">
          No completed attempts yet. Share the quiz link with your students to start collecting results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
      <h3 className="text-sm font-bold text-slate-700 mb-4">Performance Summary</h3>

      {/* Score range bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Lowest: {Math.round(lowestScore)}%</span>
          <span>Avg: {Math.round(averageScore)}%</span>
          <span>Highest: {Math.round(highestScore)}%</span>
        </div>
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          {/* Range fill */}
          <motion.div
            className="absolute h-full bg-gradient-to-r from-red-300 via-yellow-300 to-green-400 rounded-full"
            initial={{ left: '0%', right: '100%' }}
            animate={{
              left: `${lowestScore}%`,
              right: `${100 - highestScore}%`,
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Average marker */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-800"
            initial={{ left: '50%' }}
            animate={{ left: `${averageScore}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full',
          passRate >= 70 ? 'bg-green-100 text-green-700' :
            passRate >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
        )}>
          {Math.round(passRate)}% pass rate
        </span>
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600', varColor)}>
          <VarIcon className="w-3.5 h-3.5" />
          {varLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-50 text-brand-700">
          {completedAttempts} completed
        </span>
      </div>
    </div>
  );
}

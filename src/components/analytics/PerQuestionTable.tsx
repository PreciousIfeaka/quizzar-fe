import { motion } from 'framer-motion';
import type { PerQuestionStat } from '../../types/analytics.types';
import { formatSeconds } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { MathText } from '../common/MathText';

interface PerQuestionTableProps {
  stats: PerQuestionStat[];
}

export function PerQuestionTable({ stats }: PerQuestionTableProps) {
  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-8 text-center text-sm text-muted-foreground">
        No answers recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Question</div>
        <div className="col-span-2 text-center">Correct</div>
        <div className="col-span-2 text-center">Incorrect</div>
        <div className="col-span-2 text-center">Avg Time</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {stats.map((stat, i) => {
          const total = stat.totalAnswers;
          const correctPct = total > 0 ? (stat.correctAnswers / total) * 100 : 0;

          return (
            <motion.div
              key={stat.questionId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors"
            >
              {/* Index */}
              <div className="col-span-1">
                <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-xs font-black text-brand-600">
                  {i + 1}
                </span>
              </div>

              {/* Question text */}
              <div className="col-span-5">
                <div className="text-sm text-slate-700 line-clamp-2 leading-snug">
                  <MathText text={stat.questionText} />
                </div>
                {/* Mini bar */}
                <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      correctPct >= 70 ? 'bg-green-500' :
                        correctPct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${correctPct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
              </div>

              {/* Correct */}
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-green-600">{stat.correctAnswers}</span>
                {total > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({Math.round(correctPct)}%)
                  </span>
                )}
              </div>

              {/* Incorrect */}
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-red-500">{stat.incorrectAnswers}</span>
              </div>

              {/* Avg time */}
              <div className="col-span-2 text-center">
                <span className="text-sm text-slate-600">
                  {stat.averageTimeTakenSeconds
                    ? formatSeconds(Math.round(stat.averageTimeTakenSeconds))
                    : '—'
                  }
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

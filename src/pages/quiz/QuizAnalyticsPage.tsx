import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { analyticsApi } from '../../api/analytics.api';
import { AnimatedPage } from '../../components/common/AnimatedPage';
import { AnalyticsSummary } from '../../components/analytics/AnalyticsSummary';
import { ScoreDistributionChart } from '../../components/analytics/ScoreDistributionChart';
import { PerQuestionTable } from '../../components/analytics/PerQuestionTable';
import { StudentResultRow } from '../../components/analytics/StudentResultRow';
import { SessionResultDialog } from '../../components/analytics/SessionResultDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fadeUp } from '../../lib/motion';
import { Users, TrendingUp, Trophy, Clock } from 'lucide-react';
import { formatSeconds } from '../../lib/utils';

export default function QuizAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => analyticsApi.getQuizAnalytics(id!),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-slate-800">Failed to load analytics</h2>
      <p className="text-muted-foreground mt-2">Please try again later.</p>
    </div>
  );

  if (!data) return null;

  return (
    <AnimatedPage>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{data.quizTitle}</h1>
        <p className="text-muted-foreground mt-1">Analytics & Results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <AnalyticsSummary analytics={data} />
        </div>
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 h-full flex flex-col justify-center">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total', value: data.totalAttempts, icon: Users, color: 'brand' as const },
                { label: 'Score', value: `${Math.round(data.averageScore)}%`, icon: TrendingUp, color: 'accent' as const },
                { label: 'Pass', value: `${Math.round(data.passRate)}%`, icon: Trophy, color: 'success' as const },
                { label: 'Time', value: data.averageTimeTakenSeconds ? formatSeconds(data.averageTimeTakenSeconds) : '—', icon: Clock, color: 'energy' as const },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{s.label}</p>
                  <p className="text-xl font-black text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score distribution */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Score Distribution</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <ScoreDistributionChart data={data.scoreDistribution} />
        </div>
      </motion.div>

      {/* Per-question stats */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Question Breakdown</h2>
        <PerQuestionTable stats={data.perQuestionStats} />
      </motion.div>

      {/* Student results */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Student Results
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({data.studentResults?.length || 0} attempt{data.studentResults?.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="divide-y divide-slate-50">
            {(!data.studentResults || data.studentResults.length === 0) ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No attempts yet</p>
            ) : (
              data.studentResults.map((result, i) => (
                <motion.div
                  key={result.sessionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <StudentResultRow
                    result={result}
                    onViewDetails={(id) => setSelectedSessionId(id)}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <SessionResultDialog
        sessionId={selectedSessionId}
        onOpenChange={(open) => !open && setSelectedSessionId(null)}
      />
    </AnimatedPage>
  );
}

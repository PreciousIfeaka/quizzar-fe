import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { analyticsApi } from '../../api/analytics.api';
import { AnimatedPage } from '../../components/common/AnimatedPage';
import { SessionResultDialog } from '../../components/analytics/SessionResultDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fadeUp, staggerContainer } from '../../lib/motion';
import {
  TrendingUp,
  ChevronRight,
  Search,
} from 'lucide-react';
import { formatSeconds } from '../../lib/utils';

export default function QuizAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  if (error || !data) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-slate-800">Failed to load analytics</h2>
      <p className="text-muted-foreground mt-2">Please try again later.</p>
    </div>
  );

  // Filter student results client-side
  const studentResults = data.studentResults ?? [];
  const filteredResults = studentResults.filter(r =>
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedPage>
      {/* Breadcrumbs & Page Header */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
          <button onClick={() => navigate('/quizzes')} className="hover:text-primary transition-colors">
            My Quizzes
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary truncate max-w-xs">{data.quizTitle}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline-lg text-3xl font-black text-slate-900 mb-2">
              Quiz Analytics
            </h1>
            <p className="font-body-lg text-slate-500 max-w-2xl">
              A comprehensive breakdown of student engagement and performance for "{data.quizTitle}".
            </p>
          </div>
        </div>
      </div>

      {/* General Stats (Bento Style) */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {/* Pass Rate */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-8 rounded-3xl custom-shadow border border-slate-100 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Average Pass Rate
            </span>
            <h3 className="font-headline-display text-5xl font-black text-primary mt-2">
              {Math.round(data.passRate)}<span className="text-2xl">%</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mt-6">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% from last quiz</span>
          </div>
        </motion.div>

        {/* High Score */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-8 rounded-3xl custom-shadow border border-slate-100 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffdcc3]/40 rounded-bl-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              High Score
            </span>
            <h3 className="font-headline-display text-5xl font-black text-slate-800 mt-2">
              {Math.round(data.highestScore)}<span className="text-2xl">%</span>
            </h3>
          </div>
          <p className="text-slate-500 font-medium text-xs mt-6">
            Achieved by top-performing attempts
          </p>
        </motion.div>

        {/* Avg Completion Time */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-8 rounded-3xl custom-shadow border border-slate-100 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full transition-all group-hover:scale-110 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Avg. Completion Time
            </span>
            <h3 className="font-headline-display text-5xl font-black text-secondary mt-2">
              {data.averageTimeTakenSeconds ? Math.round(data.averageTimeTakenSeconds / 60) : 0}
              <span className="text-2xl font-medium text-slate-400 ml-1">m</span>
            </h3>
          </div>
          <p className="text-slate-500 font-medium text-xs mt-6">
            Recommended: ~15 mins
          </p>
        </motion.div>
      </motion.section>

      {/* Per-Question Performance Chart */}
      <section className="bg-white p-8 md:p-12 rounded-3xl custom-shadow border border-slate-100 mb-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-headline-md text-xl font-bold text-slate-800">
            Per-Question Performance
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0A99AB]" />
              <span className="text-xs font-bold text-slate-500">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs font-bold text-slate-500">Incorrect</span>
            </div>
          </div>
        </div>

        {/* Custom Bar Chart UI */}
        <div className="space-y-8">
          {data.perQuestionStats?.map((stat, i) => {
            const total = stat.totalAnswers || 1;
            const successPct = Math.round((stat.correctAnswers / total) * 100);

            return (
              <div key={stat.questionId} className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3 md:gap-6">
                <span className="font-bold text-sm text-slate-700 truncate" title={stat.questionText}>
                  Q{i + 1}: {stat.questionText}
                </span>
                <div className="h-12 bg-muted rounded-full relative overflow-hidden flex border border-slate-200/40">
                  {successPct > 0 && (
                    <div
                      className="bg-[#0A99AB] h-full transition-all duration-1000 ease-out"
                      style={{ width: `${successPct}%` }}
                    />
                  )}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-100">
                    {successPct}% SUCCESS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student Results List */}
      <section className="bg-white rounded-3xl custom-shadow border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-headline-md text-xl font-bold text-slate-800">
            Student Results
          </h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="w-full pl-12 pr-4 py-2.5 rounded-full border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none text-slate-700"
              placeholder="Search student name..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No student attempts match your criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="p-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                    Score
                  </th>
                  <th className="p-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                    Time
                  </th>
                  <th className="p-6 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((result) => {
                  const pct = Math.round(result.percentageScore);
                  const passed = pct >= 50;
                  const initials = result.studentName
                    .split(' ')
                    .map((n) => n.charAt(0))
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={result.sessionId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                            {initials || 'S'}
                          </div>
                          <span className="font-bold text-slate-800">{result.studentName}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {passed ? 'COMPLETED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0A99AB]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{pct}%</span>
                        </div>
                      </td>
                      <td className="p-6 text-slate-500">
                        {result.timeTakenSeconds ? formatSeconds(result.timeTakenSeconds) : '—'}
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => setSelectedSessionId(result.sessionId)}
                          className="text-primary hover:underline font-bold text-sm"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <SessionResultDialog
        sessionId={selectedSessionId}
        onOpenChange={(open) => !open && setSelectedSessionId(null)}
      />
    </AnimatedPage>
  );
}

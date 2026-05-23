import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { quizApi } from '@/api/quiz.api';
import { analyticsApi } from '@/api/analytics.api';
import { AnimatedPage } from '@/components/common/AnimatedPage';
import { StatCard } from '@/components/common/StatCard';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizCardSkeleton } from '@/components/quiz/QuizCardSkeleton';
import { staggerContainer, fadeUp } from '@/lib/motion';

export default function DashboardPage() {
  const { teacher } = useAuthStore();
  const navigate = useNavigate();

  const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
    queryKey: ['quizzes', 0, 4],
    queryFn: () => quizApi.getAll(0, 4),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
  });

  const firstName = teacher?.name?.split(' ')[0] ?? 'Teacher';

  return (
    <AnimatedPage>
      {/* Welcome Banner */}
      <div className="relative bg-[#0b192c] rounded-3xl p-8 mb-8 overflow-hidden shadow-md">
        {/* Subtle grid pattern of VoyageMath */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="banner-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#banner-grid)" />
          </svg>
        </div>
        {/* Overlapping concentric circles */}
        <div className="absolute right-[-5%] top-[-20%] w-96 h-96 opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none" strokeWidth="1">
            <circle cx="50" cy="50" r="40" />
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="20" />
          </svg>
        </div>
 
        <div className="relative z-10 max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-200 text-xs font-bold uppercase tracking-widest mb-1.5"
          >
            Welcome back
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight"
          >
            Good to see you, {firstName}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand-100 text-sm mb-6 max-w-md font-medium leading-relaxed"
          >
            Create interactive quizzes, track student attempts, and analyze real-time performance dashboard metrics.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button
              onClick={() => navigate('/generate')}
              className="inline-flex items-center gap-2 bg-white text-[#0b192c] hover:bg-brand-50 transition-all duration-200 font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#00bcd4]" />
              CREATE NEW QUIZ ↗
            </button>
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            label="Total Quizzes"
            value={summaryData?.totalQuizzes ?? quizzesData?.totalElements ?? 0}
            icon={BookOpen}
            color="brand"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Total Attempts"
            value={summaryData?.totalAttempts ?? 0}
            icon={Users}
            color="accent"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Avg Score"
            value={summaryData ? `${Math.round(summaryData.averageScore)}%` : '—'}
            icon={TrendingUp}
            color="success"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="This Month"
            value={summaryData?.activeQuizzesThisMonth ?? 0}
            icon={Sparkles}
            color="energy"
          />
        </motion.div>
      </motion.div>

      {/* Recent Quizzes */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">Overview</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">Recent Quizzes</h2>
        </div>
        <button
          onClick={() => navigate('/quizzes')}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 hover:bg-brand-100 transition-all duration-200"
        >
          View all ↗
        </button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {quizzesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} variants={fadeUp}>
              <QuizCardSkeleton />
            </motion.div>
          ))
          : quizzesData?.content.map(quiz => (
            <motion.div key={quiz.id} variants={fadeUp}>
              <QuizCard quiz={quiz} />
            </motion.div>
          ))
        }
      </motion.div>
    </AnimatedPage>
  );
}

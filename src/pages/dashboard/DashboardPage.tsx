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
import { BrandButton } from '@/components/common/BrandButton';
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
      <div className="relative bg-gradient-brand rounded-3xl p-8 mb-8 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
          {/* decorative SVG pattern */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="150" cy="50" r="80" fill="white" />
            <circle cx="50" cy="150" r="60" fill="white" />
          </svg>
        </div>
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-100 text-sm font-medium mb-1"
          >
            Welcome back
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-black text-white mb-4"
          >
            Good to see you, {firstName}! 👋
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <BrandButton
              onClick={() => navigate('/generate')}
              className="bg-white text-brand-600 hover:bg-brand-50"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Create New Quiz
            </BrandButton>
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
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
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800">Recent Quizzes</h2>
        <button
          onClick={() => navigate('/quizzes')}
          className="text-sm text-brand-600 font-semibold hover:text-brand-700"
        >
          View all →
        </button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
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

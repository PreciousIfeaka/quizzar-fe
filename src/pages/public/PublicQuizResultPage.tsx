import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../../api/session.api';
import type { QuizResult } from '@/types/session.types';
import { ResultDetails } from '../../components/session/ResultDetails';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { staggerContainer, fadeUp } from '../../lib/motion';
import { cn, getScoreBg } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

export default function PublicQuizResultPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  // Attempt to get result from state first
  const stateResult: QuizResult | undefined = state?.result;

  // Query as fallback (e.g. on page refresh)
  const { data: fetchedResult, isLoading } = useQuery({
    queryKey: ['quiz-result', quizCode, stateResult?.sessionId],
    queryFn: () => sessionApi.getSessionResults(quizCode!, stateResult?.sessionId || state?.sessionId),
    enabled: !!quizCode && (!!stateResult?.sessionId || !!state?.sessionId) && !stateResult,
  });

  const result = stateResult || fetchedResult;

  useEffect(() => {
    if (!result && !isLoading && !state?.sessionId) {
       navigate(`/quiz/${quizCode}`, { replace: true });
       return;
    }
    if (result?.passed && !showConfetti) {
      confetti({
        particleCount: 120, spread: 80, origin: { y: 0.6 },
        colors: ['#00e5ff', '#00bcd4', '#ff9100', '#0b192c']
      });
      setShowConfetti(true);
    }
  }, [result, isLoading]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!result) return null;

  const pct = Math.round(result.percentageScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7fc] via-[#f4f7fc] to-[#00bcd4]/10 flex items-center justify-center px-4 py-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={cn('w-full', result.details ? 'max-w-2xl' : 'max-w-md')}
      >
        {/* Score card */}
        <motion.div
          variants={fadeUp}
          className={cn(
            'bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden mb-4 mx-auto',
            result.details ? 'max-w-md' : 'w-full'
          )}
        >
          <div className={cn('h-2', result.passed ? 'bg-gradient-success' : 'bg-gradient-energy')} />
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className={cn(
                'w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg',
                result.passed ? 'bg-gradient-success' : 'bg-gradient-energy'
              )}
            >
              {result.passed
                ? <Trophy className="w-11 h-11 text-white" />
                : <XCircle className="w-11 h-11 text-white" />
              }
            </motion.div>

            <h1 className="text-2xl font-black text-slate-900 mb-1">
              {result.passed ? 'Great job!' : 'Keep practicing!'}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">{result.studentName}</p>

            {/* Score donut — simplified */}
            <div className="relative inline-flex items-center justify-center w-36 h-36 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <motion.circle
                  cx="70" cy="70" r="58"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 * (1 - pct / 100) }}
                  transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={result.passed ? 'stroke-green-500' : 'stroke-orange-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-4xl font-black text-slate-900"
                >
                  {pct}%
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  {result.totalScore}/{result.maxScore} pts
                </span>
              </div>
            </div>

            <div className={cn('inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full', getScoreBg(pct))}>
              {result.passed
                ? <CheckCircle2 className="w-4 h-4" />
                : <XCircle className="w-4 h-4" />
              }
              {result.passed ? 'Passed' : 'Not passed'}
            </div>
          </div>
        </motion.div>

        {/* Detailed Breakdown */}
        {result.details && result.details.length > 0 && (
          <motion.div variants={fadeUp}>
            <ResultDetails details={result.details} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

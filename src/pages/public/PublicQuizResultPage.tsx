import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../../api/session.api';
import type { QuizResult } from '@/types/session.types';
import { ResultDetails } from '../../components/session/ResultDetails';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';
import { BrandButton } from '../../components/common/BrandButton';
import { staggerContainer, fadeUp } from '../../lib/motion';
import { cn } from '../../lib/utils';
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
        colors: ['#0A99AB', '#00e5ff', '#ff9100', '#0b192c']
      });
      setShowConfetti(true);
    }
  }, [result, isLoading]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!result) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7fc] via-[#f4f7fc] to-[#0A99AB]/5 flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
      <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow text-center space-y-6 max-w-md w-full mx-4 z-10">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
            Failed to Load Results
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We couldn't retrieve your quiz results. This might be due to a temporary network issue.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to={`/quiz/${quizCode}`}
            className="w-full primary-gradient text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0A99AB]/15 hover:scale-[1.01] active:scale-95 transition-all text-xs"
          >
            Back to Quiz Landing
          </Link>
        </div>
      </div>
    </div>
  );

  const pct = Math.round(result.percentageScore);

  // Calculate total time taken from details
  const totalTimeTaken = result.details?.reduce((acc: number, curr: any) => acc + (curr.timeTakenSeconds || 0), 0) || 0;
  
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return mins > 0 ? `${mins}m ${remainingSecs}s` : `${remainingSecs}s`;
  };

  const handleRetake = () => {
    navigate(`/quiz/${quizCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7fc] via-[#f4f7fc] to-[#0A99AB]/5 text-slate-800 relative overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Grid Pattern Background Layer */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

      {/* Header */}
      <header className="p-6 max-w-4xl mx-auto w-full z-10">
        <QuizzarLogo noLink />
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 pb-20 max-w-4xl mx-auto w-full z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full space-y-8"
        >
          {/* Unified Score Card (elevated, wider, reduced vertical spacing) */}
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100/80 custom-shadow overflow-hidden w-full"
          >
            <div className={cn('h-2', result.passed ? 'bg-gradient-success' : 'bg-gradient-energy')} />
            <div className="p-5 md:p-8 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8">
              
              {/* Score donut — simplified & rescaled */}
              <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 md:pr-8 min-w-[150px]">
                <div className="relative inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="58" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <motion.circle
                      cx="70" cy="70" r="58"
                      fill="none"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={364.4}
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 * (1 - pct / 100) }}
                      transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={result.passed ? 'stroke-[#0A99AB]' : 'stroke-red-500'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-3xl font-black text-slate-900"
                    >
                      {pct}%
                    </motion.span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Final Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats & Actions right column */}
              <div className="flex-1 flex flex-col justify-between text-center md:text-left py-1 w-full">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 mb-1">
                    {result.passed ? `Great job, ${result.studentName}!` : `Keep practicing, ${result.studentName}!`}
                  </h1>
                  <p className="text-slate-500 text-sm mb-4">
                    You've completed the quiz. Let's see how you performed.
                  </p>
                </div>

                {/* Horizontal Stats Row */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-3 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100 w-full sm:w-auto">
                    <span className="text-[#0A99AB] bg-[#0A99AB]/10 p-1.5 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div className="text-left">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Time Taken</div>
                      <div className="text-sm font-black text-slate-800">{formatTime(totalTimeTaken)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100 w-full sm:w-auto">
                    <span className="text-[#0A99AB] bg-[#0A99AB]/10 p-1.5 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <div className="text-left">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Correct</div>
                      <div className="text-sm font-black text-slate-800">{result.totalScore} / {result.maxScore}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sm:ml-auto w-full sm:w-auto">
                    <BrandButton
                      onClick={handleRetake}
                      className="primary-gradient text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </BrandButton>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Detailed Breakdown */}
          {result.details && result.details.length > 0 && (
            <motion.div variants={fadeUp}>
              <ResultDetails details={result.details} quiz={result} />
            </motion.div>
          )}
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 md:py-8 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-3 px-6 md:px-12 mt-8 md:mt-12 text-slate-400 text-xs">
        <QuizzarLogo size="sm" noLink />
        <div className="flex gap-4 md:gap-6">
          <Link to="/privacy" className="hover:text-primary transition-colors font-semibold">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors font-semibold">Terms of Service</Link>
          <a href="#" className="hover:text-primary transition-colors font-semibold">Help Center</a>
        </div>
        <div className="font-semibold">© 2026 Quizzar AI Education</div>
      </footer>
    </div>
  );
}

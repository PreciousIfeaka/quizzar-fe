import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, X } from 'lucide-react';
import { useQuizStore } from '../../store/quizStore';
import { sessionApi } from '../../api/session.api';
import { QuestionCard } from '../../components/session/QuestionCard';
import { TimerRing } from '../../components/session/TimerRing';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { AnswerSubmission, SubmitAnswerRequest, QuestionResultResponse } from '../../types/session.types';
import { MathText } from '../../components/common/MathText';

export default function PublicQuizSessionPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const { quiz, session, currentIndex, answers, recordAnswer, nextQuestion } =
    useQuizStore();
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<QuestionResultResponse | null>(null);
  const questionStartTime = useRef(Date.now());
  const submittingRef = useRef(false);

  // Guard: redirect if no active session
  useEffect(() => {
    if (!quiz || !session) navigate(`/quiz/${quizCode}`, { replace: true });
  }, []);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => {
      return sessionApi.submitAnswers(quizCode!, session!.sessionId, { answers });
    },
    onMutate: () => {
      setIsSubmitting(true);
      submittingRef.current = true;
      setSubmitError(null);
    },
    onSuccess: (result) => {
      navigate(`/quiz/${quizCode}/result`, {
        state: {
          result,
          sessionId: session!.sessionId
        }
      });
    },
    onError: (err: any) => {
      const apiMsg = err.response?.data?.message || 'Failed to submit quiz results';
      setSubmitError(apiMsg);
      submittingRef.current = false;
    },
  });

  const submitSingleAnswerMutation = useMutation({
    mutationFn: (data: SubmitAnswerRequest) => {
      return sessionApi.submitSingleAnswer(quizCode!, session!.sessionId, data);
    },
    onSuccess: (result) => {
      setFeedback(result);
      setIsSubmitting(false);
      submittingRef.current = false;
    },
    onError: () => {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => {
      return sessionApi.completeSession(quizCode!, session!.sessionId);
    },
    onMutate: () => {
      setIsSubmitting(true);
      submittingRef.current = true;
      setSubmitError(null);
    },
    onSuccess: (result) => {
      navigate(`/quiz/${quizCode}/result`, {
        state: {
          result,
          sessionId: session!.sessionId
        }
      });
    },
    onError: (err: any) => {
      const apiMsg = err.response?.data?.message || 'Failed to complete quiz session';
      setSubmitError(apiMsg);
      submittingRef.current = false;
    }
  });

  if (!quiz || !session) return null;

  const isPerQuestion = quiz.quizMode === 'PER_QUESTION';

  if (isSubmitting && !submitError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow text-center space-y-6 max-w-md w-full mx-4 z-10">
          <div className="flex justify-center text-[#0A99AB]">
            <LoadingSpinner size="lg" />
          </div>
          <div>
            <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
              Processing Results...
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              We are grading your answers and preparing your scorecard. Please do not close or refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow text-center space-y-6 max-w-md w-full mx-4 z-10">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <X className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
              Submission Failed
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              An error occurred while processing your submission:
            </p>
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs font-semibold text-red-650 mb-4 break-words">
              {submitError}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setSubmitError(null);
                setIsSubmitting(true);
                submittingRef.current = true;
                if (isPerQuestion) {
                  completeMutation.mutate();
                } else {
                  submitMutation.mutate();
                }
              }}
              className="w-full primary-gradient text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0A99AB]/15 hover:scale-[1.01] active:scale-95 transition-all text-xs"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setSubmitError(null);
                setIsSubmitting(false);
                submittingRef.current = false;
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs"
            >
              Back to Last Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentIndex];
  const isLast = currentIndex === (quiz.questions?.length || 0) - 1;

  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex + 1) / (quiz.questions?.length || 1)) * 100;

  if (!currentQuestion) return null;

  const handleAnswer = (answer: Partial<AnswerSubmission>) => {
    if (quiz.quizMode === 'PER_QUESTION' && feedback) return;
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
    recordAnswer({ questionId: currentQuestion.id, timeTakenSeconds: timeTaken, ...answer });
  };

  const hasAnswered = !!(currentAnswer?.selectedOptionId || currentAnswer?.answerText?.trim());

  const handleSubmitAnswer = () => {
    if (submitSingleAnswerMutation.isPending || feedback || isSubmitting || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
    recordAnswer({
      questionId: currentQuestion.id,
      selectedOptionId: currentAnswer?.selectedOptionId,
      answerText: currentAnswer?.answerText,
      timeTakenSeconds: timeTaken
    });

    submitSingleAnswerMutation.mutate({
      questionId: currentQuestion.id,
      selectedOptionId: currentAnswer?.selectedOptionId,
      answerText: currentAnswer?.answerText,
      timeTakenSeconds: timeTaken
    });
  };

  const handleNext = () => {
    if (isPerQuestion) {
      if (!feedback) {
        handleSubmitAnswer();
      } else {
        if (isLast) {
          setIsSubmitting(true);
          submittingRef.current = true;
          completeMutation.mutate();
        } else {
          setDirection(1);
          setFeedback(null);
          submittingRef.current = false;
          nextQuestion();
          questionStartTime.current = Date.now();
        }
      }
    } else {
      if (submitMutation.isPending || isSubmitting || submittingRef.current) return;
      setDirection(1);
      if (isLast) {
        setIsSubmitting(true);
        submittingRef.current = true;
        submitMutation.mutate();
      } else {
        nextQuestion();
        questionStartTime.current = Date.now();
      }
    }
  };

  const timerMode = session.timingMode;
  const timerSeconds = session.timerValueSeconds;

  // Auto-submit if user reconnected/refocused and time has already run out
  useEffect(() => {
    const handleReconnected = () => {
      if (
        isPerQuestion &&
        timerMode === 'PER_QUESTION' &&
        timerSeconds &&
        !feedback &&
        !submittingRef.current &&
        navigator.onLine
      ) {
        const elapsedTime = (Date.now() - questionStartTime.current) / 1000;
        if (elapsedTime >= timerSeconds) {
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener('online', handleReconnected);
    window.addEventListener('focus', handleReconnected);
    
    // Check immediately on mount/update
    handleReconnected();

    // Periodically check every second to recover from offline/throttled states
    const interval = setInterval(handleReconnected, 1000);

    return () => {
      window.removeEventListener('online', handleReconnected);
      window.removeEventListener('focus', handleReconnected);
      clearInterval(interval);
    };
  }, [isPerQuestion, timerMode, timerSeconds, feedback]);

  const getModeLabel = () => {
    if (isPerQuestion) return 'INSTANT FEEDBACK';
    if (timerMode === 'OVERALL') return 'TIMED MODE';
    if (timerMode === 'PER_QUESTION') return 'PER-QUESTION TIMER';
    return 'PRACTICE MODE';
  };

  const getButtonText = () => {
    if (isPerQuestion) {
      if (!feedback) {
        return submitSingleAnswerMutation.isPending || isSubmitting ? 'Submitting...' : 'Submit Answer';
      }
      return isLast ? 'View Results' : 'Next Question';
    }
    if (isLast) {
      return submitMutation.isPending || isSubmitting ? 'Submitting...' : 'Submit Quiz';
    }
    return 'Next Question';
  };

  const isButtonLoading =
    submitMutation.isPending ||
    submitSingleAnswerMutation.isPending ||
    completeMutation.isPending ||
    isSubmitting;

  const isSubmitDisabled =
    isButtonLoading ||
    (!feedback && !hasAnswered);

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      navigate(`/quiz/${quizCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 text-slate-800 selection:bg-[#0A99AB]/20 relative overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0A99AB]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#0A99AB]/5 blur-[150px] pointer-events-none" />

      {/* Top Navigation — Transactional Layout */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 md:h-20 flex items-center">
        <div className="w-full px-4 md:px-6 max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <QuizzarLogo noLink />
            <div className="h-8 w-px bg-slate-200 hidden md:block" />
            <div className="hidden md:flex flex-col min-w-0">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-widest leading-tight truncate max-w-[200px]">{quiz.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            {/* Question progress */}
            <div className="flex flex-col items-end">
              <span className="font-bold text-[10px] md:text-xs text-[#0A99AB] uppercase tracking-wider">
                Q {currentIndex + 1}/{quiz.questions?.length || 0}
              </span>
              <div className="w-20 sm:w-28 md:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-[#0A99AB] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            {/* Circular Timer in header (Overall timer) */}
            {timerMode === 'OVERALL' && timerSeconds && (
              <TimerRing
                seconds={timerSeconds}
                onExpire={() => !submitMutation.isPending && submitMutation.mutate()}
                size="sm"
              />
            )}
            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow container max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 lg:py-14 flex flex-col relative z-10">

        {/* Step Narrative Header — question number + mode label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#0A99AB] text-white flex items-center justify-center font-black text-sm shadow-[0_4px_14px_rgba(10,153,171,0.35)]">
            {currentIndex + 1}
          </div>
          <span className="font-bold text-[10px] text-[#0A99AB] bg-[#0A99AB]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#0A99AB]/10">
            {getModeLabel()}
          </span>
        </div>

        {/* Animated Question Area */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={{
              hidden: (d: number) => ({ opacity: 0, x: d * 40 }),
              visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
              exit: (d: number) => ({ opacity: 0, x: d * -30, transition: { duration: 0.12 } }),
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            {/* Large Question Text — prominent h1 matching Stitch design */}
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-extrabold text-slate-900 leading-snug tracking-tight">
              <MathText text={currentQuestion.questionText} />
            </div>

            {/* Per-question circular timer (centered below question text) */}
            {timerMode === 'PER_QUESTION' && timerSeconds && !feedback && (
              <div className="flex justify-center">
                <TimerRing
                  seconds={timerSeconds}
                  onExpire={isPerQuestion ? handleSubmitAnswer : handleNext}
                  size="lg"
                  key={currentIndex}
                />
              </div>
            )}

            {/* QuestionCard (options + feedback, no question text) */}
            <QuestionCard
              question={currentQuestion}
              selectedOptionId={currentAnswer?.selectedOptionId}
              answerText={currentAnswer?.answerText}
              onSelectOption={(id) => handleAnswer({ selectedOptionId: id })}
              onAnswerText={(text) => handleAnswer({ answerText: text })}
              disabled={isPerQuestion ? !!feedback : false}
              feedback={feedback}
              hideQuestionText
            />
          </motion.div>
        </AnimatePresence>

        {/* Submit / Next Button — centered, full-width, prominent (matches Stitch) */}
        <div className="flex justify-center mt-10 pb-4">
          <motion.button
            whileHover={{ scale: isSubmitDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitDisabled ? 1 : 0.97 }}
            onClick={handleNext}
            disabled={isSubmitDisabled}
            className="primary-gradient w-full max-w-lg flex items-center justify-center gap-3 text-white rounded-2xl px-12 py-5 font-black text-sm uppercase tracking-wide shadow-[0_20px_60px_rgba(10,153,171,0.22)] hover:shadow-[0_24px_70px_rgba(10,153,171,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span>{getButtonText()}</span>
            {!isSubmitDisabled && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </motion.button>
        </div>
      </main>
    </div>
  );
}

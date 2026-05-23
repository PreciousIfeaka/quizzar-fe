import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { useQuizStore } from '../../store/quizStore';
import { sessionApi } from '../../api/session.api';
import { QuestionCard } from '../../components/session/QuestionCard';
import { TimerRing } from '../../components/session/TimerRing';
import { BrandButton } from '../../components/common/BrandButton';
import { ProgressBar } from '../../components/session/ProgressBar';
import type { AnswerSubmission, SubmitAnswerRequest, QuestionResultResponse } from '../../types/session.types';

export default function PublicQuizSessionPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const { quiz, session, studentName, currentIndex, answers, recordAnswer, nextQuestion } =
    useQuizStore();
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<QuestionResultResponse | null>(null);
  const questionStartTime = useRef(Date.now());

  // Guard: redirect if no active session
  useEffect(() => {
    if (!quiz || !session) navigate(`/quiz/${quizCode}`, { replace: true });
  }, []);

  const submitMutation = useMutation({
    mutationFn: () => {
      return sessionApi.submitAnswers(quizCode!, session!.sessionId, { answers });
    },
    onSuccess: (result) => {
      navigate(`/quiz/${quizCode}/result`, { 
        state: { 
          result,
          sessionId: session!.sessionId 
        } 
      });
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const submitSingleAnswerMutation = useMutation({
    mutationFn: (data: SubmitAnswerRequest) => {
      return sessionApi.submitSingleAnswer(quizCode!, session!.sessionId, data);
    },
    onSuccess: (result) => {
      setFeedback(result);
    },
    onError: () => {
      setIsSubmitting(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => {
      return sessionApi.completeSession(quizCode!, session!.sessionId);
    },
    onSuccess: (result) => {
      navigate(`/quiz/${quizCode}/result`, { 
        state: { 
          result,
          sessionId: session!.sessionId 
        } 
      });
    },
    onError: () => {
      setIsSubmitting(false);
    }
  });

  if (!quiz || !session) return null;

  const currentQuestion = quiz.questions?.[currentIndex];
  const isLast = currentIndex === (quiz.questions?.length || 0) - 1;
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex + 1) / (quiz.questions?.length || 1)) * 100;

  if (!currentQuestion) return null;

  const handleAnswer = (answer: Partial<AnswerSubmission>) => {
    if (quiz.quizMode === 'PER_QUESTION' && feedback) return; // Prevent changing answer if already submitted
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
    recordAnswer({ questionId: currentQuestion.id, timeTakenSeconds: timeTaken, ...answer });
  };

  const isPerQuestion = quiz.quizMode === 'PER_QUESTION';

  const handleSubmitAnswer = () => {
    if (submitSingleAnswerMutation.isPending || feedback) return;
    
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
    // Record final selection state
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
          completeMutation.mutate();
        } else {
          setDirection(1);
          setFeedback(null);
          nextQuestion();
          questionStartTime.current = Date.now();
        }
      }
    } else {
      if (submitMutation.isPending || isSubmitting) return;
      setDirection(1);
      if (isLast) {
        setIsSubmitting(true);
        submitMutation.mutate();
      } else {
        nextQuestion();
        questionStartTime.current = Date.now();
      }
    }
  };

  const timerMode = session.timingMode;
  const timerSeconds = session.timerValueSeconds;

  const getButtonText = () => {
    if (isPerQuestion) {
      if (!feedback) {
        return submitSingleAnswerMutation.isPending ? 'Submitting...' : 'Submit Answer';
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

  const showIcon = isPerQuestion 
    ? (!!feedback && !isLast) 
    : !isLast;

  return (
    <div className="min-h-screen bg-[#060e17] text-slate-100 selection:bg-[#00bcd4]/30 relative overflow-hidden">
      {/* Decorative starry glowing gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00bcd4]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#00bcd4]/5 blur-[150px] pointer-events-none" />
 
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-[#0b192c]/80 backdrop-blur-lg border-b border-[#00bcd4]/15 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-300">
              Question {currentIndex + 1} of {quiz.questions?.length || 0}
            </span>
            {timerMode === 'OVERALL' && timerSeconds && (
              <TimerRing
                seconds={timerSeconds}
                onExpire={() => !submitMutation.isPending && submitMutation.mutate()}
                size="sm"
              />
            )}
            <span 
              className="text-sm font-extrabold text-[#00bcd4] tracking-wide"
              style={{ textShadow: '0 0 8px rgba(0,188,212,0.5)' }}
            >
              {studentName}
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={{
              hidden: (d: number) => ({ opacity: 0, x: d * 60 }),
              visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
              exit: (d: number) => ({ opacity: 0, x: d * -60, transition: { duration: 0.2 } }),
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {timerMode === 'PER_QUESTION' && timerSeconds && !feedback && (
              <div className="flex justify-center mb-6">
                <TimerRing
                  seconds={timerSeconds}
                  onExpire={isPerQuestion ? handleSubmitAnswer : handleNext}
                  size="lg"
                  key={currentIndex}  // Reset timer on question change
                />
              </div>
            )}

            <QuestionCard
              question={currentQuestion}
              selectedOptionId={currentAnswer?.selectedOptionId}
              answerText={currentAnswer?.answerText}
              onSelectOption={(id) => handleAnswer({ selectedOptionId: id })}
              onAnswerText={(text) => handleAnswer({ answerText: text })}
              disabled={isPerQuestion ? !!feedback : false}
              feedback={feedback}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end mt-8">
          <BrandButton
            onClick={handleNext}
            loading={isButtonLoading}
            size="lg"
            icon={showIcon ? <ChevronRight className="w-5 h-5" /> : undefined}
          >
            {getButtonText()}
          </BrandButton>
        </div>
      </div>
    </div>
  );
}

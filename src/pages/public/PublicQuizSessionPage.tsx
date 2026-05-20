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
import type { AnswerSubmission } from '../../types/session.types';

export default function PublicQuizSessionPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const { quiz, session, studentName, currentIndex, answers, recordAnswer, nextQuestion } =
    useQuizStore();
  const [direction, setDirection] = useState(1);
  const questionStartTime = useRef(Date.now());

  // Guard: redirect if no active session
  useEffect(() => {
    if (!quiz || !session) navigate(`/quiz/${quizCode}`, { replace: true });
  }, []);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (submitMutation.isPending) return Promise.reject('Already submitting');
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
  });

  if (!quiz || !session) return null;

  const currentQuestion = quiz.questions?.[currentIndex];
  const isLast = currentIndex === (quiz.questions?.length || 0) - 1;
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex + 1) / (quiz.questions?.length || 1)) * 100;

  if (!currentQuestion) return null;

  const handleAnswer = (answer: Partial<AnswerSubmission>) => {
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
    recordAnswer({ questionId: currentQuestion.id, timeTakenSeconds: timeTaken, ...answer });
  };

  const handleNext = () => {
    if (submitMutation.isPending) return;
    setDirection(1);
    if (isLast) {
      submitMutation.mutate();
    } else {
      nextQuestion();
      questionStartTime.current = Date.now();
    }
  };

  const timerMode = session.timingMode;
  const timerSeconds = session.timerValueSeconds;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50/30">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">
              Question {currentIndex + 1} of {quiz.questions?.length || 0}
            </span>
            {timerMode === 'OVERALL' && timerSeconds && (
              <TimerRing
                seconds={timerSeconds}
                onExpire={() => !submitMutation.isPending && submitMutation.mutate()}
                size="sm"
              />
            )}
            <span className="text-sm font-semibold text-brand-600">{studentName}</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
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
            {timerMode === 'PER_QUESTION' && timerSeconds && (
              <div className="flex justify-center mb-6">
                <TimerRing
                  seconds={timerSeconds}
                  onExpire={handleNext}
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
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end mt-8">
          <BrandButton
            onClick={handleNext}
            loading={submitMutation.isPending}
            size="lg"
            icon={isLast ? undefined : <ChevronRight className="w-5 h-5" />}
          >
            {isLast ? 'Submit Quiz' : 'Next Question'}
          </BrandButton>
        </div>
      </div>
    </div>
  );
}

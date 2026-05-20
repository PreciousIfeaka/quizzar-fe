import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, User } from 'lucide-react';
import { sessionApi } from '../../api/session.api';
import { useQuizStore } from '../../store/quizStore';
import { BrandButton } from '../../components/common/BrandButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';
import { formatSeconds } from '../../lib/utils';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function PublicQuizLandingPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const { setQuiz, setSession, setStudentName } = useQuizStore();

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['public-quiz', quizCode],
    queryFn: () => sessionApi.getPublicQuiz(quizCode!),
    enabled: !!quizCode,
  });

  const startMutation = useMutation({
    mutationFn: () => sessionApi.startSession(quizCode!, { studentName: name.trim() }),
    onSuccess: (session) => {
      setQuiz(quiz!);
      setSession(session);
      setStudentName(name.trim());
      navigate(`/quiz/${quizCode}/session`);
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error || !quiz) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Quiz not found</h1>
        <p className="text-muted-foreground">This link may be invalid or the quiz has been deleted.</p>
      </div>
    </div>
  );

  const timingLabel = quiz.timingMode === 'NONE'
    ? 'No time limit'
    : quiz.timerValueSeconds
      ? `${formatSeconds(quiz.timerValueSeconds)} ${quiz.timingMode === 'PER_QUESTION' ? 'per question' : 'total'}`
      : 'Timed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/30 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <QuizzarLogo />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Quiz info card */}
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden mb-6"
          >
            <div className="h-2 bg-gradient-brand" />
            <div className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-5 shadow-brand-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-muted-foreground text-sm mb-5">{quiz.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <BookOpen className="w-4 h-4 text-brand-500" />
                  {quiz.questions.length} questions
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4 text-brand-500" />
                  {timingLabel}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Name entry card */}
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 shadow-card p-8"
          >
            <h2 className="font-bold text-slate-800 text-lg mb-5">Enter your name to begin</h2>
            <div className="space-y-1.5 mb-6">
              <Label htmlFor="studentName" className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-500" />
                Your Name
              </Label>
              <Input
                id="studentName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Smith"
                className="rounded-xl h-12 text-base"
                onKeyDown={e => {
                  if (e.key === 'Enter' && name.trim().length >= 2) startMutation.mutate();
                }}
                autoFocus
              />
            </div>
            <BrandButton
              onClick={() => startMutation.mutate()}
              disabled={name.trim().length < 2}
              loading={startMutation.isPending}
              icon={<Play className="w-4 h-4" />}
              size="lg"
              className="w-full"
            >
              Start Quiz
            </BrandButton>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

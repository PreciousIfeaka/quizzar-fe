import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { AnimatedPage } from '../../components/common/AnimatedPage';
import { QuizLinkPanel } from '../../components/quiz/QuizLinkPanel';
import { AiSuggestionBadge } from '../../components/generation/AiSuggestionBadge';
import { TimingBadge } from '../../components/quiz/TimingBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { staggerContainer, fadeUp } from '../../lib/motion';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import type { QuestionType } from '../../types/quiz.types';

const typeLabels: Record<QuestionType, string> = {
  MCQ: 'MCQ',
  TRUE_FALSE: 'T/F',
  SHORT_ANSWER: 'Short',
};

const typeColors: Record<QuestionType, string> = {
  MCQ: 'bg-[#00bcd4]/10 text-[#00bcd4]',
  TRUE_FALSE: 'bg-[#00bcd4]/10 text-[#00bcd4]',
  SHORT_ANSWER: 'bg-[#f5a623]/10 text-[#f5a623]',
};

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => quizApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz deleted' });
      navigate('/quizzes');
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!quiz) return null;

  return (
    <AnimatedPage>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate('/quizzes')}
              className="text-sm text-muted-foreground hover:text-[#00bcd4] transition-colors"
            >
              My Quizzes
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-slate-700 font-medium truncate">{quiz.title}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 truncate">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground mt-1">{quiz.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <TimingBadge timingMode={quiz.timingMode} timerSeconds={quiz.timerValueSeconds} />
            {quiz.aiSuggestedTimeSeconds && quiz.aiSuggestedTimingMode && (
              <AiSuggestionBadge
                suggestedMode={quiz.aiSuggestedTimingMode}
                suggestedSeconds={quiz.aiSuggestedTimeSeconds}
                reasoning="AI-suggested based on question complexity and level."
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/quizzes/${id}/analytics`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-100 text-sm font-medium text-slate-600 hover:border-[#00bcd4]/30 hover:bg-[#00bcd4]/5 hover:text-[#00bcd4] transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions list — takes 2 cols */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Questions
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({quiz.questions?.length || 0})
              </span>
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {quiz.questions?.map((question, index) => {
              const isExpanded = expandedQuestion === question.id;
              return (
                <motion.div
                  key={question.id}
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                    className="w-full flex items-start gap-4 p-4 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-sm font-black text-brand-600 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {question.questionText}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          typeColors[question.questionType]
                        )}>
                          {typeLabels[question.questionType]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {question.points} pt{question.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    }
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-4 pb-4 border-t border-slate-50"
                    >
                      <div className="pt-3 space-y-2">
                        {question.options?.map(option => (
                          <div
                            key={option.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl text-sm transition-colors',
                              option.isCorrect
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-slate-50 text-slate-700'
                            )}
                          >
                            <span className={cn(
                              'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                              option.isCorrect
                                ? 'bg-green-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-500'
                            )}>
                              {option.label}
                            </span>
                            <span className="flex-1">{option.text}</span>
                            {option.isCorrect && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-white px-1.5 py-0.5 rounded border border-green-200">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Sidebar — link panel + stats */}
        <div className="space-y-4">
          <QuizLinkPanel quizId={quiz.id} quizCode={quiz.quizCode} />

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">Quiz Info</h3>
            {[
              { label: 'Questions', value: quiz.questions?.length || 0 },
              { label: 'Total Points', value: quiz.questions?.reduce((s, q) => s + q.points, 0) || 0 },
              {
                label: 'Question Types',
                value: [...new Set(quiz.questions?.map(q => typeLabels[q.questionType]) || [])].join(', ') || 'N/A'
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Quiz"
        description={`Delete "${quiz.title}"? This permanently removes all questions, student sessions, and results.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </AnimatedPage>
  );
}

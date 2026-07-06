import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart2, Trash2, Plus, Edit, Calendar, GripVertical } from 'lucide-react';
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
import type { Question, QuestionType } from '../../types/quiz.types';
import QuestionEditDialog from '../../components/quiz/QuestionEditDialog';
import ScheduleEditDialog from '../../components/quiz/ScheduleEditDialog';
import { MathText } from '../../components/common/MathText';

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
  
  // Dialog/modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [questionEditOpen, setQuestionEditOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | undefined>(undefined);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  
  // Question deletion
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => quizApi.deleteQuestion(id!, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      toast({ title: 'Question deleted' });
      setQuestionToDelete(null);
    },
    onError: (err: any) => {
      const apiMsg = err.response?.data?.message || 'Failed to delete question';
      toast({
        title: 'Delete Failed',
        description: apiMsg,
        variant: 'destructive',
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedQuestionIds: string[]) => quizApi.reorderQuestions(id!, orderedQuestionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      toast({ title: 'Questions reordered' });
    },
    onError: (err: any) => {
      const apiMsg = err.response?.data?.message || 'Failed to reorder questions';
      toast({
        title: 'Reordering Failed',
        description: apiMsg,
        variant: 'destructive',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (status: 'DRAFT' | 'PUBLISHED') => quizApi.update(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      toast({ title: 'Quiz status updated' });
    },
    onError: (err: any) => {
      const apiMsg = err.response?.data?.message || 'Failed to update status';
      toast({
        title: 'Update Failed',
        description: apiMsg,
        variant: 'destructive',
      });
    },
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (!quiz?.questions || draggedIndex === null || draggedIndex === toIndex) return;

    const reordered = [...quiz.questions];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setDraggedIndex(null);
    reorderMutation.mutate(reordered.map(q => q.id));
  };

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
              className="text-sm text-muted-foreground hover:text-[#0A99AB] transition-colors"
            >
              My Quizzes
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-slate-700 font-medium truncate">{quiz.title}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate">{quiz.title}</h1>
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

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={() => navigate(`/quizzes/${id}/analytics`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-100 text-sm font-medium text-slate-600 hover:border-[#0A99AB]/30 hover:bg-[#0A99AB]/5 hover:text-[#0A99AB] transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
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
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Questions
              <span className="text-sm font-normal text-muted-foreground">
                ({quiz.questions?.length || 0})
              </span>
            </h2>
            <button
              onClick={() => {
                setSelectedQuestion(undefined);
                setQuestionEditOpen(true);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0A99AB] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0A99AB]/10 hover:bg-[#098391] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question
            </button>
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
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, index)}
                  onDragOver={(e: any) => handleDragOver(e)}
                  onDrop={(e: any) => handleDrop(e, index)}
                  className={cn(
                    "bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden transition-all duration-200",
                    draggedIndex === index && "opacity-40 border-dashed border-[#0A99AB]"
                  )}
                >
                  <div className="flex items-center w-full group">
                    {/* Drag Handle */}
                    <div className="pl-3 pr-1 text-slate-350 cursor-grab active:cursor-grabbing hover:text-slate-450 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                      className="flex-1 flex items-start gap-3 py-4 pr-4 text-left hover:bg-slate-50/20 transition-colors min-w-0"
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#0A99AB]/10 flex items-center justify-center text-xs font-black text-[#08636e] flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 leading-snug break-words pr-2">
                          <MathText text={question.questionText} />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                            typeColors[question.questionType]
                          )}>
                            {typeLabels[question.questionType]}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {question.points} pt{question.points !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Question Actions */}
                    <div className="flex items-center gap-1.5 pr-4 flex-shrink-0">
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedQuestion(question);
                          setQuestionEditOpen(true);
                        }}
                        className="p-1 rounded-md text-[#0A99AB] hover:bg-[#0A99AB]/5 transition-all"
                        title="Edit Question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setQuestionToDelete(question)}
                        disabled={quiz.questions?.length === 1}
                        className={cn(
                          "p-1 rounded-md text-red-500 hover:bg-red-50 transition-all",
                          quiz.questions?.length === 1 && "opacity-30 cursor-not-allowed"
                        )}
                        title={quiz.questions?.length === 1 ? "Cannot delete the only question" : "Delete Question"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 border-t border-slate-50"
                    >
                      <div className="pt-3 space-y-2">
                        {/* Options Display */}
                        {question.questionType !== 'SHORT_ANSWER' && question.options?.map(option => (
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
                            <span className="flex-1">
                              <MathText text={option.text} />
                            </span>
                            {option.isCorrect && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-white px-1.5 py-0.5 rounded border border-green-200">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Short Answer Display */}
                        {question.questionType === 'SHORT_ANSWER' && (
                          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Accepted Answer Keys:
                            </span>
                            <div className="flex gap-2 flex-wrap">
                              {question.acceptedAnswers?.map((ans, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-750 font-semibold text-xs rounded-lg"
                                >
                                  <MathText text={ans} />
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Sidebar — link panel, stats, schedule */}
        <div className="space-y-4">
          {/* Scheduling and Status Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0A99AB]" />
                Schedule & Status
              </h3>
              <button
                onClick={() => setScheduleOpen(true)}
                className="text-xs font-bold text-[#0A99AB] hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              {/* Status & Toggle */}
              <div className="flex flex-col gap-2 pb-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">Quiz Visibility</span>
                  <span className={cn(
                    "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border transition-colors",
                    quiz.status === 'PUBLISHED'
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {quiz.status === 'PUBLISHED' ? 'Live & Open' : 'Draft Mode'}
                  </span>
                </div>

                {/* Segmented Control */}
                <div className="bg-slate-100/80 p-0.5 rounded-xl flex gap-1 border border-slate-200/20 relative">
                  <button
                    type="button"
                    onClick={() => quiz.status !== 'DRAFT' && toggleStatusMutation.mutate('DRAFT')}
                    disabled={toggleStatusMutation.isPending}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg text-center font-bold text-[11px] transition-all relative z-10",
                      quiz.status === 'DRAFT'
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-400 hover:text-slate-700 disabled:opacity-50"
                    )}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => quiz.status !== 'PUBLISHED' && toggleStatusMutation.mutate('PUBLISHED')}
                    disabled={toggleStatusMutation.isPending}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg text-center font-bold text-[11px] transition-all relative z-10",
                      quiz.status === 'PUBLISHED'
                        ? "bg-white text-[#0A99AB] shadow-sm"
                        : "text-slate-400 hover:text-slate-700 disabled:opacity-50"
                    )}
                  >
                    Published
                  </button>
                </div>
              </div>
              
              {/* Open datetime */}
              <div className="flex flex-col gap-1 border-t border-slate-50 pt-2.5">
                <span className="text-muted-foreground">Opens At</span>
                <span className="font-semibold text-slate-700">
                  {quiz.scheduledOpenAt ? new Date(quiz.scheduledOpenAt).toLocaleString() : 'Open Immediately'}
                </span>
              </div>

              {/* Close datetime */}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Closes At</span>
                <span className="font-semibold text-slate-700">
                  {quiz.scheduledCloseAt ? new Date(quiz.scheduledCloseAt).toLocaleString() : 'Closes Manually'}
                </span>
              </div>
            </div>
          </div>

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

      {/* Quiz Deletion Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Quiz"
        description={`Delete "${quiz.title}"? This permanently removes all questions, student sessions, and results.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        variant="danger"
      />

      {/* Question Deletion Dialog */}
      <ConfirmDialog
        open={!!questionToDelete}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={() => questionToDelete && deleteQuestionMutation.mutate(questionToDelete.id)}
        loading={deleteQuestionMutation.isPending}
        variant="danger"
      />

      {/* Question Edit / Add Dialog */}
      <QuestionEditDialog
        open={questionEditOpen}
        onOpenChange={setQuestionEditOpen}
        quizId={quiz.id}
        question={selectedQuestion}
      />

      {/* Schedule Edit Dialog */}
      <ScheduleEditDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        quizId={quiz.id}
        quiz={quiz}
      />
    </AnimatedPage>
  );
}

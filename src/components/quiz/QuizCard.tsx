import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Link2, BarChart2, Trash2, MoreHorizontal } from 'lucide-react';
import type { QuizSummary } from '../../types/quiz.types';
import { formatDate, buildPublicQuizUrl, copyToClipboard } from '../../lib/utils';
import { cardHover } from '../../lib/motion';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { toast } from '../../hooks/use-toast';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../../api/quiz.api';
import { ConfirmDialog } from '../common/ConfirmDialog';

const timingLabels = {
  NONE: { label: 'No Timer', color: 'bg-slate-50 text-slate-600 border border-slate-100/50' },
  PER_QUESTION: { label: 'Per Question', color: 'bg-blue-50 text-blue-600 border border-blue-100/50' },
  OVERALL: { label: 'Overall Timer', color: 'bg-[#ff9100]/5 text-[#ff9100] border-[#ff9100]/20' },
  AI_SUGGESTED: { label: 'AI Suggested', color: 'bg-[#00bcd4]/5 text-[#00bcd4] border-[#00bcd4]/20' },
};

export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const timing = quiz.timingMode ? timingLabels[quiz.timingMode] : timingLabels.NONE;

  const deleteMutation = useMutation({
    mutationFn: () => quizApi.delete(quiz.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz deleted', description: `"${quiz.title}" has been deleted.` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete quiz.', variant: 'destructive' });
    },
  });

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(buildPublicQuizUrl(quiz.quizCode));
    toast({ title: 'Link copied!', description: 'Public quiz link copied to clipboard.' });
  };

  return (
    <>
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        animate="rest"
        onClick={() => navigate(`/quizzes/${quiz.id}`)}
        className="bg-white rounded-2xl border border-slate-100/60 quiz-card-shadow hover:shadow-lg cursor-pointer overflow-hidden group transition-all duration-300"
      >
        {/* Color accent bar */}
        <div className="h-1 bg-gradient-brand" />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate group-hover:text-[#0a99ab] transition-colors">
                {quiz.title}
              </h3>
              {quiz.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{quiz.description}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                  <BookOpen className="w-4 h-4 mr-2" /> View Quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="w-4 h-4 mr-2" /> Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/quizzes/${quiz.id}/analytics`)}>
                  <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100/50 px-3 py-1 rounded-full">
              <BookOpen className="w-3 h-3 text-slate-400" />
              {quiz.questionCount} questions
            </span>
            {quiz.timingMode && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${timing.color}`}>
                <Clock className="w-3 h-3" />
                {timing.label}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/60">
            <p className="text-xs text-muted-foreground">{formatDate(quiz.createdAt)}</p>
            <button
              onClick={handleCopyLink}
              className="text-xs text-primary font-bold flex items-center gap-1 hover:text-[#0a99ab]"
            >
              <Link2 className="w-3.5 h-3.5" />
              Copy link
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Quiz"
        description={`Are you sure you want to delete "${quiz.title}"? This will remove all questions, sessions, and student results permanently.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  );
}

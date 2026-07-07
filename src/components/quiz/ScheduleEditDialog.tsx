import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Trash2, HelpCircle } from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import type { Quiz, UpdateQuizRequest } from '../../types/quiz.types';
import { cn } from '../../lib/utils';

interface ScheduleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  quiz: Quiz;
}

// Helpers for timezone conversions
const toLocalDateString = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toUtcIsoString = (localString: string): string | null => {
  if (!localString) return null;
  const d = new Date(localString);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

export default function ScheduleEditDialog({
  open,
  onOpenChange,
  quizId,
  quiz,
}: ScheduleEditDialogProps) {
  const queryClient = useQueryClient();

  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [randomizeQuestionOrder, setRandomizeQuestionOrder] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  // Prefill when open
  useEffect(() => {
    if (open && quiz) {
      setOpenAt(toLocalDateString(quiz.scheduledOpenAt));
      setCloseAt(toLocalDateString(quiz.scheduledCloseAt));
      setRandomizeQuestionOrder(quiz.randomizeQuestionOrder || false);
      setShuffleOptions(quiz.shuffleOptions || false);
    }
  }, [open, quiz]);

  const mutation = useMutation({
    mutationFn: (data: UpdateQuizRequest) =>
      quizApi.update(quizId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Quiz Settings Updated',
        description: 'Quiz schedule and behavior settings have been updated successfully.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update settings';
      toast({
        title: 'Update Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    const utcOpen = toUtcIsoString(openAt);
    const utcClose = toUtcIsoString(closeAt);

    // Client-side Validation rules
    if (utcOpen && utcClose) {
      const oDate = new Date(utcOpen);
      const cDate = new Date(utcClose);
      if (cDate <= oDate) {
        toast({
          title: 'Invalid Dates',
          description: 'Closing time must be set after the opening time.',
          variant: 'destructive',
        });
        return;
      }
    } else if (utcClose && !utcOpen) {
      const cDate = new Date(utcClose);
      if (cDate <= new Date()) {
        toast({
          title: 'Invalid Date',
          description: 'If set without an opening time, the close time must be in the future.',
          variant: 'destructive',
        });
        return;
      }
    }

    mutation.mutate({
      scheduledOpenAt: utcOpen,
      scheduledCloseAt: utcClose,
      randomizeQuestionOrder,
      shuffleOptions,
    });
  };

  const handleClear = () => {
    setOpenAt('');
    setCloseAt('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl border-slate-100 p-6 md:p-8 bg-white font-['Plus_Jakarta_Sans',sans-serif]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0A99AB]" />
            Quiz Settings & Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure the schedule, question order, and choice shuffling rules for this quiz.
          </p>

          {/* Open Date/Time */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Opens At (Local Time)
            </label>
            <input
              type="datetime-local"
              value={openAt}
              onChange={e => setOpenAt(e.target.value)}
              className="w-full px-3 py-2.5 h-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none text-sm text-slate-800 transition-all bg-white"
            />
          </div>

          {/* Close Date/Time */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Closes At (Local Time)
            </label>
            <input
              type="datetime-local"
              value={closeAt}
              onChange={e => setCloseAt(e.target.value)}
              className="w-full px-3 py-2.5 h-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none text-sm text-slate-800 transition-all bg-white"
            />
          </div>

          {/* Quiz Options */}
          <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quiz Options
            </span>

            {/* Randomize Questions Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
              <div className="space-y-0.5 pr-2">
                <label className="text-xs font-bold text-slate-800 cursor-pointer animate-fade-in" htmlFor="randomize-questions">
                  Randomize Questions
                </label>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Deliver questions in a dynamic randomized order to each student.
                </p>
              </div>
              <button
                type="button"
                id="randomize-questions"
                onClick={() => setRandomizeQuestionOrder(!randomizeQuestionOrder)}
                className={cn(
                  "w-10 h-5.5 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0 cursor-pointer",
                  randomizeQuestionOrder ? "bg-[#0A99AB]" : "bg-slate-200"
                )}
              >
                <div
                  className={cn(
                    "w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    randomizeQuestionOrder ? "translate-x-4.5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Shuffle Answer Options Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
              <div className="space-y-0.5 pr-2">
                <label className="text-xs font-bold text-slate-800 cursor-pointer animate-fade-in" htmlFor="shuffle-options">
                  Shuffle Answer Options
                </label>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Scramble multiple choice and true/false choice positions per student.
                </p>
              </div>
              <button
                type="button"
                id="shuffle-options"
                onClick={() => setShuffleOptions(!shuffleOptions)}
                className={cn(
                  "w-10 h-5.5 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0 cursor-pointer",
                  shuffleOptions ? "bg-[#0A99AB]" : "bg-slate-200"
                )}
              >
                <div
                  className={cn(
                    "w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    shuffleOptions ? "translate-x-4.5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="bg-[#0A99AB]/5 rounded-xl p-3 flex items-start gap-2 border border-[#0A99AB]/10 mt-2">
            <HelpCircle className="w-4 h-4 text-[#0A99AB] flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-500 leading-relaxed">
              <strong>Draft vs Published:</strong> Students can never access Draft quizzes, regardless of the schedule or options. Make sure status is set to Published.
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between sm:justify-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!openAt && !closeAt}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all mr-auto disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Schedule
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-150 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending}
            className="primary-gradient text-white py-2.5 px-5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#0A99AB]/15 hover:scale-[1.01] active:scale-95 transition-all text-xs disabled:opacity-50 disabled:pointer-events-none"
          >
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

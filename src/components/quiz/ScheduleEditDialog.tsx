import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Trash2, HelpCircle } from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import type { Quiz } from '../../types/quiz.types';

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

  // Prefill when open
  useEffect(() => {
    if (open && quiz) {
      setOpenAt(toLocalDateString(quiz.scheduledOpenAt));
      setCloseAt(toLocalDateString(quiz.scheduledCloseAt));
    }
  }, [open, quiz]);

  const mutation = useMutation({
    mutationFn: (data: { scheduledOpenAt: string | null; scheduledCloseAt: string | null }) =>
      quizApi.updateSchedule(quizId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Schedule updated',
        description: 'Quiz availability schedule has been updated successfully.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update schedule';
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
            Quiz Schedule Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500 leading-relaxed">
            Schedule when this quiz becomes accessible to students and when it closes automatically. Leaving them empty makes the quiz always available once published.
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

          <div className="bg-[#0A99AB]/5 rounded-xl p-3 flex items-start gap-2 border border-[#0A99AB]/10 mt-2">
            <HelpCircle className="w-4 h-4 text-[#0A99AB] flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-500 leading-relaxed">
              <strong>Draft vs Published:</strong> Students can never access Draft quizzes, regardless of the schedule. Make sure the status is set to Published for the schedule to take effect.
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

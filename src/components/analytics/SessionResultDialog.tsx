import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ResultDetails } from '../session/ResultDetails';
import { Trophy, Clock, User, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface SessionResultDialogProps {
  sessionId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function SessionResultDialog({ sessionId, onOpenChange }: SessionResultDialogProps) {
  const { data: result, isLoading } = useQuery({
    queryKey: ['session-results', sessionId],
    queryFn: () => analyticsApi.getSessionResults(sessionId!),
    enabled: !!sessionId,
  });

  return (
    <Dialog open={!!sessionId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900">Attempt Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Quick Summary Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Student</span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">{result.studentName}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Score</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{result.percentageScore}%</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{result.passed ? 'Passed' : 'Failed'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{formatDate(result.completedAt)}</p>
              </div>
            </div>

            {result.details && <ResultDetails details={result.details} />}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            Failed to load attempt details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

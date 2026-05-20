import type { StudentResult } from '../../types/analytics.types';
import { formatDate, formatSeconds, getScoreBg } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';

export function StudentResultRow({ result, onViewDetails }: { 
  result: StudentResult; 
  onViewDetails?: (id: string) => void;
}) {
  const pct = Math.round(result.percentageScore);
  const passed = pct >= 50;

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', passed ? 'bg-green-100' : 'bg-red-100')}>
        {passed
          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
          : <XCircle className="w-4 h-4 text-red-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">{result.studentName}</p>
        <p className="text-xs text-muted-foreground">{formatDate(result.startedAt)}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {result.timeTakenSeconds && (
          <span className="text-xs text-muted-foreground hidden md:block">
            {formatSeconds(result.timeTakenSeconds)}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {result.totalScore}/{result.maxScore} pts
        </span>
        <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', getScoreBg(pct))}>
          {pct}%
        </span>
        {onViewDetails && (
          <button 
            onClick={() => onViewDetails(result.sessionId)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

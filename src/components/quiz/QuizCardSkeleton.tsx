import { Skeleton } from '../ui/skeleton';

export function QuizCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <div className="h-1 bg-slate-100 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-lg" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

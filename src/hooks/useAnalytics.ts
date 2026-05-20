import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

export function useQuizAnalytics(quizId: string | undefined) {
  return useQuery({
    queryKey: ['analytics', quizId],
    queryFn: () => analyticsApi.getQuizAnalytics(quizId!),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 2, // 2 min — analytics change with new submissions
  });
}

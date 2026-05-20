import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../api/quiz.api';
import type { UpdateQuizRequest } from '../types/quiz.types';
import { toast } from './use-toast';

export function useQuizzes(page = 0, size = 12, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') {
  return useQuery({
    queryKey: ['quizzes', page, size, sortBy, sortDir],
    queryFn: () => quizApi.getAll(page, size, sortBy, sortDir),
    placeholderData: (prev) => prev,
  });
}

export function useQuiz(id: string | undefined) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getById(id!),
    enabled: !!id,
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete quiz', variant: 'destructive' });
    },
  });
}

export function useUpdateQuiz(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateQuizRequest) => quizApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update quiz', variant: 'destructive' });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { generationApi } from '../api/generation.api';
import { toast } from './use-toast';
import type { GenerateFromPasteRequest } from '../types/generation.types';

export function useGenerateFromUpload(onGenerating: (v: boolean) => void) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => generationApi.fromUpload(formData),
    onMutate: () => onGenerating(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: '✨ Quiz generated!', description: `"${data.quiz.title}" is ready.` });
      navigate(`/quizzes/${data.quiz.id}`);
    },
    onError: () => {
      onGenerating(false);
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    },
  });
}

export function useGenerateFromPaste(onGenerating: (v: boolean) => void) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateFromPasteRequest) => generationApi.fromPaste(data),
    onMutate: () => onGenerating(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: '✨ Quiz generated!', description: `"${data.quiz.title}" is ready.` });
      navigate(`/quizzes/${data.quiz.id}`);
    },
    onError: () => {
      onGenerating(false);
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    },
  });
}

export function useGenerateFromSpecs(onGenerating: (v: boolean) => void) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => generationApi.fromSpecs(formData),
    onMutate: () => onGenerating(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: '✨ Quiz generated!', description: `"${data.quiz.title}" is ready.` });
      navigate(`/quizzes/${data.quiz.id}`);
    },
    onError: () => {
      onGenerating(false);
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    },
  });
}

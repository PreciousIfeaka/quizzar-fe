import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText } from 'lucide-react';
import { generationApi } from '../../api/generation.api';
import { BrandButton } from '../common/BrandButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { TimingSelector } from './TimingSelector';
import { toast } from '../../hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const schema = z.object({
  quizTitle: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  quizDescription: z.string().max(1000).optional(),
  rawText: z.string()
    .min(50, 'Please paste at least 50 characters of content')
    .max(50000, 'Content too long (max 50,000 characters)'),
  timingPreference: z.enum(['NONE', 'PER_QUESTION', 'OVERALL', 'AI_SUGGESTED']),
  manualTimerSeconds: z.number().min(5).max(3600).optional(),
  quizMode: z.enum(['OVERALL', 'PER_QUESTION']),
});

type FormData = z.infer<typeof schema>;

export function PasteEditor({ onGenerating }: { onGenerating: (v: boolean) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timingPreference: 'AI_SUGGESTED', quizMode: 'OVERALL' },
  });

  const rawText = watch('rawText') ?? '';
  const charCount = rawText.length;
  const charLimit = 50000;
  const isNearLimit = charCount > charLimit * 0.85;

  const mutation = useMutation({
    mutationFn: (data: FormData) => generationApi.fromPaste({
      rawText: data.rawText,
      quizTitle: data.quizTitle,
      quizDescription: data.quizDescription,
      timingPreference: data.timingPreference,
      manualTimerSeconds: data.manualTimerSeconds,
      quizMode: data.quizMode,
    }),
    onMutate: () => onGenerating(true),
    onSuccess: (data, variables) => {
      onGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: '✨ Quiz generated!', description: `"${variables.quizTitle}" is ready.` });
      navigate(`/quizzes/${data.quizId}`);
    },
    onError: () => {
      onGenerating(false);
      toast({
        title: 'Generation failed',
        description: 'Could not format your content. Please check the text and try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Paste area */}
      <div className="lg:col-span-3 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-sm font-semibold">
            <FileText className="w-4 h-4 text-[#00bcd4]" />
            Paste your questions and answers
          </Label>
          <span className={`text-xs font-medium tabular-nums ${isNearLimit ? 'text-energy-500' : 'text-muted-foreground'
            }`}>
            {charCount.toLocaleString()} / {charLimit.toLocaleString()}
          </span>
        </div>

        <Textarea
          {...register('rawText')}
          placeholder={`Paste your questions here. Any format works — numbered lists, Q&A style, tables. For example:

1. What is photosynthesis?
A) A process plants use to make food
B) A type of animal digestion
C) A chemical reaction in water
D) None of the above
Answer: A

2. True or False: The Earth is flat.
Answer: False`}
          rows={18}
          className="rounded-xl resize-none font-mono text-sm leading-relaxed focus:ring-[#00bcd4]/50"
        />
        {errors.rawText && (
          <p className="text-xs text-red-500">{errors.rawText.message}</p>
        )}

        {/* Character progress bar */}
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isNearLimit ? 'bg-[#f5a623]' : 'bg-[#00bcd4]'
              }`}
            style={{ width: `${Math.min((charCount / charLimit) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Form config */}
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="lg:col-span-2 space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="pasteTitle">Quiz Title *</Label>
          <Input
            id="pasteTitle"
            placeholder="e.g. History Midterm Review"
            className="rounded-xl"
            {...register('quizTitle')}
          />
          {errors.quizTitle && (
            <p className="text-xs text-red-500">{errors.quizTitle.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pasteDesc">Description</Label>
          <Textarea
            id="pasteDesc"
            placeholder="Optional description..."
            rows={3}
            className="rounded-xl resize-none"
            {...register('quizDescription')}
          />
        </div>

        {/* Quiz Mode */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Quiz Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'OVERALL', label: 'Overall Scoring', desc: 'Results shown at end' },
              { id: 'PER_QUESTION', label: 'Instant Feedback', desc: 'Feedback per question' },
            ].map(({ id, label, desc }) => {
              const active = watch('quizMode') === id;
              return (
                <motion.button
                  key={id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setValue('quizMode', id as any);
                    if (id === 'PER_QUESTION' && watch('timingPreference') === 'OVERALL') {
                      setValue('timingPreference', 'PER_QUESTION');
                    }
                  }}
                  className={cn(
                    'flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200',
                    active
                      ? 'border-[#00bcd4] bg-[#00bcd4]/5 shadow-brand-sm'
                      : 'border-slate-100 hover:border-[#00bcd4]/30 hover:bg-slate-50'
                  )}
                >
                  <span className={cn('text-xs font-bold', active ? 'text-[#00bcd4]' : 'text-slate-700')}>
                    {label}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <TimingSelector
          value={watch('timingPreference')}
          onChange={(v) => setValue('timingPreference', v)}
          manualSeconds={watch('manualTimerSeconds')}
          onManualSecondsChange={(v) => setValue('manualTimerSeconds', v)}
          disabledTimingModes={watch('quizMode') === 'PER_QUESTION' ? ['OVERALL'] : []}
        />

        <BrandButton
          type="submit"
          loading={mutation.isPending}
          icon={<Sparkles className="w-4 h-4" />}
          size="lg"
          className="w-full"
        >
          Format & Generate
        </BrandButton>

        {/* Tip */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          AI will identify question types automatically — MCQ, True/False, and short answer are all supported.
        </p>
      </form>
    </div>
  );
}

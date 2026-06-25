import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Clipboard, Trash2, ArrowRight, Lightbulb } from 'lucide-react';
import { generationApi } from '../../api/generation.api';
import { BrandButton } from '../common/BrandButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { TimingSelector } from './TimingSelector';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';

const schema = z.object({
  quizTitle: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  quizDescription: z.string().max(1000).optional(),
  rawText: z.string()
    .min(50, 'Please paste at least 50 characters of content')
    .max(25000, 'Content too long (max 25,000 characters)'),
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
    defaultValues: { timingPreference: 'AI_SUGGESTED', quizMode: 'OVERALL', rawText: '' },
  });

  const rawText = watch('rawText') ?? '';
  const charCount = rawText.length;
  const charLimit = 25000;
  const isNearLimit = charCount > charLimit * 0.85;

  const quizMode = watch('quizMode');
  const timingPreference = watch('timingPreference');
  useEffect(() => {
    if (quizMode === 'PER_QUESTION' && timingPreference === 'OVERALL') {
      setValue('timingPreference', 'PER_QUESTION');
    }
  }, [quizMode, timingPreference, setValue]);

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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue('rawText', text, { shouldValidate: true });
    } catch {
      toast({
        title: 'Paste failed',
        description: 'Could not read from clipboard. Please paste manually.',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    setValue('rawText', '', { shouldValidate: true });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Input Area (Step 1) */}
      <div className="xl:col-span-8 space-y-6">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-black text-slate-800 flex items-center gap-2" htmlFor="rawText">
              <span className="w-8 h-8 rounded-full bg-[#00bcd4]/10 text-primary flex items-center justify-center text-sm font-bold">
                1
              </span>
              Source Material
            </Label>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isNearLimit ? "text-amber-500" : "text-slate-400"
            )}>
              {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters
            </span>
          </div>

          <div className="relative group">
            <Textarea
              {...register('rawText')}
              placeholder={`Paste your questions and answers here, or lecture notes. Any format works. E.g.:

1. What is photosynthesis?
A) A process plants use to make food
B) A type of animal digestion
Answer: A`}
              className="w-full h-[500px] p-6 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none outline-none"
              id="rawText"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handlePaste}
                className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 hover:bg-white transition-all text-slate-600 hover:text-primary"
                type="button"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 hover:bg-white transition-all text-slate-600 hover:text-red-500"
                type="button"
                title="Clear content"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {errors.rawText && (
            <p className="text-xs text-red-500 mt-2">{errors.rawText.message}</p>
          )}

          {/* Floating Accent Background Blur */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </section>
      </div>

      {/* Configuration Sidebar (Step 2) */}
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="xl:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <Label className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#00bcd4]/10 text-primary flex items-center justify-center text-sm font-bold">
              2
            </span>
            Quiz Configuration
          </Label>

          <div className="space-y-5">
            {/* Quiz Title */}
            <div>
              <Label htmlFor="quizTitle" className="block font-bold text-xs text-slate-500 mb-2 px-1">
                Quiz Title
              </Label>
              <Input
                id="quizTitle"
                placeholder="e.g., Intro to Quantum Physics"
                className="rounded-xl h-11 border-slate-200"
                {...register('quizTitle')}
              />
              {errors.quizTitle && (
                <p className="text-xs text-red-500 mt-1">{errors.quizTitle.message}</p>
              )}
            </div>

            {/* Quiz Description */}
            <div>
              <Label htmlFor="quizDesc" className="block font-bold text-xs text-slate-500 mb-2 px-1">
                Description (Optional)
              </Label>
              <Textarea
                id="quizDesc"
                placeholder="Brief summary of the quiz content..."
                rows={3}
                className="rounded-xl border-slate-200 resize-none text-sm"
                {...register('quizDescription')}
              />
            </div>

            {/* Timing Preference */}
            <div className="space-y-4">
              <TimingSelector
                value={watch('timingPreference')}
                onChange={(v) => setValue('timingPreference', v)}
                manualSeconds={watch('manualTimerSeconds')}
                onManualSecondsChange={(v) => setValue('manualTimerSeconds', v)}
                disabledTimingModes={watch('quizMode') === 'PER_QUESTION' ? ['OVERALL'] : []}
              />
            </div>

            {/* Quiz Mode */}
            <div>
              <Label htmlFor="quizMode" className="block font-bold text-xs text-slate-500 mb-2 px-1">
                Quiz Mode
              </Label>
              <select
                id="quizMode"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                {...register('quizMode')}
              >
                <option value="OVERALL">Standard (Full List)</option>
                <option value="PER_QUESTION">Linear (Question by Question)</option>
              </select>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <BrandButton
              type="submit"
              loading={mutation.isPending}
              className="w-full primary-gradient text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
            >
              <span>Create Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </BrandButton>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-semibold italic">
              AI will take 5-10 seconds to process your text.
            </p>
          </div>
        </div>

        {/* AI Tip Card */}
        <div className="bg-[#00bcd4]/5 rounded-2xl p-5 border border-[#00bcd4]/10 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-primary">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#006672] mb-1">Expert Tip</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              For best results, include headers and clear paragraph breaks in your source text. AI works best with structured information.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

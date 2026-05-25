import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generationApi } from '../../api/generation.api';
import { TimingSelector } from './TimingSelector';
import { BrandButton } from '../common/BrandButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  quizTitle: z.string().min(1, 'Title is required'),
  quizDescription: z.string().optional(),
  timingPreference: z.enum(['NONE', 'PER_QUESTION', 'OVERALL', 'AI_SUGGESTED']),
  manualTimerSeconds: z.number().optional(),
  quizMode: z.enum(['OVERALL', 'PER_QUESTION']),
});

type FormData = z.infer<typeof schema>;

export function UploadDropzone({ onGenerating }: { onGenerating: (v: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timingPreference: 'AI_SUGGESTED', quizMode: 'OVERALL' },
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const mutation = useMutation({
    mutationFn: (fd: FormData) => {
      const formData = new FormData();
      
      const request = {
        quizTitle: fd.quizTitle,
        quizDescription: fd.quizDescription,
        timingPreference: fd.timingPreference,
        manualTimerSeconds: fd.manualTimerSeconds,
        quizMode: fd.quizMode,
      };

      formData.append(
        'request',
        new Blob([JSON.stringify(request)], { type: 'application/json' })
      );

      formData.append('file', file!);
      
      return generationApi.fromUpload(formData);
    },
    onMutate: () => onGenerating(true),
    onSuccess: (data, variables) => {
      onGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: '✨ Quiz generated!', description: `"${variables.quizTitle}" is ready.` });
      navigate(`/quizzes/${data.quizId}`);
    },
    onError: () => {
      onGenerating(false);
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Dropzone */}
      <div className="lg:col-span-3 space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-[#00bcd4] bg-[#00bcd4]/5 scale-[1.01]'
              : file
                ? 'border-green-400 bg-green-50'
                : 'border-slate-200 hover:border-[#00bcd4]/30 hover:bg-[#00bcd4]/5'
          )}
        >
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                  <File className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  <X className="w-3.5 h-3.5" /> Remove file
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                  isDragActive ? 'bg-[#00bcd4] animate-pulse' : 'bg-slate-100'
                )}>
                  <Upload className={cn('w-7 h-7', isDragActive ? 'text-white' : 'text-slate-400')} />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">
                    {isDragActive ? 'Drop it here!' : 'Drag & drop your file'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, DOCX, DOC, TXT — up to 20MB
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  or click to browse
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="lg:col-span-2 space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="quizTitle">Quiz Title *</Label>
          <Input
            id="quizTitle"
            placeholder="e.g. Biology Chapter 3"
            className="rounded-xl"
            {...register('quizTitle')}
          />
          {errors.quizTitle && (
            <p className="text-xs text-red-500">{errors.quizTitle.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quizDescription">Description</Label>
          <Textarea
            id="quizDescription"
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
          disabled={!file}
          loading={mutation.isPending}
          icon={<Sparkles className="w-4 h-4" />}
          className="w-full"
          size="lg"
        >
          Generate Quiz
        </BrandButton>
      </form>
    </div>
  );
}

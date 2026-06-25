import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, ArrowRight, Brain, Languages, ShieldCheck } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timingPreference: 'AI_SUGGESTED', quizMode: 'OVERALL' },
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      const selectedFile = accepted[0];
      setFile(selectedFile);
      // Simulate file upload progress
      setUploadProgress(0);
    }
  }, []);

  useEffect(() => {
    if (uploadProgress !== null && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress((p) => (p !== null ? Math.min(p + 10, 100) : 0));
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress]);

  const quizMode = watch('quizMode');
  const timingPreference = watch('timingPreference');
  useEffect(() => {
    if (quizMode === 'PER_QUESTION' && timingPreference === 'OVERALL') {
      setValue('timingPreference', 'PER_QUESTION');
    }
  }, [quizMode, timingPreference, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
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
    <div className="space-y-10">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-primary/30 rounded-[2rem] p-12 text-center transition-all duration-300 hover:border-primary group cursor-pointer relative overflow-hidden bg-slate-50/20',
          isDragActive && 'border-primary bg-primary/5 scale-[1.01]'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 py-8">
          <AnimatePresence mode="wait">
            {file && uploadProgress === 100 ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <File className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-800">{file.name}</h3>
                <p className="text-sm text-emerald-600 font-bold flex items-center gap-1">
                  Ready for generation • {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setUploadProgress(null);
                  }}
                  className="mt-2 text-xs text-red-500 hover:underline font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Remove File
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </h3>
                <p className="text-sm text-slate-400 font-semibold">
                  Supports PDF, DOCX, and TXT up to 50MB
                </p>
                <div className="mt-4 px-6 py-2 border border-slate-200 rounded-full text-primary font-bold hover:bg-primary hover:text-white transition-colors text-xs">
                  Browse Files
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        {uploadProgress !== null && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
            <div
              className="h-full bg-[#0A99AB] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Configuration Card */}
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="bg-white rounded-[2rem] p-8 lg:p-12 shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <h2 className="text-xl font-black text-slate-800">Configuration Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quiz Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="quizTitle" className="font-bold text-xs text-slate-500 px-1">
              Quiz Title *
            </Label>
            <Input
              id="quizTitle"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="e.g. Modern Architecture Basics"
              {...register('quizTitle')}
            />
            {errors.quizTitle && (
              <p className="text-xs text-red-500">{errors.quizTitle.message}</p>
            )}
          </div>

          {/* Quiz Mode */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="quizMode" className="font-bold text-xs text-slate-500 px-1">
              Quiz Mode
            </Label>
            <div className="relative">
              <select
                id="quizMode"
                className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                {...register('quizMode')}
              >
                <option value="OVERALL">Overall Assessment</option>
                <option value="PER_QUESTION">Per Question</option>
              </select>
            </div>
          </div>

          {/* Description (Full Width) */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <Label htmlFor="quizDescription" className="font-bold text-xs text-slate-500 px-1">
              Quiz Description
            </Label>
            <Textarea
              id="quizDescription"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none text-sm"
              placeholder="Describe the focus of this quiz to help the AI refine questions..."
              rows={4}
              {...register('quizDescription')}
            />
          </div>

          {/* Timing Selector manual values */}
          <div className="md:col-span-2">
            <TimingSelector
              value={watch('timingPreference')}
              onChange={(v) => setValue('timingPreference', v)}
              manualSeconds={watch('manualTimerSeconds')}
              onManualSecondsChange={(v) => setValue('manualTimerSeconds', v)}
              disabledTimingModes={watch('quizMode') === 'PER_QUESTION' ? ['OVERALL'] : []}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
          <BrandButton
            type="submit"
            disabled={!file || uploadProgress !== 100}
            loading={mutation.isPending}
            className="primary-gradient text-white px-10 py-4 rounded-xl font-bold text-sm shadow-md flex items-center gap-3 transition-transform active:scale-95 group"
          >
            <span>Upload & Generate</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </BrandButton>
        </div>
      </form>

      {/* Decorative Grid items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-2">
          <Brain className="w-6 h-6 text-primary mb-2" />
          <h4 className="font-bold text-sm text-slate-800">Neural Analysis</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            AI reads context, diagrams, and formatting to create relevant questions and distractors.
          </p>
        </div>
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-2">
          <Languages className="w-6 h-6 text-primary mb-2" />
          <h4 className="font-bold text-sm text-slate-800">Multilingual Support</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Works with documents in over 30 languages with native curriculum alignment.
          </p>
        </div>
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-2">
          <ShieldCheck className="w-6 h-6 text-primary mb-2" />
          <h4 className="font-bold text-sm text-slate-800">High Accuracy</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Questions are automatically validated against educational standards (e.g. Bloom's Taxonomy).
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, X, FileText, Plus, Minus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { generationApi } from '../../api/generation.api';
import { BrandButton } from '../common/BrandButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { TimingSelector } from './TimingSelector';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import type { QuestionType, Difficulty } from '../../types/quiz.types';

const schema = z.object({
  quizTitle: z.string().min(1, 'Title is required').max(500),
  quizDescription: z.string().max(1000).optional(),
  questionTypes: z.array(z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER']))
    .min(1, 'Select at least one question type'),
  gradeLevel: z.string().min(1, 'Level is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'MIXED']),
  numberOfQuestions: z.number().min(1, 'Min 1').max(100, 'Max 100'),
  additionalNotes: z.string().max(2000).optional(),
  syllabusText: z.string().max(50000).optional(),
  timingPreference: z.enum(['NONE', 'PER_QUESTION', 'OVERALL', 'AI_SUGGESTED']),
  manualTimerSeconds: z.number().min(5).max(3600).optional(),
});

type FormData = z.infer<typeof schema>;

const QUESTION_TYPES: { id: QuestionType; label: string; desc: string }[] = [
  { id: 'MCQ', label: 'Multiple Choice', desc: '4 options, one correct' },
  { id: 'TRUE_FALSE', label: 'True / False', desc: 'Binary choice' },
  { id: 'SHORT_ANSWER', label: 'Short Answer', desc: 'Free text response' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'EASY', label: 'Easy', color: 'border-green-300 bg-green-50 text-green-700 data-[selected=true]:bg-green-500 data-[selected=true]:text-white data-[selected=true]:border-green-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-yellow-300 bg-yellow-50 text-yellow-700 data-[selected=true]:bg-yellow-500 data-[selected=true]:text-white data-[selected=true]:border-yellow-500' },
  { value: 'HARD', label: 'Hard', color: 'border-red-300 bg-red-50 text-red-700 data-[selected=true]:bg-red-500 data-[selected=true]:text-white data-[selected=true]:border-red-500' },
  { value: 'MIXED', label: 'Mixed', color: 'border-brand-300 bg-brand-50 text-brand-700 data-[selected=true]:bg-brand-500 data-[selected=true]:text-white data-[selected=true]:border-brand-500' },
];

export function SpecsForm({ onGenerating }: { onGenerating: (v: boolean) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [showSyllabus, setShowSyllabus] = useState(false);

  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      questionTypes: ['MCQ'],
      difficulty: 'MEDIUM',
      numberOfQuestions: 10,
      timingPreference: 'AI_SUGGESTED',
    },
  });

  const selectedTypes = watch('questionTypes') ?? [];
  const selectedDiff = watch('difficulty');
  const questionCount = watch('numberOfQuestions') ?? 10;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && setSyllabusFile(files[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const toggleType = (type: QuestionType) => {
    const current = selectedTypes;
    if (current.includes(type)) {
      if (current.length === 1) return; // must keep at least one
      setValue('questionTypes', current.filter(t => t !== type));
    } else {
      setValue('questionTypes', [...current, type]);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const formData = new FormData();

      const request = {
        quizTitle: data.quizTitle,
        quizDescription: data.quizDescription,
        questionTypes: data.questionTypes,
        gradeLevel: data.gradeLevel,
        difficulty: data.difficulty,
        numberOfQuestions: data.numberOfQuestions,
        additionalNotes: data.additionalNotes,
        syllabusText: data.syllabusText,
        timingPreference: data.timingPreference,
        manualTimerSeconds: data.manualTimerSeconds,
      };

      formData.append(
        'request',
        new Blob([JSON.stringify(request)], { type: 'application/json' })
      );

      if (syllabusFile) {
        formData.append('syllabusFile', syllabusFile);
      }

      return generationApi.fromSpecs(formData);
    },
    onMutate: () => onGenerating(true),
    onSuccess: (data) => {
      onGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: '✨ Quiz generated!', description: `"${data.quiz.title}" is ready.` });
      navigate('/quizzes');
    },
    onError: () => {
      onGenerating(false);
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    },
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Title & description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-muted-foreground">
              Basic Info
            </h3>
            <div className="space-y-1.5">
              <Label htmlFor="specsTitle">Quiz Title *</Label>
              <Input
                id="specsTitle"
                placeholder="e.g. Cell Biology — Chapter 4 Quiz"
                className="rounded-xl"
                {...register('quizTitle')}
              />
              {errors.quizTitle && <p className="text-xs text-red-500">{errors.quizTitle.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specsDesc">Description</Label>
              <Textarea
                id="specsDesc"
                placeholder="Optional description shown to students..."
                rows={2}
                className="rounded-xl resize-none"
                {...register('quizDescription')}
              />
            </div>
          </div>

          {/* Question types */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-muted-foreground">
              Question Types *
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_TYPES.map(({ id, label, desc }) => {
                const active = selectedTypes.includes(id);
                return (
                  <motion.button
                    key={id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleType(id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200',
                      active
                        ? 'border-brand-500 bg-brand-50 shadow-brand-sm'
                        : 'border-slate-100 hover:border-brand-200 hover:bg-brand-50/30'
                    )}
                  >
                    <span className={cn('text-xs font-bold', active ? 'text-brand-700' : 'text-slate-700')}>
                      {label}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
                  </motion.button>
                );
              })}
            </div>
            {errors.questionTypes && (
              <p className="text-xs text-red-500">{errors.questionTypes.message}</p>
            )}
          </div>

          {/* Grade & difficulty */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-muted-foreground">
              Level & Difficulty
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="gradeLevel">Level *</Label>
              <Input
                id="gradeLevel"
                placeholder="e.g. Grade 10, Undergraduate, etc."
                className="rounded-xl"
                {...register('gradeLevel')}
              />
              {errors.gradeLevel && <p className="text-xs text-red-500">{errors.gradeLevel.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <div className="grid grid-cols-4 gap-2">
                {DIFFICULTIES.map(({ value, label, color }) => (
                  <motion.button
                    key={value}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setValue('difficulty', value)}
                    data-selected={selectedDiff === value}
                    className={cn(
                      'py-2 rounded-xl border-2 text-xs font-bold transition-all duration-200',
                      color
                    )}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Question count */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-muted-foreground">
              Number of Questions
            </h3>
            <div className="flex items-center gap-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setValue('numberOfQuestions', Math.max(1, questionCount - 1))}
                className="w-10 h-10 rounded-xl border-2 border-slate-100 flex items-center justify-center hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                <Minus className="w-4 h-4 text-slate-600" />
              </motion.button>
              <div className="flex-1 text-center">
                <span className="text-5xl font-black text-brand-600 tabular-nums">
                  {questionCount}
                </span>
                <p className="text-xs text-muted-foreground mt-1">questions</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setValue('numberOfQuestions', Math.min(100, questionCount + 1))}
                className="w-10 h-10 rounded-xl border-2 border-slate-100 flex items-center justify-center hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </motion.button>
            </div>
            <input
              type="range"
              min={1} max={100} step={1}
              value={questionCount}
              onChange={e => setValue('numberOfQuestions', Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>

          {/* Additional notes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-muted-foreground">
              Additional Notes
            </h3>
            <Textarea
              placeholder="Any extra instructions for the AI... e.g. 'Focus on the nervous system', 'Include real-world examples', 'Avoid questions about dates'"
              rows={4}
              className="rounded-xl resize-none text-sm"
              {...register('additionalNotes')}
            />
          </div>

          {/* Syllabus / Curriculum (optional) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-muted-foreground">
                Syllabus / Curriculum
              </h3>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Providing a syllabus makes the AI generate questions specifically aligned to your curriculum.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSyllabus(false)}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all',
                  !showSyllabus
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-slate-100 text-slate-500 hover:border-slate-200'
                )}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setShowSyllabus(true)}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all',
                  showSyllabus
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-slate-100 text-slate-500 hover:border-slate-200'
                )}
              >
                Paste Text
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!showSyllabus ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {syllabusFile ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{syllabusFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(syllabusFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSyllabusFile(null)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={cn(
                        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
                        isDragActive
                          ? 'border-brand-400 bg-brand-50'
                          : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                      )}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        {isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX, DOC, TXT</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="paste"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Textarea
                    {...register('syllabusText')}
                    placeholder="Paste your syllabus or curriculum content here..."
                    rows={6}
                    className="rounded-xl resize-none text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timing */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <TimingSelector
              value={watch('timingPreference')}
              onChange={(v) => setValue('timingPreference', v)}
              manualSeconds={watch('manualTimerSeconds')}
              onManualSecondsChange={(v) => setValue('manualTimerSeconds', v)}
            />
          </div>

          <BrandButton
            type="submit"
            loading={mutation.isPending}
            icon={<Sparkles className="w-5 h-5" />}
            size="lg"
            className="w-full"
          >
            Generate {questionCount} Question{questionCount !== 1 ? 's' : ''}
          </BrandButton>
        </div>
      </div>
    </form>
  );
}

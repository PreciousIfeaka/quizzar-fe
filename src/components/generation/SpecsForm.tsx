import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Plus, Minus, Info, ArrowRight, CheckSquare, Square, Timer, Compass } from 'lucide-react';
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
  quizMode: z.enum(['OVERALL', 'PER_QUESTION']),
});

type FormData = z.infer<typeof schema>;

const QUESTION_TYPES: { id: QuestionType; label: string; desc: string }[] = [
  { id: 'MCQ', label: 'MCQ', desc: 'Multiple Choice' },
  { id: 'TRUE_FALSE', label: 'True/False', desc: 'Binary choice' },
  { id: 'SHORT_ANSWER', label: 'Short Answer', desc: 'Free text response' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'EASY', label: 'Easy', color: 'border-green-100 bg-green-50/50 text-green-700 data-[selected=true]:bg-green-600 data-[selected=true]:text-white data-[selected=true]:border-green-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-amber-100 bg-amber-50/50 text-amber-700 data-[selected=true]:bg-amber-500 data-[selected=true]:text-white data-[selected=true]:border-amber-500' },
  { value: 'HARD', label: 'Hard', color: 'border-red-100 bg-red-50/50 text-red-700 data-[selected=true]:bg-red-600 data-[selected=true]:text-white data-[selected=true]:border-red-600' },
  { value: 'MIXED', label: 'Mixed', color: 'border-[#00bcd4]/20 bg-[#00bcd4]/5 text-primary data-[selected=true]:bg-[#00bcd4] data-[selected=true]:text-white data-[selected=true]:border-[#00bcd4]' },
];

export function SpecsForm({ onGenerating }: { onGenerating: (v: boolean) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [showSyllabus, setShowSyllabus] = useState(false);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      questionTypes: ['MCQ'],
      difficulty: 'MEDIUM',
      numberOfQuestions: 10,
      timingPreference: 'AI_SUGGESTED',
      quizMode: 'OVERALL',
    },
  });

  const selectedTypes = watch('questionTypes') ?? [];
  const selectedDiff = watch('difficulty');
  const questionCount = watch('numberOfQuestions') ?? 10;
  const quizMode = watch('quizMode');
  const timingPreference = watch('timingPreference');
  useEffect(() => {
    if (quizMode === 'PER_QUESTION' && timingPreference === 'OVERALL') {
      setValue('timingPreference', 'PER_QUESTION');
    }
  }, [quizMode, timingPreference, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && setSyllabusFile(files[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
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
        quizMode: data.quizMode,
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
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-10">
      {/* 1. General Settings */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-1.5 h-full primary-gradient" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-headline-md text-lg font-black text-slate-800">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="quizTitle" className="font-bold text-xs text-slate-500 flex items-center gap-2">
              Quiz Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quizTitle"
              placeholder="e.g. Advanced Thermodynamics Final"
              className="w-full h-12 bg-slate-50/50 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              {...register('quizTitle')}
            />
            {errors.quizTitle && <p className="text-xs text-red-500 mt-1">{errors.quizTitle.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel" className="font-bold text-xs text-slate-500">Grade Level <span className="text-red-500">*</span></Label>
            <Input
              id="gradeLevel"
              placeholder="e.g. Undergraduate, 10th Grade"
              className="w-full h-12 bg-slate-50/50 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              {...register('gradeLevel')}
            />
            {errors.gradeLevel && <p className="text-xs text-red-500 mt-1">{errors.gradeLevel.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quizDescription" className="font-bold text-xs text-slate-500">Description</Label>
            <Textarea
              id="quizDescription"
              placeholder="Describe the purpose or learning objectives of this quiz..."
              rows={3}
              className="w-full bg-slate-50/50 p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all text-sm"
              {...register('quizDescription')}
            />
          </div>
        </div>
      </section>

      {/* 2. Question Mechanics */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-1.5 h-full primary-gradient" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-headline-md text-lg font-black text-slate-800">Question Mechanics</h3>
        </div>
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="font-bold text-xs text-slate-500">Question Types (Multi-select)</Label>
            <div className="flex flex-wrap gap-3">
              {QUESTION_TYPES.map(({ id, label }) => {
                const active = selectedTypes.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleType(id)}
                    className={cn(
                      'px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 transition-all font-bold text-xs flex items-center gap-2',
                      active ? 'bg-primary border-primary text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
                    )}
                  >
                    {active ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {errors.questionTypes && (
              <p className="text-xs text-red-500 mt-1">{errors.questionTypes.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="font-bold text-xs text-slate-500">Difficulty Level</Label>
              <div className="grid grid-cols-4 gap-2">
                {DIFFICULTIES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('difficulty', value)}
                    data-selected={selectedDiff === value}
                    className={cn(
                      'py-3 rounded-xl border border-slate-200 text-xs font-bold transition-all duration-200',
                      color
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-xs text-slate-500">Number of Questions</Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setValue('numberOfQuestions', Math.max(1, questionCount - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-black text-slate-800 tabular-nums">
                    {questionCount}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">questions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('numberOfQuestions', Math.min(100, questionCount + 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={questionCount}
                onChange={e => setValue('numberOfQuestions', Number(e.target.value))}
                className="w-full accent-primary mt-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Knowledge Source */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-1.5 h-full primary-gradient" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-headline-md text-lg font-black text-slate-800">Knowledge Source</h3>
        </div>
        <div className="space-y-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowSyllabus(false)}
              className={cn(
                'flex-1 py-3 text-xs font-bold rounded-xl border transition-all',
                !showSyllabus
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}
            >
              Upload Syllabus File
            </button>
            <button
              type="button"
              onClick={() => setShowSyllabus(true)}
              className={cn(
                'flex-1 py-3 text-xs font-bold rounded-xl border transition-all',
                showSyllabus
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}
            >
              Paste Syllabus Text
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
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{syllabusFile.name}</p>
                      <p className="text-xs text-slate-400">{(syllabusFile.size / 1024).toFixed(0)} KB</p>
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
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 bg-slate-50/20',
                      isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40'
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">
                      {isDragActive ? 'Drop file here' : 'Drop syllabus file here or browse'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF or DOCX up to 10MB</p>
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
                  placeholder="Paste chapter content, syllabus requirements, or learning notes here..."
                  rows={6}
                  className="w-full bg-slate-50/50 p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md resize-none transition-all text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Quiz Delivery */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-1.5 h-full primary-gradient" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h3 className="font-headline-md text-lg font-black text-slate-800">Quiz Delivery</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="font-bold text-xs text-slate-500">Quiz Mode</Label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="OVERALL"
                  className="peer sr-only"
                  {...register('quizMode')}
                />
                <div className="p-4 rounded-xl border border-slate-200 peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center text-center transition-all">
                  <Compass className="w-5 h-5 mb-2 text-primary" />
                  <p className="font-bold text-xs text-slate-700">Practice (Full List)</p>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="PER_QUESTION"
                  className="peer sr-only"
                  {...register('quizMode')}
                />
                <div className="p-4 rounded-xl border border-slate-200 peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center text-center transition-all">
                  <Timer className="w-5 h-5 mb-2 text-primary" />
                  <p className="font-bold text-xs text-slate-700">Timed (Instant Feedback)</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <TimingSelector
              value={watch('timingPreference')}
              onChange={(v) => setValue('timingPreference', v)}
              manualSeconds={watch('manualTimerSeconds')}
              onManualSecondsChange={(v) => setValue('manualTimerSeconds', v)}
              disabledTimingModes={quizMode === 'PER_QUESTION' ? ['OVERALL'] : []}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes" className="font-bold text-xs text-slate-500">
              Additional Notes / Custom Instructions
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. Focus on Newtonian physics, exclude relativistic concepts..."
              rows={2}
              className="w-full bg-slate-50/50 p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm resize-none transition-all"
              {...register('additionalNotes')}
            />
          </div>
        </div>
      </section>

      {/* Form Action */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-slate-500">
          <Info className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm font-semibold">
            Estimated Generation Time: <span className="font-bold text-slate-700">~45 seconds</span>
          </p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="px-8 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm"
          >
            Cancel
          </button>
          <BrandButton
            type="submit"
            loading={mutation.isPending}
            className="primary-gradient px-12 py-3.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center gap-3 transition-transform active:scale-95"
          >
            <span>Generate Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </BrandButton>
        </div>
      </div>
    </form>
  );
}

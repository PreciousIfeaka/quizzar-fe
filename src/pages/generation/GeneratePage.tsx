import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, ChevronRight, ArrowLeft, ArrowRight, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { quizApi } from '@/api/quiz.api';
import { AnimatedPage } from '@/components/common/AnimatedPage';
import { UploadDropzone } from '@/components/generation/UploadDropzone';
import { PasteEditor } from '@/components/generation/PasteEditor';
import { SpecsForm } from '@/components/generation/SpecsForm';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import { formatDate } from '@/lib/utils';
import { slideInRight, staggerContainer } from '@/lib/motion';
import { useNavigate } from 'react-router-dom';

type GenerationMode = 'hub' | 'paste' | 'upload' | 'specs';

export default function GeneratePage() {
  const [mode, setMode] = useState<GenerationMode>('hub');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const { data: quizzesData } = useQuery({
    queryKey: ['quizzes', 0, 5],
    queryFn: () => quizApi.getAll(0, 5),
    enabled: mode === 'hub',
  });

  const recentQuizzes = quizzesData?.content ?? [];

  return (
    <AnimatedPage>
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GenerationProgress />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={isGenerating ? 'hidden' : ''}>
        {mode !== 'hub' && (
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <button
                onClick={() => setMode('hub')}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">
                {mode === 'paste'
                  ? 'Generate from Paste'
                  : mode === 'upload'
                    ? 'Generate from Upload'
                    : 'Generate from Specs'}
              </span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div
              key="hub"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Hero Section for Hub */}
              <div className="max-w-3xl mb-16">
                <div className="inline-flex items-center gap-2 bg-[#00bcd4]/10 border border-[#00bcd4]/20 px-4 py-1.5 rounded-full text-primary mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="font-extrabold text-[10px] tracking-wider uppercase">
                    AI-POWERED QUIZ PLATFORM
                  </span>
                </div>
                <h1 className="font-headline-lg text-4xl font-black text-slate-900 mb-6 leading-tight">
                  Generate Smart Quizzes,
                  <br />
                  <span className="primary-gradient text-white px-4 py-1.5 inline-block mt-2 rounded-xl text-3xl font-black shadow-sm">
                    Step-by-Step
                  </span>
                </h1>
                <p className="font-body-lg text-slate-500 leading-relaxed">
                  Empower your classroom with precision-engineered quizzes. Choose your creation method and let our AI handle the complex formatting while you focus on teaching.
                </p>
              </div>

              {/* Bento Grid for Quiz Creation Modes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {/* Paste Text Card */}
                <div className="group relative bg-white rounded-3xl p-8 border border-slate-100 custom-shadow-interactive">
                  <div className="absolute top-6 right-6">
                    <div className="step-indicator">1</div>
                  </div>
                  <div className="mb-8 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Paste Text</h3>
                  <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                    Simply copy and paste your lecture notes, textbook chapters, or article text. Our AI will extract key concepts automatically.
                  </p>
                  <button
                    onClick={() => setMode('paste')}
                    className="w-full btn-gradient text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 group/btn"
                  >
                    Start Generating
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Upload Document Card */}
                <div className="group relative bg-white rounded-3xl p-8 border border-slate-100 custom-shadow-interactive">
                  <div className="absolute top-6 right-6">
                    <div className="step-indicator">2</div>
                  </div>
                  <div className="mb-8 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Upload Document</h3>
                  <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                    Upload PDFs, Word docs, or PowerPoint slides. We'll scan the entire file to generate comprehensive multi-topic quizzes.
                  </p>
                  <button
                    onClick={() => setMode('upload')}
                    className="w-full btn-gradient text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 group/btn"
                  >
                    Start Generating
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Manual Specs Card */}
                <div className="group relative bg-white rounded-3xl p-8 border border-slate-100 custom-shadow-interactive">
                  <div className="absolute top-6 right-6">
                    <div className="step-indicator">3</div>
                  </div>
                  <div className="mb-8 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Manual Specs</h3>
                  <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                    Define specific topics, difficulty levels, and question types. Perfect for curriculum-aligned exams and custom tests.
                  </p>
                  <button
                    onClick={() => setMode('specs')}
                    className="w-full btn-gradient text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 group/btn"
                  >
                    Start Generating
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Recent Generation Activity */}
              <section className="mt-20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> Recent Activity
                  </h2>
                  <button
                    onClick={() => navigate('/quizzes')}
                    className="text-primary font-bold text-xs uppercase hover:underline"
                  >
                    View All History
                  </button>
                </div>
                <div className="space-y-4">
                  {recentQuizzes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                      No recent activity found.
                    </div>
                  ) : (
                    recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group cursor-pointer shadow-[0px_2px_8px_rgba(0,0,0,0.02)]"
                      >
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {quiz.questionCount} Questions • Code: {quiz.quizCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100">
                            PUBLISHED
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(quiz.createdAt)}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {mode === 'paste' && (
            <motion.div key="paste" variants={slideInRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Generate from Paste</h1>
                <p className="text-muted-foreground mt-1">
                  Paste your lecture notes, textbook chapters, or article text to transform them into interactive quizzes.
                </p>
              </div>
              <PasteEditor onGenerating={setIsGenerating} />
            </motion.div>
          )}

          {mode === 'upload' && (
            <motion.div key="upload" variants={slideInRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Generate from Upload</h1>
                <p className="text-muted-foreground mt-1">
                  Upload PDFs, Word docs, or PowerPoint slides for AI analysis.
                </p>
              </div>
              <UploadDropzone onGenerating={setIsGenerating} />
            </motion.div>
          )}

          {mode === 'specs' && (
            <motion.div key="specs" variants={slideInRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Generate from Specs</h1>
                <p className="text-muted-foreground mt-1">
                  Define specific topics, difficulty levels, and question types to craft a high-performance assessment.
                </p>
              </div>
              <SpecsForm onGenerating={setIsGenerating} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}

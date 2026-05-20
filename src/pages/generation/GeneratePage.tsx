import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { AnimatedPage } from '@/components/common/AnimatedPage';
import { GenerationModeSelector } from '@/components/generation/GenerationModeSelector';
import { UploadDropzone } from '@/components/generation/UploadDropzone';
import { PasteEditor } from '@/components/generation/PasteEditor';
import { SpecsForm } from '@/components/generation/SpecsForm';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import type { GenerationMode } from '@/types/generation.types';
import { slideInRight } from '@/lib/motion';

const modes = [
  { id: 'upload' as GenerationMode, icon: Upload, label: 'Upload File', desc: 'Extract from PDF, Word, or text' },
  { id: 'paste' as GenerationMode, icon: FileText, label: 'Paste Content', desc: 'Format raw question text' },
  { id: 'specs' as GenerationMode, icon: Sparkles, label: 'AI Generate', desc: 'Create from your specifications' },
];

export default function GeneratePage() {
  const [mode, setMode] = useState<GenerationMode>('specs');
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <AnimatedPage>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Generate Quiz</h1>
        <p className="text-muted-foreground mt-1">Choose a method to create your quiz with AI</p>
      </div>

      {!isGenerating ? (
        <>
          <GenerationModeSelector modes={modes} selected={mode} onSelect={setMode} />
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-8"
            >
              {mode === 'upload' && <UploadDropzone onGenerating={setIsGenerating} />}
              {mode === 'paste' && <PasteEditor onGenerating={setIsGenerating} />}
              {mode === 'specs' && <SpecsForm onGenerating={setIsGenerating} />}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <GenerationProgress />
      )}
    </AnimatedPage>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { buildPublicQuizUrl, copyToClipboard } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface QuizLinkPanelProps {
  quizId: string;
  quizCode: string;
}

export function QuizLinkPanel({ quizId, quizCode: initialCode }: QuizLinkPanelProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState(initialCode);

  const publicUrl = buildPublicQuizUrl(currentCode);

  const regenMutation = useMutation({
    mutationFn: () => quizApi.regenerateCode(quizId),
    onSuccess: (data) => {
      setCurrentCode(data.quizCode);
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Link regenerated', description: 'The old link is now invalid.' });
      setRegenOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to regenerate link', variant: 'destructive' });
    },
  });

  const handleCopy = async () => {
    await copyToClipboard(publicUrl);
    setCopied(true);
    toast({ title: 'Link copied!', description: 'Share this link with your students.' });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-brand-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Public Quiz Link</h3>
        </div>

        {/* URL display */}
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 group">
          <p className="text-xs text-slate-600 font-mono flex-1 truncate">{publicUrl}</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-[#0a99ab] transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Copy button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a99ab]/5 border border-[#0a99ab]/10 text-[#0a99ab] text-sm font-semibold hover:bg-[#0a99ab]/10 transition-all"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Regenerate */}
        <button
          onClick={() => setRegenOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-red-500 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate link (invalidates current)
        </button>
      </div>

      <ConfirmDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        title="Regenerate Quiz Link"
        description="This will create a new link and permanently invalidate the current one. Anyone with the old link will no longer be able to access this quiz."
        onConfirm={() => regenMutation.mutate()}
        loading={regenMutation.isPending}
        variant="danger"
      />
    </>
  );
}

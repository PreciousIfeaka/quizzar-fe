import { motion } from 'framer-motion';
import { Sparkles, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { formatSeconds } from '../../lib/utils';

interface AiSuggestionBadgeProps {
  suggestedMode:    string;
  suggestedSeconds: number;
  reasoning:        string;
}

export function AiSuggestionBadge({
  suggestedMode, suggestedSeconds, reasoning
}: AiSuggestionBadgeProps) {
  if (!suggestedMode || suggestedMode === 'NONE') return null;

  const label = suggestedMode === 'PER_QUESTION'
    ? `${formatSeconds(suggestedSeconds)} per question`
    : suggestedMode === 'OVERALL'
      ? `${formatSeconds(suggestedSeconds)} total`
      : 'No timing';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-2 rounded-xl"
    >
      <Sparkles className="w-3.5 h-3.5 text-[#00bcd4]" />
      <Clock className="w-3.5 h-3.5" />
      <span>AI suggested: {label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-cyan-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs text-xs leading-relaxed rounded-xl"
          >
            {reasoning}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

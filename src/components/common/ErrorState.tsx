import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BrandButton } from './BrandButton';

interface ErrorStateProps {
  title?:       string;
  description?: string;
  onRetry?:     () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      {onRetry && (
        <BrandButton
          variant="secondary"
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </BrandButton>
      )}
    </motion.div>
  );
}

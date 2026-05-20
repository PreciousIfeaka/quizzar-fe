import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { BrandButton } from './BrandButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center mb-5 animate-float">
        <Icon className="w-9 h-9 text-brand-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      {action && (
        <BrandButton onClick={action.onClick}>{action.label}</BrandButton>
      )}
    </motion.div>
  );
}

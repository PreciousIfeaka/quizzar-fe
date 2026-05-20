import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { cardHover } from '../../lib/motion';

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: 'brand' | 'energy' | 'success' | 'none';
  onClick?: () => void;
}

const gradients = {
  brand: 'before:from-brand-500/10 before:to-accent-500/10',
  energy: 'before:from-energy-500/10 before:to-red-500/10',
  success: 'before:from-green-500/10 before:to-emerald-500/10',
  none: '',
};

export function GradientCard({
  children, className, hoverable = false, gradient = 'none', onClick
}: GradientCardProps) {
  return (
    <motion.div
      variants={hoverable ? cardHover : undefined}
      initial={hoverable ? 'rest' : undefined}
      whileHover={hoverable ? 'hover' : undefined}
      animate={hoverable ? 'rest' : undefined}
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden',
        hoverable && 'cursor-pointer',
        gradient !== 'none' && [
          'before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-100 before:pointer-events-none',
          gradients[gradient],
        ],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

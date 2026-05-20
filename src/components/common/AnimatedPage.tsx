import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';
import type { ReactNode } from 'react';

export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

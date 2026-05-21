import { motion } from 'framer-motion';

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 bg-[#1a0926] rounded-full overflow-hidden border border-[#c97dff]/10">
      <motion.div
        className="h-full bg-gradient-brand rounded-full shadow-[0_0_10px_rgba(201,125,255,0.4)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

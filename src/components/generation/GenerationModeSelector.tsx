import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { GenerationMode } from '../../types/generation.types';
import { cn } from '../../lib/utils';

interface Mode {
  id: GenerationMode;
  icon: LucideIcon;
  label: string;
  desc: string;
}

export function GenerationModeSelector({
  modes, selected, onSelect
}: {
  modes: Mode[];
  selected: GenerationMode;
  onSelect: (m: GenerationMode) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {modes.map(({ id, icon: Icon, label, desc }) => {
        const active = selected === id;
        return (
          <motion.button
            key={id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(id)}
            className={cn(
              'relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 text-center',
              active
                ? 'border-[#00bcd4] bg-[#00bcd4]/5 shadow-brand-sm'
                : 'border-slate-100 bg-white hover:border-[#00bcd4]/30 hover:bg-[#00bcd4]/5'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
              active ? 'bg-[#00bcd4] shadow-brand-md' : 'bg-slate-100'
            )}>
              <Icon className={cn('w-6 h-6 transition-colors duration-200', active ? 'text-white' : 'text-slate-500')} />
            </div>
            <div>
              <p className={cn('font-bold text-sm transition-colors duration-200', active ? 'text-[#00bcd4]' : 'text-slate-700')}>
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            {active && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#00bcd4]"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

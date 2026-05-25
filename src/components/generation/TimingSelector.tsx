import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Timer, Ban } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import type { TimingPreference } from '../../types/generation.types';

interface TimingSelectorProps {
  value: TimingPreference;
  onChange: (v: TimingPreference) => void;
  manualSeconds?: number;
  onManualSecondsChange: (v: number | undefined) => void;
  disabledTimingModes?: TimingPreference[];
}

const OPTIONS: {
  id: TimingPreference; label: string; desc: string; icon: typeof Clock
}[] = [
    { id: 'AI_SUGGESTED', label: 'AI Suggested', desc: 'Let AI pick the best timing', icon: Zap },
    { id: 'PER_QUESTION', label: 'Per Question', desc: 'Timer resets each question', icon: Timer },
    { id: 'OVERALL', label: 'Overall', desc: 'Single timer for whole quiz', icon: Clock },
    { id: 'NONE', label: 'No Timer', desc: 'Untimed quiz', icon: Ban },
  ];

export function TimingSelector({
  value, onChange, manualSeconds, onManualSecondsChange, disabledTimingModes = []
}: TimingSelectorProps) {
  const needsManual = value === 'PER_QUESTION' || value === 'OVERALL';

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Timing Setting</Label>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(({ id, label, desc, icon: Icon }) => {
          const active = value === id;
          const disabled = disabledTimingModes.includes(id);
          return (
            <motion.button
              key={id}
              type="button"
              disabled={disabled}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              onClick={() => {
                if (disabled) return;
                onChange(id);
                if (id !== 'PER_QUESTION' && id !== 'OVERALL') {
                  onManualSecondsChange(undefined);
                }
              }}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200',
                active
                  ? 'border-[#00bcd4] bg-[#00bcd4]/5 shadow-brand-sm'
                  : 'border-slate-100 hover:border-[#00bcd4]/30 hover:bg-slate-50',
                disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                active ? 'bg-[#00bcd4] shadow-brand-md' : 'bg-slate-100',
                disabled && 'bg-slate-50'
              )}>
                <Icon className={cn('w-4 h-4 transition-colors duration-200', active ? 'text-white' : 'text-slate-300')} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-xs font-bold truncate transition-colors duration-200', active ? 'text-[#00bcd4]' : 'text-slate-700', disabled && 'text-slate-400')}>
                  {label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">{desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {disabledTimingModes.includes('OVERALL') && (
        <p className="text-[11px] text-amber-600 font-medium leading-relaxed mt-1.5 flex items-center gap-1">
          ⚠️ Overall timing is unavailable in Instant Feedback mode.
        </p>
      )}

      {/* Manual timer input — shown only when PER_QUESTION or OVERALL */}
      <AnimatePresence>
        {needsManual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1.5">
              <Label htmlFor="manualTimer" className="text-xs text-muted-foreground">
                {value === 'PER_QUESTION' ? 'Seconds per question' : 'Total quiz duration (seconds)'}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="manualTimer"
                  type="number"
                  min={5}
                  max={3600}
                  value={manualSeconds ?? ''}
                  onChange={e => onManualSecondsChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )}
                  placeholder={value === 'PER_QUESTION' ? 'e.g. 30' : 'e.g. 600'}
                  className="rounded-xl"
                />
                <span className="text-sm text-muted-foreground flex-shrink-0">seconds</span>
              </div>
              {manualSeconds && (
                <p className="text-xs text-muted-foreground">
                  = {Math.floor(manualSeconds / 60)}m {manualSeconds % 60}s
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: 'brand' | 'accent' | 'energy' | 'success';
}

const colors = {
  brand: { bg: 'bg-brand-50', icon: 'text-brand-600', ring: 'ring-brand-100/50' },
  accent: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100/50' },
  energy: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100/50' },
  success: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100/50' },
};

export function StatCard({ label, value, icon: Icon, trend, color = 'brand' }: StatCardProps) {
  const c = colors[color];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100/60 shadow-md p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
          {trend && (
            <p className={cn('text-xs font-semibold mt-2 flex items-center gap-1', trend.positive ? 'text-emerald-500' : 'text-red-500')}>
              <span className="text-sm">{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl border border-transparent transition-colors duration-200', c.bg, c.ring)}>
          <Icon className={cn('w-5 h-5', c.icon)} />
        </div>
      </div>
    </motion.div>
  );
}

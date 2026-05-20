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
  brand: { bg: 'bg-brand-100', icon: 'text-brand-600', ring: 'ring-brand-200' },
  accent: { bg: 'bg-purple-100', icon: 'text-purple-600', ring: 'ring-purple-200' },
  energy: { bg: 'bg-orange-100', icon: 'text-orange-600', ring: 'ring-orange-200' },
  success: { bg: 'bg-green-100', icon: 'text-green-600', ring: 'ring-green-200' },
};

export function StatCard({ label, value, icon: Icon, trend, color = 'brand' }: StatCardProps) {
  const c = colors[color];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-red-500')}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl ring-1', c.bg, c.ring)}>
          <Icon className={cn('w-5 h-5', c.icon)} />
        </div>
      </div>
    </motion.div>
  );
}

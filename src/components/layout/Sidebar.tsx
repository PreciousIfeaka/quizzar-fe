import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Sparkles, Settings, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quizzes', label: 'My Quizzes', icon: BookOpen },
  { to: '/generate', label: 'Generate', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -256, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -256, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-100 z-40 overflow-y-auto"
        >
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Menu
            </p>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#00bcd4]/10 text-primary font-bold border-l-4 border-primary pl-2'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-slate-500')} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-50">
            <NavLink
              to="/generate"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl primary-gradient text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Quiz
            </NavLink>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

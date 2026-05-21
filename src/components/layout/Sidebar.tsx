import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quizzes', label: 'My Quizzes', icon: BookOpen },
  { to: '/generate', label: 'Generate', icon: Sparkles },
];

export function Sidebar({ open }: { open: boolean }) {
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
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-500')} />
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <NavLink
              to="/generate"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-brand-md hover:shadow-brand-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              New Quiz
            </NavLink>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

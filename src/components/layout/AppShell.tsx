import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function AppShell() {
  // Start closed on mobile (< md), open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();

  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background grid-pattern text-slate-800 antialiased">
      <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          'flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]',
          sidebarOpen ? 'md:ml-64' : 'ml-0'
        )}>
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#EEF2FF]">
      <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />
      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} />
        <main className={cn(
          'flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}>
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { Toaster } from './components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  useAuth();

  return (
    <>
      <Analytics />
      <AppRouter />
      <Toaster />
    </>
  );
}

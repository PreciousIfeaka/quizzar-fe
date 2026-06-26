import { useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { Toaster } from './components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { FeedbackButton } from './components/common/FeedbackButton';

export default function App() {
  useAuth();

  return (
    <>
      <Analytics />
      <AppRouter />
      <Toaster />
      <FeedbackButton />
    </>
  );
}

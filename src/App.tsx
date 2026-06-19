import { useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { Toaster } from './components/ui/toaster';

export default function App() {
  useAuth(); // Initialize and validate local JWT session on startup

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

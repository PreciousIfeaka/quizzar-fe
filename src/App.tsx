import { useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Toaster } from './components/ui/toaster';

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center animate-float shadow-brand-lg">
            {/* QuizzarLogo icon */}
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <LoadingSpinner size="md" />
          <p className="text-muted-foreground text-sm">Loading Quizzar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

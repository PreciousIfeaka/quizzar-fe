import { useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { Toaster } from './components/ui/toaster';

export default function App() {
  useAuth(); // Start Keycloak SSO check in the background

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

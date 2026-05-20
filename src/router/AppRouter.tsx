import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import QuizzesPage from '../pages/quiz/QuizzesPage';
import QuizDetailPage from '../pages/quiz/QuizDetailPage';
import QuizAnalyticsPage from '../pages/quiz/QuizAnalyticsPage';
import GeneratePage from '../pages/generation/GeneratePage';
import PublicQuizLandingPage from '../pages/public/PublicQuizLandingPage';
import PublicQuizSessionPage from '../pages/public/PublicQuizSessionPage';
import PublicQuizResultPage from '../pages/public/PublicQuizResultPage';
import NotFoundPage from '../pages/NotFoundPage';
import { AppShell } from '../components/layout/AppShell';

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz/:quizCode" element={<PublicQuizLandingPage />} />
        <Route path="/quiz/:quizCode/session" element={<PublicQuizSessionPage />} />
        <Route path="/quiz/:quizCode/result" element={<PublicQuizResultPage />} />

        {/* Protected routes — wrapped in AppShell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:id" element={<QuizDetailPage />} />
            <Route path="/quizzes/:id/analytics" element={<QuizAnalyticsPage />} />
            <Route path="/generate" element={<GeneratePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

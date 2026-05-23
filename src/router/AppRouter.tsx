import { Routes, Route } from 'react-router-dom';
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
import { PageTransition } from '../components/common/PageTransition';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/quiz/:quizCode" element={<PageTransition><PublicQuizLandingPage /></PageTransition>} />
      <Route path="/quiz/:quizCode/session" element={<PageTransition><PublicQuizSessionPage /></PageTransition>} />
      <Route path="/quiz/:quizCode/result" element={<PageTransition><PublicQuizResultPage /></PageTransition>} />

      {/* Protected routes — wrapped in AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/quizzes" element={<PageTransition><QuizzesPage /></PageTransition>} />
          <Route path="/quizzes/:id" element={<PageTransition><QuizDetailPage /></PageTransition>} />
          <Route path="/quizzes/:id/analytics" element={<PageTransition><QuizAnalyticsPage /></PageTransition>} />
          <Route path="/generate" element={<PageTransition><GeneratePage /></PageTransition>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

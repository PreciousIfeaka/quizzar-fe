import api from '../lib/axios';
import type { QuizAnalytics, SummaryAnalytics } from '../types/analytics.types';
import type { QuizResult } from '../types/session.types';

export const analyticsApi = {
  getQuizAnalytics: (quizId: string): Promise<QuizAnalytics> =>
    api.get(`/api/v1/analytics/quizzes/${quizId}`).then(r => r.data.data),

  getSummary: (): Promise<SummaryAnalytics> =>
    api.get('/api/v1/analytics/summary').then(r => r.data.data),

  getSessionResults: (sessionId: string): Promise<QuizResult> =>
    api.get(`/api/v1/analytics/sessions/${sessionId}/results`).then(r => r.data.data),
};

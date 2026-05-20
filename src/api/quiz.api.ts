import api from '../lib/axios';
import type { PageResponse, Quiz, QuizSummary, UpdateQuizRequest } from '../types/quiz.types';

export const quizApi = {
  getAll: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'):
    Promise<PageResponse<QuizSummary>> =>
    api.get('/api/v1/quizzes', { params: { page, size, sortBy, sortDir } })
      .then(r => r.data.data),

  getById: (id: string): Promise<Quiz> =>
    api.get(`/api/v1/quizzes/${id}`).then(r => r.data.data),

  getLink: (id: string): Promise<{ quizCode: string; publicUrl: string }> =>
    api.get(`/api/v1/quizzes/${id}/link`).then(r => r.data.data),

  update: (id: string, data: UpdateQuizRequest): Promise<Quiz> =>
    api.patch(`/api/v1/quizzes/${id}`, data).then(r => r.data.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/quizzes/${id}`).then(() => undefined),

  regenerateCode: (id: string): Promise<{ quizCode: string; publicUrl: string }> =>
    api.post(`/api/v1/quizzes/${id}/regenerate-code`).then(r => r.data.data),
};

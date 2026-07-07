import api from '../lib/axios';
import type {
  PageResponse,
  Quiz,
  QuizSummary,
  UpdateQuizRequest,
  Question,
  AddQuestionRequest,
  UpdateQuestionRequest,
  UpdateQuizScheduleRequest,
} from '../types/quiz.types';

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

  clone: (id: string): Promise<Quiz> =>
    api.post(`/api/v1/quizzes/${id}/clone`).then(r => r.data.data),

  regenerateCode: (id: string): Promise<{ quizCode: string; publicUrl: string }> =>
    api.post(`/api/v1/quizzes/${id}/regenerate-code`).then(r => r.data.data),

  addQuestion: (quizId: string, data: AddQuestionRequest): Promise<Question> =>
    api.post(`/api/v1/quizzes/${quizId}/questions`, data).then(r => r.data.data),

  updateQuestion: (quizId: string, questionId: string, data: UpdateQuestionRequest): Promise<Question> =>
    api.patch(`/api/v1/quizzes/${quizId}/questions/${questionId}`, data).then(r => r.data.data),

  deleteQuestion: (quizId: string, questionId: string): Promise<void> =>
    api.delete(`/api/v1/quizzes/${quizId}/questions/${questionId}`).then(() => undefined),

  reorderQuestions: (quizId: string, orderedQuestionIds: string[]): Promise<Question[]> =>
    api.patch(`/api/v1/quizzes/${quizId}/questions/reorder`, { orderedQuestionIds }).then(r => r.data.data),

  updateSchedule: (quizId: string, data: UpdateQuizScheduleRequest): Promise<Quiz> =>
    api.patch(`/api/v1/quizzes/${quizId}/schedule`, data).then(r => r.data.data),

  exportResultsPdf: (quizId: string): Promise<Blob> =>
    api.get(`/api/v1/quizzes/${quizId}/results/export/pdf`, { responseType: 'blob' })
      .then(r => r.data),
};

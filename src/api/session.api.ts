import { publicApi } from '../lib/axios';
import type { PublicQuiz, QuizResult, StartSessionRequest, StartSessionResponse, SubmitAnswersRequest, SubmitAnswerRequest, QuestionResultResponse } from '../types/session.types';

export const sessionApi = {
  getPublicQuiz: (quizCode: string): Promise<PublicQuiz> =>
    publicApi.get(`/public/quiz/${quizCode}`).then(r => r.data.data),

  startSession: (quizCode: string, data: StartSessionRequest): Promise<StartSessionResponse> =>
    publicApi.post(`/public/quiz/${quizCode}/start`, data).then(r => r.data.data),

  submitAnswers: (quizCode: string, sessionId: string, data: SubmitAnswersRequest): Promise<QuizResult> =>
    publicApi.post(`/public/quiz/${quizCode}/sessions/${sessionId}/submit`, data)
      .then(r => r.data.data),

  submitSingleAnswer: (quizCode: string, sessionId: string, data: SubmitAnswerRequest): Promise<QuestionResultResponse> =>
    publicApi.post(`/public/quiz/${quizCode}/sessions/${sessionId}/submit-answer`, data)
      .then(r => r.data.data),

  completeSession: (quizCode: string, sessionId: string): Promise<QuizResult> =>
    publicApi.post(`/public/quiz/${quizCode}/sessions/${sessionId}/complete`)
      .then(r => r.data.data),

  getSessionResults: (quizCode: string, sessionId: string): Promise<QuizResult> =>
    publicApi.get(`/public/quiz/${quizCode}/sessions/${sessionId}/results`)
      .then(r => r.data.data),
};

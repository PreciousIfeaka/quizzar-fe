import type { Question, TimingMode } from './quiz.types';

export interface PublicQuiz {
  id: string;
  title: string;
  description?: string;
  timingMode: TimingMode;
  timerValueSeconds?: number;
  questions: Question[];  // no correct answers
}

export interface StartSessionRequest {
  studentName: string;
}

export interface StartSessionResponse {
  sessionId: string;
  timingMode: TimingMode;
  timerValueSeconds?: number;
}

export interface AnswerSubmission {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  timeTakenSeconds?: number;
}

export interface SubmitAnswersRequest {
  answers: AnswerSubmission[];
}

export interface DetailedSessionAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  selectedOptionLabel?: string;
  selectedOptionText?: string;
  selectedAnswerText?: string;
  correctOptionLabel?: string;
  correctOptionText?: string;
  correctShortAnswerKeys?: string[];
  pointsEarned: number;
  maxPoints: number;
  correct: boolean;
}

export interface QuizResult {
  sessionId: string;
  quizId: string;
  studentName: string;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  passed: boolean;
  completedAt: string;
  details?: DetailedSessionAnswer[];
}

export type TimingMode = 'NONE' | 'PER_QUESTION' | 'OVERALL' | 'AI_SUGGESTED';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';

export interface AnswerOption {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  options: AnswerOption[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  quizCode: string;
  timingMode: TimingMode;
  timerValueSeconds?: number;
  aiSuggestedTimeSeconds?: number;
  aiSuggestedTimingMode?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizSummary {
  id: string;
  title: string;
  description?: string;
  quizCode: string;
  questionCount: number;
  timingMode?: TimingMode;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  timingMode?: TimingMode;
  timerValueSeconds?: number;
}

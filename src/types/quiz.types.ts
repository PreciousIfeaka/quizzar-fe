export type TimingMode = 'NONE' | 'PER_QUESTION' | 'OVERALL' | 'AI_SUGGESTED';
export type QuizMode = 'OVERALL' | 'PER_QUESTION';
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
  acceptedAnswers?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  quizCode: string;
  timingMode: TimingMode;
  quizMode: QuizMode;
  timerValueSeconds?: number;
  aiSuggestedTimeSeconds?: number;
  aiSuggestedTimingMode?: string;
  questions: Question[];
  scheduledOpenAt: string | null;
  scheduledCloseAt: string | null;
  status: 'DRAFT' | 'PUBLISHED';
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
  quizMode?: QuizMode;
  scheduledOpenAt: string | null;
  scheduledCloseAt: string | null;
  status: 'DRAFT' | 'PUBLISHED';
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
  quizMode?: QuizMode;
  timerValueSeconds?: number;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface AddQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  points?: number;
  options?: {
    label: string;
    optionText: string;
    isCorrect: boolean;
  }[];
  acceptedAnswers?: string[];
}

export interface UpdateQuestionRequest {
  questionText?: string;
  questionType?: QuestionType;
  points?: number;
  options?: {
    id?: string;
    label: string;
    optionText: string;
    isCorrect: boolean;
  }[];
  acceptedAnswers?: string[];
}

export interface UpdateQuizScheduleRequest {
  scheduledOpenAt: string | null;
  scheduledCloseAt: string | null;
}

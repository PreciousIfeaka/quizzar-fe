import type { Difficulty, QuestionType, TimingMode, QuizMode } from "./quiz.types";

export type GenerationMode = 'upload' | 'paste' | 'specs';
export type TimingPreference = 'NONE' | 'PER_QUESTION' | 'OVERALL' | 'AI_SUGGESTED';

export interface GenerateFromPasteRequest {
  rawText: string;
  quizTitle: string;
  quizDescription?: string;
  timingPreference?: TimingPreference;
  manualTimerSeconds?: number;
  quizMode?: QuizMode;
}

export interface GenerateFromSpecsRequest {
  quizTitle: string;
  quizDescription?: string;
  questionTypes: QuestionType[];
  gradeLevel: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
  additionalNotes?: string;
  syllabusText?: string;
  timingPreference?: TimingPreference;
  manualTimerSeconds?: number;
  quizMode?: QuizMode;
}

export interface AiTimingSuggestion {
  mode: TimingMode;
  seconds: number;
  reasoning: string;
}

export interface GenerationResponse {
  quizId: string;
  quizCode: string;
  shareUrl: string;
  aiTimingSuggestion?: AiTimingSuggestion;
}

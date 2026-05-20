export interface PerQuestionStat {
  questionId: string;
  questionText: string;
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimeTakenSeconds?: number;
}

export interface StudentResult {
  sessionId: string;
  studentName: string;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  timeTakenSeconds?: number;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeTakenSeconds?: number;
  passRate: number;
  perQuestionStats: PerQuestionStat[];
  studentResults: StudentResult[];
  scoreDistribution: Record<string, number>;
}

export interface SummaryAnalytics {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  activeQuizzesThisMonth: number;
}

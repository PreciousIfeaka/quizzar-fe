import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AnswerSubmission, PublicQuiz, StartSessionResponse } from '../types/session.types';

interface QuizSessionStore {
  quiz: PublicQuiz | null;
  session: StartSessionResponse | null;
  studentName: string;
  currentIndex: number;
  answers: AnswerSubmission[];
  timeRemaining: number | null;

  setQuiz: (quiz: PublicQuiz) => void;
  setSession: (session: StartSessionResponse) => void;
  setStudentName: (name: string) => void;
  recordAnswer: (answer: AnswerSubmission) => void;
  nextQuestion: () => void;
  setTimeRemaining: (seconds: number) => void;
  resetSession: () => void;
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useQuizStore = create<QuizSessionStore>()(
  devtools((set) => ({
    quiz: null,
    session: null,
    studentName: '',
    currentIndex: 0,
    answers: [],
    timeRemaining: null,

    setQuiz: (quiz) => {
      const randomizedQuestions = shuffle(quiz.questions || []).map((q) => {
        if (q.options) {
          return { ...q, options: shuffle(q.options) };
        }
        return q;
      });
      set({ quiz: { ...quiz, questions: randomizedQuestions } });
    },
    setSession: (session) => set({ session }),
    setStudentName: (studentName) => set({ studentName }),
    recordAnswer: (answer) => set((state) => ({
      answers: [...state.answers.filter(a => a.questionId !== answer.questionId), answer],
    })),
    nextQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
    setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
    resetSession: () => set({
      quiz: null, session: null, studentName: '',
      currentIndex: 0, answers: [], timeRemaining: null,
    }),
  }), { name: 'quiz-store' })
);

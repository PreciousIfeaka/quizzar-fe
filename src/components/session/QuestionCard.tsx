import { motion } from 'framer-motion';
import type { Question } from '../../types/quiz.types';
import { OptionButton } from './OptionButton';
import { Textarea } from '../ui/textarea';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  answerText?: string;
  onSelectOption: (id: string) => void;
  onAnswerText: (text: string) => void;
}

export function QuestionCard({
  question, selectedOptionId, answerText, onSelectOption, onAnswerText
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
      <div className="h-1.5 bg-gradient-brand" />
      <div className="p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
            {question.questionType === 'MCQ' ? 'Multiple Choice'
              : question.questionType === 'TRUE_FALSE' ? 'True / False'
                : 'Short Answer'}
          </span>
          <span className="text-xs text-muted-foreground">{question.points} pt{question.points !== 1 ? 's' : ''}</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 leading-snug mb-8">
          {question.questionText}
        </h2>

        {question.questionType === 'SHORT_ANSWER' ? (
          <Textarea
            value={answerText ?? ''}
            onChange={e => onAnswerText(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="rounded-xl resize-none text-base focus:ring-brand-400"
          />
        ) : (
          <div className="space-y-3">
            {question.options?.map((option, i) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <OptionButton
                  label={option.label}
                  text={option.text}
                  selected={selectedOptionId === option.id}
                  onClick={() => onSelectOption(option.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import type { DetailedSessionAnswer } from '../../types/session.types';
import { cn } from '../../lib/utils';

interface ResultDetailsProps {
  details: DetailedSessionAnswer[];
  quiz?: any;
}

export function ResultDetails({ details, quiz }: ResultDetailsProps) {
  const correctCount = details.filter(d => d.correct).length;
  const incorrectCount = details.length - correctCount;

  return (
    <div className="space-y-6 mt-8">
      {/* Review Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">
        <h2 className="text-xl font-black text-slate-800">Question Review</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-1.5 bg-[#0A99AB]/10 text-[#0A99AB] rounded-full text-xs font-black flex items-center gap-1.5 border border-[#0A99AB]/15">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {correctCount} Correct
          </span>
          {incorrectCount > 0 && (
            <span className="px-4 py-1.5 bg-red-50 text-red-500 rounded-full text-xs font-black flex items-center gap-1.5 border border-red-100">
              <XCircle className="w-3.5 h-3.5" />
              {incorrectCount} Incorrect
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {details.map((detail, index) => {
          const isShortAnswer = detail.questionType === 'SHORT_ANSWER';
          const question = quiz?.questions?.find((q: any) => q.id === detail.questionId);

          return (
            <motion.article
              key={detail.questionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'bg-white rounded-2xl p-6 md:p-8 border border-slate-100 border-l-8 relative flex flex-col gap-6 quiz-card-shadow-interactive',
                detail.correct ? 'border-l-[#0A99AB]' : 'border-l-red-500'
              )}
            >
              {/* Correct / Incorrect Status Badge Top-Right */}
              <div className={cn(
                'absolute top-6 right-6 flex items-center gap-1 font-bold text-xs uppercase tracking-wider',
                detail.correct ? 'text-[#0A99AB]' : 'text-red-500'
              )}>
                {detail.correct ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Correct
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Incorrect
                  </>
                )}
              </div>

              {/* Question Header Badge */}
              <div>
                <span className={cn(
                  'text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border w-fit block',
                  detail.correct 
                    ? 'bg-[#0A99AB]/10 text-[#0A99AB] border-[#0A99AB]/15' 
                    : 'bg-red-50 text-red-500 border-red-100'
                )}>
                  Question {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-black text-slate-800 leading-snug pr-24">
                {detail.questionText}
              </h3>

              {/* Choices Grid (for MCQ and TRUE_FALSE) */}
              {!isShortAnswer && question && question.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option: any) => {
                    const isSelected = detail.selectedOptionLabel === option.label;
                    const isCorrect = detail.correctOptionLabel === option.label;
                    
                    return (
                      <div
                        key={option.id}
                        className={cn(
                          'p-4 rounded-xl border-2 text-sm flex justify-between items-center transition-all w-full',
                          isCorrect 
                            ? 'border-[#0A99AB] bg-[#0A99AB]/5 text-slate-900 font-extrabold shadow-[0px_4px_15px_rgba(10,153,171,0.05)]' 
                            : isSelected && !isCorrect 
                              ? 'border-red-500 bg-red-50 text-red-700 font-extrabold' 
                              : 'border-slate-300 bg-slate-50/50 text-slate-800 font-semibold shadow-sm'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0',
                            isCorrect 
                              ? 'bg-[#0A99AB] text-white' 
                              : isSelected && !isCorrect 
                                ? 'bg-red-500 text-white' 
                                : 'bg-slate-200 text-slate-700 font-extrabold border border-slate-300'
                          )}>
                            {option.label.length > 1 ? option.label[0] : option.label}
                          </span>
                          <div className="flex flex-col">
                            <span className={cn(
                              'font-bold',
                              isCorrect ? 'text-[#0A99AB] font-extrabold' : isSelected && !isCorrect ? 'text-red-700 font-extrabold' : 'text-slate-800 font-bold'
                            )}>
                              {option.text}
                            </span>
                            {/* Subtext: YOUR ANSWER or CORRECT ANSWER */}
                            {isSelected && !isCorrect && (
                              <span className="text-[9px] font-black text-red-500 uppercase tracking-wider mt-0.5">
                                Your Answer
                              </span>
                            )}
                            {isCorrect && !detail.correct && (
                              <span className="text-[9px] font-black text-[#0A99AB] uppercase tracking-wider mt-0.5">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-[#0A99AB] flex-shrink-0" />
                        ) : isSelected && !isCorrect ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fallback if MCQ/TF options list is not available from quiz query */}
              {!isShortAnswer && (!question || !question.options) && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400">Selected Answer:</span>
                    <span className={cn('text-sm font-bold', detail.correct ? 'text-[#0A99AB]' : 'text-red-500')}>
                      {detail.selectedOptionLabel && detail.selectedOptionLabel !== detail.selectedOptionText
                        ? `${detail.selectedOptionLabel}. ${detail.selectedOptionText || ''}`
                        : detail.selectedOptionText || 'No answer'}
                    </span>
                  </div>
                  {!detail.correct && detail.correctOptionText && (
                    <div className="p-4 rounded-xl bg-[#0A99AB]/5 border border-[#0A99AB]/15 flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-[#0A99AB]">Correct Answer:</span>
                      <span className="text-sm font-bold text-[#0A99AB]">
                        {detail.correctOptionLabel && detail.correctOptionLabel !== detail.correctOptionText
                          ? `${detail.correctOptionLabel}. ${detail.correctOptionText}`
                          : detail.correctOptionText}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Short Answer Details */}
              {isShortAnswer && (
                <div className="space-y-3">
                  <div className={cn(
                    'p-4 rounded-xl border-2 text-sm',
                    detail.correct 
                      ? 'border-[#0A99AB]/30 bg-[#0A99AB]/5 text-[#0A99AB] font-bold' 
                      : 'border-red-200 bg-red-50/20 text-red-700 font-bold'
                  )}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">Your Response</p>
                    <p className="font-extrabold text-slate-800">{detail.selectedAnswerText || 'No answer provided'}</p>
                  </div>
                  
                  {!detail.correct && detail.correctShortAnswerKeys && detail.correctShortAnswerKeys.length > 0 && (
                    <div className="p-4 rounded-xl border border-[#0A99AB]/20 bg-[#0A99AB]/5 text-slate-800 text-sm">
                      <p className="text-[10px] font-black text-[#0A99AB] uppercase tracking-wider mb-1">Expected Keywords</p>
                      <p className="font-bold text-[#0A99AB]">{detail.correctShortAnswerKeys.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { DetailedSessionAnswer } from '../../types/session.types';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface ResultDetailsProps {
  details: DetailedSessionAnswer[];
}

export function ResultDetails({ details }: ResultDetailsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-black text-slate-800 px-1">Review Your Answers</h2>
      <div className="space-y-3">
        {details.map((detail, index) => {
          const isExpanded = expandedId === detail.questionId;
          const isShortAnswer = detail.questionType === 'SHORT_ANSWER';
          
          return (
            <motion.div
              key={detail.questionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'bg-white rounded-2xl border transition-all overflow-hidden',
                detail.correct ? 'border-green-100 shadow-sm shadow-green-50' : 'border-red-100 shadow-sm shadow-red-50'
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : detail.questionId)}
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                  detail.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                )}>
                  {detail.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Question {index + 1} · {detail.pointsEarned}/{detail.maxPoints} pts
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {detail.questionText}
                  </p>
                  
                  {!isExpanded && (
                    <p className="text-xs mt-2 truncate">
                      <span className="text-muted-foreground">Your answer: </span>
                      <span className={cn('font-medium', detail.correct ? 'text-green-600' : 'text-red-500')}>
                        {isShortAnswer 
                          ? (detail.selectedAnswerText || 'No answer')
                          : (detail.selectedOptionText || 'No answer')
                        }
                      </span>
                    </p>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/30 border-t border-slate-50">
                  <div className="space-y-3">
                    {/* Student's Answer */}
                    <div className="p-3 rounded-xl bg-white border border-slate-100">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Your Answer</p>
                      <div className="flex items-center gap-2">
                        {!isShortAnswer && detail.selectedOptionLabel && (
                          <span className={cn(
                            'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black',
                            detail.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          )}>
                            {detail.selectedOptionLabel}
                          </span>
                        )}
                        <p className={cn('text-sm font-medium', detail.correct ? 'text-green-700' : 'text-red-600')}>
                          {isShortAnswer ? (detail.selectedAnswerText || 'No answer') : (detail.selectedOptionText || 'No answer')}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer (if wrong) */}
                    {!detail.correct && (
                      <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                        <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Correct Answer</p>
                        <div className="flex items-center gap-2">
                          {!isShortAnswer && detail.correctOptionLabel && (
                            <span className="w-6 h-6 rounded-lg bg-green-500 text-white flex items-center justify-center text-[10px] font-black">
                              {detail.correctOptionLabel}
                            </span>
                          )}
                          <p className="text-sm font-bold text-green-700">
                            {isShortAnswer 
                              ? `Must contain: ${detail.correctShortAnswerKeys?.join(', ')}`
                              : detail.correctOptionText
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {isShortAnswer && detail.correct && (
                       <div className="flex items-center gap-1.5 text-[10px] text-slate-500 ml-1">
                         <Info className="w-3 h-3" />
                         <span>Accepted keywords: {detail.correctShortAnswerKeys?.join(', ')}</span>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

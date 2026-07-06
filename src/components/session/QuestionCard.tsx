import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import type { Question } from '../../types/quiz.types';
import { OptionButton } from './OptionButton';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';

import type { QuestionResultResponse } from '../../types/session.types';
import { MathText } from '../common/MathText';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  answerText?: string;
  onSelectOption: (id: string) => void;
  onAnswerText: (text: string) => void;
  disabled?: boolean;
  feedback?: QuestionResultResponse | null;
  hideQuestionText?: boolean;
}

export function QuestionCard({
  question, selectedOptionId, answerText, onSelectOption, onAnswerText, disabled, feedback, hideQuestionText = false
}: QuestionCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cancel any active speech when question changes or on unmount
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [question.id]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.questionText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden relative">
      <div className="h-2 bg-gradient-to-r from-[#0A99AB] to-[#577D84]" />
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
              question.questionType === 'MCQ' && "bg-[#0A99AB]/10 text-[#0A99AB] border-[#0A99AB]/20",
              question.questionType === 'TRUE_FALSE' && "bg-[#0A99AB]/10 text-[#0A99AB] border-[#0A99AB]/20",
              question.questionType === 'SHORT_ANSWER' && "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/20"
            )}>
              {question.questionType === 'MCQ' ? 'Multiple Choice'
                : question.questionType === 'TRUE_FALSE' ? 'True / False'
                  : 'Short Answer'}
            </span>
            <span className="text-xs text-[#f5a623] font-black uppercase tracking-widest bg-[#f5a623]/10 px-2.5 py-1 rounded-full border border-[#f5a623]/20">{question.points} Pt{question.points !== 1 ? 's' : ''}</span>
          </div>

          {/* Text-To-Speech Button */}
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
              isSpeaking
                ? 'bg-[#0A99AB]/20 border-[#0A99AB] text-[#0A99AB] shadow-[0_0_15px_rgba(10,153,171,0.2)] animate-pulse'
                : 'bg-slate-50 border-slate-200 text-[#0A99AB] hover:bg-[#0A99AB]/10 hover:text-[#0A99AB] hover:border-[#0A99AB]/40'
            }`}
            title={isSpeaking ? 'Stop Read Aloud' : 'Read Aloud Question'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {!hideQuestionText && (
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 leading-snug tracking-tight mb-8 text-center px-2">
            <MathText text={question.questionText} />
          </h2>
        )}

        {/* Short Answer Layout - Beautifully Centered and Interactive */}
        {question.questionType === 'SHORT_ANSWER' && (
          <div className="flex flex-col items-center w-full max-w-xl mx-auto py-4">
            <motion.div 
              whileFocus={!disabled ? { scale: 1.01 } : undefined}
              className={cn(
                "w-full relative rounded-3xl bg-slate-50 p-8 border-2 shadow-sm transition-all duration-300",
                !feedback 
                  ? "border-slate-200 focus-within:border-[#0A99AB] focus-within:ring-2 focus-within:ring-[#0A99AB]/20" 
                  : feedback.correct 
                    ? "border-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.1)] bg-emerald-50/30" 
                    : "border-red-200 shadow-[0_0_25px_rgba(239,68,68,0.1)] bg-red-50/30"
              )}
            >
              <div className="flex items-center gap-2 mb-4 text-xs font-extrabold uppercase tracking-widest justify-center">
                {!feedback ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0A99AB] animate-ping" />
                    <span className="text-[#0A99AB]">⚡ Express Your Brilliance Below</span>
                  </>
                ) : feedback.correct ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600">✨ Spot On! Absolutely Correct</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-500">💫 Not Quite! Keep Learning</span>
                  </>
                )}
              </div>
              <Textarea
                value={answerText ?? ''}
                onChange={e => onAnswerText(e.target.value)}
                placeholder={disabled ? "No answer provided" : "Type your spectacular answer here..."}
                rows={3}
                disabled={disabled}
                className={cn(
                  "w-full text-xl font-bold bg-transparent border-0 focus-visible:ring-0 focus:outline-none p-0 resize-none focus:ring-0 transition-all text-center leading-relaxed",
                  !feedback 
                    ? "text-slate-800 placeholder-slate-400/70" 
                    : feedback.correct 
                      ? "text-emerald-700 placeholder-emerald-400/50" 
                      : "text-red-700 placeholder-red-400/50"
                )}
              />
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#0A99AB]/20 to-transparent my-5" />
              
              {/* If incorrect, show the accepted short answers */}
              {feedback && !feedback.correct && feedback.correctShortAnswerKeys && feedback.correctShortAnswerKeys.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center"
                >
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Accepted Keywords</p>
                  <div className="text-sm font-extrabold text-emerald-700">
                    {feedback.correctShortAnswerKeys.map((key, i) => (
                      <span key={i}>
                        {i > 0 && ', '}
                        <MathText text={key} />
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>{feedback ? "Review status" : "💡 Be creative & precise"}</span>
                <span className="bg-slate-200/60 px-3 py-1 rounded-full text-[10px] text-slate-600 font-extrabold">
                  {answerText?.length ?? 0} chars
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* MCQ options */}
        {question.questionType === 'MCQ' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            {question.options?.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                text={option.text}
                selected={selectedOptionId === option.id}
                onClick={() => onSelectOption(option.id)}
                disabled={disabled}
                correct={
                  feedback
                    ? option.label === feedback.correctOptionLabel ? true
                      : selectedOptionId === option.id ? false
                      : null
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* True or False options */}
        {question.questionType === 'TRUE_FALSE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            {question.options?.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                text={option.text}
                selected={selectedOptionId === option.id}
                onClick={() => onSelectOption(option.id)}
                disabled={disabled}
                correct={
                  feedback
                    ? option.label === feedback.correctOptionLabel ? true
                      : selectedOptionId === option.id ? false
                      : null
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {feedback && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "p-5 border-t text-center flex flex-col sm:flex-row items-center justify-between gap-4 font-black uppercase tracking-wider text-sm relative z-10",
            feedback.correct 
              ? "bg-emerald-50/80 border-emerald-100/50 text-emerald-650" 
              : "bg-red-50/80 border-red-100/50 text-red-600"
          )}
        >
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white",
              feedback.correct ? "bg-emerald-500" : "bg-red-500"
            )}>
              {feedback.correct ? "✓" : "✕"}
            </span>
            <span>
              {feedback.correct ? "Correct Answer!" : "Incorrect Answer"}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {!feedback.correct && feedback.correctOptionText && (
              <span className="text-xs font-bold text-slate-600 normal-case">
                Correct answer:{' '}
                <strong className="text-slate-800 font-extrabold">
                  {question.questionType === 'TRUE_FALSE' ? (
                    <MathText text={feedback.correctOptionText} />
                  ) : (
                    <>
                      {feedback.correctOptionLabel}. <MathText text={feedback.correctOptionText} />
                    </>
                  )}
                </strong>
              </span>
            )}
            <span className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-black text-[#f5a623]">
              +{feedback.pointsEarned} Pt{feedback.pointsEarned !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

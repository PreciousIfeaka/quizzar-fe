import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import type { Question } from '../../types/quiz.types';
import { OptionButton } from './OptionButton';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';

import type { QuestionResultResponse } from '../../types/session.types';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  answerText?: string;
  onSelectOption: (id: string) => void;
  onAnswerText: (text: string) => void;
  disabled?: boolean;
  feedback?: QuestionResultResponse | null;
}

export function QuestionCard({
  question, selectedOptionId, answerText, onSelectOption, onAnswerText, disabled, feedback
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
      {/* Decorative fun floating glowing elements inside the question card */}
      <div className="absolute top-4 right-16 w-3 h-3 rounded-full bg-[#00bcd4]/10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-8 left-6 w-2.5 h-2.5 rounded-full bg-[#00bcd4]/10 animate-bounce pointer-events-none" style={{ animationDuration: '3s' }} />
      <div className="absolute top-1/2 left-4 w-1.5 h-1.5 rounded-full bg-[#f5a623]/10 animate-ping pointer-events-none" style={{ animationDuration: '5s' }} />

      <div className="h-2 bg-gradient-brand" />
      <div className="p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
              question.questionType === 'MCQ' && "bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20",
              question.questionType === 'TRUE_FALSE' && "bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20",
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
                ? 'bg-[#00bcd4]/20 border-[#00bcd4] text-[#00bcd4] shadow-[0_0_15px_rgba(0,188,212,0.2)] animate-pulse'
                : 'bg-slate-50 border-slate-200 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-[#00bcd4] hover:border-[#00bcd4]/40'
            }`}
            title={isSpeaking ? 'Stop Read Aloud' : 'Read Aloud Question'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 leading-snug tracking-tight mb-8 text-center px-2">
          {question.questionText}
        </h2>

        {/* Short Answer Layout - Beautifully Centered and Interactive */}
        {question.questionType === 'SHORT_ANSWER' && (
          <div className="flex flex-col items-center w-full max-w-xl mx-auto py-4">
            <motion.div 
              whileFocus={!disabled ? { scale: 1.01 } : undefined}
              className={cn(
                "w-full relative rounded-3xl bg-slate-50 p-8 border shadow-sm transition-all duration-300",
                !feedback 
                  ? "border-slate-100 focus-within:border-[#00bcd4] focus-within:shadow-[0_0_25px_rgba(0,188,212,0.15)]" 
                  : feedback.correct 
                    ? "border-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.1)] bg-emerald-50/30" 
                    : "border-red-200 shadow-[0_0_25px_rgba(239,68,68,0.1)] bg-red-50/30"
              )}
            >
              <div className="flex items-center gap-2 mb-4 text-xs font-extrabold uppercase tracking-widest justify-center">
                {!feedback ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00bcd4] animate-ping" />
                    <span className="text-[#00bcd4]">⚡ Express Your Brilliance Below</span>
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
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00bcd4]/20 to-transparent my-5" />
              
              {/* If incorrect, show the accepted short answers */}
              {feedback && !feedback.correct && feedback.correctShortAnswerKeys && feedback.correctShortAnswerKeys.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center"
                >
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Accepted Keywords</p>
                  <p className="text-sm font-extrabold text-emerald-700">
                    {feedback.correctShortAnswerKeys.join(', ')}
                  </p>
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

        {/* MCQ Scattered Grid Layout */}
        {question.questionType === 'MCQ' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
            {question.options?.map((option, i) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: i * 0.05
                }}
              >
                <OptionButton
                  label={option.label}
                  text={option.text}
                  selected={selectedOptionId === option.id}
                  onClick={() => onSelectOption(option.id)}
                  disabled={disabled}
                  correct={
                    feedback 
                      ? option.label === feedback.correctOptionLabel
                        ? true 
                        : selectedOptionId === option.id 
                          ? false 
                          : null 
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* True or False - Dynamic, Premium Glassmorphic Cards */}
        {question.questionType === 'TRUE_FALSE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
            {question.options?.map((option, i) => {
              const isTrue = option.text.toLowerCase() === 'true';
              const isSelected = selectedOptionId === option.id;
              const isOptionCorrect = feedback ? option.label === feedback.correctOptionLabel : false;
              const isOptionIncorrect = feedback ? (isSelected && option.label !== feedback.correctOptionLabel) : false;
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: i * 0.05
                  }}
                >
                  <motion.button
                    whileHover={!disabled ? { scale: 1.04, y: -4, rotate: isTrue ? 1 : -1 } : undefined}
                    whileTap={!disabled ? { scale: 0.96 } : undefined}
                    onClick={!disabled ? () => onSelectOption(option.id) : undefined}
                    disabled={disabled}
                    className={cn(
                      'w-full py-10 px-8 rounded-3xl border-2 text-center transition-all duration-300 relative overflow-hidden group flex flex-col items-center justify-center gap-4',
                      !feedback ? (
                        !isSelected 
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#00bcd4]/80 hover:bg-[#00bcd4]/5 hover:shadow-[0_12px_40px_rgba(0,188,212,0.1)]'
                          : (isTrue 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                            : 'border-red-500 bg-red-500/10 text-red-700 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
                          )
                      ) : (
                        isOptionCorrect
                          ? (isSelected 
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 shadow-[0_0_40px_rgba(16,185,129,0.25)]' 
                            : 'border-emerald-500/30 bg-emerald-50 text-emerald-600'
                          )
                          : (isOptionIncorrect
                            ? 'border-red-500 bg-red-500/15 text-red-600 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
                            : 'border-slate-100 bg-slate-50 text-slate-400 opacity-40 cursor-not-allowed'
                          )
                      )
                    )}
                  >
                    {/* Spotlight Glare overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Badge Icon */}
                    <div className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black mb-1 transition-all duration-300 shadow-sm transform group-hover:scale-110',
                      !feedback ? (
                        isTrue 
                          ? (isSelected ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')
                          : (isSelected ? 'bg-red-500 text-white shadow-red-200' : 'bg-red-50 text-red-500 border border-red-100')
                      ) : (
                        isOptionCorrect
                          ? (isSelected ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')
                          : (isOptionIncorrect ? 'bg-red-500 text-white shadow-red-200' : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-50')
                      )
                    )}>
                      {isTrue ? '✓' : '✕'}
                    </div>
                    <span className="text-xl font-black uppercase tracking-widest">
                      {option.text}
                    </span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {feedback && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            {feedback.correctOptionText && (
              <span className="text-xs font-bold text-slate-600 normal-case">
                Correct answer: <strong className="text-slate-800 font-extrabold">{feedback.correctOptionLabel}. {feedback.correctOptionText}</strong>
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

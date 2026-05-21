import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import type { Question } from '../../types/quiz.types';
import { OptionButton } from './OptionButton';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';

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
    <div className="bg-[#12061c]/85 rounded-3xl border border-[#c97dff]/25 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
      {/* Decorative fun floating glowing elements inside the question card */}
      <div className="absolute top-4 right-16 w-3 h-3 rounded-full bg-[#c97dff]/30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-8 left-6 w-2.5 h-2.5 rounded-full bg-[#6366f1]/30 animate-bounce pointer-events-none" style={{ animationDuration: '3s' }} />
      <div className="absolute top-1/2 left-4 w-1.5 h-1.5 rounded-full bg-[#c97dff]/15 animate-ping pointer-events-none" style={{ animationDuration: '5s' }} />

      <div className="h-2 bg-gradient-brand" />
      <div className="p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#c97dff]/15 text-[#e5baff] border border-[#c97dff]/30">
              {question.questionType === 'MCQ' ? 'Multiple Choice'
                : question.questionType === 'TRUE_FALSE' ? 'True / False'
                  : 'Short Answer'}
            </span>
            <span className="text-xs text-[#c97dff]/90 font-black uppercase tracking-widest bg-[#c97dff]/10 px-2.5 py-1 rounded-full">{question.points} Pt{question.points !== 1 ? 's' : ''}</span>
          </div>

          {/* Text-To-Speech Button */}
          <button
            onClick={handleSpeak}
            className={`p-2 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
              isSpeaking
                ? 'bg-[#c97dff]/30 border-[#c97dff] text-[#e5baff] shadow-[0_0_15px_rgba(201,125,255,0.5)] animate-pulse'
                : 'bg-[#1a0926]/60 border-[#c97dff]/20 text-[#c97dff]/85 hover:bg-[#c97dff]/20 hover:text-[#e5baff] hover:border-[#c97dff]/60'
            }`}
            title={isSpeaking ? 'Stop Read Aloud' : 'Read Aloud Question'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-snug tracking-tight mb-8 text-center px-2">
          {question.questionText}
        </h2>

        {/* Short Answer Layout - Beautifully Centered and Interactive */}
        {question.questionType === 'SHORT_ANSWER' && (
          <div className="flex flex-col items-center w-full max-w-xl mx-auto py-4">
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              className="w-full relative rounded-3xl bg-[#0d0414]/90 p-8 border border-[#c97dff]/20 shadow-[0_0_35px_rgba(201,125,255,0.08)] focus-within:border-[#c97dff] focus-within:shadow-[0_0_45px_rgba(201,125,255,0.25)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4 text-xs text-[#e5baff] font-extrabold uppercase tracking-widest justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c97dff] animate-ping" />
                ⚡ Express Your Brilliance Below
              </div>
              <Textarea
                value={answerText ?? ''}
                onChange={e => onAnswerText(e.target.value)}
                placeholder="Type your spectacular answer here..."
                rows={3}
                className="w-full text-xl font-bold bg-transparent border-0 text-slate-100 placeholder-[#c97dff]/30 focus-visible:ring-0 focus:outline-none p-0 resize-none focus:ring-0 transition-all text-center leading-relaxed"
              />
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#c97dff]/30 to-transparent my-5" />
              <div className="flex justify-between items-center text-xs text-[#c97dff]/60 font-bold uppercase tracking-wider">
                <span>💡 Be creative & precise</span>
                <span className="bg-[#c97dff]/12 px-3 py-1 rounded-full text-[10px] text-slate-300 font-extrabold">{answerText?.length ?? 0} chars</span>
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
                    whileHover={{ scale: 1.04, y: -4, rotate: isTrue ? 1 : -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSelectOption(option.id)}
                    className={cn(
                      'w-full py-10 px-8 rounded-3xl border-2 text-center transition-all duration-300 relative overflow-hidden group flex flex-col items-center justify-center gap-4',
                      !isSelected && 'bg-[#1a0926]/40 border-[#c97dff]/15 text-slate-200 hover:border-[#c97dff]/80 hover:bg-[#c97dff]/10 hover:shadow-[0_12px_40px_rgba(201,125,255,0.2)]',
                      isSelected && (isTrue 
                        ? 'border-[#00d68f] bg-[#00d68f]/20 text-[#a8ffd4] shadow-[0_0_40px_rgba(0,214,143,0.4)]'
                        : 'border-[#ff4d4d] bg-[#ff4d4d]/20 text-[#ffb3b3] shadow-[0_0_40px_rgba(255,77,77,0.4)]'
                      )
                    )}
                  >
                    {/* Spotlight Glare overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Badge Icon */}
                    <div className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black mb-1 transition-all duration-300 shadow-lg transform group-hover:scale-110',
                      isTrue 
                        ? (isSelected ? 'bg-[#00d68f] text-white shadow-[#00d68f]/40' : 'bg-[#00d68f]/10 text-[#00d68f] border border-[#00d68f]/25')
                        : (isSelected ? 'bg-[#ff4d4d] text-white shadow-[#ff4d4d]/40' : 'bg-[#ff4d4d]/10 text-[#ff4d4d] border border-[#ff4d4d]/25')
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
    </div>
  );
}

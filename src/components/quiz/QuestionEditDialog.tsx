import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import type { Question, QuestionType, AddQuestionRequest, UpdateQuestionRequest } from '../../types/quiz.types';

interface QuestionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  question?: Question; // undefined for Add mode, defined for Edit mode
  onSuccess?: () => void;
}

export default function QuestionEditDialog({
  open,
  onOpenChange,
  quizId,
  question,
  onSuccess,
}: QuestionEditDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!question;

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
  const [points, setPoints] = useState(1);
  
  // MCQ/True-False Options state
  const [options, setOptions] = useState<{ id?: string; label: string; optionText: string; isCorrect: boolean }[]>([]);
  
  // Short Answer state
  const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>(['']);

  // Reset form states on open/question change
  useEffect(() => {
    if (open) {
      if (question) {
        setQuestionText(question.questionText);
        setQuestionType(question.questionType);
        setPoints(question.points);
        if (question.questionType === 'SHORT_ANSWER') {
          setAcceptedAnswers(question.acceptedAnswers && question.acceptedAnswers.length > 0 ? [...question.acceptedAnswers] : ['']);
          setOptions([]);
        } else {
          setOptions(question.options.map(opt => ({
            id: opt.id,
            label: opt.label,
            optionText: opt.text,
            isCorrect: !!opt.isCorrect,
          })));
          setAcceptedAnswers(['']);
        }
      } else {
        // Reset to defaults for Add Question
        setQuestionText('');
        setQuestionType('MCQ');
        setPoints(1);
        setOptions([
          { label: 'A', optionText: '', isCorrect: false },
          { label: 'B', optionText: '', isCorrect: false },
          { label: 'C', optionText: '', isCorrect: false },
          { label: 'D', optionText: '', isCorrect: false },
        ]);
        setAcceptedAnswers(['']);
      }
    }
  }, [open, question]);

  // Adjust options/accepted answers when questionType changes
  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    if (type === 'MCQ') {
      setOptions([
        { label: 'A', optionText: '', isCorrect: false },
        { label: 'B', optionText: '', isCorrect: false },
        { label: 'C', optionText: '', isCorrect: false },
        { label: 'D', optionText: '', isCorrect: false },
      ]);
    } else if (type === 'TRUE_FALSE') {
      setOptions([
        { label: 'T', optionText: 'True', isCorrect: false },
        { label: 'F', optionText: 'False', isCorrect: false },
      ]);
    } else {
      setOptions([]);
      setAcceptedAnswers(['']);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: AddQuestionRequest | UpdateQuestionRequest) => {
      if (isEdit && question) {
        return quizApi.updateQuestion(quizId, question.id, data as UpdateQuestionRequest);
      } else {
        return quizApi.addQuestion(quizId, data as AddQuestionRequest);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: isEdit ? 'Question updated' : 'Question added',
        description: 'Your changes have been saved successfully.',
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Something went wrong';
      toast({
        title: 'Save Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    // Client-side validations
    if (!questionText.trim()) {
      toast({ title: 'Validation Error', description: 'Question text is required.', variant: 'destructive' });
      return;
    }
    if (questionText.length > 2000) {
      toast({ title: 'Validation Error', description: 'Question text cannot exceed 2000 characters.', variant: 'destructive' });
      return;
    }
    if (points < 1 || points > 10) {
      toast({ title: 'Validation Error', description: 'Points must be between 1 and 10.', variant: 'destructive' });
      return;
    }

    let payload: AddQuestionRequest | UpdateQuestionRequest = {
      questionText: questionText.trim(),
      questionType,
      points,
    };

    if (questionType === 'MCQ' || questionType === 'TRUE_FALSE') {
      // Validate options
      const invalidOpt = options.find(o => !o.optionText.trim());
      if (invalidOpt) {
        toast({ title: 'Validation Error', description: `Option ${invalidOpt.label} cannot be empty.`, variant: 'destructive' });
        return;
      }
      const correctCount = options.filter(o => o.isCorrect).length;
      if (correctCount !== 1) {
        toast({ title: 'Validation Error', description: 'Exactly one option must be marked as correct.', variant: 'destructive' });
        return;
      }
      
      payload.options = options.map(o => ({
        id: o.id,
        label: o.label,
        optionText: o.optionText.trim(),
        isCorrect: o.isCorrect,
      }));
      payload.acceptedAnswers = undefined;
    } else if (questionType === 'SHORT_ANSWER') {
      const validAnswers = acceptedAnswers.map(a => a.trim()).filter(Boolean);
      if (validAnswers.length === 0) {
        toast({ title: 'Validation Error', description: 'At least one accepted answer is required.', variant: 'destructive' });
        return;
      }
      payload.acceptedAnswers = validAnswers;
      payload.options = undefined;
    }

    mutation.mutate(payload);
  };

  const handleOptionTextChange = (index: number, val: string) => {
    const next = [...options];
    next[index].optionText = val;
    setOptions(next);
  };

  const handleOptionCorrectToggle = (index: number) => {
    const next = options.map((o, idx) => ({
      ...o,
      isCorrect: idx === index,
    }));
    setOptions(next);
  };

  const handleAddAcceptedAnswer = () => {
    setAcceptedAnswers([...acceptedAnswers, '']);
  };

  const handleRemoveAcceptedAnswer = (index: number) => {
    const next = acceptedAnswers.filter((_, i) => i !== index);
    setAcceptedAnswers(next.length === 0 ? [''] : next);
  };

  const handleAcceptedAnswerChange = (index: number, val: string) => {
    const next = [...acceptedAnswers];
    next[index] = val;
    setAcceptedAnswers(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:rounded-2xl border-slate-100 p-6 md:p-8 bg-white font-['Plus_Jakarta_Sans',sans-serif] max-h-[90vh] flex flex-col gap-0">
        <DialogHeader className="mb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {isEdit ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 overflow-y-auto pr-2 flex-1 min-h-0">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Question Text
            </label>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="e.g. What is the capital of France?"
              className="w-full min-h-[90px] p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none text-sm text-slate-800 transition-all resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Be descriptive and clear.</span>
              <span>{questionText.length}/2000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Question Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={e => handleTypeChange(e.target.value as QuestionType)}
                className="w-full px-3 py-2.5 h-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none text-sm text-slate-800 transition-all bg-white"
              >
                <option value="MCQ">Multiple Choice (MCQ)</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>
            </div>

            {/* Points */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Points (1 - 10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={points}
                onChange={e => setPoints(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2.5 h-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none text-sm text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Dynamic Options or Accepted Answers */}
          <div className="border-t border-slate-100 pt-4">
            {questionType === 'MCQ' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Multiple Choice Options
                  </span>
                  <span className="text-[9px] text-slate-400 italic">Select one correct answer</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {options.map((opt, index) => (
                    <div
                      key={opt.label}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-xl border transition-all",
                        opt.isCorrect 
                          ? "bg-green-50/50 border-green-200" 
                          : "border-slate-150 bg-slate-50/20"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleOptionCorrectToggle(index)}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all flex-shrink-0",
                          opt.isCorrect
                            ? "bg-green-500 text-white shadow-md shadow-green-500/10"
                            : "bg-white border border-slate-200 text-slate-400 hover:border-slate-350"
                        )}
                      >
                        {opt.label}
                      </button>
                      <input
                        type="text"
                        placeholder={`Option ${opt.label} text`}
                        value={opt.optionText}
                        onChange={e => handleOptionTextChange(index, e.target.value)}
                        className="flex-1 bg-transparent border-none py-1 text-sm outline-none text-slate-800 placeholder-slate-450"
                      />
                      {opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questionType === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    True / False Options
                  </span>
                  <span className="text-[9px] text-slate-400 italic">Select the correct statement</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {options.map((opt, index) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleOptionCorrectToggle(index)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center gap-2",
                        opt.isCorrect
                          ? "border-[#0A99AB] bg-[#0A99AB]/5 text-[#0A99AB] font-bold"
                          : "border-slate-100 hover:border-slate-200 bg-white text-slate-650 font-medium"
                      )}
                    >
                      <span className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        opt.isCorrect ? "bg-[#0A99AB] text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {opt.label}
                      </span>
                      <span className="text-sm">{opt.optionText}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {questionType === 'SHORT_ANSWER' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Accepted Answers
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAcceptedAnswer}
                    className="text-[10px] font-bold text-[#0A99AB] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Answer Variant
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {acceptedAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Paris (case-insensitive matches automatically)"
                        value={answer}
                        onChange={e => handleAcceptedAnswerChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 h-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none text-sm text-slate-800 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAcceptedAnswer(index)}
                        disabled={acceptedAnswers.length === 1 && !answer}
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 italic">
                  Students will be graded correct if their response exactly matches any of the accepted answers listed above (whitespace trimmed).
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all text-xs"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending}
            className="primary-gradient text-white py-2.5 px-5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#0A99AB]/15 hover:scale-[1.01] active:scale-95 transition-all text-xs disabled:opacity-50 disabled:pointer-events-none"
          >
            {mutation.isPending ? 'Saving...' : 'Save Question'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}

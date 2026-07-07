import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, BookOpen, User, Rocket, ArrowRight, Info, Lock, CalendarX, AlertCircle, RefreshCw } from 'lucide-react';
import { sessionApi } from '../../api/session.api';
import { useQuizStore } from '../../store/quizStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';
import { staggerContainer } from '../../lib/motion';
import { toast } from '../../hooks/use-toast';

export default function PublicQuizLandingPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const { setQuiz, setSession, setStudentName, resetSession } = useQuizStore();

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['public-quiz', quizCode],
    queryFn: () => sessionApi.getPublicQuiz(quizCode!),
    enabled: !!quizCode,
    retry: false,
  });

  const startMutation = useMutation({
    mutationFn: () => sessionApi.startSession(quizCode!, { studentName: name.trim() }),
    onSuccess: async (sessionData) => {
      try {
        const questions = await sessionApi.getSessionQuestions(quizCode!, sessionData.sessionId);
        resetSession();
        setQuiz({ ...quiz!, questions });
        setSession(sessionData);
        setStudentName(name.trim());
        navigate(`/quiz/${quizCode}/session`);
      } catch (err: any) {
        const apiMsg = err.response?.data?.message || 'Failed to load session questions';
        toast({
          title: 'Error loading questions',
          description: apiMsg,
          variant: 'destructive',
        });
      }
    },
    onError: (err: any) => {
      const apiMsg = err.response?.data?.message || 'Failed to start quiz session';
      toast({
        title: 'Unable to start quiz',
        description: apiMsg,
        variant: 'destructive',
      });
    },
  });

  const [timeLeft, setTimeLeft] = useState<string>('');

  const axiosError = error as any;
  const errorStatus = axiosError?.response?.status;
  const errorData = axiosError?.response?.data;

  const isNotYetOpen = errorStatus === 423 || quiz?.availabilityStatus === 'NOT_YET_OPEN';
  const isClosed = errorStatus === 410 || quiz?.availabilityStatus === 'CLOSED';
  
  const opensAt = errorData?.opensAt || quiz?.scheduledOpenAt;
  const closesAt = quiz?.scheduledCloseAt;

  useEffect(() => {
    if (isNotYetOpen && opensAt) {
      const targetTime = new Date(opensAt).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = targetTime - now;
        
        if (diff <= 0) {
          setTimeLeft('Open now! Refresh the page.');
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        
        setTimeLeft(parts.join(' '));
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isNotYetOpen, opensAt]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  // Locked Status view
  if (isNotYetOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
        <header className="p-4 md:p-6 max-w-5xl mx-auto w-full z-10">
          <QuizzarLogo noLink />
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-8 z-10 max-w-md mx-auto w-full">
          <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow text-center space-y-6 w-full">
            <div className="w-16 h-16 bg-[#ffdcc3]/40 text-[#f5a623] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
                Quiz is Locked
              </h1>
              <p className="text-slate-500 text-xs leading-relaxed">
                This challenge has not opened yet. It is scheduled to open on:
              </p>
              <p className="font-bold text-slate-800 text-xs mt-1.5">
                {opensAt ? new Date(opensAt).toLocaleString() : 'a future scheduled date'}
              </p>
            </div>

            {timeLeft && (
              <div className="bg-[#f5a623]/5 border border-[#f5a623]/15 rounded-2xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Starts In
                </span>
                <span className="font-headline-display text-2xl font-black text-[#f5a623] font-mono">
                  {timeLeft}
                </span>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
               <RefreshCw className="w-3.5 h-3.5" />
               Refresh Status
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Closed Status view
  if (isClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
        <header className="p-4 md:p-6 max-w-5xl mx-auto w-full z-10">
          <QuizzarLogo noLink />
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-8 z-10 max-w-md mx-auto w-full">
          <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow text-center space-y-6 w-full">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CalendarX className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
                Quiz is Closed
              </h1>
              <p className="text-slate-500 text-xs leading-relaxed">
                The availability window for this quiz has ended. You can no longer start a session.
              </p>
              {closesAt && (
                <p className="text-[10px] text-slate-400 mt-2">
                  Closed at: {new Date(closesAt).toLocaleString()}
                </p>
              )}
            </div>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Return to Landing Page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Error fetching or other availability issues
  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>
        <header className="p-4 md:p-6 max-w-5xl mx-auto w-full z-10">
          <QuizzarLogo noLink />
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-8 z-10 max-w-md mx-auto w-full">
          <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow text-center space-y-6 w-full">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
                Quiz Unavailable
              </h1>
              <p className="text-slate-500 text-xs leading-relaxed">
                {errorData?.message || 'This quiz is not currently available. Please check the code and try again.'}
              </p>
            </div>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Return to Landing Page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#0A99AB]/5 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#0A99AB]/20 relative overflow-hidden">
      {/* Grid Pattern Background Layer */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

      {/* Header */}
      <header className="p-4 md:p-6 max-w-5xl mx-auto w-full z-10">
        <QuizzarLogo noLink />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 z-10 max-w-4xl mx-auto w-full">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
        >
          {/* Left Side: Quiz Details (Bento Style) */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Quiz Branding Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100/80 custom-shadow relative overflow-hidden flex-grow flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4">
                <div className="w-12 h-12 bg-[#0A99AB]/10 rounded-xl flex items-center justify-center text-[#0A99AB]">
                  <Rocket className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A99AB]/10 text-[#0A99AB] font-bold text-[10px] mb-4 uppercase tracking-wider border border-[#0A99AB]/10">
                  Active Challenge
                </span>
                <h1 className="font-headline-md text-2xl font-black text-slate-900 mb-2 leading-tight">
                  {quiz.title}
                </h1>
                {quiz.description && (
                  <p className="text-slate-500 text-xs leading-relaxed mt-2">{quiz.description}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100/80 custom-shadow flex flex-col justify-center">
                <BookOpen className="w-5 h-5 text-[#0A99AB] mb-2" />
                <div className="text-2xl font-black text-slate-800">{quiz.questions?.length || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100/80 custom-shadow flex flex-col justify-center">
                <Clock className="w-5 h-5 text-[#0A99AB] mb-2" />
                <div className="text-2xl font-black text-slate-800">
                  {quiz.timingMode === 'NONE' ? 'None' : quiz.timerValueSeconds ? Math.ceil(quiz.timerValueSeconds / 60) : 'Timed'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {quiz.timingMode === 'PER_QUESTION' ? 'Min / Q' : 'Minutes'}
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-[#0A99AB]/5 p-6 rounded-2xl border border-[#0A99AB]/10 custom-shadow">
              <h3 className="font-bold text-xs text-[#0A99AB] mb-3 flex items-center gap-2 tracking-widest uppercase">
                <Info className="w-4 h-4" />
                Important Rules
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A99AB] mt-1.5 flex-shrink-0"></span>
                  Once the quiz begins, the timer starts and cannot be paused.
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A99AB] mt-1.5 flex-shrink-0"></span>
                  Ensure you have a stable internet connection before starting.
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A99AB] mt-1.5 flex-shrink-0"></span>
                  Do not refresh your quiz page while in session.
                </li>
              </ul>
            </div>

          </div>

          {/* Right Side: Student Onboarding Form */}
          <div className="lg:col-span-7 lg:self-center">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100/80 custom-shadow flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Ready to start?</h2>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">Please confirm your identity to enter the lobby.</p>

                {/* Input Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="studentName" className="font-bold text-[10px] text-slate-400 uppercase tracking-widest block">
                    Your Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0A99AB] w-4 h-4 transition-colors" />
                    <Input
                      id="studentName"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name here"
                      className="w-full pl-11 pr-4 py-3 h-11 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A99AB]/20 focus:border-[#0A99AB] outline-none transition-all text-sm text-slate-800"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && name.trim().length >= 2) startMutation.mutate();
                      }}
                      autoFocus
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 italic">This name will be used on your result.</p>
                </div>
              </div>

              {/* Action and Badges bottom wrapper */}
              <div className="space-y-4">
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={name.trim().length < 2 || startMutation.isPending}
                  className="w-full primary-gradient text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0A99AB]/15 hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none group text-xs"
                >
                  <span>{startMutation.isPending ? 'ENTERING LOBBY...' : 'START QUIZ'}</span>
                  {!startMutation.isPending && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white border-t border-slate-100 p-4 md:p-6 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto gap-3 md:gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <QuizzarLogo size="sm" noLink />
            <p className="text-slate-400 text-xs font-semibold">© 2026 Quizzar AI Platform</p>
          </div>
          <div className="flex gap-4 md:gap-6 text-slate-400 text-xs font-semibold">
            <Link className="hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors" to="/terms">Terms of Service</Link>
            <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  TrendingUp,
  Search,
  MoreVertical,
  ArrowRight,
  Calendar,
  Link2,
  Trash2,
  BarChart2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { quizApi } from '@/api/quiz.api';
import { analyticsApi } from '@/api/analytics.api';
import { AnimatedPage } from '@/components/common/AnimatedPage';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { staggerContainer, fadeUp } from '@/lib/motion';
import { formatDate, copyToClipboard, buildPublicQuizUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { QuizSummary } from '@/types/quiz.types';

// Helper to render consistent category icon based on index/title


export default function DashboardPage() {
  const { teacher } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<QuizSummary | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz deleted', description: 'The quiz has been successfully deleted.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete quiz.', variant: 'destructive' });
    },
  });

  const handleCopyLink = async (e: React.MouseEvent, quizCode: string) => {
    e.stopPropagation();
    await copyToClipboard(buildPublicQuizUrl(quizCode));
    toast({ title: 'Link copied!', description: 'Public quiz link copied to clipboard.' });
  };

  const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
    queryKey: ['quizzes', 0, 10], // load up to 10 for dashboard table
    queryFn: () => quizApi.getAll(0, 10),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
  });

  const quizzes = quizzesData?.content ?? [];
  
  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.quizCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatedPage>
      {/* Welcome Banner */}
      <div className="relative bg-[#0b192c] rounded-2xl py-5 px-5 md:py-6 md:px-8 mb-6 overflow-hidden text-white shadow-card border border-slate-800/60">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Concentric circles decoration on the right side */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[200px] h-[200px] opacity-15 pointer-events-none hidden md:block select-none">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/50 scale-[0.6]" />
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/50 scale-[0.8]" />
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/50 scale-[1.0]" />
        </div>

        <div className="relative z-10 max-w-2xl text-left">
          <span className="text-[9px] font-black text-[#0A99AB] uppercase tracking-widest bg-[#0A99AB]/10 px-2.5 py-0.5 rounded-full border border-[#0A99AB]/20">
            Welcome Back
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-3 mb-1.5">
            Good to see you, {teacher?.name ?? 'Instructor'}! 👋
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            Create interactive quizzes, track student attempts, and analyze real-time performance dashboard metrics.
          </p>
        </div>
      </div>

      {/* Summary Analytics (Metrics Row) */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {/* Total Quizzes */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-6 rounded-[22px] border border-slate-100/80 flex items-center justify-between custom-shadow-interactive cursor-default"
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
              Total Quizzes
            </span>
            <span className="text-[32px] font-extrabold text-slate-900 mt-2 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-none">
              {summaryData?.totalQuizzes ?? quizzesData?.totalElements ?? 0}
            </span>
          </div>
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#f1f3f6] text-[#1b253b] flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
        </motion.div>

        {/* Total Attempts */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-6 rounded-[22px] border border-slate-100/80 flex items-center justify-between custom-shadow-interactive cursor-default"
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
              Total Attempts
            </span>
            <span className="text-[32px] font-extrabold text-slate-900 mt-2 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-none">
              {summaryData?.totalAttempts ?? 0}
            </span>
          </div>
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#ebf2ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
        </motion.div>

        {/* Average Score */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-6 rounded-[22px] border border-slate-100/80 flex items-center justify-between custom-shadow-interactive cursor-default"
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
              Avg Score
            </span>
            <span className="text-[32px] font-extrabold text-slate-900 mt-2 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-none">
              {summaryData ? `${Math.round(summaryData.averageScore)}%` : '—'}
            </span>
          </div>
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#e6fbf2] text-[#04a162] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </motion.div>

        {/* This Month */}
        <motion.div
          variants={fadeUp}
          className="bg-white p-6 rounded-[22px] border border-slate-100/80 flex items-center justify-between custom-shadow-interactive cursor-default"
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
              This Month
            </span>
            <span className="text-[32px] font-extrabold text-slate-900 mt-2 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-none">
              {summaryData?.activeQuizzesThisMonth ?? 0}
            </span>
          </div>
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#fff0f0] text-[#e02424] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
        </motion.div>
      </motion.section>

      {/* Main Dashboard Content */}
      <section className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl custom-shadow overflow-hidden border border-outline-variant/20">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white">
            <h3 className="font-headline-md text-lg font-black text-slate-800">
              Recent Quizzes
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-56 text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="Search quizzes..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="p-6">
            {quizzesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="rounded-full border-2 border-slate-100 border-t-[#0A99AB] w-8 h-8 animate-spin" />
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                <BookOpen className="w-12 h-12 mb-3 stroke-[1.5] text-slate-350" />
                <span className="text-sm font-semibold">No quizzes found.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 quiz-card-shadow-interactive hover:border-[#0A99AB]/30 flex flex-col justify-between relative group cursor-pointer"
                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A99AB]/10 text-[#0A99AB] text-[10px] font-black uppercase tracking-wider">
                          {quiz.questionCount} {quiz.questionCount === 1 ? 'Question' : 'Questions'}
                        </span>
                      </div>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                              <BookOpen className="w-4 h-4 mr-2 text-slate-405" /> View Quiz
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={(e) => handleCopyLink(e, quiz.quizCode)}>
                              <Link2 className="w-4 h-4 mr-2 text-slate-405" /> Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}/analytics`)}>
                              <BarChart2 className="w-4 h-4 mr-2 text-slate-405" /> Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onClick={() => setDeleteTarget(quiz)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex-grow mb-4">
                      <h4 className="font-extrabold text-slate-800 text-base mb-1.5 group-hover:text-[#0A99AB] transition-colors line-clamp-1">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-slate-550 line-clamp-2 leading-relaxed">
                        {quiz.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    <div className="border-t border-slate-50 pt-4 flex items-center justify-between text-xs mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Created</span>
                        <span className="text-slate-500 font-semibold mt-0.5">
                          {formatDate(quiz.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Code</span>
                        <span className="text-slate-500 font-semibold mt-0.5 font-mono">
                          {quiz.quizCode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50/50 flex justify-center border-t border-slate-100">
            <button
              onClick={() => navigate('/quizzes')}
              className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
            >
              View All Quizzes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Quiz"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This will remove all questions, sessions, and student results permanently.` : ''}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </AnimatedPage>
  );
}

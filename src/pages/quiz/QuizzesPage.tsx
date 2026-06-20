import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  BookOpen,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Link2,
  BarChart2,
  Trash2,
  Beaker,
  Globe,
  Calculator,
  Rocket,
} from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { AnimatedPage } from '../../components/common/AnimatedPage';
import { BrandButton } from '../../components/common/BrandButton';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { formatDate, copyToClipboard, buildPublicQuizUrl } from '../../lib/utils';
import type { QuizSummary } from '../../types/quiz.types';

const PAGE_SIZE = 12;

const getCategoryIcon = (index: number) => {
  const icons = [Beaker, Globe, Calculator, Rocket];
  const colors = [
    'bg-primary-container/20 text-primary',
    'bg-secondary-container/20 text-secondary',
    'bg-outline-variant/20 text-slate-500',
    'bg-primary-container/20 text-primary',
  ];
  const IconComponent = icons[index % icons.length];
  const colorClass = colors[index % colors.length];

  return (
    <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
      <IconComponent className="w-4 h-4" />
    </div>
  );
};

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['quizzes', page, PAGE_SIZE, 'createdAt', sortDir],
    queryFn: () => quizApi.getAll(page, PAGE_SIZE, 'createdAt', sortDir),
    placeholderData: (prev) => prev,
  });

  const quizzes = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  // Sort the quizzes array before search filtering:
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortDir === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Client-side search filter (for the current page)
  const filtered = sortedQuizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.description?.toLowerCase().includes(search.toLowerCase()) ||
    q.quizCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatedPage>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${totalElements} quiz${totalElements !== 1 ? 'zes' : ''} total`}
          </p>
        </div>
        <BrandButton
          onClick={() => navigate('/generate')}
          icon={<Sparkles className="w-4 h-4" />}
        >
          New Quiz
        </BrandButton>
      </div>

      {/* Search & sort bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="pl-9 rounded-xl"
          />
        </div>
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 bg-white text-sm font-medium text-slate-600 hover:border-brand-200 hover:bg-brand-50 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-2xl custom-shadow overflow-hidden border border-outline-variant/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="rounded-full border-2 border-slate-100 border-t-primary w-8 h-8 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
            <BookOpen className="w-12 h-12 mb-3 stroke-[1.5] text-slate-350" />
            <span className="text-sm font-semibold">
              {search ? 'No quizzes match your search.' : 'No quizzes yet.'}
            </span>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filtered.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getCategoryIcon(index)}
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-800 block truncate text-sm">{quiz.title}</span>
                        {quiz.description && (
                          <span className="text-xs text-muted-foreground block truncate mt-0.5">{quiz.description}</span>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">{quiz.quizCode}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(quiz.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                            <BookOpen className="w-4 h-4 mr-2" /> View Quiz
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={(e) => handleCopyLink(e, quiz.quizCode)}>
                            <Link2 className="w-4 h-4 mr-2" /> Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}/analytics`)}>
                            <BarChart2 className="w-4 h-4 mr-2" /> Analytics
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
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quiz Title
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Code
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date Created
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((quiz, index) => (
                    <tr
                      key={quiz.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/quizzes/${quiz.id}`)}
                    >
                      <td className="px-6 py-4 max-w-[220px] md:max-w-[320px]">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(index)}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 hover:text-primary transition-colors block truncate">
                              {quiz.title}
                            </span>
                            {quiz.description && (
                              <span className="text-xs text-muted-foreground block truncate mt-0.5" title={quiz.description}>
                                {quiz.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">
                        {quiz.quizCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(quiz.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00bcd4]/10 text-[#006672] text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00bcd4]" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 text-slate-400 hover:text-slate-650 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                                <BookOpen className="w-4 h-4 mr-2" /> View Quiz
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={(e) => handleCopyLink(e, quiz.quizCode)}>
                                <Link2 className="w-4 h-4 mr-2" /> Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/quizzes/${quiz.id}/analytics`)}>
                                <BarChart2 className="w-4 h-4 mr-2" /> Analytics
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || isFetching}
            className="px-4 py-2 rounded-xl border border-slate-100 text-sm font-medium text-slate-600 disabled:opacity-40 hover:border-brand-200 hover:bg-brand-50 transition-all"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const pageNum = totalPages <= 7
                ? i
                : page <= 3 ? i
                : page >= totalPages - 4 ? totalPages - 7 + i
                : page - 3 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                    pageNum === page
                      ? 'bg-brand-500 text-white shadow-brand-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isFetching}
            className="px-4 py-2 rounded-xl border border-slate-100 text-sm font-medium text-slate-600 disabled:opacity-40 hover:border-brand-200 hover:bg-brand-50 transition-all"
          >
            Next →
          </button>
        </div>
      )}

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

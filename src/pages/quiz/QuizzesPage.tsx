import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { quizApi } from '../../api/quiz.api';
import { AnimatedPage } from '../../components/common/AnimatedPage';
import { QuizCard } from '../../components/quiz/QuizCard';
import { QuizCardSkeleton } from '../../components/quiz/QuizCardSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { BrandButton } from '../../components/common/BrandButton';
import { Input } from '../../components/ui/input';
import { staggerContainer, fadeUp } from '../../lib/motion';

const PAGE_SIZE = 12;

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['quizzes', page, PAGE_SIZE, 'createdAt', sortDir],
    queryFn: () => quizApi.getAll(page, PAGE_SIZE, 'createdAt', sortDir),
    placeholderData: (prev) => prev,
  });

  const quizzes = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  // Client-side search filter (for the current page)
  const filtered = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.description?.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex items-center gap-3 mb-6">
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 bg-white text-sm font-medium text-slate-600 hover:border-brand-200 hover:bg-brand-50 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search ? 'No quizzes match your search' : 'No quizzes yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Create your first quiz using AI — upload a file, paste content, or describe your specs.'
          }
          action={!search ? { label: 'Create First Quiz', onClick: () => navigate('/generate') } : undefined}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map(quiz => (
            <motion.div key={quiz.id} variants={fadeUp}>
              <QuizCard quiz={quiz} />
            </motion.div>
          ))}
        </motion.div>
      )}

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
    </AnimatedPage>
  );
}

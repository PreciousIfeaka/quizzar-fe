import { Link } from 'react-router-dom';

export function QuizzarLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };
  const iconSizes = { sm: 'w-6 h-6 text-sm', md: 'w-8 h-8 text-base', lg: 'w-12 h-12 text-xl' };

  return (
    <Link to="/dashboard" className="flex items-center gap-2 group">
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand-sm group-hover:shadow-brand-md transition-all duration-200`}>
        <span className="text-white font-black">Q</span>
      </div>
      <span className={`${sizes[size]} font-black text-slate-800`}>
        Quizz<span className="text-[#00bcd4]">ar</span>
      </span>
    </Link>
  );
}

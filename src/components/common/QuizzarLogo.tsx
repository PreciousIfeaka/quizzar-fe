import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8 flex-shrink-0", className)}
    >
      {/* Back card outline (bottom-left) */}
      <path
        d="M30 36H14C10.6863 36 8 33.3137 8 30V14"
        stroke="#0A99AB"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Front card (top-right) - filled rounded rect */}
      <rect
        x="14"
        y="6"
        width="24"
        height="24"
        rx="6"
        fill="#0A99AB"
      />
      {/* Question mark inside front card */}
      <path
        d="M22 15C22 13 23.5 11.5 25.5 11.5C27.5 11.5 29 13 29 15C29 17 27 18 26 19.5V20.5"
        stroke="#0B192C"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="24" r="1.6" fill="#0B192C" />
    </svg>
  );
}

interface QuizzarLogoProps {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  noLink?: boolean;
  lightText?: boolean;
}

export function QuizzarLogo({ size = 'md', to = '/dashboard', noLink = false, lightText = false }: QuizzarLogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-xl md:text-2xl', lg: 'text-3xl' };
  const iconSizes = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const content = (
    <>
      <LogoIcon className={iconSizes[size]} />
      <span className={cn(sizes[size], "font-black tracking-tight select-none")}>
        <span className={lightText ? "text-white" : "text-[#0B192C]"}>Quiz</span>
        <span className="text-[#0A99AB]">zar</span>
      </span>
    </>
  );

  if (noLink) {
    return (
      <div className="flex items-center gap-2.5">
        {content}
      </div>
    );
  }

  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      {content}
    </Link>
  );
}

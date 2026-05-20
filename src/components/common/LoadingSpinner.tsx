import { cn } from '../../lib/utils';

export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn(
      'rounded-full border-2 border-brand-100 border-t-brand-500 animate-spin',
      sizes[size]
    )} />
  );
}

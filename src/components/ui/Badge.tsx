import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  dot?: boolean;
  dotColor?: string;
}

export default function Badge({ children, className, dot, dotColor }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor || 'bg-current')} />}
      {children}
    </span>
  );
}

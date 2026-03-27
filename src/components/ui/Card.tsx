import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  id?: string;
}

export function Card({ children, className, padding = true, id }: CardProps) {
  return (
    <div id={id} className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', padding && 'p-5', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('font-semibold text-gray-900 text-sm', className)}>{children}</h3>
  );
}

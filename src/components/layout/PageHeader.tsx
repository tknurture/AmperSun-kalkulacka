import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-start justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-white border-b border-gray-200 gap-3">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

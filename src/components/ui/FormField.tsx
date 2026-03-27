import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const inputBase =
  'w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all';

export function FormInput({ label, error, hint, suffix, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          {...props}
          className={cn(
            inputBase,
            error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200',
            suffix && 'pr-12',
            className
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function FormSelect({ label, error, hint, children, className, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <select
        {...props}
        className={cn(
          inputBase,
          error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200',
          className
        )}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function FormTextarea({ label, error, hint, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        {...props}
        className={cn(
          inputBase,
          'resize-none',
          error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200',
          className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// Toggle switch
interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
export function FormToggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={cn(
            'w-9 h-5 rounded-full transition-colors',
            checked ? 'bg-gray-900' : 'bg-gray-200'
          )}
        />
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
    </label>
  );
}

// Sekce formuláře
interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}
export function FormSection({ title, description, children, className }: SectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

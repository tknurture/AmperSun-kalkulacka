'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  ChevronRight,
  X,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { setTourStep, resetTourDone } from '@/lib/tour';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kalkulace', label: 'Kalkulace', icon: FileText },
  { href: '/kalkulace/nova', label: 'Nová kalkulace', icon: PlusCircle, highlight: true },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}

function TourStartButton({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const handleClick = () => {
    resetTourDone();
    setTourStep(0);
    onClose?.();
    router.push('/');
  };
  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all"
    >
      <HelpCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">Průvodce aplikací</span>
    </button>
  );
}

export default function Sidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter(); // needed by TourStartButton inside same 'use client' scope

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-gray-200 h-screen z-50',
        // Mobile: fixed drawer, slides in/out
        'fixed inset-y-0 left-0 w-72 transition-transform duration-300 ease-in-out',
        // Desktop: sticky in normal flow, always visible
        'md:sticky md:top-0 md:w-60 md:shrink-0 md:translate-x-0 md:transition-none',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <Image
          src="/ampersun-logo.png"
          alt="AmperSun"
          width={140}
          height={40}
          className="h-8 w-auto object-contain"
          priority
        />
        {/* Close button – mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          aria-label="Zavřít menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigace */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-xs font-semibold text-gray-400 px-2 pb-2 uppercase tracking-wider">
          Hlavní menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href) &&
                !(item.href === '/kalkulace' && pathname === '/kalkulace/nova');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                item.highlight
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && !item.highlight && (
                <ChevronRight className="w-3 h-3 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spodní část */}
      <div className="px-3 py-4 border-t border-gray-100">
        <TourStartButton onClose={onClose} />
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 cursor-pointer mt-1">
          <Settings className="w-4 h-4" />
          <span>Nastavení</span>
        </div>
        <div className="mt-3 px-3">
          <div className="text-xs text-gray-400">
            <div className="font-medium text-gray-500">Interní systém</div>
            <div>AmperSun s.r.o. © 2025</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

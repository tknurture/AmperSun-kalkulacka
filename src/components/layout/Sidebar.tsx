'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kalkulace', label: 'Kalkulace', icon: FileText },
  { href: '/kalkulace/nova', label: 'Nová kalkulace', icon: PlusCircle, highlight: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Image
          src="/ampersun-logo.png"
          alt="AmperSun"
          width={140}
          height={40}
          className="h-8 w-auto object-contain"
          priority
        />
      </div>

      {/* Navigace */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-xs font-semibold text-gray-400 px-2 pb-2 uppercase tracking-wider">Hlavní menu</div>
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
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                item.highlight
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
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

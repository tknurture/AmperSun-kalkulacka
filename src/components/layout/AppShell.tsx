'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import LoginPage from '@/components/auth/LoginPage';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('ampersun_auth');
    setAuthenticated(auth === 'true');
  }, []);

  // Čekáme na hydrataci
  if (authenticated === null) return null;

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex h-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Otevřít menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/">
            <Image
              src="/ampersun-logo.png"
              alt="AmperSun"
              width={110}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Lock } from 'lucide-react';

const HESLO = 'AmperSun123';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [hodnota, setHodnota] = useState('');
  const [zobrazit, setZobrazit] = useState(false);
  const [chyba, setChyba] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hodnota === HESLO) {
      sessionStorage.setItem('ampersun_auth', 'true');
      onLogin();
    } else {
      setChyba(true);
      setHodnota('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/ampersun-logo.png"
            alt="AmperSun"
            width={180}
            height={52}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Karta */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mx-auto mb-5">
            <Lock className="w-5 h-5 text-white" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Přihlášení</h1>
          <p className="text-sm text-gray-400 text-center mb-6">Interní systém AmperSun</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Heslo</label>
              <div className="relative">
                <input
                  type={zobrazit ? 'text' : 'password'}
                  value={hodnota}
                  onChange={(e) => { setHodnota(e.target.value); setChyba(false); }}
                  placeholder="Zadejte heslo"
                  autoFocus
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                    chyba ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setZobrazit(!zobrazit)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {zobrazit ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {chyba && (
                <p className="mt-1.5 text-xs text-red-600">Nesprávné heslo. Zkuste to znovu.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
            >
              Přihlásit se
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          AmperSun s.r.o. · Interní nástroj
        </p>
      </div>
    </div>
  );
}

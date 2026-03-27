import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import { StavKalkulace, PrioritaZakazky, TypZakazky } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDatum(dateStr: string, formatStr = 'd. M. yyyy'): string {
  try {
    return format(parseISO(dateStr), formatStr, { locale: cs });
  } catch {
    return dateStr;
  }
}

export function formatDatumCas(dateStr: string): string {
  return formatDatum(dateStr, 'd. M. yyyy HH:mm');
}

export function formatCena(value: number): string {
  if (!value && value !== 0) return '–';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

export function stavColor(stav: StavKalkulace): string {
  switch (stav) {
    case 'rozpracovano': return 'bg-gray-100 text-gray-700';
    case 'ceka_na_schvaleni': return 'bg-amber-100 text-amber-700';
    case 'schvaleno': return 'bg-green-100 text-green-700';
    case 'nabidka_odeslana': return 'bg-blue-100 text-blue-700';
  }
}

export function stavDot(stav: StavKalkulace): string {
  switch (stav) {
    case 'rozpracovano': return 'bg-gray-400';
    case 'ceka_na_schvaleni': return 'bg-amber-400';
    case 'schvaleno': return 'bg-green-500';
    case 'nabidka_odeslana': return 'bg-blue-500';
  }
}

export function prioritaColor(priorita: PrioritaZakazky): string {
  switch (priorita) {
    case 'nizka': return 'bg-slate-100 text-slate-600';
    case 'stredni': return 'bg-orange-100 text-orange-700';
    case 'vysoka': return 'bg-red-100 text-red-700';
  }
}

export function typZakazkyColor(typ: TypZakazky): string {
  switch (typ) {
    case 'fve_rodinny_dum': return 'bg-emerald-100 text-emerald-700';
    case 'fve_firma': return 'bg-violet-100 text-violet-700';
    case 'fve_obec': return 'bg-sky-100 text-sky-700';
    case 'bateriove_uloziste': return 'bg-amber-100 text-amber-700';
    case 'servis_rozsireni': return 'bg-rose-100 text-rose-700';
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function cisloNabidky(cislo: string): string {
  return cislo;
}

// Vypočítá % rozdíl dvou čísel
export function rozdilProcent(puvodni: number, finalni: number): number {
  if (puvodni === 0) return 0;
  return Math.round(((finalni - puvodni) / puvodni) * 100);
}

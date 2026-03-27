export const TOUR_KEY = 'ampersun_tour_step';

/** Vrátí aktuální globální krok průvodce, nebo null pokud průvodce neběží */
export function getTourStep(): number | null {
  if (typeof window === 'undefined') return null;
  const s = sessionStorage.getItem(TOUR_KEY);
  return s !== null ? Number(s) : null;
}

/** Uloží aktuální globální krok */
export function setTourStep(step: number) {
  sessionStorage.setItem(TOUR_KEY, String(step));
}

/** Ukončí průvodce */
export function endTour() {
  sessionStorage.removeItem(TOUR_KEY);
}

/** Rozsahy kroků pro každou stránku (globální indexy) */
export const TOUR_PAGES = {
  dashboard: { start: 0, end: 1 },
  nova:      { start: 2, end: 5 },
  list:      { start: 6, end: 7 },
  detail:    { start: 8, end: 10 },
  nabidka:   { start: 11, end: 12 },
} as const;

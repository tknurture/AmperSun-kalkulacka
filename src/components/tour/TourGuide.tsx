'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useKalkulaceStore } from '@/lib/store';
import { getTourStep, setTourStep, endTour, isTourDone, TOUR_PAGES } from '@/lib/tour';
import 'driver.js/dist/driver.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeDriver: any = null;

function destroyDriver() {
  if (activeDriver) {
    try { activeDriver.destroy(); } catch { /* noop */ }
    activeDriver = null;
  }
}

export default function TourGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const { kalkulace } = useKalkulaceStore();

  const routerRef = useRef(router);
  const kalkulaceRef = useRef(kalkulace);
  routerRef.current = router;
  kalkulaceRef.current = kalkulace;

  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const globalStep = getTourStep();
    // Pokud tour neběží nebo už byl dokončen, nic nedělej
    if (globalStep === null || isTourDone()) return;

    destroyDriver();

    const timer = setTimeout(async () => {
      if (cancelledRef.current) return;

      const step = getTourStep();
      if (step === null) return;

      try {
        const { driver } = await import('driver.js');
        if (cancelledRef.current) return;

        function navigateTo(nextStep: number, url: string) {
          setTourStep(nextStep);
          routerRef.current.push(url);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function go(steps: any[], localIndex: number) {
          activeDriver = driver({
            animate: true,
            smoothScroll: true,
            allowClose: true,
            overlayOpacity: 0.6,
            stagePadding: 6,
            stageRadius: 8,
            showProgress: false,
            popoverClass: 'ampersun-tour-popover',
            nextBtnText: 'Další →',
            prevBtnText: '← Zpět',
            doneBtnText: 'Dokončit',
            onCloseClick: (_el: unknown, _step: unknown, { driver: d }: { driver: { destroy: () => void } }) => {
              endTour();
              d.destroy();
            },
            onDestroyed: () => { activeDriver = null; },
            steps,
          });
          activeDriver.drive(localIndex);
        }

        // ── DASHBOARD (0–1) ──────────────────────────────────────────
        if (pathname === '/') {
          const { start, end } = TOUR_PAGES.dashboard;
          if (step < start || step > end) return;
          go([
            {
              popover: {
                title: '👋 Vítejte v AmperSun!',
                description: 'Tento průvodce vás provede celým procesem — od vytvoření kalkulace až po stažení PDF nabídky.',
                side: 'over' as const,
                align: 'center' as const,
                onNextClick: () => { setTourStep(1); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-nova-btn',
              popover: {
                title: 'Nová kalkulace',
                description: 'Tímto tlačítkem vytvoříte novou zakázku.',
                side: 'bottom' as const,
                align: 'end' as const,
                onNextClick: () => navigateTo(TOUR_PAGES.nova.start, '/kalkulace/nova'),
              },
            },
          ], step - start);
          return;
        }

        // ── NOVÁ KALKULACE (2–5) ────────────────────────────────────
        if (pathname === '/kalkulace/nova') {
          const { start, end } = TOUR_PAGES.nova;
          if (step < start || step > end) return;
          go([
            {
              element: '#tour-typ-zakazky',
              popover: {
                title: 'Typ zakázky',
                description: 'Nejprve vyberte typ zakázky. Pro běžný dům zvolte <b>FVE Rodinný dům</b>.',
                side: 'bottom' as const,
                align: 'start' as const,
                onNextClick: () => { setTourStep(3); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-klient',
              popover: {
                title: 'Údaje zákazníka',
                description: 'Vyplňte jméno, adresu realizace a kontaktní údaje.',
                side: 'top' as const,
                align: 'center' as const,
                onNextClick: () => { setTourStep(4); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-technicke',
              popover: {
                title: 'Technické parametry',
                description: 'Zadejte výkon FVE v kWp a počet panelů.',
                side: 'top' as const,
                align: 'center' as const,
                onNextClick: () => { setTourStep(5); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-save-btn',
              popover: {
                title: 'Uložit a pokračovat',
                description: 'Po vyplnění klikněte na <b>Uložit</b>. Systém automaticky spočítá cenu.',
                side: 'top' as const,
                align: 'end' as const,
                onNextClick: () => navigateTo(TOUR_PAGES.list.start, '/kalkulace'),
              },
            },
          ], step - start);
          return;
        }

        // ── SEZNAM (6–7) ────────────────────────────────────────────
        if (pathname === '/kalkulace') {
          const { start, end } = TOUR_PAGES.list;
          if (step < start || step > end) return;
          const firstId = kalkulaceRef.current[0]?.id;
          go([
            {
              element: '#tour-filters',
              popover: {
                title: 'Vyhledávání a filtry',
                description: 'Filtrujte podle typu, stavu nebo vyhledávejte.',
                side: 'bottom' as const,
                align: 'start' as const,
                onNextClick: () => { setTourStep(7); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-kalkulace-row',
              popover: {
                title: 'Detail kalkulace',
                description: 'Kliknutím na ikonu oka otevřete detail.',
                side: 'top' as const,
                align: 'center' as const,
                onNextClick: () => {
                  if (!firstId) { endTour(); activeDriver?.destroy(); return; }
                  navigateTo(TOUR_PAGES.detail.start, `/kalkulace/${firstId}`);
                },
              },
            },
          ], step - start);
          return;
        }

        // ── DETAIL (8–10) ───────────────────────────────────────────
        const detailMatch = pathname.match(/^\/kalkulace\/([^/]+)$/);
        if (detailMatch) {
          const { start, end } = TOUR_PAGES.detail;
          if (step < start || step > end) return;
          const approvedKalk = kalkulaceRef.current.find((k) => k.cenova?.schvaleno);
          const currentId = detailMatch[1];
          go([
            {
              element: '#tour-price-cards',
              popover: {
                title: 'Přehled cen',
                description: 'Pravidlová kalkulace, doporučená cena a finální návrh.',
                side: 'bottom' as const,
                align: 'center' as const,
                onNextClick: () => { setTourStep(9); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-polozky',
              popover: {
                title: 'Rozpis položek',
                description: 'Detailní přehled všech položek kalkulace.',
                side: 'top' as const,
                align: 'center' as const,
                onNextClick: () => { setTourStep(10); activeDriver?.moveNext(); },
              },
            },
            {
              element: '#tour-schvaleni-panel',
              popover: {
                title: 'Schválení ceny',
                description: 'Zadejte finální cenu a klikněte <b>Schválit</b>. Tím se zpřístupní PDF.',
                side: 'left' as const,
                align: 'start' as const,
                onNextClick: () => {
                  const targetId = approvedKalk?.id ?? currentId;
                  navigateTo(TOUR_PAGES.nabidka.start, `/kalkulace/${targetId}/nabidka`);
                },
              },
            },
          ], step - start);
          return;
        }

        // ── NABÍDKA (11–12) ─────────────────────────────────────────
        const nabidkaMatch = pathname.match(/^\/kalkulace\/([^/]+)\/nabidka$/);
        if (nabidkaMatch) {
          const { start, end } = TOUR_PAGES.nabidka;
          if (step < start || step > end) return;
          go([
            {
              element: '#tour-download-btn',
              popover: {
                title: 'Stažení PDF',
                description: 'Kliknutím se vygeneruje a stáhne PDF nabídka.',
                side: 'bottom' as const,
                align: 'end' as const,
                onNextClick: () => { setTourStep(12); activeDriver?.moveNext(); },
              },
            },
            {
              popover: {
                title: '🎉 Hotovo!',
                description: 'Nyní znáte celý proces od kalkulace až po PDF nabídku. Hodně úspěchů!',
                side: 'over' as const,
                align: 'center' as const,
                onNextClick: () => { endTour(); activeDriver?.destroy(); },
              },
            },
          ], step - start);
        }
      } catch (err) {
        console.error('[TourGuide] Chyba:', err);
      }
    }, 600);

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
      destroyDriver();
    };
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

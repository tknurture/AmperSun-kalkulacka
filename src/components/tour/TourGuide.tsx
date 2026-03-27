'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useKalkulaceStore } from '@/lib/store';
import { getTourStep, setTourStep, endTour, TOUR_PAGES } from '@/lib/tour';
import 'driver.js/dist/driver.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeDriver: any = null;

function destroyDriver() {
  if (activeDriver) {
    try { activeDriver.destroy(); } catch { /* ignore */ }
    activeDriver = null;
  }
}

export default function TourGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const { kalkulace } = useKalkulaceStore();

  // Refs drží vždy aktuální hodnoty – nebloky useEffect na re-renderech
  const routerRef = useRef(router);
  const kalkulaceRef = useRef(kalkulace);
  routerRef.current = router;
  kalkulaceRef.current = kalkulace;

  useEffect(() => {
    const globalStep = getTourStep();
    if (globalStep === null) return;

    destroyDriver();

    // Prodleva, aby se stihly vyrenderovat všechny elementy
    const timer = setTimeout(async () => {
      const step = getTourStep();
      if (step === null) return;

      const { driver } = await import('driver.js');

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
          doneBtnText: 'Zavřít',
          onDestroyed: () => { activeDriver = null; },
          steps,
        });
        activeDriver.drive(localIndex);
      }

      // ── DASHBOARD (0–1) ──────────────────────────────────────────────────
      if (pathname === '/') {
        const { start, end } = TOUR_PAGES.dashboard;
        if (step < start || step > end) return;
        go([
          {
            popover: {
              title: '👋 Vítejte v AmperSun!',
              description: 'Tento průvodce vás provede celým procesem — od vytvoření kalkulace až po stažení PDF nabídky. Klikněte <b>Další</b> pro pokračování.',
              side: 'over',
              align: 'center',
              onNextClick: () => { setTourStep(1); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-nova-btn',
            popover: {
              title: 'Nová kalkulace',
              description: 'Tímto tlačítkem vytvoříte novou zakázku. Vyplníte zákazníka, technické parametry a systém spočítá cenu.',
              side: 'bottom',
              align: 'end',
              onNextClick: () => {
                setTourStep(TOUR_PAGES.nova.start);
                setTimeout(() => {
                  destroyDriver();
                  routerRef.current.push('/kalkulace/nova');
                }, 50);
              },
            },
          },
        ], step - start);
        return;
      }

      // ── NOVÁ KALKULACE (2–5) ─────────────────────────────────────────────
      if (pathname === '/kalkulace/nova') {
        const { start, end } = TOUR_PAGES.nova;
        if (step < start || step > end) return;
        go([
          {
            element: '#tour-typ-zakazky',
            popover: {
              title: 'Typ zakázky',
              description: 'Nejprve vyberte typ zakázky. Pro běžný dům zvolte <b>FVE Rodinný dům</b>.',
              side: 'bottom',
              align: 'start',
              onNextClick: () => { setTourStep(3); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-klient',
            popover: {
              title: 'Údaje zákazníka',
              description: 'Vyplňte jméno nebo název firmy, adresu realizace a kontaktní údaje zákazníka.',
              side: 'top',
              align: 'center',
              onNextClick: () => { setTourStep(4); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-technicke',
            popover: {
              title: 'Technické parametry FVE',
              description: 'Zadejte výkon FVE v kWp a počet panelů. Typ panelů a střídač jsou volitelné upřesnění.',
              side: 'top',
              align: 'center',
              onNextClick: () => { setTourStep(5); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-save-btn',
            popover: {
              title: 'Uložit a pokračovat',
              description: 'Po vyplnění formuláře klikněte na <b>Uložit a přejít na kalkulaci</b>. Systém automaticky spočítá cenu.',
              side: 'top',
              align: 'end',
              onNextClick: () => {
                setTourStep(TOUR_PAGES.list.start);
                setTimeout(() => {
                  destroyDriver();
                  routerRef.current.push('/kalkulace');
                }, 50);
              },
            },
          },
        ], step - start);
        return;
      }

      // ── SEZNAM (6–7) ────────────────────────────────────────────────────
      if (pathname === '/kalkulace') {
        const { start, end } = TOUR_PAGES.list;
        if (step < start || step > end) return;
        const firstId = kalkulaceRef.current[0]?.id;
        go([
          {
            element: '#tour-filters',
            popover: {
              title: 'Vyhledávání a filtry',
              description: 'Kalkulace lze filtrovat podle typu zakázky a stavu, nebo vyhledávat podle jména zákazníka či čísla nabídky.',
              side: 'bottom',
              align: 'start',
              onNextClick: () => { setTourStep(7); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-kalkulace-row',
            popover: {
              title: 'Detail kalkulace',
              description: 'Každý řádek je jedna zakázka. Kliknutím na ikonu oka 👁 otevřete detail s výpočtem ceny.',
              side: 'top',
              align: 'center',
              onNextClick: () => {
                if (!firstId) { endTour(); destroyDriver(); return; }
                setTourStep(TOUR_PAGES.detail.start);
                setTimeout(() => {
                  destroyDriver();
                  routerRef.current.push(`/kalkulace/${firstId}`);
                }, 50);
              },
            },
          },
        ], step - start);
        return;
      }

      // ── DETAIL (8–10) ───────────────────────────────────────────────────
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
              description: 'Systém spočítal cenu automaticky. Vidíte <b>pravidlovou kalkulaci</b>, <b>doporučenou cenu</b> z historicky podobných zakázek a <b>finální návrh</b>.',
              side: 'bottom',
              align: 'center',
              onNextClick: () => { setTourStep(9); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-polozky',
            popover: {
              title: 'Rozpis položek',
              description: 'Detailní přehled všech položek kalkulace. Kliknutím na <b>Upravit položky</b> můžete ručně upravit ceny.',
              side: 'top',
              align: 'center',
              onNextClick: () => { setTourStep(10); activeDriver?.moveNext(); },
            },
          },
          {
            element: '#tour-schvaleni-panel',
            popover: {
              title: 'Schválení finální ceny',
              description: 'Zadejte finální cenu (nebo slevu) a klikněte na <b>Schválit cenu</b>. Tím se zpřístupní generování PDF nabídky.',
              side: 'left',
              align: 'start',
              onNextClick: () => {
                const targetId = approvedKalk?.id ?? currentId;
                setTourStep(TOUR_PAGES.nabidka.start);
                setTimeout(() => {
                  destroyDriver();
                  routerRef.current.push(`/kalkulace/${targetId}/nabidka`);
                }, 50);
              },
            },
          },
        ], step - start);
        return;
      }

      // ── NABÍDKA (11–12) ─────────────────────────────────────────────────
      const nabidkaMatch = pathname.match(/^\/kalkulace\/([^/]+)\/nabidka$/);
      if (nabidkaMatch) {
        const { start, end } = TOUR_PAGES.nabidka;
        if (step < start || step > end) return;
        go([
          {
            element: '#tour-download-btn',
            popover: {
              title: 'Stažení PDF nabídky',
              description: 'Kliknutím na toto tlačítko se vygeneruje PDF nabídka a automaticky se stáhne do vašeho počítače.',
              side: 'bottom',
              align: 'end',
              onNextClick: () => { setTourStep(12); activeDriver?.moveNext(); },
            },
          },
          {
            popover: {
              title: '🎉 Průvodce dokončen!',
              description: 'Skvěle! Nyní znáte celý proces — od vytvoření kalkulace až po stažení profesionální PDF nabídky pro zákazníka. Hodně úspěchů!',
              side: 'over',
              align: 'center',
              onNextClick: () => { endTour(); destroyDriver(); },
            },
          },
        ], step - start);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      destroyDriver();
    };
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

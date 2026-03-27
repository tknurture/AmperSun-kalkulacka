// ============================================================
// Zustand store – globální stav aplikace
// Persistence přes localStorage
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Kalkulace, StavKalkulace, CenovaKalkulace } from './types';
import { DEMO_KALKULACE } from './seedData';

interface KalkulaceStore {
  kalkulace: Kalkulace[];
  posledniCislo: number;

  // CRUD
  addKalkulace: (kalkulace: Kalkulace) => void;
  updateKalkulace: (id: string, data: Partial<Kalkulace>) => void;
  deleteKalkulace: (id: string) => void;
  getKalkulace: (id: string) => Kalkulace | undefined;

  // Číslo nabídky
  generateCisloNabidky: () => string;

  // Cena
  updateCenova: (id: string, cenova: CenovaKalkulace) => void;
  updateStav: (id: string, stav: StavKalkulace) => void;
}

const generateId = () => `kal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useKalkulaceStore = create<KalkulaceStore>()(
  persist(
    (set, get) => ({
      kalkulace: DEMO_KALKULACE,
      posledniCislo: DEMO_KALKULACE.length,

      addKalkulace: (kalkulace) =>
        set((state) => ({
          kalkulace: [kalkulace, ...state.kalkulace],
        })),

      updateKalkulace: (id, data) =>
        set((state) => ({
          kalkulace: state.kalkulace.map((k) =>
            k.id === id
              ? { ...k, ...data, datumUpravy: new Date().toISOString() }
              : k
          ),
        })),

      deleteKalkulace: (id) =>
        set((state) => ({
          kalkulace: state.kalkulace.filter((k) => k.id !== id),
        })),

      getKalkulace: (id) => get().kalkulace.find((k) => k.id === id),

      generateCisloNabidky: () => {
        const state = get();
        const noveCislo = state.posledniCislo + 1;
        const rok = new Date().getFullYear();
        set({ posledniCislo: noveCislo });
        return `AMP-${rok}-${String(noveCislo).padStart(3, '0')}`;
      },

      updateCenova: (id, cenova) =>
        set((state) => ({
          kalkulace: state.kalkulace.map((k) =>
            k.id === id
              ? { ...k, cenova, datumUpravy: new Date().toISOString() }
              : k
          ),
        })),

      updateStav: (id, stav) =>
        set((state) => ({
          kalkulace: state.kalkulace.map((k) =>
            k.id === id
              ? {
                  ...k,
                  obchodniUdaje: { ...k.obchodniUdaje, stav },
                  datumUpravy: new Date().toISOString(),
                }
              : k
          ),
        })),
    }),
    {
      name: 'ampersun-kalkulace',
      version: 1,
    }
  )
);

// ---- Pomocná funkce: vytvoření nové prázdné kalkulace ----
export function createEmptyKalkulace(cisloNabidky: string): Kalkulace {
  return {
    id: generateId(),
    cisloNabidky,
    datumVytvoreni: new Date().toISOString(),
    datumUpravy: new Date().toISOString(),
    typZakazky: 'fve_rodinny_dum',
    klient: {
      jmeno: '',
      kontaktniOsoba: '',
      telefon: '',
      email: '',
      adresaRealizace: '',
      fakturacniAdresa: '',
      poznamka: '',
    },
    technickeUdaje: {
      spotrebaElektriny: 5000,
      vykonFVE: 8.8,
      pocetPanelu: 20,
      typPanelu: 'Longi Solar Hi-MO 440W',
      typStridace: 'Fronius Primo 8.2',
      baterieAno: false,
      kapacitaBaterie: 0,
      wallboxAno: false,
      chyteRizeniAno: false,
      zalozniRezimAno: false,
      monitoringAno: true,
      typObjektu: 'rodinny_dum',
      typStrechy: 'sediova',
      sklonStrechy: 35,
      orientaceStrechy: 'jih',
      slozitostMontaze: 'jednoducha',
      vzdalenostRealizace: 30,
      elektroupravyAno: false,
      revizeAno: true,
      projektovaDokumentaceAno: false,
      vyrizeniDotaceAno: false,
    },
    obchodniUdaje: {
      interniPoznamka: '',
      priorita: 'stredni',
      predpokladanyTermin: '',
      stav: 'rozpracovano',
    },
    cenova: null,
  };
}

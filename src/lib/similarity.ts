// ============================================================
// Algoritmus podobnosti – porovnání nové zakázky s historií
// ============================================================

import { HistorickaZakazka, TechnickeUdaje, TypZakazky, CenovaDoporuceni, SlozitostMontaze, TypObjektu } from './types';
import { HISTORICKE_ZAKAZKY } from './seedData';

// Váhy jednotlivých parametrů (součet = 1.0)
const VAHY = {
  typZakazky: 0.25,    // Typ zakázky je nejdůležitější
  vykonFVE: 0.20,       // Výkon FVE
  baterieAno: 0.10,     // Přítomnost baterie
  kapacitaBaterie: 0.08, // Kapacita baterie
  slozitostMontaze: 0.10, // Složitost montáže
  typObjektu: 0.08,     // Typ objektu
  typStrechy: 0.05,      // Typ střechy
  vzdalenost: 0.07,      // Vzdálenost
  doplnky: 0.07,        // Doplňky (wallbox, dotace...)
};

// ---- Výpočet podobnosti jedné historické zakázky ----

function skoreTypuZakazky(typ1: TypZakazky, typ2: TypZakazky): number {
  if (typ1 === typ2) return 1.0;
  // Podobné kategorie
  if (typ1 === 'fve_rodinny_dum' && typ2 === 'fve_firma') return 0.4;
  if (typ1 === 'fve_firma' && typ2 === 'fve_rodinny_dum') return 0.4;
  if (typ1 === 'fve_firma' && typ2 === 'fve_obec') return 0.5;
  if (typ1 === 'fve_obec' && typ2 === 'fve_firma') return 0.5;
  return 0.1;
}

function skoreVykonu(vykon1: number, vykon2: number): number {
  // Oba nula (baterie/servis) → neutrální shoda, ne maximální
  if (vykon2 === 0 && vykon1 === 0) return 0.5;
  if (vykon2 === 0 || vykon1 === 0) return 0.0;
  const rozdil = Math.abs(vykon1 - vykon2);
  const prum = (vykon1 + vykon2) / 2;
  const pctRozdil = rozdil / prum;
  // Lineární pokles: do 10% = 1.0, nad 100% = 0.0
  return Math.max(0, 1 - pctRozdil);
}

function skoreVzdalenosti(d1: number, d2: number): number {
  const rozdil = Math.abs(d1 - d2);
  return Math.max(0, 1 - rozdil / 200);
}

function skoreKapacityBaterie(k1: number, k2: number, bat1: boolean, bat2: boolean): number {
  if (!bat1 && !bat2) return 1.0;
  if (bat1 !== bat2) return 0.0;
  const rozdil = Math.abs(k1 - k2);
  const prum = (k1 + k2) / 2;
  return prum > 0 ? Math.max(0, 1 - rozdil / prum) : 1.0;
}

function skoreSlozitosti(s1: SlozitostMontaze, s2: SlozitostMontaze): number {
  if (s1 === s2) return 1.0;
  const levels: Record<SlozitostMontaze, number> = { jednoducha: 0, stredni: 1, slozita: 2 };
  const l1 = levels[s1];
  const l2 = levels[s2];
  return 1 - Math.abs(l1 - l2) / 2;
}

function skoreTypuObjektu(t1: TypObjektu, t2: TypObjektu): number {
  if (t1 === t2) return 1.0;
  // Skupiny podobných objektů
  const skupina1 = ['rodinny_dum', 'bytovy_dum'];
  const skupina2 = ['prumyslovy_objekt', 'zemedelsky_objekt', 'kancelarske_prostory'];
  const skupina3 = ['obecni_objekt'];

  const vSkupine = (s: string[], t: string) => s.includes(t);
  if (vSkupine(skupina1, t1) && vSkupine(skupina1, t2)) return 0.7;
  if (vSkupine(skupina2, t1) && vSkupine(skupina2, t2)) return 0.7;
  return 0.2;
}

function skoreDoplnku(
  nova: TechnickeUdaje,
  hist: HistorickaZakazka
): number {
  let shoda = 0;
  let celkem = 0;

  const porovnej = (a: boolean, b: boolean) => {
    celkem++;
    if (a === b) shoda++;
  };

  porovnej(nova.wallboxAno, hist.wallboxAno);
  porovnej(nova.vyrizeniDotaceAno, hist.vyrizeniDotaceAno);
  porovnej(nova.baterieAno, hist.baterieAno);

  return celkem > 0 ? shoda / celkem : 1.0;
}

export function vypocitejPodobnost(
  nova: { typZakazky: TypZakazky; technickeUdaje: TechnickeUdaje },
  historicka: HistorickaZakazka
): number {
  const t = nova.technickeUdaje;

  const skore =
    VAHY.typZakazky * skoreTypuZakazky(nova.typZakazky, historicka.typZakazky) +
    VAHY.vykonFVE * skoreVykonu(t.vykonFVE, historicka.vykonFVE) +
    VAHY.baterieAno * (t.baterieAno === historicka.baterieAno ? 1 : 0) +
    VAHY.kapacitaBaterie * skoreKapacityBaterie(
      t.kapacitaBaterie, historicka.kapacitaBaterie,
      t.baterieAno, historicka.baterieAno
    ) +
    VAHY.slozitostMontaze * skoreSlozitosti(t.slozitostMontaze, historicka.slozitostMontaze) +
    VAHY.typObjektu * skoreTypuObjektu(t.typObjektu, historicka.typObjektu) +
    VAHY.typStrechy * (t.typStrechy === historicka.typStrechy ? 1 : 0.3) +
    VAHY.vzdalenost * skoreVzdalenosti(t.vzdalenostRealizace, historicka.vzdalenostRealizace) +
    VAHY.doplnky * skoreDoplnku(t, historicka);

  return Math.round(skore * 100) / 100;
}

// ---- Najdi podobné zakázky a spočítej doporučení ----

export function najdiPodobneZakazky(
  nova: { typZakazky: TypZakazky; technickeUdaje: TechnickeUdaje },
  minPodobnost = 0.35,
  maxPocet = 8
): CenovaDoporuceni {
  // Spočítej podobnost pro všechny historické zakázky
  const ohodnocene = HISTORICKE_ZAKAZKY.map((hz) => ({
    ...hz,
    podobnost: vypocitejPodobnost(nova, hz),
  })).sort((a, b) => b.podobnost - a.podobnost);

  const relevantni = ohodnocene
    .filter((hz) => hz.podobnost >= minPodobnost)
    .slice(0, maxPocet);

  // Použij top 3–5 pro výpočet doporučené ceny
  const proVypocet = relevantni.slice(0, 5);

  if (proVypocet.length === 0) {
    return {
      prumernaCena: 0,
      minCena: 0,
      maxCena: 0,
      doporucenaCena: 0,
      podobneZakazky: [],
    };
  }

  const ceny = proVypocet.map((hz) => hz.finalniCena);
  const prumernaCena = Math.round(ceny.reduce((s, c) => s + c, 0) / ceny.length);
  const minCena = Math.min(...ceny);
  const maxCena = Math.max(...ceny);

  // Vážený průměr podle podobnosti
  const vazenaSum = proVypocet.reduce((s, hz) => s + hz.finalniCena * hz.podobnost, 0);
  const podobnostSum = proVypocet.reduce((s, hz) => s + hz.podobnost, 0);
  const doporucenaCena = Math.round(vazenaSum / podobnostSum);

  return {
    prumernaCena,
    minCena,
    maxCena,
    doporucenaCena,
    podobneZakazky: relevantni,
  };
}

// ============================================================
// Cenová logika – pravidlová kalkulace zakázky
// ============================================================

import { TechnickeUdaje, TypZakazky, PolozkaKalkulace, SlozitostMontaze } from './types';

// ---- Ceník (v Kč bez DPH) ----
const CENIK = {
  // Panely – cena za 1 panel dle výkonu
  panel_do_400W: 4800,
  panel_400_450W: 5600,
  panel_nad_450W: 6400,

  // Střídač – cena za 1 kWp výkonu
  stridac_za_kwp_maly: 9500,   // do 10 kWp
  stridac_za_kwp_stredni: 8200, // 10–50 kWp
  stridac_za_kwp_velky: 7000,  // nad 50 kWp

  // Baterie – cena za 1 kWh kapacity
  baterie_za_kwh: 14500,

  // Montáž – cena za 1 panel dle složitosti
  montaz_jednoducha: 1100,
  montaz_stredni: 1600,
  montaz_slozita: 2400,

  // Elektroinstalace – paušál + za kWp
  elektro_pausal: 18000,
  elektro_za_kwp: 1800,

  // Kabeláž a doplňkový materiál
  material_pausal: 8000,
  material_za_kwp: 1200,

  // Doprava
  doprava_za_km: 28,
  doprava_minimum: 2500,

  // Revize
  revize: 8500,

  // Projektová dokumentace dle výkonu
  projekt_maly: 9000,    // do 10 kWp
  projekt_stredni: 16000, // 10–50 kWp
  projekt_velky: 28000,   // nad 50 kWp

  // Administrativa a uvedení do provozu
  administrativa: 5500,

  // Vyřízení dotace
  dotace: 12000,

  // Doplňky
  wallbox: 24000,
  monitoring: 7500,
  zalozni_rezim: 18000,
  chyte_rizeni: 11000,
  elektroupravy: 22000,

  // Marže (% z nákladů)
  marze_procent: 18,

  // Obchodní rezerva (% z celku)
  rezerva_procent: 5,
};

// ---- Pomocné funkce ----

function cenaPanelu(typPanelu: string): number {
  const typ = typPanelu.toLowerCase();
  if (typ.includes('500') || typ.includes('510') || typ.includes('520')) return CENIK.panel_nad_450W;
  if (typ.includes('440') || typ.includes('450') || typ.includes('460')) return CENIK.panel_400_450W;
  return CENIK.panel_do_400W;
}

function cenaStridaceZaKwp(vykon: number): number {
  if (vykon <= 10) return CENIK.stridac_za_kwp_maly;
  if (vykon <= 50) return CENIK.stridac_za_kwp_stredni;
  return CENIK.stridac_za_kwp_velky;
}

function cenaMontazeZaPanel(slozitost: SlozitostMontaze): number {
  switch (slozitost) {
    case 'jednoducha': return CENIK.montaz_jednoducha;
    case 'stredni': return CENIK.montaz_stredni;
    case 'slozita': return CENIK.montaz_slozita;
  }
}

function cenovaKategorieStridac(vykon: number): string {
  if (vykon <= 10) return 'Střídač – malý systém';
  if (vykon <= 50) return 'Střídač – střední systém';
  return 'Střídač – velký systém';
}

function cenovaKategorieProjekt(vykon: number): number {
  if (vykon <= 10) return CENIK.projekt_maly;
  if (vykon <= 50) return CENIK.projekt_stredni;
  return CENIK.projekt_velky;
}

// ---- Hlavní funkce – výpočet položek kalkulace ----

export function vypocitejPolozky(
  tech: TechnickeUdaje,
  typZakazky: TypZakazky
): PolozkaKalkulace[] {
  const polozky: PolozkaKalkulace[] = [];
  let id = 1;

  const addPolozka = (
    nazev: string,
    mnozstvi: number,
    jednotka: string,
    cenaJednotky: number,
    kategorie: string
  ) => {
    polozky.push({
      id: String(id++),
      nazev,
      mnozstvi,
      jednotka,
      cenaJednotky: Math.round(cenaJednotky),
      celkem: Math.round(mnozstvi * cenaJednotky),
      kategorie,
      upraveno: false,
    });
  };

  // === FVE komponenty ===
  if (typZakazky !== 'bateriove_uloziste' && typZakazky !== 'servis_rozsireni') {
    // Panely
    if (tech.pocetPanelu > 0) {
      const cenaPan = cenaPanelu(tech.typPanelu);
      addPolozka(
        `FV panely – ${tech.typPanelu || 'standard'}`,
        tech.pocetPanelu,
        'ks',
        cenaPan,
        'FV panely'
      );
    }

    // Střídač
    if (tech.vykonFVE > 0) {
      const cenaStr = cenaStridaceZaKwp(tech.vykonFVE) * tech.vykonFVE;
      addPolozka(
        `${cenovaKategorieStridac(tech.vykonFVE)} – ${tech.typStridace || 'standard'}`,
        1,
        'ks',
        cenaStr,
        'Střídač'
      );
    }

    // Kabeláž a materiál
    if (tech.vykonFVE > 0) {
      addPolozka(
        'Kabeláž, konektory a montážní materiál',
        1,
        'paušál',
        CENIK.material_pausal + CENIK.material_za_kwp * tech.vykonFVE,
        'Materiál'
      );
    }
  }

  // Servis / rozšíření – přidáme jen práce a materiál
  if (typZakazky === 'servis_rozsireni') {
    if (tech.pocetPanelu > 0) {
      addPolozka(
        `Rozšíření FVE – FV panely (${tech.typPanelu})`,
        tech.pocetPanelu,
        'ks',
        cenaPanelu(tech.typPanelu) * 1.05,
        'Rozšíření'
      );
    }
    addPolozka(
      'Servisní práce a kontrola systému',
      1,
      'paušál',
      15000,
      'Servis'
    );
  }

  // === Baterie ===
  if (tech.baterieAno && tech.kapacitaBaterie > 0) {
    addPolozka(
      `Bateriové úložiště ${tech.kapacitaBaterie} kWh`,
      tech.kapacitaBaterie,
      'kWh',
      CENIK.baterie_za_kwh,
      'Baterie'
    );
    addPolozka(
      'Instalace bateriového systému',
      1,
      'paušál',
      8000,
      'Baterie'
    );
  }

  // === Montáž ===
  if (tech.pocetPanelu > 0 && typZakazky !== 'bateriove_uloziste') {
    addPolozka(
      `Montáž FV panelů – ${tech.slozitostMontaze} složitost`,
      tech.pocetPanelu,
      'ks',
      cenaMontazeZaPanel(tech.slozitostMontaze),
      'Montáž'
    );
  }

  // === Elektroinstalace ===
  if (typZakazky !== 'servis_rozsireni') {
    const vykon = tech.vykonFVE > 0 ? tech.vykonFVE : 5; // min. paušál
    addPolozka(
      'Elektroinstalační práce',
      1,
      'paušál',
      CENIK.elektro_pausal + CENIK.elektro_za_kwp * vykon,
      'Elektroinstalace'
    );
  }

  // === Doplňky ===
  if (tech.wallboxAno) {
    addPolozka('Wallbox – nabíjecí stanice pro EV', 1, 'ks', CENIK.wallbox, 'Doplňky');
  }
  if (tech.monitoringAno) {
    addPolozka('Monitoring a online dohled systému', 1, 'ks', CENIK.monitoring, 'Doplňky');
  }
  if (tech.zalozniRezimAno) {
    addPolozka('Záložní režim – backup box', 1, 'ks', CENIK.zalozni_rezim, 'Doplňky');
  }
  if (tech.chyteRizeniAno) {
    addPolozka('Chytré řízení energie – smart energy management', 1, 'ks', CENIK.chyte_rizeni, 'Doplňky');
  }
  if (tech.elektroupravyAno) {
    addPolozka('Elektroúpravy – rozvaděč, jistič, přípojka', 1, 'paušál', CENIK.elektroupravy, 'Elektroúpravy');
  }

  // === Doprava ===
  const doprava = Math.max(CENIK.doprava_za_km * tech.vzdalenostRealizace, CENIK.doprava_minimum);
  addPolozka('Doprava a logistika', 1, 'paušál', doprava, 'Doprava');

  // === Administrativní náklady ===
  addPolozka('Administrativa, příprava smluv, uvedení do provozu', 1, 'paušál', CENIK.administrativa, 'Administrativa');

  // === Revize ===
  if (tech.revizeAno) {
    addPolozka('Revize elektroinstalace', 1, 'ks', CENIK.revize, 'Revize');
  }

  // === Projektová dokumentace ===
  if (tech.projektovaDokumentaceAno) {
    addPolozka('Projektová dokumentace', 1, 'paušál', cenovaKategorieProjekt(tech.vykonFVE), 'Projekt');
  }

  // === Vyřízení dotace ===
  if (tech.vyrizeniDotaceAno) {
    addPolozka('Poradenství a vyřízení dotace NZÚ', 1, 'paušál', CENIK.dotace, 'Dotace');
  }

  return polozky;
}

// ---- Výpočet ceny z položek ----

export interface VysledekKalkulace {
  polozky: PolozkaKalkulace[];
  odhadNakladu: number;
  marze: number;
  marzeProc: number;
  celkemBezDPH: number;
  dphSazba: number;
  dphCastka: number;
  celkemSDPH: number;
}

export function vypocitejCenu(polozky: PolozkaKalkulace[]): VysledekKalkulace {
  const naklady = polozky.reduce((sum, p) => sum + p.celkem, 0);
  const marze = Math.round(naklady * (CENIK.marze_procent / 100));
  const rezerva = Math.round((naklady + marze) * (CENIK.rezerva_procent / 100));
  const celkemBezDPH = naklady + marze + rezerva;
  const dphSazba = 21;
  const dphCastka = Math.round(celkemBezDPH * (dphSazba / 100));
  const celkemSDPH = celkemBezDPH + dphCastka;

  return {
    polozky,
    odhadNakladu: naklady,
    marze,
    marzeProc: CENIK.marze_procent + CENIK.rezerva_procent,
    celkemBezDPH,
    dphSazba,
    dphCastka,
    celkemSDPH,
  };
}

// ---- Přepočet celkových součtů z editovaných položek ----

export function prepocitejZPolozek(polozky: PolozkaKalkulace[]): {
  celkemBezDPH: number;
  dphCastka: number;
  celkemSDPH: number;
} {
  const celkemBezDPH = polozky.reduce((sum, p) => sum + p.celkem, 0);
  const dphCastka = Math.round(celkemBezDPH * 0.21);
  const celkemSDPH = celkemBezDPH + dphCastka;
  return { celkemBezDPH, dphCastka, celkemSDPH };
}

// ---- Formátování čísla jako cenu ----
export function formatCena(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

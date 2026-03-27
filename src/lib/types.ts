// ============================================================
// Typy a rozhraní pro AmperSun kalkulačku
// ============================================================

export type TypZakazky =
  | 'fve_rodinny_dum'
  | 'fve_firma'
  | 'fve_obec'
  | 'bateriove_uloziste'
  | 'servis_rozsireni';

export type StavKalkulace =
  | 'rozpracovano'
  | 'ceka_na_schvaleni'
  | 'schvaleno'
  | 'nabidka_odeslana';

export type TypObjektu =
  | 'rodinny_dum'
  | 'bytovy_dum'
  | 'kancelarske_prostory'
  | 'prumyslovy_objekt'
  | 'zemedelsky_objekt'
  | 'obecni_objekt';

export type TypStrechy =
  | 'sediova'
  | 'pultova'
  | 'ploche'
  | 'valbova'
  | 'mansardova';

export type SlozitostMontaze = 'jednoducha' | 'stredni' | 'slozita';

export type OrientaceStrechy =
  | 'jih'
  | 'jihozapad'
  | 'jihovychod'
  | 'zapad'
  | 'vychod'
  | 'sever';

export type PrioritaZakazky = 'nizka' | 'stredni' | 'vysoka';

// ---- Klient ----
export interface Klient {
  jmeno: string;
  kontaktniOsoba: string;
  telefon: string;
  email: string;
  adresaRealizace: string;
  fakturacniAdresa: string;
  poznamka: string;
}

// ---- Technické údaje ----
export interface TechnickeUdaje {
  spotrebaElektriny: number; // kWh/rok
  vykonFVE: number; // kWp
  pocetPanelu: number;
  typPanelu: string;
  typStridace: string;
  baterieAno: boolean;
  kapacitaBaterie: number; // kWh
  wallboxAno: boolean;
  chyteRizeniAno: boolean;
  zalozniRezimAno: boolean;
  monitoringAno: boolean;
  typObjektu: TypObjektu;
  typStrechy: TypStrechy;
  sklonStrechy: number; // stupně
  orientaceStrechy: OrientaceStrechy;
  slozitostMontaze: SlozitostMontaze;
  vzdalenostRealizace: number; // km
  elektroupravyAno: boolean;
  revizeAno: boolean;
  projektovaDokumentaceAno: boolean;
  vyrizeniDotaceAno: boolean;
}

// ---- Obchodní údaje ----
export interface ObchodniUdaje {
  interniPoznamka: string;
  priorita: PrioritaZakazky;
  predpokladanyTermin: string;
  stav: StavKalkulace;
}

// ---- Položka kalkulace ----
export interface PolozkaKalkulace {
  id: string;
  nazev: string;
  mnozstvi: number;
  jednotka: string;
  cenaJednotky: number;
  celkem: number;
  kategorie: string;
  upraveno: boolean;
}

// ---- Historická zakázka (seed data) ----
export interface HistorickaZakazka {
  id: string;
  typZakazky: TypZakazky;
  lokalita: string;
  kraj: string;
  vykonFVE: number;
  pocetPanelu: number;
  baterieAno: boolean;
  kapacitaBaterie: number;
  typObjektu: TypObjektu;
  typStrechy: TypStrechy;
  slozitostMontaze: SlozitostMontaze;
  doporucenaCena: number;
  finalniCena: number;
  datumRealizace: string;
  vzdalenostRealizace: number;
  wallboxAno: boolean;
  vyrizeniDotaceAno: boolean;
  pocetPanelu2?: number;
  podobnost?: number; // vypočteno při porovnání
}

// ---- Cenová doporučení ----
export interface CenovaDoporuceni {
  prumernaCena: number;
  minCena: number;
  maxCena: number;
  doporucenaCena: number;
  podobneZakazky: HistorickaZakazka[];
}

// ---- Cenová kalkulace ----
export interface CenovaKalkulace {
  polozky: PolozkaKalkulace[];
  celkemBezDPH: number;
  dphSazba: number; // %
  dphCastka: number;
  celkemSDPH: number;
  odhadNakladu: number;
  odhadMarze: number;
  odhadMarzeProc: number;

  pravidlovaKalkulace: number;
  doporucenaCena: number;
  cenoveRozpeti: { min: number; max: number };
  podobneZakazky: HistorickaZakazka[];

  // Finální schválení
  finalniCena: number;
  sleva: number; // Kč (kladná = sleva, záporná = přirážka)
  slevaProc: number;
  duvodZmeny: string;
  datumSchvaleni: string;
  schvaleno: boolean;
}

// ---- Hlavní entita kalkulace ----
export interface Kalkulace {
  id: string;
  cisloNabidky: string;
  datumVytvoreni: string;
  datumUpravy: string;
  typZakazky: TypZakazky;
  klient: Klient;
  technickeUdaje: TechnickeUdaje;
  obchodniUdaje: ObchodniUdaje;
  cenova: CenovaKalkulace | null;
}

// ---- Dashboard statistiky ----
export interface DashboardStats {
  celkemKalkulaci: number;
  schvalenych: number;
  odeslanychNabidek: number;
  prumernaHodnota: number;
  celkovyObjem: number;
}

// ---- Labely ----
export const TYP_ZAKAZKY_LABEL: Record<TypZakazky, string> = {
  fve_rodinny_dum: 'FVE – Rodinný dům',
  fve_firma: 'FVE – Firma',
  fve_obec: 'FVE – Obec / Město',
  bateriove_uloziste: 'Bateriové úložiště',
  servis_rozsireni: 'Servis / Rozšíření',
};

export const STAV_KALKULACE_LABEL: Record<StavKalkulace, string> = {
  rozpracovano: 'Rozpracováno',
  ceka_na_schvaleni: 'Čeká na schválení',
  schvaleno: 'Schváleno',
  nabidka_odeslana: 'Nabídka odeslána',
};

export const TYP_OBJEKTU_LABEL: Record<TypObjektu, string> = {
  rodinny_dum: 'Rodinný dům',
  bytovy_dum: 'Bytový dům',
  kancelarske_prostory: 'Kancelářské prostory',
  prumyslovy_objekt: 'Průmyslový objekt',
  zemedelsky_objekt: 'Zemědělský objekt',
  obecni_objekt: 'Obecní objekt',
};

export const TYP_STRECHY_LABEL: Record<TypStrechy, string> = {
  sediova: 'Sedlová',
  pultova: 'Pultová',
  ploche: 'Plochá',
  valbova: 'Valbová',
  mansardova: 'Mansardová',
};

export const SLOZITOST_LABEL: Record<SlozitostMontaze, string> = {
  jednoducha: 'Jednoduchá',
  stredni: 'Střední',
  slozita: 'Složitá',
};

export const PRIORITA_LABEL: Record<PrioritaZakazky, string> = {
  nizka: 'Nízká',
  stredni: 'Střední',
  vysoka: 'Vysoká',
};

export const ORIENTACE_LABEL: Record<OrientaceStrechy, string> = {
  jih: 'Jih',
  jihozapad: 'Jihozápad',
  jihovychod: 'Jihovýchod',
  zapad: 'Západ',
  vychod: 'Východ',
  sever: 'Sever',
};

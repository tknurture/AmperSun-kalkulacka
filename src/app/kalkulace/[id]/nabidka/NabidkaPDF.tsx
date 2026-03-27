'use client';

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { Kalkulace, PolozkaKalkulace, TYP_ZAKAZKY_LABEL } from '@/lib/types';
import { formatDatum } from '@/lib/utils';

// Helvetica nemá diakritiku → "Kč" by zobrazilo jen "K", použijeme CZK
function formatCena(value: number): string {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
    currencyDisplay: 'code',
  }).format(value);
}
import { Fragment } from 'react';

// ── Barvy ──────────────────────────────────────────────────────────────────
const NAVY = '#0F1C3F';
const GOLD = '#F5A623';
const GRAY900 = '#111827';
const GRAY600 = '#4B5563';
const GRAY400 = '#9CA3AF';
const GRAY200 = '#E5E7EB';
const GRAY50 = '#F9FAFB';
const AMBER50 = '#FFFBEB';
const AMBER200 = '#FDE68A';
const AMBER600 = '#D97706';
const AMBER900 = '#78350F';
const GREEN600 = '#16A34A';

// ── Styly ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: GRAY600,
    backgroundColor: 'white',
    flexDirection: 'column',
  },

  // Header
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 36,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWrap: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logo: {
    width: 120,
    height: 34,
    objectFit: 'contain',
  },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: GOLD },
  headerNum: { fontSize: 9, color: '#D1D5DB', marginTop: 4 },
  headerDate: { fontSize: 8, color: GRAY400, marginTop: 2 },

  // Content wrapper
  body: { paddingHorizontal: 36, paddingTop: 22, flex: 1 },

  // Section label
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GRAY400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: GRAY200, marginBottom: 16 },

  // Parties (2 sloupce)
  partiesRow: { flexDirection: 'row', marginBottom: 20 },
  partyCol: { flex: 1 },
  partySep: { width: 1, backgroundColor: GRAY200, marginHorizontal: 20 },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: GRAY900, marginBottom: 3 },
  partyLine: { fontSize: 8, color: GRAY600, marginBottom: 1 },
  partySmall: { fontSize: 7, color: GRAY400, marginBottom: 1 },

  // Solution box
  solutionBox: {
    backgroundColor: GRAY50,
    borderRadius: 6,
    padding: 14,
    marginBottom: 18,
  },
  solutionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: GRAY900, marginBottom: 10 },
  statsRow: { flexDirection: 'row', marginBottom: 10 },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: GRAY200,
    marginRight: 8,
  },
  statBoxLast: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: GRAY200,
  },
  statLabel: { fontSize: 7, color: GRAY400, marginBottom: 3 },
  statValue: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: GRAY900 },
  specRow: { fontSize: 8, color: GRAY600, marginBottom: 2 },
  specBold: { fontFamily: 'Helvetica-Bold' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  badge: {
    backgroundColor: GRAY200,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeText: { fontSize: 7, color: '#374151' },
  badgeGold: {
    backgroundColor: '#FEF3C7',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeGoldText: { fontSize: 7, color: AMBER900 },

  // Table
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: GRAY200,
    paddingBottom: 5,
    marginBottom: 2,
  },
  thText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY400, textTransform: 'uppercase' },
  catRow: { paddingTop: 8, paddingBottom: 2 },
  catText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY400, letterSpacing: 0.5, textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 4,
    alignItems: 'center',
  },
  colName: { flex: 3, fontSize: 8, color: GRAY600 },
  colQty: { flex: 1, fontSize: 8, color: GRAY400, textAlign: 'right' },
  colUnit: { flex: 1.5, fontSize: 8, color: GRAY600, textAlign: 'right' },
  colTotal: { flex: 1.5, fontFamily: 'Helvetica-Bold', fontSize: 8, color: GRAY900, textAlign: 'right' },

  // Totals
  totalsSection: {
    borderTopWidth: 2,
    borderTopColor: GRAY200,
    paddingTop: 10,
    marginTop: 6,
    alignItems: 'flex-end',
  },
  totalsBox: { width: 200 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { fontSize: 8, color: GRAY600 },
  totalValue: { fontSize: 8, color: GRAY600 },
  discountLabel: { fontSize: 8, color: GREEN600 },
  discountValue: { fontSize: 8, color: GREEN600 },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: GRAY200,
    paddingTop: 6,
    marginTop: 4,
  },
  grandLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: GRAY900 },
  grandValue: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: AMBER600 },

  // Conditions
  condBox: {
    backgroundColor: AMBER50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AMBER200,
    padding: 14,
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  condCol: { flex: 1 },
  condSep: { width: 1, backgroundColor: AMBER200, marginHorizontal: 16 },
  condTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: GRAY900, marginBottom: 6 },
  condLine: { fontSize: 8, color: GRAY600, marginBottom: 2 },

  // Signatures
  sigsRow: { flexDirection: 'row', marginTop: 8 },
  sigCol: { flex: 1, marginRight: 40 },
  sigColLast: { flex: 1 },
  sigLine: { borderTopWidth: 1, borderTopColor: GRAY400, paddingTop: 5, marginBottom: 4 },
  sigLabel: { fontSize: 7, color: GRAY400 },
  sigName: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: GRAY600, marginTop: 2 },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 36,
  },
  footerText: { fontSize: 7, color: GRAY400, textAlign: 'center' },

  // Accent bar under header
  accentBar: { height: 3, backgroundColor: GOLD },
});

// ── Pomocná funkce – seskupit položky ────────────────────────────────────────
function skupinyPolozek(polozky: PolozkaKalkulace[]) {
  return polozky.reduce((acc: Record<string, PolozkaKalkulace[]>, p) => {
    if (!acc[p.kategorie]) acc[p.kategorie] = [];
    acc[p.kategorie].push(p);
    return acc;
  }, {});
}

// ── PDF Document ──────────────────────────────────────────────────────────────
export function NabidkaPDFDocument({ kalkulace, logoUrl }: { kalkulace: Kalkulace; logoUrl: string }) {
  const { klient, technickeUdaje: t, cenova, cisloNabidky, datumVytvoreni, typZakazky } = kalkulace;
  if (!cenova) return null;

  const skupiny = skupinyPolozek(cenova.polozky);
  const stats: { label: string; value: string }[] = [];
  if (t.vykonFVE > 0) stats.push({ label: 'Výkon FVE', value: `${t.vykonFVE} kWp` });
  if (t.pocetPanelu > 0) stats.push({ label: 'Počet panelů', value: `${t.pocetPanelu} ks` });
  if (t.baterieAno && t.kapacitaBaterie > 0) stats.push({ label: 'Baterie', value: `${t.kapacitaBaterie} kWh` });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.logoWrap}>
            <Image src={logoUrl} style={s.logo} />
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>Cenová nabídka</Text>
            <Text style={s.headerNum}>{cisloNabidky}</Text>
            <Text style={s.headerDate}>{formatDatum(datumVytvoreni)}</Text>
          </View>
        </View>
        <View style={s.accentBar} />

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* Strany */}
          <View style={s.partiesRow}>
            <View style={s.partyCol}>
              <Text style={s.sectionLabel}>Odběratel</Text>
              <Text style={s.partyName}>{klient.jmeno}</Text>
              {klient.kontaktniOsoba && klient.kontaktniOsoba !== klient.jmeno && (
                <Text style={s.partySmall}>Kontakt: {klient.kontaktniOsoba}</Text>
              )}
              <Text style={s.partyLine}>{klient.adresaRealizace}</Text>
              {klient.fakturacniAdresa && klient.fakturacniAdresa !== klient.adresaRealizace && (
                <Text style={s.partySmall}>Fakt. adresa: {klient.fakturacniAdresa}</Text>
              )}
              {klient.telefon ? <Text style={s.partyLine}>{klient.telefon}</Text> : null}
              {klient.email ? <Text style={s.partyLine}>{klient.email}</Text> : null}
            </View>
            <View style={s.partySep} />
            <View style={s.partyCol}>
              <Text style={s.sectionLabel}>Dodavatel</Text>
              <Text style={s.partyName}>AmperSun s.r.o.</Text>
              <Text style={s.partyLine}>IČO: 12345678 · DIČ: CZ12345678</Text>
              <Text style={s.partyLine}>Energetická 42, 602 00 Brno</Text>
              <Text style={s.partyLine}>Tel: +420 800 123 456</Text>
              <Text style={s.partyLine}>info@ampersun.cz · www.ampersun.cz</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Navržené řešení */}
          <Text style={s.sectionLabel}>Navržené řešení</Text>
          <View style={s.solutionBox}>
            <Text style={s.solutionTitle}>{TYP_ZAKAZKY_LABEL[typZakazky]}</Text>
            {stats.length > 0 && (
              <View style={s.statsRow}>
                {stats.map((stat, i) => (
                  <View key={stat.label} style={i < stats.length - 1 ? s.statBox : s.statBoxLast}>
                    <Text style={s.statLabel}>{stat.label}</Text>
                    <Text style={s.statValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>
            )}
            {t.typPanelu && t.typPanelu !== '-' && (
              <Text style={s.specRow}><Text style={s.specBold}>Panely: </Text>{t.typPanelu}</Text>
            )}
            {t.typStridace ? (
              <Text style={s.specRow}><Text style={s.specBold}>Střídač: </Text>{t.typStridace}</Text>
            ) : null}
            <View style={s.badgesRow}>
              {t.wallboxAno && <View style={s.badge}><Text style={s.badgeText}>Wallbox</Text></View>}
              {t.monitoringAno && <View style={s.badge}><Text style={s.badgeText}>Monitoring</Text></View>}
              {t.zalozniRezimAno && <View style={s.badge}><Text style={s.badgeText}>Záložní režim</Text></View>}
              {t.chyteRizeniAno && <View style={s.badge}><Text style={s.badgeText}>Chytré řízení</Text></View>}
              {t.revizeAno && <View style={s.badge}><Text style={s.badgeText}>Revize</Text></View>}
              {t.vyrizeniDotaceAno && <View style={s.badgeGold}><Text style={s.badgeGoldText}>Dotace NZÚ</Text></View>}
            </View>
          </View>

          {/* Cenový rozpis */}
          <Text style={s.sectionLabel}>Cenový rozpis</Text>
          <View style={s.tableHead}>
            <Text style={[s.thText, { flex: 3 }]}>Položka</Text>
            <Text style={[s.thText, { flex: 1, textAlign: 'right' }]}>Množ.</Text>
            <Text style={[s.thText, { flex: 1.5, textAlign: 'right' }]}>Jedn. cena</Text>
            <Text style={[s.thText, { flex: 1.5, textAlign: 'right' }]}>Celkem</Text>
          </View>
          {Object.entries(skupiny).map(([kat, items]) => (
            <Fragment key={kat}>
              <View style={s.catRow}>
                <Text style={s.catText}>{kat}</Text>
              </View>
              {(items as PolozkaKalkulace[]).map((p) => (
                <View key={p.id} style={s.tableRow}>
                  <Text style={s.colName}>{p.nazev}</Text>
                  <Text style={s.colQty}>{p.mnozstvi} {p.jednotka}</Text>
                  <Text style={s.colUnit}>{formatCena(p.cenaJednotky)}</Text>
                  <Text style={s.colTotal}>{formatCena(p.celkem)}</Text>
                </View>
              ))}
            </Fragment>
          ))}

          {/* Součty */}
          <View style={s.totalsSection}>
            <View style={s.totalsBox}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Cena bez DPH</Text>
                <Text style={s.totalValue}>{formatCena(cenova.celkemBezDPH)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>DPH {cenova.dphSazba}%</Text>
                <Text style={s.totalValue}>{formatCena(cenova.dphCastka)}</Text>
              </View>
              {cenova.sleva > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.discountLabel}>Sleva</Text>
                  <Text style={s.discountValue}>-{formatCena(cenova.sleva)}</Text>
                </View>
              )}
              <View style={s.grandRow}>
                <Text style={s.grandLabel}>Celkem s DPH</Text>
                <Text style={s.grandValue}>{formatCena(cenova.finalniCena)}</Text>
              </View>
            </View>
          </View>

          {/* Podmínky */}
          <View style={s.condBox}>
            <View style={s.condCol}>
              <Text style={s.condTitle}>Podmínky nabídky</Text>
              <Text style={s.condLine}>Platnost nabídky: 30 dní od vydání</Text>
              <Text style={s.condLine}>Záruční doba: 2 roky (montáž), 25 let (panely)</Text>
              <Text style={s.condLine}>Způsob platby: zálohová faktura</Text>
            </View>
            {t.vyrizeniDotaceAno && (
              <>
                <View style={s.condSep} />
                <View style={s.condCol}>
                  <Text style={s.condTitle}>Poznámka k dotaci</Text>
                  <Text style={s.condLine}>
                    Nabídka obsahuje poradenství při vyřízení dotace NZÚ. Výše dotace závisí na
                    konkrétních parametrech systému a schválení žádosti.
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Podpisy */}
          <View style={s.sigsRow}>
            <View style={s.sigCol}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Za dodavatele</Text>
              <Text style={s.sigName}>AmperSun s.r.o.</Text>
            </View>
            <View style={s.sigColLast}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Za odběratele (schválení nabídky)</Text>
              <Text style={s.sigName}>{klient.jmeno}</Text>
            </View>
          </View>

        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            AmperSun s.r.o. · IČO: 12345678 · DIČ: CZ12345678 · Energetická 42, 602 00 Brno · info@ampersun.cz · www.ampersun.cz
          </Text>
        </View>
      </Page>
    </Document>
  );
}

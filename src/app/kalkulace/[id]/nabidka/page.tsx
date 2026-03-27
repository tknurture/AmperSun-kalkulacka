'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Printer } from 'lucide-react';
import Image from 'next/image';
import { useKalkulaceStore } from '@/lib/store';
import { formatCena, formatDatum } from '@/lib/utils';
import { TYP_ZAKAZKY_LABEL } from '@/lib/types';
import { Fragment } from 'react';
import Button from '@/components/ui/Button';
import { Kalkulace, PolozkaKalkulace } from '@/lib/types';
import { NabidkaPDFDocument } from './NabidkaPDF';

// ---- PDF šablona – renderuje se v prohlížeči a tiskne přes CSS print ----
function NabidkaTemplate({ kalkulace }: { kalkulace: Kalkulace }) {
  if (!kalkulace.cenova) return null;
  const { klient, technickeUdaje: t, cenova, cisloNabidky, datumVytvoreni, typZakazky } = kalkulace;

  // Skupiny položek pro zobrazení
  const skupiny = cenova.polozky.reduce((acc: Record<string, PolozkaKalkulace[]>, p: PolozkaKalkulace) => {
    if (!acc[p.kategorie]) acc[p.kategorie] = [];
    acc[p.kategorie].push(p);
    return acc;
  }, {} as Record<string, typeof cenova.polozky>);

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hlavička */}
      <div className="bg-gray-900 text-white px-10 py-8">
        <div className="flex items-start justify-between">
          <div className="bg-white rounded-lg px-3 py-2">
            <Image
              src="/ampersun-logo.png"
              alt="AmperSun"
              width={160}
              height={46}
              className="h-9 w-auto object-contain"
            />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">Cenová nabídka</div>
            <div className="text-gray-300 text-sm mt-1">{cisloNabidky}</div>
            <div className="text-gray-400 text-xs mt-0.5">{formatDatum(datumVytvoreni)}</div>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 space-y-8">
        {/* Zákazník */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Odběratel</div>
            <div className="font-bold text-gray-900 text-lg">{klient.jmeno}</div>
            {klient.kontaktniOsoba && klient.kontaktniOsoba !== klient.jmeno && (
              <div className="text-gray-600 text-sm">Kontakt: {klient.kontaktniOsoba}</div>
            )}
            <div className="text-gray-600 text-sm mt-1">{klient.adresaRealizace}</div>
            {klient.fakturacniAdresa && klient.fakturacniAdresa !== klient.adresaRealizace && (
              <div className="text-gray-500 text-xs mt-1">Fakt. adresa: {klient.fakturacniAdresa}</div>
            )}
            <div className="text-gray-600 text-sm mt-1">{klient.telefon}</div>
            <div className="text-gray-600 text-sm">{klient.email}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dodavatel</div>
            <div className="font-bold text-gray-900">AmperSun s.r.o.</div>
            <div className="text-gray-600 text-sm">IČO: 12345678</div>
            <div className="text-gray-600 text-sm">DIČ: CZ12345678</div>
            <div className="text-gray-600 text-sm">Energetická 42, 602 00 Brno</div>
            <div className="text-gray-600 text-sm mt-1">Tel: +420 800 123 456</div>
            <div className="text-gray-600 text-sm">info@ampersun.cz</div>
            <div className="text-gray-600 text-sm">www.ampersun.cz</div>
          </div>
        </div>

        {/* Navržené řešení */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navržené řešení</div>
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="text-base font-semibold text-gray-900 mb-3">
              {TYP_ZAKAZKY_LABEL[typZakazky]}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {t.vykonFVE > 0 && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500">Výkon FVE</div>
                  <div className="font-bold text-gray-900 text-lg">{t.vykonFVE} kWp</div>
                </div>
              )}
              {t.pocetPanelu > 0 && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500">Počet panelů</div>
                  <div className="font-bold text-gray-900 text-lg">{t.pocetPanelu} ks</div>
                </div>
              )}
              {t.baterieAno && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500">Baterie</div>
                  <div className="font-bold text-gray-900 text-lg">{t.kapacitaBaterie} kWh</div>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {t.typPanelu && t.typPanelu !== '-' && (
                <div><span className="font-medium">Panely:</span> {t.typPanelu}</div>
              )}
              {t.typStridace && (
                <div><span className="font-medium">Střídač:</span> {t.typStridace}</div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {t.wallboxAno && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Wallbox</span>}
                {t.monitoringAno && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Monitoring</span>}
                {t.zalozniRezimAno && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Záložní režim</span>}
                {t.chyteRizeniAno && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Chytré řízení</span>}
                {t.revizeAno && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Revize</span>}
                {t.vyrizeniDotaceAno && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Dotace NZÚ</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Cenový rozpis */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Cenový rozpis</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-500">Položka</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Množství</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Jedn. cena</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(skupiny).map(([kat, items]) => (
                <Fragment key={kat}>
                  <tr>
                    <td colSpan={4} className="py-2 pt-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{kat}</td>
                  </tr>
                  {(items as PolozkaKalkulace[]).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-700">{p.nazev}</td>
                      <td className="py-1.5 text-right text-gray-500">{p.mnozstvi} {p.jednotka}</td>
                      <td className="py-1.5 text-right text-gray-600">{formatCena(p.cenaJednotky)}</td>
                      <td className="py-1.5 text-right font-medium text-gray-900">{formatCena(p.celkem)}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* Součty */}
          <div className="mt-4 border-t-2 border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Cena bez DPH</span>
                  <span>{formatCena(cenova.celkemBezDPH)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>DPH {cenova.dphSazba}%</span>
                  <span>{formatCena(cenova.dphCastka)}</span>
                </div>
                {cenova.sleva > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Sleva</span>
                    <span>-{formatCena(cenova.sleva)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t-2 border-gray-300 pt-2 mt-2">
                  <span>Celkem s DPH</span>
                  <span className="text-amber-600">{formatCena(cenova.finalniCena)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Podmínky a platnost */}
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-semibold text-gray-700 mb-2">Podmínky nabídky</div>
              <div className="text-gray-600 space-y-1">
                <div>Platnost nabídky: 30 dní od vydání</div>
                <div>Záruční doba: 2 roky (montáž), 25 let (panely)</div>
                <div>Způsob platby: zálohová faktura</div>
              </div>
            </div>
            <div>
              {t.vyrizeniDotaceAno && (
                <>
                  <div className="font-semibold text-gray-700 mb-2">Poznámka k dotaci</div>
                  <div className="text-gray-600 text-sm">
                    Nabídka obsahuje poradenství při vyřízení dotace NZÚ. Výše dotace závisí na konkrétních parametrech
                    systému a schválení žádosti.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Podpisy */}
        <div className="grid grid-cols-2 gap-12 pt-4">
          <div>
            <div className="border-t border-gray-300 pt-3">
              <div className="text-xs text-gray-500">Za dodavatele</div>
              <div className="text-sm font-medium text-gray-700 mt-1">AmperSun s.r.o.</div>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-300 pt-3">
              <div className="text-xs text-gray-500">Za odběratele (schválení nabídky)</div>
              <div className="text-sm font-medium text-gray-700 mt-1">{klient.jmeno}</div>
            </div>
          </div>
        </div>

        {/* Patička */}
        <div className="pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          AmperSun s.r.o. · IČO: 12345678 · DIČ: CZ12345678 · Energetická 42, 602 00 Brno
          · info@ampersun.cz · www.ampersun.cz
        </div>
      </div>
    </div>
  );
}

// ---- Hlavní stránka ----
export default function NabidkaPDFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getKalkulace } = useKalkulaceStore();
  const kalkulace = getKalkulace(id);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (!kalkulace) return;
    setPrinting(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const logoUrl = `${window.location.origin}/ampersun-logo.png`;
      const blob = await pdf(
        <NabidkaPDFDocument kalkulace={kalkulace} logoUrl={logoUrl} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nabidka-${kalkulace.cisloNabidky}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPrinting(false);
    }
  };

  if (!kalkulace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400">Kalkulace nenalezena.</div>
          <Link href="/kalkulace"><Button variant="secondary" className="mt-4">Zpět</Button></Link>
        </div>
      </div>
    );
  }

  if (!kalkulace.cenova?.schvaleno) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <div className="text-gray-500 text-sm mb-3">
            PDF nabídku lze vygenerovat až po schválení finální ceny.
          </div>
          <Link href={`/kalkulace/${id}`}>
            <Button>Přejít na kalkulaci</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Akční lišta – skrytá při tisku */}
      <div className="print:hidden bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link href={`/kalkulace/${id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" />Zpět na kalkulaci
        </Link>
        <div className="flex-1 text-center">
          <span className="font-semibold text-gray-900">PDF Nabídka</span>
          <span className="text-gray-400 ml-2 text-sm">{kalkulace.cisloNabidky}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button id="tour-download-btn" onClick={handlePrint} loading={printing}>
            <Printer className="w-4 h-4" />
            Tisknout / Uložit jako PDF
          </Button>
        </div>
      </div>

      {/* Obsah nabídky */}
      <div className="py-8 flex justify-center print:py-0">
        <div>
          <NabidkaTemplate kalkulace={kalkulace} />
        </div>
      </div>

    </div>
  );
}

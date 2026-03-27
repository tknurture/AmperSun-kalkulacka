'use client';

import { use, useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileDown, Edit2, CheckCircle, AlertTriangle,
  ChevronLeft, BarChart2, Clock, TrendingUp, TrendingDown, Minus,
  Save, Info,
} from 'lucide-react';
import { useKalkulaceStore } from '@/lib/store';
import { vypocitejPolozky, vypocitejCenu, prepocitejZPolozek, formatCena as fmtCena } from '@/lib/pricing';
import { najdiPodobneZakazky } from '@/lib/similarity';
import { formatCena, formatDatumCas, stavColor, stavDot, typZakazkyColor, rozdilProcent } from '@/lib/utils';
import {
  CenovaKalkulace, PolozkaKalkulace,
  TYP_ZAKAZKY_LABEL, STAV_KALKULACE_LABEL,
} from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/FormField';
import PageHeader from '@/components/layout/PageHeader';
import KalkulaceFormular from '@/components/kalkulace/KalkulaceFormular';

// ---- Zobrazení položky kalkulace ----
function PolozkaRow({
  polozka,
  onEdit,
  editable,
}: {
  polozka: PolozkaKalkulace;
  onEdit: (p: PolozkaKalkulace) => void;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [lokalCena, setLokalCena] = useState(String(polozka.cenaJednotky));

  const save = () => {
    const nova = Number(lokalCena);
    if (!isNaN(nova) && nova >= 0) {
      onEdit({ ...polozka, cenaJednotky: nova, celkem: nova * polozka.mnozstvi, upraveno: true });
    }
    setEditing(false);
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="px-4 py-2.5 text-sm text-gray-800">
        {polozka.nazev}
        {polozka.upraveno && <span className="ml-1 text-xs text-amber-500">*</span>}
      </td>
      <td className="px-3 py-2.5 text-xs text-gray-500 text-right">{polozka.mnozstvi} {polozka.jednotka}</td>
      <td className="px-3 py-2.5 text-right">
        {editable && editing ? (
          <div className="flex items-center gap-1 justify-end">
            <input
              type="number"
              value={lokalCena}
              onChange={(e) => setLokalCena(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              autoFocus
              className="w-28 text-right text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        ) : (
          <button
            onClick={() => editable && setEditing(true)}
            className={`text-sm text-gray-700 ${editable ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
          >
            {fmtCena(polozka.cenaJednotky)}
          </button>
        )}
      </td>
      <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">
        {fmtCena(polozka.celkem)}
      </td>
    </tr>
  );
}

// ---- Skupiny položek ----
function PolozkyTable({
  polozky,
  onEditPolozka,
  editable,
}: {
  polozky: PolozkaKalkulace[];
  onEditPolozka: (p: PolozkaKalkulace) => void;
  editable: boolean;
}) {
  const groups = polozky.reduce((acc, p) => {
    if (!acc[p.kategorie]) acc[p.kategorie] = [];
    acc[p.kategorie].push(p);
    return acc;
  }, {} as Record<string, PolozkaKalkulace[]>);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Položka</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Množství</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cena/j.</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Celkem</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([kat, items]) => (
            <Fragment key={kat}>
              <tr className="bg-gray-50/60">
                <td colSpan={4} className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {kat}
                </td>
              </tr>
              {items.map((p) => (
                <PolozkaRow key={p.id} polozka={p} onEdit={onEditPolozka} editable={editable} />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Hlavní stránka ----
export default function KalkulaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getKalkulace, updateKalkulace, updateCenova } = useKalkulaceStore();

  const [tab, setTab] = useState<'udaje' | 'kalkulace'>('kalkulace');
  const [cenova, setCenova] = useState<CenovaKalkulace | null>(null);
  const [editPolozky, setEditPolozky] = useState(false);
  const [finalniCenaInput, setFinalniCenaInput] = useState('');
  const [sleva, setSleva] = useState('0');
  const [duvodZmeny, setDuvodZmeny] = useState('');
  const [saving, setSaving] = useState(false);
  const [stavNovy, setStavNovy] = useState('');

  const kalkulace = getKalkulace(id);

  // BUG-3: Dependency na datumUpravy = efekt se spustí při každé změně kalkulace (formulář, stav)
  // BUG-7: Guard na začátku efektu
  useEffect(() => {
    if (!kalkulace) return;

    if (kalkulace.cenova) {
      setCenova(kalkulace.cenova);
      setFinalniCenaInput(String(kalkulace.cenova.finalniCena));
      setSleva(String(kalkulace.cenova.sleva));
      setDuvodZmeny(kalkulace.cenova.duvodZmeny);
    } else {
      // Spočítej automaticky
      const polozky = vypocitejPolozky(kalkulace.technickeUdaje, kalkulace.typZakazky);
      const vysledek = vypocitejCenu(polozky);
      const doporuceni = najdiPodobneZakazky({ typZakazky: kalkulace.typZakazky, technickeUdaje: kalkulace.technickeUdaje });

      const nova: CenovaKalkulace = {
        polozky: vysledek.polozky,
        celkemBezDPH: vysledek.celkemBezDPH,
        dphSazba: 21,
        dphCastka: vysledek.dphCastka,
        celkemSDPH: vysledek.celkemSDPH,
        odhadNakladu: vysledek.odhadNakladu,
        odhadMarze: vysledek.marze,
        odhadMarzeProc: vysledek.marzeProc,
        pravidlovaKalkulace: vysledek.celkemSDPH,
        doporucenaCena:
          doporuceni.doporucenaCena > 0
            ? Math.round((vysledek.celkemSDPH + doporuceni.doporucenaCena) / 2)
            : vysledek.celkemSDPH,
        cenoveRozpeti: {
          min: doporuceni.minCena > 0 ? doporuceni.minCena : Math.round(vysledek.celkemSDPH * 0.9),
          max: doporuceni.maxCena > 0 ? doporuceni.maxCena : Math.round(vysledek.celkemSDPH * 1.1),
        },
        podobneZakazky: doporuceni.podobneZakazky,
        finalniCena: vysledek.celkemSDPH,
        sleva: 0,
        slevaProc: 0,
        duvodZmeny: '',
        datumSchvaleni: '',
        schvaleno: false,
      };
      setCenova(nova);
      setFinalniCenaInput(String(nova.finalniCena));
    }
    setStavNovy(kalkulace.obchodniUdaje.stav);
  }, [kalkulace?.id, kalkulace?.datumUpravy]); // eslint-disable-line

  if (!kalkulace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-sm">Kalkulace nenalezena.</div>
          <Link href="/kalkulace"><Button variant="secondary" className="mt-4">Zpět na seznam</Button></Link>
        </div>
      </div>
    );
  }

  // Přepočet po editaci položky
  const handleEditPolozka = (updated: PolozkaKalkulace) => {
    if (!cenova) return;
    const newPolozky = cenova.polozky.map((p) => (p.id === updated.id ? updated : p));
    const { celkemBezDPH, dphCastka, celkemSDPH } = prepocitejZPolozek(newPolozky);
    setCenova({
      ...cenova,
      polozky: newPolozky,
      celkemBezDPH,
      dphCastka,
      celkemSDPH,
      pravidlovaKalkulace: celkemSDPH,
      finalniCena: celkemSDPH - Number(sleva),
    });
    setFinalniCenaInput(String(celkemSDPH - Number(sleva)));
  };

  // Přepočet slevy
  const handleSlevaChange = (val: string) => {
    setSleva(val);
    if (!cenova) return;
    const s = Number(val) || 0;
    const nova = cenova.celkemSDPH - s;
    setFinalniCenaInput(String(Math.max(0, nova)));
  };

  // Ruční cena
  const handleFinalniCenaChange = (val: string) => {
    setFinalniCenaInput(val);
    if (!cenova) return;
    const s = cenova.celkemSDPH - Number(val);
    setSleva(String(Math.round(s)));
  };

  // Schválení kalkulace
  const handleSchvalit = () => {
    if (!cenova) return;
    const finalniCena = Number(finalniCenaInput) || cenova.pravidlovaKalkulace;
    const slevaVal = Number(sleva) || 0;

    const schvalena: CenovaKalkulace = {
      ...cenova,
      finalniCena,
      sleva: slevaVal,
      slevaProc: cenova.celkemSDPH > 0 ? Math.round((slevaVal / cenova.celkemSDPH) * 100) : 0,
      duvodZmeny,
      datumSchvaleni: new Date().toISOString(),
      schvaleno: true,
    };
    setCenova(schvalena);
    updateCenova(id, schvalena);
    updateKalkulace(id, { obchodniUdaje: { ...kalkulace.obchodniUdaje, stav: 'schvaleno' } });
  };

  // Uložit změny stavu
  const handleUlozitStav = () => {
    setSaving(true);
    updateKalkulace(id, { obchodniUdaje: { ...kalkulace.obchodniUdaje, stav: stavNovy as any } });
    if (cenova) updateCenova(id, cenova);
    setTimeout(() => setSaving(false), 400);
  };

  const rozdil = cenova ? rozdilProcent(cenova.doporucenaCena, Number(finalniCenaInput)) : 0;
  const maSlevu = Number(sleva) > 0;
  const maPrirazku = Number(sleva) < 0;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={kalkulace.klient.jmeno || '(bez jména)'}
        subtitle={`${kalkulace.cisloNabidky} · ${TYP_ZAKAZKY_LABEL[kalkulace.typZakazky]}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={stavColor(kalkulace.obchodniUdaje.stav)} dot dotColor={stavDot(kalkulace.obchodniUdaje.stav)}>
              {STAV_KALKULACE_LABEL[kalkulace.obchodniUdaje.stav]}
            </Badge>
            {cenova?.schvaleno && (
              <Link href={`/kalkulace/${id}/nabidka`}>
                <Button variant="secondary" size="sm"><FileDown className="w-4 h-4" />PDF nabídka</Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Breadcrumb + tabs */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
        <Link href="/kalkulace" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 shrink-0">
          <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Zpět na seznam</span>
        </Link>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('kalkulace')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${tab === 'kalkulace' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Kalkulace
          </button>
          <button
            onClick={() => setTab('udaje')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${tab === 'udaje' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Údaje
          </button>
        </div>
        <div className="w-8 sm:w-32" />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {tab === 'udaje' ? (
          // ---- Editace údajů ----
          <KalkulaceFormular
            initial={kalkulace}
            onSubmit={(data) => { updateKalkulace(id, data); setTab('kalkulace'); }}
            saving={saving}
            isNew={false}
          />
        ) : (
          // ---- Kalkulace ceny ----
          cenova && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Levý sloupec – položky a cenový přehled */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                {/* Souhrn cen nahoře */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="bg-slate-50 border-slate-200">
                    <div className="text-xs text-slate-500 mb-1 font-medium">Pravidlová kalkulace</div>
                    <div className="text-xl font-bold text-slate-800">{formatCena(cenova.pravidlovaKalkulace)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Vč. DPH {cenova.dphSazba}%</div>
                  </Card>
                  <Card className={`border-2 ${cenova.doporucenaCena > 0 ? 'border-amber-300 bg-amber-50' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs text-amber-600 mb-1 font-medium flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" /> Doporučená (dle hist.)
                    </div>
                    <div className="text-xl font-bold text-amber-700">
                      {cenova.doporucenaCena > 0 ? formatCena(cenova.doporucenaCena) : '–'}
                    </div>
                    {cenova.doporucenaCena > 0 && (
                      <div className="text-xs text-amber-500 mt-0.5">
                        Rozpětí: {formatCena(cenova.cenoveRozpeti.min)} – {formatCena(cenova.cenoveRozpeti.max)}
                      </div>
                    )}
                  </Card>
                  <Card className={`border-2 ${cenova.schvaleno ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <div className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                      {cenova.schvaleno ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3" />}
                      {cenova.schvaleno ? 'Schválená cena' : 'Finální cena (návrh)'}
                    </div>
                    <div className={`text-xl font-bold ${cenova.schvaleno ? 'text-green-700' : 'text-gray-900'}`}>
                      {formatCena(cenova.finalniCena)}
                    </div>
                    {cenova.schvaleno && cenova.datumSchvaleni && (
                      <div className="text-xs text-green-500 mt-0.5">{formatDatumCas(cenova.datumSchvaleni)}</div>
                    )}
                  </Card>
                </div>

                {/* Položky kalkulace */}
                <Card padding={false}>
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <CardTitle>Rozpis položek</CardTitle>
                    <div className="flex items-center gap-2">
                      {cenova.polozky.some((p) => p.upraveno) && (
                        <span className="text-xs text-amber-500 flex items-center gap-1">
                          <Info className="w-3 h-3" />Položky upraveny ručně
                        </span>
                      )}
                      <button
                        onClick={() => setEditPolozky(!editPolozky)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${editPolozky ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-600 border-gray-200 hover:border-gray-400'}`}
                      >
                        <Edit2 className="w-3 h-3" />
                        {editPolozky ? 'Ukončit editaci' : 'Upravit položky'}
                      </button>
                    </div>
                  </div>
                  <PolozkyTable
                    polozky={cenova.polozky}
                    onEditPolozka={handleEditPolozka}
                    editable={editPolozky}
                  />
                  {/* Součty */}
                  <div className="border-t border-gray-200 px-4 py-3 space-y-1.5 bg-gray-50">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Mezisoučet bez DPH</span>
                      <span>{formatCena(cenova.celkemBezDPH)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>DPH {cenova.dphSazba}%</span>
                      <span>{formatCena(cenova.dphCastka)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
                      <span>Celkem s DPH</span>
                      <span>{formatCena(cenova.celkemSDPH)}</span>
                    </div>
                  </div>
                </Card>

                {/* Náklady a marže */}
                <Card>
                  <CardHeader><CardTitle>Ekonomika zakázky (orientační)</CardTitle></CardHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-700">{formatCena(cenova.odhadNakladu)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Odhadované náklady</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">{formatCena(cenova.odhadMarze)}</div>
                      <div className="text-xs text-green-500 mt-0.5">Marže ({cenova.odhadMarzeProc}%)</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">
                        {cenova.celkemBezDPH > 0
                          ? `${Math.round(((cenova.celkemBezDPH - cenova.odhadNakladu) / cenova.celkemBezDPH) * 100)}%`
                          : '–'}
                      </div>
                      <div className="text-xs text-blue-500 mt-0.5">Reálná marže (bez DPH)</div>
                    </div>
                  </div>
                </Card>

                {/* Podobné zakázky */}
                {cenova.podobneZakazky.length > 0 && (
                  <Card padding={false}>
                    <div className="px-5 py-4 border-b border-gray-100">
                      <CardTitle>Podobné historické zakázky</CardTitle>
                      <p className="text-xs text-gray-400 mt-0.5">Na základě těchto zakázek byl spočítán cenový doporučení</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {cenova.podobneZakazky.slice(0, 5).map((hz) => (
                        <div key={hz.id} className="px-5 py-3 flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {hz.lokalita} · {hz.vykonFVE > 0 ? `${hz.vykonFVE} kWp` : 'Baterie'} · {hz.slozitostMontaze}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {hz.typStrechy} · {hz.baterieAno ? `baterie ${hz.kapacitaBaterie} kWh` : 'bez baterie'}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-semibold text-gray-900">{formatCena(hz.finalniCena)}</div>
                            <div className="text-xs text-gray-400">{new Date(hz.datumRealizace).getFullYear()}</div>
                          </div>
                          <div className="w-16 text-right">
                            <span className="text-xs font-medium text-emerald-600">
                              {Math.round((hz.podobnost ?? 0) * 100)}% shoda
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Pravý sloupec – schválení */}
              <div className="space-y-4">
                {/* Schválení ceny */}
                <Card className={cenova.schvaleno ? 'border-green-300 bg-green-50' : ''}>
                  <CardHeader>
                    <CardTitle>{cenova.schvaleno ? 'Schváleno' : 'Schválení ceny'}</CardTitle>
                    {cenova.schvaleno && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </CardHeader>

                  {!cenova.schvaleno ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Finální cena (s DPH)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={finalniCenaInput}
                            onChange={(e) => handleFinalniCenaChange(e.target.value)}
                            className="w-full px-3 py-2.5 text-lg font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Kč</span>
                        </div>
                        {/* Vizuální indikátor rozdílu od doporučené */}
                        {cenova.doporucenaCena > 0 && (
                          <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                            rozdil > 5 ? 'text-red-500' : rozdil < -5 ? 'text-blue-500' : 'text-green-500'
                          }`}>
                            {rozdil > 0 ? <TrendingUp className="w-3 h-3" /> :
                             rozdil < 0 ? <TrendingDown className="w-3 h-3" /> :
                             <Minus className="w-3 h-3" />}
                            {Math.abs(rozdil)}% {rozdil > 0 ? 'nad' : rozdil < 0 ? 'pod' : 'na úrovni'} doporučenou cenou
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sleva / přirážka (Kč)</label>
                        <input
                          type="number"
                          value={sleva}
                          onChange={(e) => handleSlevaChange(e.target.value)}
                          placeholder="0"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                            maSlevu ? 'border-green-300 bg-green-50 text-green-700' :
                            maPrirazku ? 'border-red-300 bg-red-50 text-red-700' :
                            'border-gray-200'
                          }`}
                        />
                        {(maSlevu || maPrirazku) && (
                          <div className="mt-1 text-xs text-gray-400">
                            {maSlevu ? `Sleva ${formatCena(Number(sleva))}` : `Přirážka ${formatCena(Math.abs(Number(sleva)))}`}
                          </div>
                        )}
                      </div>

                      {(maSlevu || maPrirazku || rozdil !== 0) && (
                        <FormTextarea
                          label="Důvod změny ceny"
                          placeholder="Proč se finální cena liší od kalkulace?"
                          value={duvodZmeny}
                          onChange={(e) => setDuvodZmeny(e.target.value)}
                          rows={2}
                        />
                      )}

                      <Button onClick={handleSchvalit} className="w-full" size="lg">
                        <CheckCircle className="w-4 h-4" />
                        Schválit cenu
                      </Button>

                      {cenova.doporucenaCena > 0 && Math.abs(rozdil) > 10 && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">
                            Finální cena se výrazně liší od doporučení ({Math.abs(rozdil)}%). Zvažte uvedení důvodu.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">Původní kalkulace</div>
                          <div className="font-medium text-gray-700">{formatCena(cenova.pravidlovaKalkulace)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Finální cena</div>
                          <div className="font-bold text-green-700 text-base">{formatCena(cenova.finalniCena)}</div>
                        </div>
                        {cenova.sleva !== 0 && (
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500">
                              {cenova.sleva > 0 ? 'Sleva' : 'Přirážka'}
                            </div>
                            <div className={`font-medium text-sm ${cenova.sleva > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {cenova.sleva > 0 ? '-' : '+'}{formatCena(Math.abs(cenova.sleva))} ({Math.abs(cenova.slevaProc)}%)
                            </div>
                          </div>
                        )}
                      </div>
                      {cenova.duvodZmeny && (
                        <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-600">
                          <span className="font-medium">Důvod:</span> {cenova.duvodZmeny}
                        </div>
                      )}
                      <button
                        onClick={() => setCenova({ ...cenova, schvaleno: false })}
                        className="text-xs text-gray-400 hover:text-gray-700 underline"
                      >
                        Zrušit schválení a upravit
                      </button>
                    </div>
                  )}
                </Card>

                {/* Stav kalkulace */}
                <Card>
                  <CardHeader><CardTitle>Stav zakázky</CardTitle></CardHeader>
                  <FormSelect
                    value={stavNovy}
                    onChange={(e) => setStavNovy(e.target.value)}
                  >
                    <option value="rozpracovano">Rozpracováno</option>
                    <option value="ceka_na_schvaleni">Čeká na schválení</option>
                    <option value="schvaleno">Schváleno</option>
                    <option value="nabidka_odeslana">Nabídka odeslána</option>
                  </FormSelect>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-3"
                    onClick={handleUlozitStav}
                    loading={saving}
                  >
                    <Save className="w-4 h-4" />Uložit stav
                  </Button>
                </Card>

                {/* Souhrn techniky */}
                <Card>
                  <CardHeader><CardTitle>Technické shrnutí</CardTitle></CardHeader>
                  <div className="space-y-1.5 text-sm">
                    {kalkulace.technickeUdaje.vykonFVE > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Výkon FVE</span>
                        <span className="font-medium">{kalkulace.technickeUdaje.vykonFVE} kWp</span>
                      </div>
                    )}
                    {kalkulace.technickeUdaje.pocetPanelu > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Počet panelů</span>
                        <span className="font-medium">{kalkulace.technickeUdaje.pocetPanelu} ks</span>
                      </div>
                    )}
                    {kalkulace.technickeUdaje.baterieAno && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Baterie</span>
                        <span className="font-medium">{kalkulace.technickeUdaje.kapacitaBaterie} kWh</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spotřeba/rok</span>
                      <span className="font-medium">{kalkulace.technickeUdaje.spotrebaElektriny.toLocaleString('cs')} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vzdálenost</span>
                      <span className="font-medium">{kalkulace.technickeUdaje.vzdalenostRealizace} km</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 space-y-1">
                      {kalkulace.technickeUdaje.wallboxAno && <div className="text-xs text-gray-500">✓ Wallbox</div>}
                      {kalkulace.technickeUdaje.monitoringAno && <div className="text-xs text-gray-500">✓ Monitoring</div>}
                      {kalkulace.technickeUdaje.zalozniRezimAno && <div className="text-xs text-gray-500">✓ Záložní režim</div>}
                      {kalkulace.technickeUdaje.revizeAno && <div className="text-xs text-gray-500">✓ Revize</div>}
                      {kalkulace.technickeUdaje.vyrizeniDotaceAno && <div className="text-xs text-gray-500">✓ Dotace NZÚ</div>}
                    </div>
                  </div>
                </Card>

                {/* PDF akce */}
                {cenova.schvaleno && (
                  <Link href={`/kalkulace/${id}/nabidka`} className="block">
                    <Button variant="success" className="w-full" size="lg">
                      <FileDown className="w-4 h-4" />
                      Vygenerovat PDF nabídku
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

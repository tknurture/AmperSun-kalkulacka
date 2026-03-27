'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Trash2, FileDown } from 'lucide-react';
import { useKalkulaceStore } from '@/lib/store';
import {
  formatCena, formatDatum, stavColor, stavDot, typZakazkyColor, prioritaColor,
} from '@/lib/utils';
import {
  TYP_ZAKAZKY_LABEL, STAV_KALKULACE_LABEL, PRIORITA_LABEL,
  TypZakazky, StavKalkulace,
} from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';

export default function KalkulaceListPage() {
  const { kalkulace, deleteKalkulace } = useKalkulaceStore();
  const [search, setSearch] = useState('');
  const [filterTyp, setFilterTyp] = useState<TypZakazky | ''>('');
  const [filterStav, setFilterStav] = useState<StavKalkulace | ''>('');
  // BUG-15: ID kalkulace čekající na potvrzení smazání (místo blokujícího confirm())
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return kalkulace.filter((k) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        k.klient.jmeno.toLowerCase().includes(q) ||
        k.cisloNabidky.toLowerCase().includes(q) ||
        k.klient.adresaRealizace.toLowerCase().includes(q) ||
        k.klient.email.toLowerCase().includes(q);
      const matchTyp = !filterTyp || k.typZakazky === filterTyp;
      const matchStav = !filterStav || k.obchodniUdaje.stav === filterStav;
      return matchSearch && matchTyp && matchStav;
    });
  }, [kalkulace, search, filterTyp, filterStav]);

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteKalkulace(deletingId);
      setDeletingId(null);
    }
  };

  // Kalkulace, která se právě maže (pro label v dialogu)
  const deletingKalkulace = deletingId ? kalkulace.find((k) => k.id === deletingId) : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* BUG-15: Confirm dialog místo window.confirm() */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Smazat kalkulaci?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Opravdu chcete smazat kalkulaci pro <span className="font-medium text-gray-900">„{deletingKalkulace?.klient.jmeno || 'tohoto klienta'}"</span>? Tato akce je nevratná.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                Zrušit
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}
      <PageHeader
        title="Kalkulace"
        subtitle={`${filtered.length} z ${kalkulace.length} záznamů`}
        actions={
          <Link href="/kalkulace/nova">
            <Button><Plus className="w-4 h-4" />Nová kalkulace</Button>
          </Link>
        }
      />

      {/* Filtry */}
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat klienta, číslo nabídky, adresu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterTyp}
            onChange={(e) => setFilterTyp(e.target.value as TypZakazky | '')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">Všechny typy</option>
            {Object.entries(TYP_ZAKAZKY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStav}
            onChange={(e) => setFilterStav(e.target.value as StavKalkulace | '')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">Všechny stavy</option>
            {Object.entries(STAV_KALKULACE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {(search || filterTyp || filterStav) && (
            <button
              onClick={() => { setSearch(''); setFilterTyp(''); setFilterStav(''); }}
              className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
            >
              Zrušit filtry
            </button>
          )}
        </div>
      </div>

      {/* Tabulka */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-gray-400 text-sm">Žádné kalkulace neodpovídají filtrům.</div>
              <Link href="/kalkulace/nova">
                <Button className="mt-4" variant="secondary">
                  <Plus className="w-4 h-4" />Nová kalkulace
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Klient / Nabídka</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Typ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fin. cena</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stav</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priorita</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{k.klient.jmeno || '(bez jména)'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{k.cisloNabidky}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={typZakazkyColor(k.typZakazky)}>
                        {TYP_ZAKAZKY_LABEL[k.typZakazky]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-40 truncate">
                      {k.klient.adresaRealizace || '–'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDatum(k.datumVytvoreni)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {k.cenova?.finalniCena ? formatCena(k.cenova.finalniCena) : (
                        <span className="text-gray-400 font-normal">Není spočítáno</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={stavColor(k.obchodniUdaje.stav)} dot dotColor={stavDot(k.obchodniUdaje.stav)}>
                        {STAV_KALKULACE_LABEL[k.obchodniUdaje.stav]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={prioritaColor(k.obchodniUdaje.priorita)}>
                        {PRIORITA_LABEL[k.obchodniUdaje.priorita]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/kalkulace/${k.id}`}>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Otevřít">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        {k.cenova?.schvaleno && (
                          <Link href={`/kalkulace/${k.id}/nabidka`}>
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="PDF nabídka">
                              <FileDown className="w-4 h-4" />
                            </button>
                          </Link>
                        )}
                        <button
                          onClick={() => setDeletingId(k.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  FileText, CheckCircle, Send, TrendingUp,
  ArrowRight, Plus, Clock, AlertCircle,
} from 'lucide-react';
import { useKalkulaceStore } from '@/lib/store';
import { formatCena, formatDatum, stavColor, stavDot, typZakazkyColor } from '@/lib/utils';
import { TYP_ZAKAZKY_LABEL, STAV_KALKULACE_LABEL, StavKalkulace } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PageHeader from '@/components/layout/PageHeader';

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { kalkulace } = useKalkulaceStore();

  const stats = useMemo(() => {
    const schvalene = kalkulace.filter(
      (k) => k.obchodniUdaje.stav === 'schvaleno' || k.obchodniUdaje.stav === 'nabidka_odeslana'
    );
    const odeslane = kalkulace.filter((k) => k.obchodniUdaje.stav === 'nabidka_odeslana');
    const sCenou = kalkulace.filter((k) => k.cenova?.finalniCena);
    const prumer =
      sCenou.length > 0
        ? Math.round(sCenou.reduce((s, k) => s + (k.cenova?.finalniCena ?? 0), 0) / sCenou.length)
        : 0;
    const objem = sCenou.reduce((s, k) => s + (k.cenova?.finalniCena ?? 0), 0);
    return { celkem: kalkulace.length, schvalene: schvalene.length, odeslane: odeslane.length, prumer, objem };
  }, [kalkulace]);

  const posledni = kalkulace.slice(0, 5);
  const cekajici = kalkulace.filter((k) => k.obchodniUdaje.stav === 'ceka_na_schvaleni');

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle={`Celkem ${stats.celkem} kalkulací`}
        actions={
          <Link href="/kalkulace/nova">
            <Button><Plus className="w-4 h-4" />Nová kalkulace</Button>
          </Link>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Statistiky */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Celkem kalkulací" value={stats.celkem} icon={FileText} color="bg-slate-100 text-slate-700" />
          <StatCard label="Schválených" value={stats.schvalene} icon={CheckCircle} color="bg-green-100 text-green-700" />
          <StatCard label="Odeslaných nabídek" value={stats.odeslane} icon={Send} color="bg-blue-100 text-blue-700" />
          <StatCard
            label="Průměrná hodnota"
            value={stats.prumer > 0 ? formatCena(stats.prumer) : '–'}
            sub={stats.objem > 0 ? `Celkem: ${formatCena(stats.objem)}` : undefined}
            icon={TrendingUp}
            color="bg-amber-100 text-amber-700"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Poslední kalkulace */}
          <div className="col-span-2">
            <Card padding={false}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Poslední kalkulace</h3>
                <Link href="/kalkulace" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                  Zobrazit vše <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {posledni.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">
                    Žádné kalkulace.{' '}
                    <Link href="/kalkulace/nova" className="text-gray-900 font-medium hover:underline">Vytvořte první.</Link>
                  </div>
                )}
                {posledni.map((k) => (
                  <Link key={k.id} href={`/kalkulace/${k.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 truncate">{k.klient.jmeno || '(bez jména)'}</span>
                        <Badge className={typZakazkyColor(k.typZakazky)}>{TYP_ZAKAZKY_LABEL[k.typZakazky]}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">{k.cisloNabidky}</span>
                        <span className="text-xs text-gray-400">{k.klient.adresaRealizace || '–'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {k.cenova?.finalniCena ? formatCena(k.cenova.finalniCena) : '–'}
                      </div>
                      <Badge className={stavColor(k.obchodniUdaje.stav)} dot dotColor={stavDot(k.obchodniUdaje.stav)}>
                        {STAV_KALKULACE_LABEL[k.obchodniUdaje.stav]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Pravý panel */}
          <div className="space-y-4">
            {cekajici.length > 0 && (
              <Card padding={false}>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">Čeká na schválení</h3>
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{cekajici.length}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {cekajici.slice(0, 4).map((k) => (
                    <Link key={k.id} href={`/kalkulace/${k.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{k.klient.jmeno || '(bez jména)'}</div>
                        <div className="text-xs text-gray-400">{formatDatum(k.datumVytvoreni)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Rychlé akce</h3>
              <div className="space-y-2">
                <Link href="/kalkulace/nova" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 group">
                  <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Nová kalkulace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-50" />
                </Link>
                <Link href="/kalkulace" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 group">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span>Všechny kalkulace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-50" />
                </Link>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Stav zakázek</h3>
              <div className="space-y-2">
                {(['rozpracovano', 'ceka_na_schvaleni', 'schvaleno', 'nabidka_odeslana'] as StavKalkulace[]).map((stav) => {
                  const pocet = kalkulace.filter((k) => k.obchodniUdaje.stav === stav).length;
                  return (
                    <div key={stav} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stavDot(stav)}`} />
                      <span className="text-xs text-gray-600 flex-1">{STAV_KALKULACE_LABEL[stav]}</span>
                      <span className="text-xs font-semibold text-gray-900">{pocet}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

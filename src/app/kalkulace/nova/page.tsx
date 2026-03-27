'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKalkulaceStore, createEmptyKalkulace } from '@/lib/store';
import { Kalkulace } from '@/lib/types';
import KalkulaceFormular from '@/components/kalkulace/KalkulaceFormular';
import PageHeader from '@/components/layout/PageHeader';

export default function NovaKalkulacePage() {
  const router = useRouter();
  const { addKalkulace, generateCisloNabidky } = useKalkulaceStore();
  const [saving, setSaving] = useState(false);

  // useState s initializer – volá se jen jednou při prvním renderu, ne při každém re-renderu
  const [prazdna] = useState<Kalkulace>(() => {
    const cislo = generateCisloNabidky();
    return createEmptyKalkulace(cislo);
  });

  const handleSubmit = (data: Kalkulace) => {
    setSaving(true);
    addKalkulace(data);
    setTimeout(() => {
      router.push(`/kalkulace/${data.id}`);
    }, 200);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Nová kalkulace"
        subtitle="Zadejte údaje o zákazníkovi a zakázce"
      />
      <div className="flex-1 p-8">
        <KalkulaceFormular
          initial={prazdna}
          onSubmit={handleSubmit}
          saving={saving}
          isNew
        />
      </div>
    </div>
  );
}

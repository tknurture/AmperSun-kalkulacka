'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Kalkulace, TypZakazky, TYP_ZAKAZKY_LABEL } from '@/lib/types';
import { FormInput, FormSelect, FormTextarea, FormToggle, FormSection } from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

interface Props {
  initial: Kalkulace;
  onSubmit: (data: Kalkulace) => void;
  saving?: boolean;
  isNew?: boolean;
}

export default function KalkulaceFormular({ initial, onSubmit, saving, isNew }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Kalkulace>(initial);

  // BUG-11: Sync state pokud se změní kalkulace (např. při přechodu na jinou)
  useEffect(() => {
    setData(initial);
  }, [initial.id]);

  // Helpers pro aktualizaci zanořených objektů
  const setKlient = (field: string, value: string) =>
    setData((d) => ({ ...d, klient: { ...d.klient, [field]: value } }));
  const setTech = (field: string, value: unknown) =>
    setData((d) => ({ ...d, technickeUdaje: { ...d.technickeUdaje, [field]: value } }));
  const setObchodni = (field: string, value: string) =>
    setData((d) => ({ ...d, obchodniUdaje: { ...d.obchodniUdaje, [field]: value } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
      {/* Typ zakázky – nahoře prominentně */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Typ zakázky</label>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.entries(TYP_ZAKAZKY_LABEL) as [TypZakazky, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setData((d) => ({ ...d, typZakazky: key }))}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-center transition-all ${
                data.typZakazky === key
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Údaje o zákazníkovi */}
      <FormSection title="Zákazník" description="Kontaktní a fakturační údaje">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Jméno / Název firmy *"
            placeholder="Jan Novák nebo FIRMA s.r.o."
            value={data.klient.jmeno}
            onChange={(e) => setKlient('jmeno', e.target.value)}
            required
          />
          <FormInput
            label="Kontaktní osoba"
            placeholder="Pro firmy – jméno jednající osoby"
            value={data.klient.kontaktniOsoba}
            onChange={(e) => setKlient('kontaktniOsoba', e.target.value)}
          />
          <FormInput
            label="Telefon"
            type="tel"
            placeholder="+420 601 234 567"
            value={data.klient.telefon}
            onChange={(e) => setKlient('telefon', e.target.value)}
          />
          <FormInput
            label="E-mail"
            type="email"
            placeholder="klient@email.cz"
            value={data.klient.email}
            onChange={(e) => setKlient('email', e.target.value)}
          />
          <FormInput
            label="Adresa realizace *"
            placeholder="Ulice 1, 602 00 Brno"
            value={data.klient.adresaRealizace}
            onChange={(e) => setKlient('adresaRealizace', e.target.value)}
            required
            className="col-span-2"
          />
          <FormInput
            label="Fakturační adresa (pokud se liší)"
            placeholder="Pokud je stejná, nechte prázdné"
            value={data.klient.fakturacniAdresa}
            onChange={(e) => setKlient('fakturacniAdresa', e.target.value)}
            className="col-span-2"
          />
          <FormTextarea
            label="Poznámka ke klientovi"
            placeholder="Interní poznámka – neobjeví se v nabídce"
            value={data.klient.poznamka}
            onChange={(e) => setKlient('poznamka', e.target.value)}
            rows={2}
            className="col-span-2"
          />
        </div>
      </FormSection>

      {/* Technické údaje – FVE */}
      {data.typZakazky !== 'bateriove_uloziste' && (
        <FormSection title="FV systém" description="Parametry fotovoltaické instalace">
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Roční spotřeba elektřiny (kWh)"
              type="number"
              suffix="kWh"
              placeholder="5000"
              value={data.technickeUdaje.spotrebaElektriny || ''}
              onChange={(e) => setTech('spotrebaElektriny', Number(e.target.value))}
              hint="Typicky 3 000–8 000 kWh pro RD"
            />
            <FormInput
              label="Výkon FVE (kWp)"
              type="number"
              step="0.1"
              suffix="kWp"
              placeholder="8.8"
              value={data.technickeUdaje.vykonFVE || ''}
              onChange={(e) => setTech('vykonFVE', Number(e.target.value))}
            />
            <FormInput
              label="Počet panelů"
              type="number"
              suffix="ks"
              placeholder="20"
              value={data.technickeUdaje.pocetPanelu || ''}
              onChange={(e) => setTech('pocetPanelu', Number(e.target.value))}
            />
            <FormInput
              label="Typ panelů"
              placeholder="Longi Solar Hi-MO 440W"
              value={data.technickeUdaje.typPanelu}
              onChange={(e) => setTech('typPanelu', e.target.value)}
            />
            <FormInput
              label="Typ střídače"
              placeholder="Fronius Primo 8.2"
              value={data.technickeUdaje.typStridace}
              onChange={(e) => setTech('typStridace', e.target.value)}
              className="col-span-2"
            />
          </div>
        </FormSection>
      )}

      {/* Baterie */}
      <FormSection title="Baterie a doplňky" description="Rozšiřující prvky systému">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormToggle
              label="Bateriové úložiště"
              description="Li-Ion baterie pro ukládání energie"
              checked={data.technickeUdaje.baterieAno}
              onChange={(v) => setTech('baterieAno', v)}
            />
            {data.technickeUdaje.baterieAno && (
              <FormInput
                label="Kapacita baterie (kWh)"
                type="number"
                suffix="kWh"
                placeholder="10"
                value={data.technickeUdaje.kapacitaBaterie || ''}
                onChange={(e) => setTech('kapacitaBaterie', Number(e.target.value))}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormToggle
              label="Wallbox – nabíjení EV"
              description="Nabíjecí stanice pro elektromobil"
              checked={data.technickeUdaje.wallboxAno}
              onChange={(v) => setTech('wallboxAno', v)}
            />
            <FormToggle
              label="Monitoring systému"
              description="Online přehled výroby a spotřeby"
              checked={data.technickeUdaje.monitoringAno}
              onChange={(v) => setTech('monitoringAno', v)}
            />
            <FormToggle
              label="Záložní režim (backup)"
              description="Provoz při výpadku sítě"
              checked={data.technickeUdaje.zalozniRezimAno}
              onChange={(v) => setTech('zalozniRezimAno', v)}
            />
            <FormToggle
              label="Chytré řízení energie"
              description="Smart energy management systém"
              checked={data.technickeUdaje.chyteRizeniAno}
              onChange={(v) => setTech('chyteRizeniAno', v)}
            />
          </div>
        </div>
      </FormSection>

      {/* Objekt a střecha */}
      <FormSection title="Objekt a střecha" description="Parametry místa instalace">
        <div className="grid grid-cols-3 gap-4">
          <FormSelect
            label="Typ objektu"
            value={data.technickeUdaje.typObjektu}
            onChange={(e) => setTech('typObjektu', e.target.value)}
          >
            <option value="rodinny_dum">Rodinný dům</option>
            <option value="bytovy_dum">Bytový dům</option>
            <option value="kancelarske_prostory">Kancelářské prostory</option>
            <option value="prumyslovy_objekt">Průmyslový objekt</option>
            <option value="zemedelsky_objekt">Zemědělský objekt</option>
            <option value="obecni_objekt">Obecní objekt</option>
          </FormSelect>
          <FormSelect
            label="Typ střechy"
            value={data.technickeUdaje.typStrechy}
            onChange={(e) => setTech('typStrechy', e.target.value)}
          >
            <option value="sediova">Sedlová</option>
            <option value="pultova">Pultová</option>
            <option value="ploche">Plochá</option>
            <option value="valbova">Valbová</option>
            <option value="mansardova">Mansardová</option>
          </FormSelect>
          <FormInput
            label="Sklon střechy (°)"
            type="number"
            suffix="°"
            placeholder="35"
            value={data.technickeUdaje.sklonStrechy || ''}
            onChange={(e) => setTech('sklonStrechy', Number(e.target.value))}
          />
          <FormSelect
            label="Orientace střechy"
            value={data.technickeUdaje.orientaceStrechy}
            onChange={(e) => setTech('orientaceStrechy', e.target.value)}
          >
            <option value="jih">Jih</option>
            <option value="jihozapad">Jihozápad</option>
            <option value="jihovychod">Jihovýchod</option>
            <option value="zapad">Západ</option>
            <option value="vychod">Východ</option>
            <option value="sever">Sever</option>
          </FormSelect>
          <FormSelect
            label="Složitost montáže"
            value={data.technickeUdaje.slozitostMontaze}
            onChange={(e) => setTech('slozitostMontaze', e.target.value)}
          >
            <option value="jednoducha">Jednoduchá – přímá střecha, dobrý přístup</option>
            <option value="stredni">Střední – komplikovanější tvar nebo přístup</option>
            <option value="slozita">Složitá – lešení, nestandardní řešení</option>
          </FormSelect>
          <FormInput
            label="Vzdálenost realizace (km)"
            type="number"
            suffix="km"
            placeholder="30"
            value={data.technickeUdaje.vzdalenostRealizace || ''}
            onChange={(e) => setTech('vzdalenostRealizace', Number(e.target.value))}
            hint="Od sídla firmy AmperSun"
          />
        </div>
      </FormSection>

      {/* Práce a administrativa */}
      <FormSection title="Práce a administrativa" description="Revize, projekt, dotace">
        <div className="grid grid-cols-2 gap-4">
          <FormToggle
            label="Elektroúpravy (rozvaděč, jistič)"
            description="Úpravy elektrické instalace objektu"
            checked={data.technickeUdaje.elektroupravyAno}
            onChange={(v) => setTech('elektroupravyAno', v)}
          />
          <FormToggle
            label="Revize elektroinstalace"
            description="Revizní zpráva pro připojení FVE"
            checked={data.technickeUdaje.revizeAno}
            onChange={(v) => setTech('revizeAno', v)}
          />
          <FormToggle
            label="Projektová dokumentace"
            description="Pro stavební povolení nebo FVE nad 10 kWp"
            checked={data.technickeUdaje.projektovaDokumentaceAno}
            onChange={(v) => setTech('projektovaDokumentaceAno', v)}
          />
          <FormToggle
            label="Vyřízení dotace NZÚ"
            description="Poradenství a administrativa žádosti o dotaci"
            checked={data.technickeUdaje.vyrizeniDotaceAno}
            onChange={(v) => setTech('vyrizeniDotaceAno', v)}
          />
        </div>
      </FormSection>

      {/* Obchodní údaje */}
      <FormSection title="Obchodní údaje" description="Interní informace o zakázce">
        <div className="grid grid-cols-3 gap-4">
          <FormSelect
            label="Priorita zakázky"
            value={data.obchodniUdaje.priorita}
            onChange={(e) => setObchodni('priorita', e.target.value)}
          >
            <option value="nizka">Nízká</option>
            <option value="stredni">Střední</option>
            <option value="vysoka">Vysoká</option>
          </FormSelect>
          <FormInput
            label="Předpokládaný termín realizace"
            type="date"
            value={data.obchodniUdaje.predpokladanyTermin}
            onChange={(e) => setObchodni('predpokladanyTermin', e.target.value)}
          />
          <FormSelect
            label="Stav kalkulace"
            value={data.obchodniUdaje.stav}
            onChange={(e) => setObchodni('stav', e.target.value)}
          >
            <option value="rozpracovano">Rozpracováno</option>
            <option value="ceka_na_schvaleni">Čeká na schválení</option>
            <option value="schvaleno">Schváleno</option>
            <option value="nabidka_odeslana">Nabídka odeslána</option>
          </FormSelect>
          <FormTextarea
            label="Interní poznámka obchodníka"
            placeholder="Pouze pro interní účely – zákazník neuvidí"
            value={data.obchodniUdaje.interniPoznamka}
            onChange={(e) => setObchodni('interniPoznamka', e.target.value)}
            rows={2}
            className="col-span-3"
          />
        </div>
      </FormSection>

      {/* Akční panel */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-8 px-8 py-4 flex items-center gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          Zrušit
        </button>
        <div className="flex-1" />
        <Button type="submit" size="lg" loading={saving}>
          <Save className="w-4 h-4" />
          {isNew ? 'Uložit a přejít na kalkulaci' : 'Uložit změny'}
        </Button>
      </div>
    </form>
  );
}

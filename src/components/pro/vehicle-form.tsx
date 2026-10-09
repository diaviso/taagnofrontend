"use client";

import { CalendarDays, Hash, Palette, Route, KeyRound } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { CityField } from "@/components/search/city-field";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/ui/field";
import { Counter } from "@/components/ui/misc";
import type { Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface VehicleValues {
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  numberOfSeats: number;
  isForCarpooling: boolean;
  isForRental: boolean;
  city: string;
}

const BRANDS = ["Toyota", "Hyundai", "Kia", "Peugeot", "Renault", "Nissan", "Mercedes", "Ford", "Suzuki", "Mitsubishi", "Honda", "Volkswagen"];

function UsageCard({ selected, onClick, icon, title, text }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; text: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn("flex items-start gap-3 rounded-[18px] border-2 p-4 text-left transition", selected ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40")}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", selected ? "bg-brand text-white" : "bg-surface-alt text-ink-soft")}>{icon}</span>
      <span>
        <span className="block text-[15px] font-extrabold text-ink">{title}</span>
        <span className="block text-[12.5px] text-muted">{text}</span>
      </span>
    </button>
  );
}

/** Informations d'un véhicule (ajout et modification). */
export function VehicleForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  lockPlate,
}: {
  initial?: Vehicle;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (v: VehicleValues) => void;
  lockPlate?: boolean;
}) {
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [plate, setPlate] = useState(initial?.licensePlate ?? "");
  const [seats, setSeats] = useState(initial?.numberOfSeats ?? 5);
  const [carpool, setCarpool] = useState(initial?.isForCarpooling ?? true);
  const [rental, setRental] = useState(initial?.isForRental ?? false);
  const [city, setCity] = useState(initial?.city ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    const y = Number(year);
    if (!brand.trim()) err.brand = "Indiquez la marque.";
    if (!model.trim()) err.model = "Indiquez le modèle.";
    if (!y || y < 1950 || y > new Date().getFullYear() + 1) err.year = "Année invalide.";
    if (!color.trim()) err.color = "Indiquez la couleur.";
    if (!lockPlate && plate.trim().length < 4) err.plate = "Indiquez la plaque d’immatriculation.";
    if (!carpool && !rental) err.usage = "Choisissez au moins un usage.";
    if (rental && !city.trim()) err.city = "Indiquez la ville où se trouve le véhicule.";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSubmit({
      brand: brand.trim(),
      model: model.trim(),
      year: y,
      color: color.trim(),
      licensePlate: plate.trim().toUpperCase(),
      numberOfSeats: seats,
      isForCarpooling: carpool,
      isForRental: rental,
      city: city.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <TextField label="Marque" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" error={errors.brand} list="brands" maxLength={50} />
          <datalist id="brands">
            {BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        <TextField label="Modèle" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" error={errors.model} maxLength={50} />
        <TextField label="Année" inputMode="numeric" icon={<CalendarDays />} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2018" error={errors.year} />
        <TextField label="Couleur" icon={<Palette />} value={color} onChange={(e) => setColor(e.target.value)} placeholder="Gris" error={errors.color} maxLength={30} />
        <TextField
          label="Plaque d’immatriculation"
          icon={<Hash />}
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="DK-1234-AB"
          error={errors.plate}
          disabled={lockPlate}
          hint={lockPlate ? "La plaque ne peut pas être modifiée." : "Jamais affichée publiquement."}
          maxLength={20}
        />
        <Field label="Nombre de places" hint="Conducteur compris">
          <div className="flex h-12 items-center rounded-[14px] border border-line bg-white px-3">
            <Counter value={seats} onChange={setSeats} min={2} max={30} />
          </div>
        </Field>
      </div>

      <Field label="Usages" error={errors.usage}>
        <div className="grid gap-3 sm:grid-cols-2">
          <UsageCard selected={carpool} onClick={() => setCarpool(!carpool)} icon={<Route className="h-5 w-5" />} title="Covoiturage" text="Je propose des places sur mes trajets" />
          <UsageCard selected={rental} onClick={() => setRental(!rental)} icon={<KeyRound className="h-5 w-5" />} title="Location" text="Je loue ce véhicule" />
        </div>
      </Field>

      <div>
        <CityField label={rental ? "Ville du véhicule" : "Ville du véhicule (facultatif)"} value={city} onChange={setCity} placeholder="Dakar" invalid={!!errors.city} />
        {errors.city ? <p className="mt-1.5 text-[12.5px] font-semibold text-danger">{errors.city}</p> : <p className="mt-1.5 text-[12.5px] text-muted">Lieu où le véhicule peut être loué.</p>}
      </div>

      <Button type="submit" size="xl" block loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}

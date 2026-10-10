"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, KeyRound, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { OfferCard } from "@/components/cards/offer-card";
import { OptionIcon } from "@/components/cards/option-icon";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { Card, ChipToggle, Counter, EmptyState } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fcfa } from "@/lib/format";
import { canRent } from "@/lib/pro";
import { useMyOffers, useMyVehicles } from "@/lib/queries";
import { RENTAL_OPTIONS, type RentalOffer, type RentalOption, type Vehicle } from "@/lib/types";
import { VehiclePicker } from "./vehicle-picker";

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-[14px] font-extrabold text-white">{n}</span>
        <div>
          <h2 className="text-[17px] font-extrabold text-ink">{title}</h2>
          {hint && <p className="text-[13px] text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function MoneyInput({ value, onChange, placeholder, invalid }: { value: string; onChange: (v: string) => void; placeholder: string; invalid?: boolean }) {
  return (
    <Input
      inputMode="numeric"
      value={value ? Number(value).toLocaleString("fr-FR") : ""}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
      placeholder={placeholder}
      suffix="FCFA"
      invalid={invalid}
      className="text-[17px] font-bold"
    />
  );
}

/** Création ou modification d'une offre de location. */
export function OfferEditor({ offerId }: { offerId?: string }) {
  const vehicles = useMyVehicles();
  const offers = useMyOffers();
  const existing = offerId ? offers.data?.find((o) => o.id === offerId) : undefined;

  if (vehicles.isPending || offers.isPending) return <PageSpinner />;
  if (offerId && !existing) return <EmptyState icon={<KeyRound />} title="Annonce introuvable" action={<LinkButton href="/pro/locations">Mes locations</LinkButton>} />;

  const taken = new Set((offers.data ?? []).map((o) => o.vehicleId));
  const usable = (vehicles.data ?? []).filter((v) => canRent(v) && !taken.has(v.id));
  if (!existing && !usable.length) {
    const any = (vehicles.data ?? []).length > 0;
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={<KeyRound />}
          title={any ? "Aucun véhicule disponible pour une nouvelle offre" : "Ajoutez d’abord votre véhicule"}
          text={
            any
              ? "Le véhicule doit être approuvé, marqué « Location », et ne pas avoir déjà une offre (une seule offre par véhicule)."
              : "Pour louer votre voiture, ajoutez-la avec ses photos et ses documents. Notre équipe la vérifie rapidement."
          }
          action={<LinkButton href={any ? "/pro/vehicules" : "/pro/vehicules/nouveau"}>{any ? "Mes véhicules" : "Ajouter un véhicule"}</LinkButton>}
        />
      </div>
    );
  }
  const vehicle = existing ? (vehicles.data ?? []).find((v) => v.id === existing.vehicleId) ?? existing.vehicle ?? undefined : undefined;
  return <OfferForm existing={existing} vehicles={existing ? (vehicle ? [vehicle as Vehicle] : []) : usable} />;
}

function OfferForm({ existing, vehicles }: { existing?: RentalOffer; vehicles: Vehicle[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [vehicleId, setVehicleId] = useState(existing?.vehicleId ?? vehicles[0]?.id ?? "");
  const [price, setPrice] = useState(existing ? String(existing.pricePerDay) : "");
  const [deposit, setDeposit] = useState(existing ? String(existing.depositAmount) : "");
  const [minDays, setMinDays] = useState(existing?.minDays ?? 1);
  const [pickup, setPickup] = useState(existing?.pickupLocation ?? "");
  const [options, setOptions] = useState<RentalOption[]>(existing?.options ?? ["AIR_CONDITIONING"]);
  const [driverPrice, setDriverPrice] = useState(existing?.driverPricePerDay ? String(existing.driverPricePerDay) : "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [active, setActive] = useState(existing?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const priceValue = Number(price) || 0;
  const withDriver = options.includes("WITH_DRIVER");

  const preview: RentalOffer = {
    id: "apercu",
    pricePerDay: priceValue,
    depositAmount: Number(deposit) || 0,
    minDays,
    isActive: true,
    options,
    vehicle: vehicle ? { ...vehicle, owner: user } : null,
  };

  const toggle = (o: RentalOption) => setOptions((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!vehicleId) e.vehicle = "Choisissez un véhicule.";
    if (priceValue < 1000) e.price = "Indiquez un prix par jour.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Vérifiez les informations en rouge.");
      return;
    }
    setBusy(true);
    const body = {
      pricePerDay: priceValue,
      depositAmount: Number(deposit) || 0,
      minDays,
      isActive: active,
      options,
      ...(withDriver && Number(driverPrice)
        ? { driverPricePerDay: Number(driverPrice) }
        : existing?.driverPricePerDay
          ? { driverPricePerDay: null } // option retirée ou champ vidé : l'ancien supplément est effacé
          : {}),
    };
    try {
      if (existing) {
        await api.patch(`/rental/offers/${existing.id}`, { ...body, description: description.trim(), pickupLocation: pickup.trim() });
        toast.success("Annonce enregistrée.");
        await queryClient.invalidateQueries({ queryKey: ["offers"] });
        queryClient.invalidateQueries({ queryKey: ["offer", existing.id] });
        router.push(`/pro/locations/${existing.id}`);
      } else {
        const created = await api.post<RentalOffer>("/rental/offers", {
          vehicleId,
          ...body,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(pickup.trim() ? { pickupLocation: pickup.trim() } : {}),
        });
        toast.success("Annonce publiée ! Votre véhicule est maintenant à louer.");
        await queryClient.invalidateQueries({ queryKey: ["offers"] });
        router.push(`/pro/locations/${created.id}`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Link href={existing ? `/pro/locations/${existing.id}` : "/pro/locations"} className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {existing ? "Retour à l’annonce" : "Mes locations"}
      </Link>
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">{existing ? "Modifier l’annonce" : "Louer un véhicule"}</h1>
      <p className="mt-1 text-[14.5px] text-muted">Fixez vos prix et vos conditions. Vous validez chaque demande.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Step n={1} title="Véhicule">
            <VehiclePicker vehicles={vehicles} value={vehicleId} onChange={setVehicleId} disabled={!!existing} />
            {errors.vehicle && <p className="mt-2 text-[12.5px] font-semibold text-danger">{errors.vehicle}</p>}
          </Step>

          <Step n={2} title="Prix et caution" hint="La caution vous est versée à la remise des clés et rendue au retour.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prix par jour" error={errors.price}>
                <MoneyInput value={price} onChange={setPrice} placeholder="25 000" invalid={!!errors.price} />
              </Field>
              <Field label="Caution" hint="0 si aucune caution">
                <MoneyInput value={deposit} onChange={setDeposit} placeholder="100 000" />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line px-4 py-3">
              <div>
                <p className="text-[15px] font-bold text-ink">Durée minimale</p>
                <p className="text-[12.5px] text-muted">En jours</p>
              </div>
              <Counter value={minDays} onChange={setMinDays} min={1} max={30} />
            </div>
          </Step>

          <Step n={3} title="Remise des clés">
            <Field label="Lieu" optional hint="Quartier ou adresse, ex. « Mermoz, près de la pharmacie »">
              <Input icon={<MapPin />} value={pickup} maxLength={120} onChange={(e) => setPickup(e.target.value)} placeholder="Mermoz, Dakar" />
            </Field>
          </Step>

          <Step n={4} title="Équipements et services">
            <div className="flex flex-wrap gap-2">
              {RENTAL_OPTIONS.map((o) => (
                <ChipToggle key={o.value} selected={options.includes(o.value)} onClick={() => toggle(o.value)} icon={<OptionIcon option={o.value} className="h-4 w-4" />}>
                  {o.label}
                </ChipToggle>
              ))}
            </div>
            {withDriver && (
              <div className="mt-4 rounded-[16px] bg-brand-soft/60 p-4">
                <Field label={<span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-brand" /> Supplément chauffeur par jour</span>} optional>
                  <MoneyInput value={driverPrice} onChange={setDriverPrice} placeholder="10 000" />
                </Field>
              </div>
            )}
          </Step>

          <Step n={5} title="Présentation" hint="Facultatif : état du véhicule, règles, kilométrage…">
            <Textarea value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} placeholder="Véhicule entretenu, non-fumeur. Plein à rendre comme au départ." />
            <p className="mt-1.5 text-right text-[12px] text-faint">{description.length}/1000</p>
          </Step>

          <Card className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-[15px] font-extrabold text-ink">Annonce visible</p>
              <p className="text-[13px] text-muted">Mettez-la en pause quand le véhicule n’est pas disponible.</p>
            </div>
            <Switch checked={active} onChange={setActive} label="Annonce visible" />
          </Card>
        </div>

        <div>
          <div className="sticky top-[96px] space-y-4">
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-muted">Aperçu</p>
            <div className="pointer-events-none">
              <OfferCard offer={preview} />
            </div>
            <Card className="p-5">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted">Loué 10 jours par mois</span>
                <span className="text-[18px] font-extrabold text-ink">{fcfa(priceValue * 10)}</span>
              </div>
              <Button type="submit" block size="xl" className="mt-4" loading={busy}>
                {existing ? "Enregistrer" : "Publier l’annonce"}
              </Button>
              <p className="mt-3 text-center text-[12.5px] text-muted">Gratuit et sans commission.</p>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}

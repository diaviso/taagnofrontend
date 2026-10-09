"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CarFront, Circle, Flag, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { OptionIcon } from "@/components/cards/option-icon";
import { TripCard } from "@/components/cards/trip-card";
import { CityField } from "@/components/search/city-field";
import { DateField } from "@/components/search/date-field";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, ChipToggle, Counter, EmptyState } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fcfa, startOfDay } from "@/lib/format";
import { canCarpool, isEditable } from "@/lib/pro";
import { useMyTrips, useMyVehicles } from "@/lib/queries";
import { TRIP_OPTIONS, confirmedSeats, type CarpoolTrip, type TripOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { VehiclePicker } from "./vehicle-picker";
import { TimeField } from "./time-field";

const PRICE_CHIPS = [2000, 3000, 4000, 5000, 7500, 10000];

function Step({ n, title, children, hint }: { n: number; title: string; hint?: string; children: ReactNode }) {
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

/** Publication ou modification d'un trajet, avec aperçu en direct. */
export function TripEditor({ tripId }: { tripId?: string }) {
  const vehicles = useMyVehicles();
  const trips = useMyTrips();
  const existing = tripId ? trips.data?.find((t) => t.id === tripId) : undefined;

  if (vehicles.isPending || (tripId && trips.isPending)) return <PageSpinner />;
  if (tripId && !existing) {
    return <EmptyState icon={<CarFront />} title="Trajet introuvable" action={<LinkButton href="/pro/trajets">Mes trajets</LinkButton>} />;
  }
  if (existing && !isEditable(existing)) {
    return (
      <EmptyState
        icon={<CarFront />}
        title="Ce trajet ne peut plus être modifié"
        text="Seuls les trajets ouverts et à venir peuvent être modifiés."
        action={<LinkButton href={`/pro/trajets/${existing.id}`}>Retour au trajet</LinkButton>}
      />
    );
  }
  const usable = (vehicles.data ?? []).filter(canCarpool);
  if (!existing && !usable.length) {
    const any = (vehicles.data ?? []).length > 0;
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={<CarFront />}
          title={any ? "Aucun véhicule prêt pour le covoiturage" : "Ajoutez d’abord votre véhicule"}
          text={
            any
              ? "Votre véhicule doit être approuvé par Taagno et marqué « Covoiturage ». Vérifiez son statut dans « Mes véhicules »."
              : "Pour proposer un trajet, ajoutez votre véhicule avec ses photos et ses documents. Notre équipe le vérifie rapidement."
          }
          action={<LinkButton href={any ? "/pro/vehicules" : "/pro/vehicules/nouveau"}>{any ? "Mes véhicules" : "Ajouter un véhicule"}</LinkButton>}
        />
      </div>
    );
  }
  return <TripForm existing={existing} vehicles={existing ? (vehicles.data ?? []).filter((v) => v.id === existing.vehicleId) : usable} />;
}

function TripForm({ existing, vehicles }: { existing?: CarpoolTrip; vehicles: NonNullable<ReturnType<typeof useMyVehicles>["data"]> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const initialDate = existing ? new Date(existing.departureTime) : null;
  const [vehicleId, setVehicleId] = useState(existing?.vehicleId ?? vehicles[0]?.id ?? "");
  const [from, setFrom] = useState(existing?.departureCity ?? "");
  const [to, setTo] = useState(existing?.arrivalCity ?? "");
  const [meeting, setMeeting] = useState(existing?.meetingPoint ?? "");
  const [dropoff, setDropoff] = useState(existing?.dropoffPoint ?? "");
  const [date, setDate] = useState<Date | null>(initialDate ? startOfDay(initialDate) : null);
  const [hour, setHour] = useState(initialDate ? `${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")}` : "08:00");
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  // Places libres possibles : véhicule moins le conducteur, moins les places déjà confirmées.
  const maxSeats = Math.max(1, (vehicle?.numberOfSeats ?? 5) - 1 - (existing ? confirmedSeats(existing) : 0));
  const [seats, setSeats] = useState(existing?.availableSeats ?? Math.min(3, maxSeats));
  const [price, setPrice] = useState(existing ? String(existing.pricePerSeat) : "");
  const [options, setOptions] = useState<TripOption[]>(existing?.options ?? ["AIR_CONDITIONING"]);
  const [description, setDescription] = useState(existing?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departure = useMemo(() => {
    if (!date || !hour) return null;
    const [h, m] = hour.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  }, [date, hour]);

  const priceValue = Number(price.replace(/\D/g, "")) || 0;
  // Date d'exemple de l'aperçu tant qu'aucun départ n'est choisi.
  const [sampleDate] = useState(() => new Date(Date.now() + 86_400_000));

  const preview: CarpoolTrip = {
    id: "apercu",
    departureCity: from || "Départ",
    arrivalCity: to || "Arrivée",
    departureTime: (departure ?? sampleDate).toISOString(),
    pricePerSeat: priceValue,
    availableSeats: seats,
    status: "OPEN",
    driver: user,
    vehicle,
    meetingPoint: meeting || null,
    dropoffPoint: dropoff || null,
    options,
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!vehicleId) e.vehicle = "Choisissez un véhicule.";
    if (!from.trim()) e.from = "Indiquez la ville de départ.";
    if (!to.trim()) e.to = "Indiquez la ville d’arrivée.";
    if (from.trim() && to.trim() && from.trim().toLowerCase() === to.trim().toLowerCase()) e.to = "L’arrivée doit être différente du départ.";
    if (!departure) e.date = "Choisissez la date et l’heure.";
    else if (departure.getTime() < Date.now() + 10 * 60_000) e.date = "Le départ doit être dans le futur.";
    if (priceValue < 100) e.price = "Indiquez un prix par place.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Vérifiez les informations en rouge.");
      return;
    }
    setBusy(true);
    try {
      const body = {
        departureCity: from.trim(),
        arrivalCity: to.trim(),
        departureTime: departure!.toISOString(),
        pricePerSeat: priceValue,
        availableSeats: seats,
        options,
      };
      if (existing) {
        await api.patch(`/carpool/trips/${existing.id}`, { ...body, meetingPoint: meeting.trim(), dropoffPoint: dropoff.trim(), description: description.trim() });
        toast.success("Trajet modifié.");
        await queryClient.invalidateQueries({ queryKey: ["trips"] });
        queryClient.invalidateQueries({ queryKey: ["trip", existing.id] });
        router.push(`/pro/trajets/${existing.id}`);
      } else {
        const created = await api.post<CarpoolTrip>("/carpool/trips", {
          vehicleId,
          ...body,
          ...(meeting.trim() ? { meetingPoint: meeting.trim() } : {}),
          ...(dropoff.trim() ? { dropoffPoint: dropoff.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
        });
        toast.success("Trajet publié ! Les voyageurs peuvent déjà réserver.");
        await queryClient.invalidateQueries({ queryKey: ["trips"] });
        router.push(`/pro/trajets/${created.id}?publie=1`);
      }
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (o: TripOption) => setOptions((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  return (
    <form onSubmit={submit}>
      <Link href={existing ? `/pro/trajets/${existing.id}` : "/pro/trajets"} className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {existing ? "Retour au trajet" : "Mes trajets"}
      </Link>
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">{existing ? "Modifier le trajet" : "Proposer un trajet"}</h1>
      <p className="mt-1 text-[14.5px] text-muted">Quelques informations, et votre trajet est visible par tous les voyageurs.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Step n={1} title="Véhicule">
            <VehiclePicker vehicles={vehicles} value={vehicleId} onChange={(id) => {
              setVehicleId(id);
              const v = vehicles.find((x) => x.id === id);
              if (v?.numberOfSeats) setSeats((s) => Math.min(s, Math.max(1, v.numberOfSeats! - 1)));
            }} disabled={!!existing} />
            {errors.vehicle && <p className="mt-2 text-[12.5px] font-semibold text-danger">{errors.vehicle}</p>}
          </Step>

          <Step n={2} title="Itinéraire" hint="Le point de rendez-vous rassure les voyageurs.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <CityField label="Départ" value={from} onChange={setFrom} placeholder="Dakar" icon={<Circle className="!h-3.5 !w-3.5 stroke-[3] text-brand" />} invalid={!!errors.from} />
                {errors.from && <p className="mt-1.5 text-[12.5px] font-semibold text-danger">{errors.from}</p>}
              </div>
              <div>
                <CityField label="Arrivée" value={to} onChange={setTo} placeholder="Touba" invalid={!!errors.to} />
                {errors.to && <p className="mt-1.5 text-[12.5px] font-semibold text-danger">{errors.to}</p>}
              </div>
              <Field label="Point de rendez-vous" optional>
                <Input icon={<MapPin />} value={meeting} maxLength={120} onChange={(e) => setMeeting(e.target.value)} placeholder="Station Total VDN" />
              </Field>
              <Field label="Point de dépose" optional>
                <Input icon={<Flag />} value={dropoff} maxLength={120} onChange={(e) => setDropoff(e.target.value)} placeholder="Gare routière" />
              </Field>
            </div>
          </Step>

          <Step n={3} title="Date et heure de départ">
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField label="Date" value={date} onChange={setDate} placeholder="Choisir la date" allowClear={false} />
              <TimeField label="Heure" value={hour} onChange={setHour} />
            </div>
            {errors.date && <p className="mt-2 text-[12.5px] font-semibold text-danger">{errors.date}</p>}
          </Step>

          <Step n={4} title="Places et prix" hint="Partagez vos frais : carburant, péage…">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line px-4 py-3">
              <div>
                <p className="text-[15px] font-bold text-ink">Places proposées</p>
                <p className="text-[12.5px] text-muted">
                  {existing ? `Places encore libres (maximum ${maxSeats})` : `Maximum ${maxSeats} avec ce véhicule (conducteur non compris)`}
                </p>
              </div>
              <Counter value={seats} onChange={setSeats} min={1} max={maxSeats} />
            </div>
            <div className="mt-4">
              <Field label="Prix par place" error={errors.price}>
                <Input
                  inputMode="numeric"
                  value={price ? Number(price.replace(/\D/g, "")).toLocaleString("fr-FR") : ""}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 7))}
                  placeholder="5 000"
                  suffix="FCFA"
                  invalid={!!errors.price}
                  className="text-[17px] font-bold"
                />
              </Field>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRICE_CHIPS.map((p) => (
                  <ChipToggle key={p} selected={priceValue === p} onClick={() => setPrice(String(p))}>
                    {fcfa(p)}
                  </ChipToggle>
                ))}
              </div>
            </div>
          </Step>

          <Step n={5} title="Options" hint="Ce qui compte pour vos passagers.">
            <button
              type="button"
              onClick={() => toggle("INSTANT_BOOKING")}
              className={cn(
                "mb-4 flex w-full items-center gap-4 rounded-[18px] border-2 p-4 text-left transition",
                options.includes("INSTANT_BOOKING") ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40",
              )}
            >
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", options.includes("INSTANT_BOOKING") ? "bg-brand text-white" : "bg-surface-alt text-ink-soft")}>
                <Zap className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-extrabold text-ink">Réservation instantanée</span>
                <span className="block text-[13px] text-muted">Les voyageurs sont confirmés sans attendre votre réponse. Idéal pour remplir vite.</span>
              </span>
              <span className={cn("h-6 w-11 shrink-0 rounded-full p-0.5 transition", options.includes("INSTANT_BOOKING") ? "bg-brand" : "bg-line")}>
                <span className={cn("block h-5 w-5 rounded-full bg-white shadow transition", options.includes("INSTANT_BOOKING") && "translate-x-5")} />
              </span>
            </button>
            <div className="flex flex-wrap gap-2">
              {TRIP_OPTIONS.filter((o) => o.value !== "INSTANT_BOOKING").map((o) => (
                <ChipToggle key={o.value} selected={options.includes(o.value)} onClick={() => toggle(o.value)} icon={<OptionIcon option={o.value} className="h-4 w-4" />}>
                  {o.label}
                </ChipToggle>
              ))}
            </div>
          </Step>

          <Step n={6} title="Un mot aux voyageurs" hint="Facultatif : pause prévue, bagages, ponctualité…">
            <Textarea value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} placeholder="Départ à l’heure, pause café à Thiès. Petits bagages uniquement." />
            <p className="mt-1.5 text-right text-[12px] text-faint">{description.length}/500</p>
          </Step>
        </div>

        <div>
          <div className="sticky top-[96px] space-y-4">
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-muted">Aperçu</p>
            <div className="pointer-events-none">
              <TripCard trip={preview} />
            </div>
            <Card className="p-5">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted">Si toutes les places sont prises</span>
                <span className="text-[18px] font-extrabold text-ink">{fcfa(priceValue * seats)}</span>
              </div>
              <Button type="submit" block size="xl" className="mt-4" loading={busy}>
                {existing ? "Enregistrer les modifications" : "Publier le trajet"}
              </Button>
              <p className="mt-3 text-center text-[12.5px] text-muted">Gratuit et sans commission.</p>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import { ArrowUpDown, Circle, MapPin, Route, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { TripCard, TripCardSkeleton } from "@/components/cards/trip-card";
import { Button } from "@/components/ui/button";
import { ChipToggle, Counter, EmptyState, Segmented } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { apiDay, day, fcfa, plural, startOfDay } from "@/lib/format";
import { canonicalCity } from "@/lib/cities";
import { useRecentSearches } from "@/lib/favorites";
import { useTripSearch } from "@/lib/queries";
import { TRIP_OPTIONS, type CarpoolTrip } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OptionIcon } from "@/components/cards/option-icon";
import { CreateAlertButton } from "./alert-button";
import { CityField } from "./city-field";
import { DateField } from "./date-field";

type Sort = "time" | "price";

function parseDate(s: string | null) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date < startOfDay(new Date()) ? null : date;
}

const PRICE_STEPS = [2000, 3000, 5000, 7500, 10000, 15000];

/** Recherche de trajets : critères dans l'adresse (partageable), filtres et tri. */
export function TripSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const recent = useRecentSearches();

  const q = {
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    date: parseDate(params.get("date")),
    seats: Math.max(1, Math.min(6, Number(params.get("seats")) || 1)),
    options: params.getAll("options"),
    maxPrice: Number(params.get("maxPrice")) || undefined,
  };

  const [from, setFrom] = useState(q.from);
  const [to, setTo] = useState(q.to);
  const [date, setDate] = useState<Date | null>(q.date);
  const [seats, setSeats] = useState(q.seats);
  const [sort, setSort] = useState<Sort>("time");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Critères changés depuis l'extérieur (lien, retour arrière) : les champs suivent.
  const paramsKey = params.toString();
  const [lastKey, setLastKey] = useState(paramsKey);
  if (paramsKey !== lastKey) {
    setLastKey(paramsKey);
    setFrom(q.from);
    setTo(q.to);
    setDate(q.date);
    setSeats(q.seats);
  }

  const { data, isPending, isFetching } = useTripSearch(q);

  const update = (patch: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      next.delete(k);
      if (Array.isArray(v)) v.forEach((x) => next.append(k, x));
      else if (v) next.set(k, v);
    }
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const f = canonicalCity(from);
    const t = canonicalCity(to);
    setFrom(f);
    setTo(t);
    recent.push(f, t);
    update({ from: f || null, to: t || null, date: date ? apiDay(date) : null, seats: seats > 1 ? String(seats) : null });
  };

  const trips = useMemo(() => {
    const list = [...(data ?? [])];
    if (sort === "price") list.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    else list.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    return list;
  }, [data, sort]);

  // Sans date choisie, les trajets sont regroupés par jour de départ.
  const groups = useMemo(() => {
    if (sort === "price" || q.date) return [{ label: null as string | null, trips }];
    const map = new Map<string, CarpoolTrip[]>();
    for (const t of trips) {
      // Jour de Dakar (UTC) : le même que celui affiché.
      const key = t.departureTime.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return [...map.values()].map((list) => ({ label: day(list[0].departureTime), trips: list }));
  }, [trips, sort, q.date]);

  const activeFilters = q.options.length + (q.maxPrice ? 1 : 0);
  const title = q.from && q.to ? `${q.from} → ${q.to}` : q.from ? `Départs de ${q.from}` : q.to ? `Trajets vers ${q.to}` : "Tous les trajets";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      {/* Barre de recherche */}
      <form onSubmit={submit} className="rounded-[22px] border border-line/70 bg-white p-2 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="relative flex flex-col md:flex-[2] md:flex-row">
            <CityField bare value={from} onChange={setFrom} placeholder="Départ" label="Départ" icon={<Circle className="!h-3.5 !w-3.5 stroke-[3] text-brand" />} className="md:flex-1" />
            <div className="mx-3.5 h-px bg-line md:mx-0 md:my-3 md:h-auto md:w-px" />
            <CityField bare value={to} onChange={setTo} placeholder="Arrivée" label="Arrivée" icon={<MapPin className="text-brand" />} className="md:flex-1 md:pl-4" />
            <button
              type="button"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              className="absolute right-3 top-[38px] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft shadow-soft transition hover:rotate-180 hover:text-brand md:left-1/2 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
              aria-label="Inverser départ et arrivée"
            >
              <ArrowUpDown className="h-4 w-4 md:rotate-90" />
            </button>
          </div>
          <div className="mx-3.5 h-px bg-line md:mx-0 md:my-3 md:h-auto md:w-px" />
          <DateField bare value={date} onChange={setDate} label="Date" className="md:flex-1" />
          <Button type="submit" size="lg" className="m-1 h-12" icon={<Search className="h-[18px] w-[18px]" />} loading={isFetching && !isPending}>
            Rechercher
          </Button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
          <p className="mt-0.5 text-[14px] text-muted">
            {isPending ? "Recherche en cours…" : `${plural(trips.length, "trajet")} ${q.date ? day(q.date).toLowerCase() : "à venir"}${q.seats > 1 ? ` · ${q.seats} places` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            layoutId="trip-sort"
            size="sm"
            value={sort}
            onChange={setSort}
            options={[
              { value: "time", label: "Plus tôt" },
              { value: "price", label: "Moins cher" },
            ]}
          />
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-[14px] border px-3.5 text-[13.5px] font-bold transition",
              activeFilters ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink hover:border-brand/40",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtres
            {activeFilters > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] leading-[18px] text-white">{activeFilters}</span>}
          </button>
        </div>
      </div>

      {activeFilters > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {q.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => update({ options: q.options.filter((x) => x !== o) })}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[12.5px] font-bold text-brand"
            >
              {TRIP_OPTIONS.find((x) => x.value === o)?.label ?? o} <X className="h-3.5 w-3.5" />
            </button>
          ))}
          {q.maxPrice && (
            <button
              type="button"
              onClick={() => update({ maxPrice: null })}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[12.5px] font-bold text-brand"
            >
              Max {fcfa(q.maxPrice)} <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className={cn("mt-6 transition-opacity duration-300", isFetching && !isPending && "opacity-50")}>
        {isPending ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-line bg-white">
            <EmptyState
              icon={<Route />}
              title="Aucun trajet trouvé"
              text={
                q.from && q.to
                  ? "Personne ne propose encore ce trajet. Créez une alerte : nous vous prévenons dès qu’un conducteur le publie."
                  : "Essayez une autre date ou d’autres villes, ou retirez des filtres."
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <CreateAlertButton key={`${q.from}|${q.to}|${q.date ? apiDay(q.date) : ""}`} from={q.from} to={q.to} date={q.date} />
                  {(q.date || activeFilters > 0) && (
                    <Button variant="outline" onClick={() => update({ date: null, options: [], maxPrice: null })}>
                      Toutes les dates, sans filtre
                    </Button>
                  )}
                </div>
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((g, gi) => (
              <section key={g.label ?? gi}>
                {g.label && (
                  <h2 className="mb-3 flex items-center gap-3 text-[14px] font-extrabold uppercase tracking-wide text-brand">
                    {g.label}
                    <span className="h-px flex-1 bg-line" />
                  </h2>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {g.trips.map((t, i) => (
                    <TripCard key={t.id} trip={t} index={i} showDay={!g.label} linkQuery={q.seats > 1 ? `places=${q.seats}` : undefined} />
                  ))}
                </div>
              </section>
            ))}
            {q.from && q.to && (
              <div className="flex flex-col items-center gap-3 rounded-[22px] bg-brand-soft/60 px-6 py-6 text-center sm:flex-row sm:text-left">
                <p className="flex-1 text-[14.5px] font-semibold text-ink">Vous ne trouvez pas l’horaire idéal ? Soyez prévenu des prochains trajets {q.from} → {q.to}.</p>
                <CreateAlertButton key={`${q.from}|${q.to}|${q.date ? apiDay(q.date) : ""}-b`} from={q.from} to={q.to} date={q.date} variant="soft" />
              </div>
            )}
          </div>
        )}
      </div>

      <FiltersModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        seats={seats}
        options={q.options}
        maxPrice={q.maxPrice}
        onApply={(f) => {
          setSeats(f.seats);
          update({ options: f.options, maxPrice: f.maxPrice ? String(f.maxPrice) : null, seats: f.seats > 1 ? String(f.seats) : null });
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}

function FiltersModal({
  open,
  onOpenChange,
  seats: initialSeats,
  options: initialOptions,
  maxPrice: initialMax,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  seats: number;
  options: string[];
  maxPrice?: number;
  onApply: (f: { seats: number; options: string[]; maxPrice?: number }) => void;
}) {
  const [seats, setSeats] = useState(initialSeats);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMax);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setSeats(initialSeats);
      setOptions(initialOptions);
      setMaxPrice(initialMax);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Filtres"
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => onApply({ seats: 1, options: [], maxPrice: undefined })}>
            Tout effacer
          </Button>
          <Button block onClick={() => onApply({ seats, options, maxPrice })}>
            Afficher les trajets
          </Button>
        </div>
      }
    >
      <div className="space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-ink">Places nécessaires</p>
            <p className="text-[13px] text-muted">Pour vous et vos accompagnants</p>
          </div>
          <Counter value={seats} onChange={setSeats} min={1} max={6} />
        </div>
        <div>
          <p className="mb-3 text-[15px] font-bold text-ink">Prix maximum par place</p>
          <div className="flex flex-wrap gap-2">
            <ChipToggle selected={!maxPrice} onClick={() => setMaxPrice(undefined)}>
              Peu importe
            </ChipToggle>
            {PRICE_STEPS.map((p) => (
              <ChipToggle key={p} selected={maxPrice === p} onClick={() => setMaxPrice(p)}>
                {fcfa(p)}
              </ChipToggle>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-[15px] font-bold text-ink">Confort et préférences</p>
          <div className="flex flex-wrap gap-2">
            {TRIP_OPTIONS.map((o) => (
              <ChipToggle
                key={o.value}
                selected={options.includes(o.value)}
                onClick={() => setOptions((prev) => (prev.includes(o.value) ? prev.filter((x) => x !== o.value) : [...prev, o.value]))}
                icon={<OptionIcon option={o.value} className="h-4 w-4" />}
              >
                {o.label}
              </ChipToggle>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

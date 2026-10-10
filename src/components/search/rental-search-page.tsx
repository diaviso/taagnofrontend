"use client";

import { KeyRound, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { OfferCard, OfferCardSkeleton } from "@/components/cards/offer-card";
import { OptionIcon } from "@/components/cards/option-icon";
import { Button } from "@/components/ui/button";
import { ChipToggle, Counter, EmptyState, Segmented } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { apiDay, fcfa, plural, range, rentalDays, startOfDay } from "@/lib/format";
import { useOfferSearch } from "@/lib/queries";
import { RENTAL_OPTIONS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CityField } from "./city-field";
import { DateRangeField } from "./date-field";

function parseDate(s: string | null) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const PRICE_STEPS = [15000, 25000, 35000, 50000, 75000];

/** Recherche de voitures à louer : ville, dates, options. */
export function RentalSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  let start = parseDate(params.get("start"));
  let end = parseDate(params.get("end"));
  if (!start || !end || end <= start || start < startOfDay(new Date())) {
    start = null;
    end = null;
  }
  const q = {
    city: params.get("city") ?? "",
    start,
    end,
    options: params.getAll("options"),
    maxPrice: Number(params.get("maxPrice")) || undefined,
    minSeats: Number(params.get("minSeats")) || undefined,
  };

  const [city, setCity] = useState(q.city);
  const [dates, setDates] = useState<[Date | null, Date | null]>([q.start, q.end]);
  const [sort, setSort] = useState<"price" | "recent">("price");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const paramsKey = params.toString();
  const [lastKey, setLastKey] = useState(paramsKey);
  if (paramsKey !== lastKey) {
    setLastKey(paramsKey);
    setCity(q.city);
    setDates([q.start, q.end]);
  }

  const { data, isPending, isFetching } = useOfferSearch(q);
  const days = q.start && q.end ? rentalDays(q.start, q.end) : undefined;

  const offers = useMemo(() => {
    const list = [...(data ?? [])];
    if (sort === "price") list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    return list;
  }, [data, sort]);

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
    const [s, en] = dates;
    update({ city: city.trim() || null, start: s && en ? apiDay(s) : null, end: s && en ? apiDay(en) : null });
  };

  const activeFilters = q.options.length + (q.maxPrice ? 1 : 0) + (q.minSeats ? 1 : 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      <form onSubmit={submit} className="rounded-[22px] border border-line/70 bg-white p-2 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center">
          <CityField bare value={city} onChange={setCity} placeholder="Ville (Dakar, Thiès…)" label="Ville" icon={<MapPin className="text-brand" />} className="md:flex-1" />
          <div className="mx-3.5 h-px bg-line md:mx-0 md:my-3 md:h-auto md:w-px" />
          <DateRangeField bare start={dates[0]} end={dates[1]} onChange={(s, e) => setDates([s, e])} label="Dates" className="md:flex-[1.3]" />
          <Button type="submit" size="lg" className="m-1 h-12" icon={<Search className="h-[18px] w-[18px]" />} loading={isFetching && !isPending}>
            Rechercher
          </Button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
            {q.city ? `Voitures à louer à ${q.city}` : "Voitures à louer"}
          </h1>
          <p className="mt-0.5 text-[14px] text-muted">
            {isPending
              ? "Recherche en cours…"
              : `${plural(offers.length, "véhicule")} disponible${offers.length > 1 ? "s" : ""}${q.start && q.end ? ` · ${range(q.start, q.end).toLowerCase()}` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            layoutId="rental-sort"
            size="sm"
            value={sort}
            onChange={setSort}
            options={[
              { value: "price", label: "Moins cher" },
              { value: "recent", label: "Nouveautés" },
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
            <FilterChip key={o} onClear={() => update({ options: q.options.filter((x) => x !== o) })}>
              {RENTAL_OPTIONS.find((x) => x.value === o)?.label ?? o}
            </FilterChip>
          ))}
          {q.maxPrice && <FilterChip onClear={() => update({ maxPrice: null })}>Max {fcfa(q.maxPrice)} / jour</FilterChip>}
          {q.minSeats && <FilterChip onClear={() => update({ minSeats: null })}>{q.minSeats} places et plus</FilterChip>}
        </div>
      )}

      {!q.start && (
        <p className="mt-4 rounded-[16px] bg-brand-soft/60 px-4 py-3 text-[13.5px] font-semibold text-ink-soft">
          Astuce : choisissez vos dates pour ne voir que les voitures libres et connaître le prix total.
        </p>
      )}

      <div className={cn("mt-6 transition-opacity duration-300", isFetching && !isPending && "opacity-50")}>
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-line bg-white">
            <EmptyState
              icon={<KeyRound />}
              title="Aucune voiture disponible"
              text="Essayez d’autres dates, une ville voisine, ou retirez des filtres."
              action={
                <Button variant="outline" onClick={() => update({ city: null, start: null, end: null, options: [], maxPrice: null, minSeats: null })}>
                  Voir toutes les voitures
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o, i) => (
              <OfferCard key={o.id} offer={o} index={i} days={days} />
            ))}
          </div>
        )}
      </div>

      <RentalFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        options={q.options}
        maxPrice={q.maxPrice}
        minSeats={q.minSeats}
        onApply={(f) => {
          update({ options: f.options, maxPrice: f.maxPrice ? String(f.maxPrice) : null, minSeats: f.minSeats && f.minSeats > 2 ? String(f.minSeats) : null });
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}

function FilterChip({ children, onClear }: { children: ReactNode; onClear: () => void }) {
  return (
    <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[12.5px] font-bold text-brand">
      {children} <X className="h-3.5 w-3.5" />
    </button>
  );
}

function RentalFilters({
  open,
  onOpenChange,
  options: initialOptions,
  maxPrice: initialMax,
  minSeats: initialSeats,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  options: string[];
  maxPrice?: number;
  minSeats?: number;
  onApply: (f: { options: string[]; maxPrice?: number; minSeats?: number }) => void;
}) {
  const [options, setOptions] = useState(initialOptions);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [minSeats, setMinSeats] = useState(initialSeats ?? 2);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setOptions(initialOptions);
      setMaxPrice(initialMax);
      setMinSeats(initialSeats ?? 2);
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Filtres"
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => onApply({ options: [], maxPrice: undefined, minSeats: undefined })}>
            Tout effacer
          </Button>
          <Button block onClick={() => onApply({ options, maxPrice, minSeats })}>
            Afficher les voitures
          </Button>
        </div>
      }
    >
      <div className="space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-ink">Nombre de places minimum</p>
            <p className="text-[13px] text-muted">Conducteur compris</p>
          </div>
          <Counter value={minSeats} onChange={setMinSeats} min={2} max={9} />
        </div>
        <div>
          <p className="mb-3 text-[15px] font-bold text-ink">Prix maximum par jour</p>
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
          <p className="mb-3 text-[15px] font-bold text-ink">Équipements et services</p>
          <div className="flex flex-wrap gap-2">
            {RENTAL_OPTIONS.map((o) => (
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

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Circle, KeyRound, MapPin, Route, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/misc";
import { canonicalCity } from "@/lib/cities";
import { apiDay } from "@/lib/format";
import { useRecentSearches } from "@/lib/favorites";
import { cn } from "@/lib/utils";
import { CityField } from "./city-field";
import { DateField, DateRangeField } from "./date-field";
import * as Popover from "@radix-ui/react-popover";

type Tab = "carpool" | "rental";

/** Grande barre de recherche de l'accueil : covoiturage ou location. */
export function HomeSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("carpool");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [seats, setSeats] = useState(1);
  const [city, setCity] = useState("");
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [swap, setSwap] = useState(0);
  const recent = useRecentSearches();

  const submitCarpool = (e: FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    const f = canonicalCity(from);
    const t = canonicalCity(to);
    if (f) q.set("from", f);
    if (t) q.set("to", t);
    if (date) q.set("date", apiDay(date));
    if (seats > 1) q.set("seats", String(seats));
    recent.push(f, t);
    router.push(`/covoiturage${q.size ? `?${q}` : ""}`);
  };

  const submitRental = (e: FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city.trim()) q.set("city", canonicalCity(city));
    if (start && end) {
      q.set("start", apiDay(start));
      q.set("end", apiDay(end));
    }
    router.push(`/location${q.size ? `?${q}` : ""}`);
  };

  return (
    <div className="w-full">
      <div className="mb-3 inline-flex rounded-full bg-white/15 p-1 backdrop-blur-md">
        {(
          [
            ["carpool", "Covoiturage", Route],
            ["rental", "Location de voiture", KeyRound],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold transition-colors sm:px-5",
              tab === value ? "text-brand-dark" : "text-white/90 hover:text-white",
            )}
          >
            {tab === value && (
              <motion.span layoutId="home-tab" className="absolute inset-0 rounded-full bg-white shadow-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-[24px] bg-white p-2 shadow-[0_24px_60px_rgb(6_30_17_/_0.28)]">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "carpool" ? (
            <motion.form
              key="carpool"
              onSubmit={submitCarpool}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col lg:flex-row lg:items-center"
            >
              <div className="relative flex flex-col lg:flex-[2.2] lg:flex-row">
                <CityField bare value={from} onChange={setFrom} placeholder="Ville de départ" label="Départ" icon={<Circle className="!h-3.5 !w-3.5 stroke-[3] text-brand" />} className="lg:flex-1" />
                <div className="mx-3.5 h-px bg-line lg:mx-0 lg:my-3 lg:h-auto lg:w-px" />
                <CityField bare value={to} onChange={setTo} placeholder="Ville d’arrivée" label="Arrivée" icon={<MapPin className="text-brand" />} className="lg:flex-1 lg:pl-5" />
                <motion.button
                  type="button"
                  onClick={() => {
                    setFrom(to);
                    setTo(from);
                    setSwap((s) => s + 1);
                  }}
                  animate={{ rotate: swap * 180 }}
                  className="absolute right-3 top-[40px] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft shadow-soft transition hover:text-brand lg:left-1/2 lg:right-auto lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
                  aria-label="Inverser départ et arrivée"
                >
                  <ArrowUpDown className="h-4 w-4 lg:rotate-90" />
                </motion.button>
              </div>
              <div className="mx-3.5 h-px bg-line lg:mx-0 lg:my-3 lg:h-auto lg:w-px" />
              <div className="flex lg:flex-[1.6]">
                <DateField bare value={date} onChange={setDate} placeholder="Toutes dates" label="Date" className="flex-1" />
                <div className="my-3 w-px bg-line" />
                <SeatsField value={seats} onChange={setSeats} />
              </div>
              <Button type="submit" size="xl" className="m-1 mt-2 lg:mt-1" icon={<Search className="h-5 w-5" />}>
                Rechercher
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="rental"
              onSubmit={submitRental}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col lg:flex-row lg:items-center"
            >
              <CityField bare value={city} onChange={setCity} placeholder="Ville (Dakar, Thiès…)" label="Ville" icon={<MapPin className="text-brand" />} className="lg:flex-1" />
              <div className="mx-3.5 h-px bg-line lg:mx-0 lg:my-3 lg:h-auto lg:w-px" />
              <DateRangeField bare start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e); }} placeholder="Dates de location" label="Dates" className="lg:flex-[1.3]" />
              <Button type="submit" size="xl" className="m-1 mt-2 lg:mt-1" icon={<Search className="h-5 w-5" />}>
                Voir les voitures
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {tab === "carpool" && recent.list.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-white/75">Récemment :</span>
          {recent.list.slice(0, 3).map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              type="button"
              onClick={() => router.push(`/covoiturage?from=${encodeURIComponent(a)}&to=${encodeURIComponent(b)}`)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur transition hover:bg-white/25"
            >
              {a} → {b}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SeatsField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="flex h-14 items-center gap-2.5 px-4 text-[15px] font-semibold text-ink" aria-label="Nombre de passagers">
          <Users className="h-[18px] w-[18px] text-muted" />
          {value} {value > 1 ? "passagers" : "passager"}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="z-[90] rounded-[20px] border border-line bg-white p-5 shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]">
          <p className="mb-3 text-[14px] font-bold text-ink">Nombre de places</p>
          <Counter value={value} onChange={onChange} min={1} max={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

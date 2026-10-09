"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BellRing, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { CityField } from "@/components/search/city-field";
import { DateField } from "@/components/search/date-field";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Skeleton } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { apiDay, day, parseDay } from "@/lib/format";
import { useAction, useTripAlerts } from "@/lib/queries";

/** Alertes trajet : être prévenu dès qu'un trajet correspondant est publié. */
export default function AlertsPage() {
  return (
    <RequireAuth title="Vos alertes trajet" text="Connectez-vous pour être prévenu dès qu’un trajet qui vous intéresse est publié.">
      <Alerts />
    </RequireAuth>
  );
}

function Alerts() {
  const { data, isPending } = useTripAlerts();
  const { run, busy } = useAction();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    const ok = await run("create", () => api.post("/carpool/alerts", { fromCity: from.trim(), toCity: to.trim(), ...(date ? { date: apiDay(date) } : {}) }), {
      success: "Alerte créée. Nous vous prévenons dès qu’un trajet correspond.",
      invalidate: [["alerts"]],
    });
    if (ok !== undefined) {
      setFrom("");
      setTo("");
      setDate(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">Alertes trajet</h1>
      <p className="mt-1 text-[14px] text-muted">Recevez une notification dès qu’un conducteur publie le trajet que vous cherchez.</p>

      <Card className="mt-6 p-5 sm:p-6">
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <CityField label="Départ" value={from} onChange={setFrom} placeholder="Dakar" />
          <CityField label="Arrivée" value={to} onChange={setTo} placeholder="Touba" />
          <DateField label="Date" value={date} onChange={setDate} />
          <Button type="submit" size="lg" className="h-12" loading={busy === "create"} disabled={!from.trim() || !to.trim()} icon={<Plus className="h-[18px] w-[18px]" />}>
            Créer
          </Button>
        </form>
      </Card>

      <div className="mt-6">
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : !data?.length ? (
          <EmptyState icon={<BellRing />} title="Aucune alerte" text="Créez votre première alerte ci-dessus : jusqu’à 10 trajets surveillés." />
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {data.map((a) => (
                <motion.li key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <Card className="flex items-center gap-4 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <BellRing className="h-5 w-5" />
                    </span>
                    <Link
                      href={`/covoiturage?from=${encodeURIComponent(a.fromCity)}&to=${encodeURIComponent(a.toCity)}${a.date ? `&date=${apiDay(parseDay(a.date))}` : ""}`}
                      className="group min-w-0 flex-1"
                    >
                      <p className="flex items-center gap-2 truncate text-[16px] font-extrabold text-ink">
                        {a.fromCity} <ArrowRight className="h-4 w-4 text-brand" /> {a.toCity}
                      </p>
                      <p className="text-[13px] text-muted group-hover:text-brand">{a.date ? day(parseDay(a.date)) : "Toutes les dates"} · voir les trajets</p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => run(`del-${a.id}`, () => api.delete(`/carpool/alerts/${a.id}`), { success: "Alerte supprimée.", invalidate: [["alerts"]] })}
                      disabled={busy === `del-${a.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
                      aria-label="Supprimer l’alerte"
                    >
                      <Trash2 className="h-[18px] w-[18px]" />
                    </button>
                  </Card>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { BellPlus, BellRing } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { canonicalCity } from "@/lib/cities";
import { apiDay, day } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

/** « Créer une alerte » : être prévenu quand un trajet correspondant est publié. */
export function CreateAlertButton({ from, to, date, variant = "primary" }: { from: string; to: string; date: Date | null; variant?: "primary" | "soft" }) {
  const { requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const can = from.trim() && to.trim();

  const create = () =>
    requireAuth(async () => {
      setBusy(true);
      try {
        await api.post("/carpool/alerts", { fromCity: canonicalCity(from), toCity: canonicalCity(to), ...(date ? { date: apiDay(date) } : {}) });
        setDone(true);
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
        toast.success(`Alerte créée : ${from.trim()} → ${to.trim()}${date ? `, ${day(date).toLowerCase()}` : ""}. Vous serez prévenu.`);
      } catch (e) {
        toast.error(errorMessage(e));
      } finally {
        setBusy(false);
      }
    }, "Connectez-vous pour être prévenu dès qu’un trajet est publié.");

  if (!can) return null;
  return (
    <Button variant={done ? "soft" : variant} onClick={create} loading={busy} disabled={done} icon={done ? <BellRing className="h-4.5 w-4.5" /> : <BellPlus className="h-4.5 w-4.5" />}>
      {done ? "Alerte active" : "Créer une alerte"}
    </Button>
  );
}

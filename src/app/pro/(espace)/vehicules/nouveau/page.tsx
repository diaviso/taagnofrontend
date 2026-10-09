"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera, ClipboardCheck, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { VehicleForm, type VehicleValues } from "@/components/pro/vehicle-form";
import { Card } from "@/components/ui/misc";
import { api, errorMessage } from "@/lib/api";
import type { Vehicle } from "@/lib/types";

export default function NewVehiclePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const create = async (v: VehicleValues) => {
    setBusy(true);
    try {
      const { city, ...rest } = v;
      const created = await api.post<Vehicle>("/vehicles", { ...rest, ...(city ? { city } : {}) });
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Véhicule ajouté ! Ajoutez maintenant ses photos et ses documents.");
      router.push(`/pro/vehicules/${created.id}?nouveau=1`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/pro/vehicules" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes véhicules
      </Link>
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">Ajouter un véhicule</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { icon: FileText, label: "1. Informations", active: true },
          { icon: Camera, label: "2. Photos et documents" },
          { icon: ClipboardCheck, label: "3. Vérification Taagno" },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className={`flex items-center gap-2.5 rounded-[16px] px-4 py-3 text-[13.5px] font-bold ${active ? "bg-brand text-white shadow-glow" : "bg-white text-muted"}`}>
            <Icon className="h-4.5 w-4.5" /> {label}
          </div>
        ))}
      </div>
      <Card className="mt-5 p-5 sm:p-7">
        <VehicleForm submitLabel="Continuer : photos et documents" busy={busy} onSubmit={create} />
      </Card>
    </div>
  );
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, BadgeCheck, CarFront, Hourglass, KeyRound, Pencil, Route, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { DocumentsSection, PhotoManager } from "@/components/pro/vehicle-media";
import { VehicleForm, type VehicleValues } from "@/components/pro/vehicle-form";
import { StatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/field";
import { Card, EmptyState } from "@/components/ui/misc";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { canCarpool, canRent, usageLabel } from "@/lib/pro";
import { useAction, useMyOffers, useVehicle } from "@/lib/queries";
import { VEHICLE_STATUS, vehicleTitleYear } from "@/lib/types";

function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: v, isPending } = useVehicle(id);
  const offers = useMyOffers();
  const { run, busy } = useAction();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (isPending) return <PageSpinner />;
  if (!v) return <EmptyState icon={<CarFront />} title="Véhicule introuvable" action={<LinkButton href="/pro/vehicules">Mes véhicules</LinkButton>} />;

  const invalidate = [["vehicles"], ["vehicle", v.id]];
  const docs = new Set((v.documents ?? []).map((d) => d.type));
  const missingDocs = 3 - docs.size;
  const missingPhotos = (v.photos ?? []).length === 0;
  const offer = (offers.data ?? []).find((o) => o.vehicleId === v.id);

  const save = async (values: VehicleValues) => {
    setSaving(true);
    try {
      const { licensePlate: _plate, ...rest } = values;
      void _plate;
      await api.patch(`/vehicles/${v.id}`, rest);
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      toast.success("Véhicule enregistré.");
      setEditOpen(false);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const banner =
    v.status === "APPROVED"
      ? { tone: "bg-success/10 border-success/25", icon: <BadgeCheck className="h-6 w-6 text-success" />, title: "Véhicule approuvé", text: "Vous pouvez publier des trajets et des offres de location avec ce véhicule." }
      : v.status === "REJECTED"
        ? { tone: "bg-danger/5 border-danger/25", icon: <AlertTriangle className="h-6 w-6 text-danger" />, title: "Véhicule refusé", text: v.adminComment || "Corrigez les informations ou les documents : le véhicule repassera en vérification." }
        : {
            tone: "bg-warning/8 border-warning/30",
            icon: <Hourglass className="h-6 w-6 text-[#b46b05]" />,
            title: missingDocs || missingPhotos ? "Complétez votre véhicule" : "Vérification en cours",
            text:
              missingDocs || missingPhotos
                ? `Il manque ${[missingPhotos && "au moins une photo", missingDocs && `${missingDocs} document${missingDocs > 1 ? "s" : ""}`].filter(Boolean).join(" et ")} pour que notre équipe puisse le vérifier.`
                : "Notre équipe vérifie vos documents. Vous serez prévenu par notification dès que c’est fait.",
          };

  return (
    <div>
      <Link href="/pro/vehicules" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes véhicules
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">{vehicleTitleYear(v)}</h1>
          <p className="mt-1 text-[14px] text-muted">
            {[v.color, v.numberOfSeats ? `${v.numberOfSeats} places` : null, v.licensePlate, v.city, usageLabel(v)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Modifier
          </Button>
          <Button variant="danger" size="icon" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)} aria-label="Supprimer le véhicule" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-5 flex items-start gap-4 rounded-[20px] border p-4 ${banner.tone}`}>
        {banner.icon}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-extrabold text-ink">{banner.title}</p>
            <StatusBadge status={v.status} map={VEHICLE_STATUS} />
          </div>
          <p className="mt-0.5 text-[13.5px] text-ink-soft">{banner.text}</p>
          {params.get("nouveau") === "1" && v.status === "PENDING" && (
            <p className="mt-2 text-[13px] font-semibold text-ink">Étape suivante : ajoutez vos photos et vos 3 documents ci-dessous.</p>
          )}
        </div>
      </motion.div>

      {v.status === "APPROVED" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {canCarpool(v) && (
            <LinkButton href="/pro/trajets/nouveau" icon={<Route className="h-4 w-4" />}>
              Proposer un trajet
            </LinkButton>
          )}
          {canRent(v) &&
            (offer ? (
              <LinkButton href={`/pro/locations/${offer.id}`} variant="soft" icon={<KeyRound className="h-4 w-4" />}>
                Voir mon offre de location
              </LinkButton>
            ) : (
              <LinkButton href="/pro/locations/nouvelle" variant="soft" icon={<KeyRound className="h-4 w-4" />}>
                Mettre en location
              </LinkButton>
            ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-[17px] font-extrabold text-ink">Photos</h2>
          <p className="mb-4 text-[13px] text-muted">La première photo est celle que les voyageurs voient en premier.</p>
          <PhotoManager vehicle={v} />
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-[17px] font-extrabold text-ink">Documents</h2>
          <p className="mb-4 text-[13px] text-muted">Vérifiés par Taagno, jamais publiés. Une photo nette de chaque document suffit.</p>
          <DocumentsSection vehicle={v} />
        </Card>
      </div>

      <Card className="mt-6 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[15px] font-extrabold text-ink">{v.isActive === false ? "Véhicule désactivé" : "Véhicule actif"}</p>
          <p className="text-[13px] text-muted">Désactivez-le temporairement (panne, entretien) sans le supprimer.</p>
        </div>
        <Switch
          checked={v.isActive !== false}
          disabled={busy === "active"}
          label="Véhicule actif"
          onChange={() => run("active", () => api.patch(`/vehicles/${v.id}/toggle-active`), { success: "Statut du véhicule mis à jour.", invalidate })}
        />
      </Card>

      <Modal open={editOpen} onOpenChange={setEditOpen} title="Modifier le véhicule" description="Attention : modifier ces informations renvoie le véhicule en vérification (sauf la ville)." size="lg">
        <VehicleForm initial={v} submitLabel="Enregistrer" busy={saving} onSubmit={save} lockPlate />
      </Modal>
      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce véhicule ?"
        message="Ses photos, ses documents et ses annonces seront supprimés. Impossible s’il a des réservations en cours."
        confirmLabel="Supprimer"
        danger
        loading={busy === "delete"}
        onConfirm={async () => {
          const ok = await run("delete", () => api.delete(`/vehicles/${v.id}`), { success: "Véhicule supprimé.", invalidate: [["vehicles"], ["offers"], ["trips"]] });
          setDeleteOpen(false);
          if (ok !== undefined) router.push("/pro/vehicules");
        }}
      />
    </div>
  );
}

export default function VehiclePage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <VehicleDetail />
    </Suspense>
  );
}

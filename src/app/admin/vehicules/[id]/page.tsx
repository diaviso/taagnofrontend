"use client";

import { ArrowLeft, Check, ExternalLink, FileWarning, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProPageHeader } from "@/components/pro/widgets";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Gallery } from "@/components/ui/gallery";
import { Card, EmptyState, InfoRow } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { ADMIN_INVALIDATE, useAdminVehicle } from "@/lib/admin";
import { api } from "@/lib/api";
import { date } from "@/lib/format";
import { cdn } from "@/lib/images";
import { usageLabel } from "@/lib/pro";
import { useAction } from "@/lib/queries";
import { DOCUMENT_STATUS, DOCUMENT_TYPES, VEHICLE_STATUS, contactLabel, fullName, orderedPhotos, vehicleTitle, vehicleTitleYear } from "@/lib/types";
import { ContactButtons } from "@/components/booking/contact-buttons";

const REASONS = ["Documents illisibles", "Assurance expirée", "Carte grise manquante", "Visite technique manquante", "Photos du véhicule insuffisantes", "Informations incohérentes avec la carte grise"];

export default function AdminVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const { data: v, isPending } = useAdminVehicle(id);
  const { run, busy } = useAction();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");

  if (isPending) return <PageSpinner />;
  if (!v) return <EmptyState icon={<FileWarning />} title="Véhicule introuvable" />;

  const docs = DOCUMENT_TYPES.map((t) => ({ ...t, doc: (v.documents ?? []).filter((d) => d.type === t.value).sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))[0] }));
  const invalidate = ADMIN_INVALIDATE;

  return (
    <div>
      <ProPageHeader
        back={
          <Link href="/admin/vehicules" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Véhicules
          </Link>
        }
        title={vehicleTitleYear(v)}
        subtitle={[v.color, v.numberOfSeats ? `${v.numberOfSeats} places` : null, v.licensePlate, v.city, usageLabel(v)].filter(Boolean).join(" · ")}
        actions={<StatusBadge status={v.status} map={VEHICLE_STATUS} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Gallery photos={orderedPhotos(v).map((p) => p.url)} alt={vehicleTitle(v)} />
          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 text-[17px] font-extrabold text-ink">Documents</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {docs.map(({ value, label, doc }) => (
                <div key={value} className="overflow-hidden rounded-[18px] border border-line">
                  {doc ? (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[4/3] bg-surface-alt">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cdn(doc.fileUrl, 600) ?? undefined} alt={label} className="h-full w-full object-cover" />
                      <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </a>
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1 bg-warning/8 text-[#b46b05]">
                      <FileWarning className="h-7 w-7" />
                      <span className="text-[12.5px] font-bold">Manquant</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="text-[14px] font-bold text-ink">{label}</span>
                    {doc && <StatusBadge status={doc.status} map={DOCUMENT_STATUS} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-muted">Décision</p>
            {v.adminComment && <p className="rounded-[14px] bg-danger/5 px-4 py-3 text-[13.5px] text-ink-soft">Dernier motif : {v.adminComment}</p>}
            {v.status !== "APPROVED" && (
              <Button
                block
                size="lg"
                variant="solid"
                icon={<Check className="h-5 w-5" />}
                loading={busy === "approve"}
                onClick={() => run("approve", () => api.patch(`/admin/vehicles/${v.id}/approve`), { success: "Véhicule approuvé. Le propriétaire est prévenu.", invalidate })}
              >
                Approuver
              </Button>
            )}
            {v.status !== "REJECTED" && (
              <Button block size="lg" variant="danger" icon={<X className="h-5 w-5" />} onClick={() => setRejectOpen(true)}>
                Refuser
              </Button>
            )}
            {v.status !== "PENDING" && (
              <Button
                block
                variant="ghost"
                icon={<RotateCcw className="h-4 w-4" />}
                loading={busy === "reset"}
                onClick={() => run("reset", () => api.patch(`/admin/vehicles/${v.id}/status`, { status: "PENDING" }), { success: "Véhicule remis en vérification.", invalidate })}
              >
                Remettre en vérification
              </Button>
            )}
          </Card>
          <Card className="p-5">
            <p className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-muted">Propriétaire</p>
            <Link href={`/admin/utilisateurs/${v.owner?.id}`} className="flex items-center gap-3 rounded-[14px] p-1 transition hover:bg-surface-alt">
              <Avatar user={v.owner} size={44} />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-extrabold text-ink">{fullName(v.owner)}</p>
                <p className="truncate text-[12.5px] text-muted">{contactLabel(v.owner)}</p>
              </div>
            </Link>
            {v.owner?.phone && (
              <ContactButtons
                className="mt-3"
                compact
                phone={v.owner.phone}
                name={fullName(v.owner)}
                message={`Bonjour ${v.owner.firstName ?? ""}, c’est l’équipe Taagno au sujet de votre véhicule ${vehicleTitle(v)}.`}
              />
            )}
          </Card>
          <Card className="p-5">
            <InfoRow label="Ajouté le" value={date(v.createdAt)} />
            <InfoRow label="Actif" value={v.isActive === false ? "Non" : "Oui"} />
            <InfoRow label="Offre de location" value={v.rentalOffer ? "Oui" : "Non"} />
            <InfoRow label="Trajets récents" value={String(v.carpoolTrips?.length ?? 0)} />
          </Card>
        </div>
      </div>

      <Modal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Refuser le véhicule"
        description="Le propriétaire recevra ce motif et pourra corriger son véhicule."
        footer={
          <Button
            block
            size="lg"
            variant="danger"
            loading={busy === "reject"}
            onClick={async () => {
              const ok = await run("reject", () => api.patch(`/admin/vehicles/${v.id}/reject`, { comment: comment.trim() || undefined }), { success: "Véhicule refusé. Le propriétaire est prévenu.", invalidate });
              if (ok !== undefined) {
                setRejectOpen(false);
                setComment("");
              }
            }}
          >
            Refuser le véhicule
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setComment((c) => (c ? `${c}. ${r}` : r))}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-bold text-ink-soft transition hover:border-brand/50 hover:text-brand"
            >
              + {r}
            </button>
          ))}
        </div>
        <Field label="Motif" hint="Soyez précis : c’est ce que le propriétaire lira.">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ex. L’attestation d’assurance a expiré en septembre." />
        </Field>
      </Modal>
    </div>
  );
}

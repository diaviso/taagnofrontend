"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ExternalLink, Flag, Power, RotateCcw, Trash2, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Meta, Pager, PersonTag } from "@/components/admin/admin-ui";
import { ExportButton } from "@/components/admin/export-button";
import { ReasonModal } from "@/components/pro/reason-modal";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { ADMIN_INVALIDATE, PAGE_SIZE, REPORT_STATUS, adminActions, useAdminBadges, useAdminReport, useAdminReports, type AdminReport, type ReportStatus } from "@/lib/admin";
import { dayTime, relative } from "@/lib/format";
import { useAction } from "@/lib/queries";
import { fullName, reportReasonLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

const TARGET_TYPE = { USER: "Profil", TRIP: "Trajet", OFFER: "Annonce de location", REVIEW: "Avis" } as const;

type Decision = { report: AdminReport; status: ReportStatus };

const DECISION: Record<ReportStatus, { title: string; confirm: string; success: string; message: string }> = {
  RESOLVED: { title: "Marquer comme traité ?", confirm: "Marquer comme traité", success: "Signalement traité.", message: "Le signalement passe dans l’onglet « Traités »." },
  DISMISSED: { title: "Classer sans suite ?", confirm: "Classer sans suite", success: "Signalement classé sans suite.", message: "Aucune action n’est nécessaire : le signalement passe dans l’onglet « Classés »." },
  OPEN: { title: "Rouvrir ce signalement ?", confirm: "Rouvrir", success: "Signalement rouvert.", message: "Il repasse dans l’onglet « Ouverts »." },
};

export default function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus>("OPEN");
  const [page, setPage] = useState(1);
  const badges = useAdminBadges();
  const { data, isPending, isFetching, isError, refetch } = useAdminReports({ status, page });
  const { run, busy } = useAction();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [suspend, setSuspend] = useState<AdminReport | null>(null);
  const [removeReview, setRemoveReview] = useState<AdminReport | null>(null);

  return (
    <div>
      <ProPageHeader title="Signalements" subtitle="Ce que les membres ont signalé : profils, trajets, annonces et avis." actions={<ExportButton kind="reports" />} />
      <Segmented
        layoutId="admin-reports-status"
        className="w-full sm:w-auto"
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        options={[
          { value: "OPEN", label: "Ouverts", count: badges.reports },
          { value: "RESOLVED", label: "Traités" },
          { value: "DISMISSED", label: "Classés" },
        ]}
      />

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton rows={3} className="h-40" />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList
            icon={<Flag />}
            title={status === "OPEN" ? "Aucun signalement ouvert" : "Rien ici pour le moment"}
            text={status === "OPEN" ? "Tout a été examiné. Merci !" : "Les signalements apparaissent ici une fois examinés."}
          />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((r, i) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  index={i}
                  onDecide={(s) => setDecision({ report: r, status: s })}
                  onSuspend={() => setSuspend(r)}
                  onRemoveReview={() => setRemoveReview(r)}
                />
              ))}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ReasonModal
        open={!!decision}
        onOpenChange={(v) => !v && setDecision(null)}
        title={decision ? DECISION[decision.status].title : ""}
        message={decision ? DECISION[decision.status].message : null}
        confirmLabel={decision ? DECISION[decision.status].confirm : "Confirmer"}
        danger={false}
        label="Note interne"
        hint="Réservée à l’équipe, jamais envoyée au membre."
        placeholder="Ex. : conducteur averti par téléphone"
        max={500}
        loading={busy === "decide"}
        onConfirm={async (note) => {
          if (!decision) return;
          const ok = await run("decide", () => adminActions.setReportStatus(decision.report.id, decision.status, note), { success: DECISION[decision.status].success, invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setDecision(null);
        }}
      />

      <ReasonModal
        open={!!suspend}
        onOpenChange={(v) => !v && setSuspend(null)}
        title="Suspendre ce compte ?"
        message={
          suspend && (
            <>
              <strong>{fullName(suspend.targetUser)}</strong> sera déconnecté de tous ses appareils et ne pourra plus se connecter. Ses trajets et annonces disparaissent de la recherche. Vous pourrez réactiver le compte depuis sa fiche.
            </>
          )
        }
        confirmLabel="Suspendre le compte"
        hint="Gardé dans le journal, jamais montré au membre."
        placeholder="Ex. : arnaque confirmée par deux signalements"
        loading={busy === "suspend"}
        onConfirm={async (reason) => {
          if (!suspend?.targetUserId) return;
          const targetUserId = suspend.targetUserId;
          const ok = await run("suspend", () => adminActions.toggleUserActive(targetUserId, reason), { success: "Compte suspendu.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setSuspend(null);
        }}
      />

      <ConfirmModal
        open={!!removeReview}
        onOpenChange={(v) => !v && setRemoveReview(null)}
        title="Supprimer l’avis signalé ?"
        danger
        confirmLabel="Supprimer l’avis"
        loading={busy === "review"}
        message="L’avis est supprimé pour de bon et sa note est retirée de la note moyenne de la personne notée."
        onConfirm={async () => {
          if (!removeReview) return;
          const ok = await run("review", () => adminActions.deleteReview(removeReview.targetId), { success: "Avis supprimé.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setRemoveReview(null);
        }}
      />
    </div>
  );
}

function ReportCard({ report: r, index, onDecide, onSuspend, onRemoveReview }: { report: AdminReport; index: number; onDecide: (s: ReportStatus) => void; onSuspend: () => void; onRemoveReview: () => void }) {
  const [open, setOpen] = useState(false);
  const detail = useAdminReport(r.id, open);
  const label = r.reasonLabel ?? reportReasonLabel(r.reason);
  const others = detail.data?.otherReportsOnSameUser;
  const state = REPORT_STATUS[r.status];
  const canSuspend = !!r.targetUserId && !!r.targetUser && r.targetUser.isActive !== false;
  const canRemoveReview = r.targetType === "REVIEW" && r.targetExists !== false;

  return (
    <AdminCard index={index}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[16px] font-extrabold text-ink">
            <Flag className={cn("h-4 w-4", r.status === "OPEN" ? "text-danger" : "text-faint")} />
            {label}
          </p>
          <Meta className="mt-0.5">
            {TARGET_TYPE[r.targetType]} · signalé {relative(r.createdAt)}
          </Meta>
        </div>
        <Badge tone={state.tone} dot>
          {state.label}
        </Badge>
      </div>

      {r.details ? (
        <p className="mt-3 whitespace-pre-line break-words rounded-[14px] bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-ink-soft">« {r.details} »</p>
      ) : (
        <p className="mt-3 text-[13px] italic text-muted">Aucun détail donné.</p>
      )}

      <div className="mt-4 grid gap-2 text-[13.5px] sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11.5px] font-extrabold uppercase tracking-[0.1em] text-faint">Signalé par</p>
          <PersonTag user={r.reporter} />
        </div>
        <div>
          <p className="mb-1 text-[11.5px] font-extrabold uppercase tracking-[0.1em] text-faint">Personne visée</p>
          {r.targetUser ? <PersonTag user={r.targetUser} /> : <span className="text-muted">Compte supprimé</span>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px]">
        <span className="font-semibold text-ink-soft">{r.targetLabel || TARGET_TYPE[r.targetType]}</span>
        {r.targetExists === false && <Badge tone="muted">Élément supprimé</Badge>}
        {r.targetExists !== false && r.targetType === "TRIP" && (
          <>
            <Link href={`/covoiturage/${r.targetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-brand hover:underline">
              Voir le trajet <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link href={`/admin/trajets/${r.targetId}`} className="font-bold text-brand hover:underline">
              Fiche admin
            </Link>
          </>
        )}
        {r.targetExists !== false && r.targetType === "OFFER" && (
          <Link href={`/location/${r.targetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-brand hover:underline">
            Voir l’annonce <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
        {r.targetExists !== false && r.targetType === "USER" && (
          <Link href={`/admin/utilisateurs/${r.targetId}`} className="inline-flex items-center gap-1 font-bold text-brand hover:underline">
            <UserRound className="h-3.5 w-3.5" /> Fiche du membre
          </Link>
        )}
      </div>

      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-soft transition hover:text-brand">
        Détail <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <dl className="mt-2 space-y-1.5 rounded-[14px] bg-surface-alt px-4 py-3 text-[13.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Autres signalements sur cette personne</dt>
                <dd className="font-bold text-ink">
                  {detail.isPending ? "…" : others === undefined ? "—" : others === 0 ? "Aucun" : <Badge tone="danger">{others}</Badge>}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Signalé le</dt>
                <dd className="font-bold text-ink">{dayTime(r.createdAt)}</dd>
              </div>
              {r.handledAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Examiné le</dt>
                  <dd className="font-bold text-ink">{dayTime(r.handledAt)}</dd>
                </div>
              )}
              {r.resolutionNote && (
                <div>
                  <dt className="text-muted">Note interne</dt>
                  <dd className="mt-0.5 whitespace-pre-line font-semibold text-ink">{r.resolutionNote}</dd>
                </div>
              )}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-line pt-3">
        {r.status === "OPEN" ? (
          <>
            {canSuspend && (
              <Button variant="danger" size="sm" icon={<Power className="h-4 w-4" />} onClick={onSuspend}>
                Suspendre le compte
              </Button>
            )}
            {canRemoveReview && (
              <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={onRemoveReview}>
                Supprimer l’avis
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={() => onDecide("DISMISSED")}>
              Classer sans suite
            </Button>
            <Button variant="solid" size="sm" icon={<Check className="h-4 w-4" />} onClick={() => onDecide("RESOLVED")}>
              Traité
            </Button>
          </>
        ) : (
          <>
            {canRemoveReview && (
              <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={onRemoveReview}>
                Supprimer l’avis
              </Button>
            )}
            <Button variant="outline" size="sm" icon={<RotateCcw className="h-4 w-4" />} onClick={() => onDecide("OPEN")}>
              Rouvrir
            </Button>
          </>
        )}
      </div>
    </AdminCard>
  );
}

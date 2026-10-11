"use client";

import { Flag } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/booking/success-check";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { ApiError, api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { REPORT_REASONS, type ReportReason, type ReportTarget } from "@/lib/types";
import { cn } from "@/lib/utils";

const DETAILS_MAX = 1000;

const SUBJECT: Record<ReportTarget, { title: string; intro: string }> = {
  USER: { title: "Signaler ce membre", intro: "Dites-nous ce qui ne va pas avec ce profil." },
  TRIP: { title: "Signaler ce trajet", intro: "Dites-nous ce qui ne va pas avec ce trajet ou son conducteur." },
  OFFER: { title: "Signaler cette annonce", intro: "Dites-nous ce qui ne va pas avec cette annonce ou son propriétaire." },
  REVIEW: { title: "Signaler cet avis", intro: "Dites-nous ce qui ne va pas avec cet avis." },
};

/**
 * Lien discret « Signaler » (profil, trajet, annonce). La connexion est demandée au clic ;
 * rien ne s'affiche sur son propre profil ou sa propre annonce (`ownerId`).
 */
export function ReportButton({ targetType, targetId, ownerId, className }: { targetType: ReportTarget; targetId: string; ownerId?: string | null; className?: string }) {
  const { user, requireAuth } = useAuth();
  const [open, setOpen] = useState(false);
  if (user && ownerId && user.id === ownerId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => requireAuth(() => setOpen(true), "Connectez-vous pour signaler. C’est rapide : votre numéro et un code.")}
        className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted transition hover:bg-danger/8 hover:text-danger", className)}
      >
        <Flag className="h-3.5 w-3.5" /> Signaler
      </button>
      <ReportDialog open={open} onOpenChange={setOpen} targetType={targetType} targetId={targetId} />
    </>
  );
}

function ReportDialog({ open, onOpenChange, targetType, targetId }: { open: boolean; onOpenChange: (v: boolean) => void; targetType: ReportTarget; targetId: string }) {
  const detailsId = useId();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ title: string; text: string } | null>(null);
  const subject = SUBJECT[targetType];

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      // On vide le formulaire une fois la fenêtre refermée.
      setTimeout(() => {
        setReason(null);
        setDetails("");
        setDone(null);
      }, 300);
    }
  };

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      const result = await api.post<{ id: string; message: string }>("/reports", {
        targetType,
        targetId,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
      });
      setDone({ title: "Signalement transmis", text: result?.message || "Merci, votre signalement a été transmis à l’équipe Taagno." });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // Déjà signalé : rien à refaire, on le dit simplement.
        setDone({ title: "Déjà signalé", text: "Vous avez déjà signalé cet élément : notre équipe l’examine." });
      } else {
        toast.error(errorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={close} title={done ? "Merci" : subject.title} description={done ? undefined : subject.intro} hideHeader={!!done} size="sm">
      {done ? (
        <div className="py-4 text-center">
          <SuccessCheck />
          <h3 className="mt-5 text-[22px] font-extrabold tracking-tight text-ink">{done.title}</h3>
          <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">{done.text}</p>
          <Button className="mt-6" block variant="ghost" onClick={() => close(false)}>
            Fermer
          </Button>
        </div>
      ) : (
        <div>
          <div role="radiogroup" aria-label="Motif du signalement" className="space-y-2">
            {REPORT_REASONS.map((r) => {
              const selected = reason === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition active:scale-[0.99]",
                    selected ? "border-brand bg-brand-soft shadow-[inset_0_0_0_1px_var(--brand)]" : "border-line bg-white hover:border-brand/40",
                  )}
                >
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", selected ? "border-brand" : "border-line")}>
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-bold text-ink">{r.label}</span>
                    <span className="block text-[12.5px] text-muted">{r.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Field label="Détails" htmlFor={detailsId} optional hint={`${details.length}/${DETAILS_MAX} · Plus c’est précis, plus l’équipe peut agir vite.`} className="mt-4">
            <Textarea id={detailsId} value={details} maxLength={DETAILS_MAX} onChange={(e) => setDetails(e.target.value)} placeholder="Que s’est-il passé ? Quand ?" className="min-h-[96px]" />
          </Field>
          <Button block size="lg" className="mt-5" disabled={!reason} loading={busy} onClick={submit}>
            Envoyer le signalement
          </Button>
          <p className="mt-3 text-center text-[12.5px] text-muted">Votre signalement reste confidentiel : la personne concernée n’est pas prévenue.</p>
        </div>
      )}
    </Modal>
  );
}

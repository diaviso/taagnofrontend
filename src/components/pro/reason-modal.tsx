"use client";

import { useId, useState, type ReactNode } from "react";
import { Field, Textarea } from "@/components/ui/field";
import { ConfirmModal } from "@/components/ui/modal";

export const REASON_MAX = 300;

/**
 * Confirmation avec un motif facultatif (≤ 300 caractères) que la personne concernée recevra
 * (passager retiré, location annulée par le propriétaire).
 */
export function ReasonModal({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  loading,
  placeholder = "Ex. : changement de programme",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  placeholder?: string;
  /** Reçoit le motif nettoyé (chaîne vide s'il n'y en a pas). */
  onConfirm: (reason: string) => void;
}) {
  const id = useId();
  const [reason, setReason] = useState("");
  // Chaque ouverture repart d'un champ vide (ajustement pendant le rendu).
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setReason("");
  }

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      danger
      loading={loading}
      onConfirm={() => onConfirm(reason.trim())}
    >
      <Field label="Motif" htmlFor={id} optional hint={`${reason.length}/${REASON_MAX} · Il sera transmis dans la notification.`} className="mt-4">
        <Textarea id={id} value={reason} maxLength={REASON_MAX} onChange={(e) => setReason(e.target.value)} placeholder={placeholder} className="min-h-[88px]" />
      </Field>
    </ConfirmModal>
  );
}

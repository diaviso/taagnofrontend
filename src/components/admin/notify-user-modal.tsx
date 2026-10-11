"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Segmented } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ADMIN_INVALIDATE, adminActions } from "@/lib/admin";
import { errorMessage } from "@/lib/api";

const TITLE_MAX = 80;
const BODY_MAX = 500;

/** Message de l'équipe à une seule personne : notification dans l'app choisie, avec push. */
export function NotifyUserModal({ open, onOpenChange, userId, name }: { open: boolean; onOpenChange: (open: boolean) => void; userId: string; name: string }) {
  const titleId = useId();
  const bodyId = useId();
  const queryClient = useQueryClient();
  const [audience, setAudience] = useState<"VOYAGEUR" | "PRO">("VOYAGEUR");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  // Chaque ouverture repart d'un formulaire vide (ajustement pendant le rendu).
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setTitle("");
      setBody("");
      setAudience("VOYAGEUR");
    }
  }

  const valid = title.trim().length >= 2 && body.trim().length >= 2;

  const send = async () => {
    setBusy(true);
    try {
      await adminActions.notifyUser(userId, { audience, title: title.trim(), body: body.trim() });
      toast.success(`Message envoyé à ${name}.`);
      await Promise.all(ADMIN_INVALIDATE.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Envoyer un message"
      description={`${name} le reçoit en notification dans l’application, avec un push sur son téléphone.`}
      footer={
        <Button block size="lg" disabled={!valid} loading={busy} icon={<Send className="h-[18px] w-[18px]" />} onClick={send}>
          Envoyer
        </Button>
      }
    >
      <p className="mb-2 text-[13.5px] font-bold text-ink">Application</p>
      <Segmented
        layoutId="notify-user-audience"
        className="w-full"
        value={audience}
        onChange={setAudience}
        options={[
          { value: "VOYAGEUR", label: "Taagno" },
          { value: "PRO", label: "Taagno Pro" },
        ]}
      />
      <Field label="Titre" htmlFor={titleId} hint={`${title.length}/${TITLE_MAX}`} className="mt-4">
        <Input id={titleId} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : À propos de votre dernier trajet" />
      </Field>
      <Field label="Message" htmlFor={bodyId} hint={`${body.length}/${BODY_MAX}`} className="mt-4">
        <Textarea id={bodyId} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} placeholder="Écrivez simplement, en une ou deux phrases." className="min-h-[120px]" />
      </Field>
    </Modal>
  );
}

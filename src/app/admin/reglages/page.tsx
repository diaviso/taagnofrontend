"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Eye, Headset, Mail, Megaphone, MessageCircle, Phone, Save } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { ProPageHeader } from "@/components/pro/widgets";
import { SupportActionsView } from "@/components/info/support-actions";
import { AnnouncementBar } from "@/components/layout/announcement-banner";
import { Button } from "@/components/ui/button";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { Card, Skeleton } from "@/components/ui/misc";
import { adminActions, useAdminSettings, type AdminSettings } from "@/lib/admin";
import { errorMessage } from "@/lib/api";
import { normalizeContactPhone, prettyPhone } from "@/lib/phone";

const ANNOUNCEMENT_MAX = 280;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Saisie en cours : seuls les champs modifiés y figurent. */
type Draft = Partial<Record<"supportPhone" | "supportWhatsapp" | "supportEmail" | "announcementText", string>> & { announcementActive?: boolean };

export default function AdminSettingsPage() {
  const { data, isPending } = useAdminSettings();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>({});
  const [saving, setSaving] = useState(false);
  const ids = { phone: useId(), whatsapp: useId(), email: useId(), text: useId() };

  if (isPending || !data) {
    return (
      <div>
        <ProPageHeader title="Réglages" subtitle="Contact du support et annonce affichée aux membres." />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-[22px]" />
          <Skeleton className="h-80 rounded-[22px]" />
        </div>
      </div>
    );
  }

  const shownPhone = (v: string) => (v ? prettyPhone(v, true) : "");
  const field = {
    supportPhone: draft.supportPhone ?? shownPhone(data.supportPhone),
    supportWhatsapp: draft.supportWhatsapp ?? shownPhone(data.supportWhatsapp),
    supportEmail: draft.supportEmail ?? data.supportEmail,
    announcementText: draft.announcementText ?? data.announcementText,
    announcementActive: draft.announcementActive ?? data.announcementActive,
  };

  // Valeurs telles qu'elles seront envoyées (numéros normalisés), ou erreur lisible.
  const phone = field.supportPhone.trim() ? normalizeContactPhone(field.supportPhone) : "";
  const whatsapp = field.supportWhatsapp.trim() ? normalizeContactPhone(field.supportWhatsapp) : "";
  const email = field.supportEmail.trim();
  const errors = {
    supportPhone: phone === null ? "Numéro invalide. Exemple : 77 123 45 67 ou +33 6 12 34 56 78." : null,
    supportWhatsapp: whatsapp === null ? "Numéro invalide. Exemple : 77 123 45 67 ou +33 6 12 34 56 78." : null,
    supportEmail: email && !EMAIL.test(email) ? "Adresse e-mail invalide." : null,
  };
  const valid = !errors.supportPhone && !errors.supportWhatsapp && !errors.supportEmail;
  const next: AdminSettings = {
    supportPhone: phone ?? "",
    supportWhatsapp: whatsapp ?? "",
    supportEmail: email,
    announcementText: field.announcementText.trim(),
    announcementActive: field.announcementActive,
  };
  const dirty = (Object.keys(next) as (keyof AdminSettings)[]).some((k) => next[k] !== data[k]);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = await adminActions.saveSettings(next);
      queryClient.setQueryData(["admin", "settings"], saved);
      // Le site public relit ses réglages (contact du support, bandeau).
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      setDraft({});
      toast.success("Réglages enregistrés. Ils sont visibles tout de suite sur le site et dans les applications.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ProPageHeader
        title="Réglages"
        subtitle="Contact du support et annonce affichée aux membres."
        actions={
          <Button icon={<Save className="h-4 w-4" />} disabled={!dirty || !valid} loading={saving} onClick={save}>
            Enregistrer
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-ink [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-brand">
            <Headset /> Contact du support
          </h2>
          <p className="mt-1 text-[13.5px] text-muted">Affichés sur la page Aide, dans le pied de page et dans les applications. Un champ vide masque le bouton correspondant.</p>
          <div className="mt-5 space-y-4">
            <Field label="Numéro d’appel" htmlFor={ids.phone} error={errors.supportPhone} hint="Bouton « Appeler »">
              <Input id={ids.phone} icon={<Phone />} inputMode="tel" value={field.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} placeholder="+221 77 123 45 67" invalid={!!errors.supportPhone} />
            </Field>
            <Field label="Numéro WhatsApp" htmlFor={ids.whatsapp} error={errors.supportWhatsapp} hint="Bouton « WhatsApp »">
              <Input id={ids.whatsapp} icon={<MessageCircle />} inputMode="tel" value={field.supportWhatsapp} onChange={(e) => set("supportWhatsapp", e.target.value)} placeholder="+221 77 123 45 67" invalid={!!errors.supportWhatsapp} />
            </Field>
            <Field label="Adresse e-mail" htmlFor={ids.email} error={errors.supportEmail} hint="Bouton « E-mail »">
              <Input id={ids.email} icon={<Mail />} type="email" value={field.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} placeholder="support@taagno.sn" invalid={!!errors.supportEmail} />
            </Field>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted">
              <Eye className="h-3.5 w-3.5" /> Aperçu sur la page Aide
            </p>
            {phone || whatsapp || email ? (
              <SupportActionsView support={{ phone: phone || null, whatsapp: whatsapp || null, email: email && !errors.supportEmail ? email : null }} variant="cards" />
            ) : (
              <p className="rounded-[14px] bg-surface-alt px-4 py-3 text-[13.5px] text-muted">Aucune coordonnée : aucun bouton n’est affiché aux visiteurs.</p>
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-ink [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-brand">
                <Megaphone /> Bandeau d’annonce
              </h2>
              <p className="mt-1 text-[13.5px] text-muted">Un message court en haut du site (et dans les apps), que chacun peut fermer.</p>
            </div>
            <Switch checked={field.announcementActive} onChange={(v) => set("announcementActive", v)} label="Afficher le bandeau d’annonce" />
          </div>
          <Field label="Texte de l’annonce" htmlFor={ids.text} hint={`${field.announcementText.length}/${ANNOUNCEMENT_MAX}`} className="mt-5">
            <Textarea
              id={ids.text}
              value={field.announcementText}
              maxLength={ANNOUNCEMENT_MAX}
              onChange={(e) => set("announcementText", e.target.value)}
              placeholder="Ex. : Maintenance dimanche de 2 h à 4 h. Les réservations restent possibles."
              className="min-h-[110px]"
            />
          </Field>
          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted">
              <Eye className="h-3.5 w-3.5" /> Aperçu en haut du site
            </p>
            <div className="overflow-hidden rounded-[16px] border border-line">
              <AnnouncementBar text={next.announcementText || "Le texte de votre annonce s’affichera ici."} onClose={() => {}} className={next.announcementText ? "" : "opacity-60"} />
              <div className="bg-white px-4 py-3 text-[12.5px] text-faint">Le reste de la page…</div>
            </div>
            <p className="mt-3 text-[13px] font-semibold text-ink-soft">
              {!field.announcementActive ? "Le bandeau est désactivé : personne ne le voit." : !next.announcementText ? "Le bandeau est activé mais sans texte : il n’apparaît pas." : "Le bandeau est visible par tous les visiteurs."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

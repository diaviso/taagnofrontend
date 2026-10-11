"use client";

import { BellRing, Briefcase, Megaphone, Send, Ticket, Users } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Meta, Pager } from "@/components/admin/admin-ui";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { ADMIN_INVALIDATE, PAGE_SIZE, adminActions, useAdminAudit, useAdminOverview, useAdminStats } from "@/lib/admin";
import { dayTime, plural } from "@/lib/format";
import { useAction } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Audience = "ALL" | "VOYAGEUR" | "PRO";

const AUDIENCES: { value: Audience; label: string; hint: string; icon: ReactNode }[] = [
  { value: "ALL", label: "Tout le monde", hint: "Toutes les apps", icon: <Users /> },
  { value: "VOYAGEUR", label: "Voyageurs", hint: "Application Taagno", icon: <Ticket /> },
  { value: "PRO", label: "Conducteurs et propriétaires", hint: "Application Taagno Pro", icon: <Briefcase /> },
];

const AUDIENCE_LABEL: Record<Audience, string> = { ALL: "Tout le monde", VOYAGEUR: "Voyageurs", PRO: "Taagno Pro" };
const AUDIENCE_TO: Record<Audience, string> = { ALL: "tout le monde", VOYAGEUR: "tous les voyageurs", PRO: "tous les conducteurs et propriétaires" };

const TITLE_MAX = 80;
const BODY_MAX = 500;

export default function AdminMessagesPage() {
  const titleId = useId();
  const bodyId = useId();
  const [audience, setAudience] = useState<Audience>("ALL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { run, busy } = useAction();
  const stats = useAdminStats();
  const overview = useAdminOverview();
  const history = useAdminAudit({ targetType: "BROADCAST", page });

  // Estimation du nombre de destinataires (comptes actifs ; Pro : comptes avec un véhicule).
  const active = stats.data && overview.data ? stats.data.users.total - overview.data.users.suspended : null;
  const recipients = audience === "PRO" ? (overview.data?.users.pros ?? null) : active;

  const valid = title.trim().length >= 2 && body.trim().length >= 2;

  const send = async () => {
    const result = await run("send", () => adminActions.broadcast({ audience, title: title.trim(), body: body.trim() }), { invalidate: ADMIN_INVALIDATE });
    if (result) {
      toast.success(`Message envoyé : ${plural(result.sent, "notification")}.`);
      setConfirmOpen(false);
      setTitle("");
      setBody("");
      setPage(1);
    }
  };

  return (
    <div>
      <ProPageHeader title="Messages" subtitle="Écrivez à vos membres : annonce, nouveauté, maintenance. Chaque message arrive en notification dans l’application." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-[17px] font-extrabold text-ink">Nouveau message</h2>

          <fieldset className="mt-4">
            <legend className="mb-2 text-[13.5px] font-bold text-ink">Destinataires</legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {AUDIENCES.map((a) => {
                const selected = audience === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAudience(a.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-[16px] border p-3.5 text-left transition active:scale-[0.98]",
                      selected ? "border-brand bg-brand-soft shadow-[inset_0_0_0_1px_var(--brand)]" : "border-line bg-white hover:border-brand/40",
                    )}
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] [&_svg]:h-5 [&_svg]:w-5", selected ? "bg-brand text-white" : "bg-surface-alt text-muted")}>{a.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-extrabold leading-tight text-ink">{a.label}</span>
                      <span className="block text-[12.5px] text-muted">{a.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Titre" htmlFor={titleId} hint={`${title.length}/${TITLE_MAX}`} className="mt-5">
            <Input id={titleId} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : Nouveau : réservation instantanée" />
          </Field>
          <Field label="Message" htmlFor={bodyId} hint={`${body.length}/${BODY_MAX}`} className="mt-4">
            <Textarea id={bodyId} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} placeholder="Écrivez simplement, en une ou deux phrases." className="min-h-[130px]" />
          </Field>

          <Button size="lg" className="mt-5 w-full sm:w-auto" disabled={!valid} icon={<Send className="h-[18px] w-[18px]" />} onClick={() => setConfirmOpen(true)}>
            Envoyer le message
          </Button>
        </Card>

        <div className="space-y-3 lg:sticky lg:top-[88px] lg:self-start">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted">Aperçu sur le téléphone</p>
          <div className="rounded-[26px] bg-gradient-to-b from-brand-soft to-surface-alt p-4">
            <div className="rounded-[20px] border border-white/70 bg-white/90 p-3.5 shadow-soft backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-gradient text-white">
                  <Megaphone className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{audience === "PRO" ? "Taagno Pro" : "Taagno"}</p>
                    <p className="text-[11.5px] text-faint">maintenant</p>
                  </div>
                  <p className="mt-0.5 break-words text-[14.5px] font-extrabold leading-snug text-ink">{title.trim() || "Titre du message"}</p>
                  <p className="mt-0.5 line-clamp-5 whitespace-pre-line break-words text-[13.5px] leading-snug text-ink-soft">{body.trim() || "Le texte de votre message s’affichera ici."}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="flex items-start gap-2 text-[12.5px] leading-snug text-muted">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0" />
            {recipients !== null ? `Environ ${plural(recipients, "personne")} le recevront` : "Tous les destinataires le recevront"}, dans la liste des notifications et par notification push.
          </p>
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-[18px] font-extrabold text-ink">Messages envoyés</h2>
      {history.isPending ? (
        <ListSkeleton rows={3} className="h-24" />
      ) : history.isError ? (
        <LoadError onRetry={() => history.refetch()} />
      ) : !history.data.items.length ? (
        <EmptyList icon={<Megaphone />} title="Aucun message envoyé" text="L’historique de vos envois apparaît ici." />
      ) : (
        <>
          <CardList refreshing={history.isFetching}>
            {history.data.items.map((a, i) => {
              const d = (a.details ?? {}) as { audience?: Audience; title?: string; body?: string; sent?: number };
              return (
                <AdminCard key={a.id} index={i}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 break-words text-[15.5px] font-extrabold text-ink">{d.title ?? a.summary}</p>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {d.audience && <Badge tone="brand">{AUDIENCE_LABEL[d.audience] ?? d.audience}</Badge>}
                      {typeof d.sent === "number" && <Badge tone="muted">{plural(d.sent, "envoi")}</Badge>}
                    </div>
                  </div>
                  {d.body && <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-[14px] leading-relaxed text-ink-soft">{d.body}</p>}
                  <Meta className="mt-2">
                    {dayTime(a.createdAt)}
                    {a.admin ? ` · par ${[a.admin.firstName, a.admin.lastName].filter(Boolean).join(" ") || a.admin.email}` : ""}
                  </Meta>
                </AdminCard>
              );
            })}
          </CardList>
          <Pager page={history.data.page} pageSize={history.data.pageSize || PAGE_SIZE} total={history.data.total} onPage={setPage} />
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Envoyer ce message ?"
        confirmLabel="Envoyer maintenant"
        loading={busy === "send"}
        message={
          <>
            <p>
              « <strong>{title.trim()}</strong> » sera envoyé à <strong>{AUDIENCE_TO[audience]}</strong>
              {recipients !== null ? <> (environ {plural(recipients, "personne")})</> : null}.
            </p>
            <p className="mt-3 rounded-[14px] bg-warning/10 px-4 py-3 text-[13.5px] text-ink-soft">
              Chaque personne reçoit une notification dans l’application <strong>et</strong> une notification push sur son téléphone. L’envoi ne peut pas être annulé.
            </p>
          </>
        }
        onConfirm={send}
      />
    </div>
  );
}

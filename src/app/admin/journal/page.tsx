"use client";

import {
  Ban,
  CarFront,
  Flag,
  KeyRound,
  Megaphone,
  MessageSquareHeart,
  Route,
  ScrollText,
  Settings,
  Ticket,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Meta, Pager } from "@/components/admin/admin-ui";
import { ProPageHeader } from "@/components/pro/widgets";
import { Select } from "@/components/ui/field";
import { PAGE_SIZE, useAdminAudit, type AdminAction } from "@/lib/admin";
import { dayTime } from "@/lib/format";

const TYPES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "USER", label: "Utilisateurs", icon: UserRound },
  { value: "VEHICLE", label: "Véhicules", icon: CarFront },
  { value: "TRIP", label: "Trajets", icon: Route },
  { value: "RESERVATION", label: "Réservations", icon: Ticket },
  { value: "OFFER", label: "Annonces de location", icon: KeyRound },
  { value: "BOOKING", label: "Demandes de location", icon: KeyRound },
  { value: "REVIEW", label: "Avis", icon: MessageSquareHeart },
  { value: "REPORT", label: "Signalements", icon: Flag },
  { value: "BROADCAST", label: "Messages", icon: Megaphone },
  { value: "SETTINGS", label: "Réglages et exports", icon: Settings },
];

const iconOf = (type: string) => TYPES.find((t) => t.value === type)?.icon ?? Ban;
const labelOf = (type: string) => TYPES.find((t) => t.value === type)?.label ?? type;

/** Page de l'administration qui présente l'élément concerné, quand il y en a une. */
function targetHref(a: AdminAction) {
  if (!a.targetId) return null;
  switch (a.targetType) {
    case "USER":
      return `/admin/utilisateurs/${a.targetId}`;
    case "VEHICLE":
      return `/admin/vehicules/${a.targetId}`;
    case "TRIP":
      return `/admin/trajets/${a.targetId}`;
    case "REPORT":
      return "/admin/signalements";
    default:
      return null;
  }
}

/** Motif ou note joints à l'action. */
function extra(a: AdminAction) {
  const d = (a.details ?? {}) as Record<string, unknown>;
  const reason = typeof d.reason === "string" && d.reason ? d.reason : null;
  const note = typeof d.note === "string" && d.note ? d.note : null;
  return reason ? { label: "Motif", text: reason } : note ? { label: "Note", text: note } : null;
}

export default function AdminJournalPage() {
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError, refetch } = useAdminAudit({ targetType: type || undefined, page });

  return (
    <div>
      <ProPageHeader title="Journal" subtitle={data ? `${data.total} action${data.total > 1 ? "s" : ""} enregistrée${data.total > 1 ? "s" : ""}` : "Qui a fait quoi, et quand."} />
      <div className="w-full sm:max-w-xs">
        <Select
          aria-label="Filtrer par type d’action"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Toutes les actions</option>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton className="h-20" />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList icon={<ScrollText />} title="Journal vide" text="Les actions de l’équipe apparaissent ici." />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((a, i) => {
                const Icon = iconOf(a.targetType);
                const href = targetHref(a);
                const more = extra(a);
                const who = a.admin ? [a.admin.firstName, a.admin.lastName].filter(Boolean).join(" ") || a.admin.email : "Système";
                return (
                  <AdminCard key={a.id} index={i} className="p-4 sm:p-4">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[14.5px] font-bold leading-snug text-ink">{a.summary}</p>
                        {more && (
                          <p className="mt-0.5 break-words text-[13px] text-ink-soft">
                            {more.label} : « {more.text} »
                          </p>
                        )}
                        <Meta className="mt-1">
                          {who} · {dayTime(a.createdAt)} · {labelOf(a.targetType)}
                          {href && (
                            <>
                              {" · "}
                              <Link href={href} className="font-bold text-brand hover:underline">
                                Ouvrir
                              </Link>
                            </>
                          )}
                        </Meta>
                      </div>
                    </div>
                  </AdminCard>
                );
              })}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

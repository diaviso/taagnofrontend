"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BellOff, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { relative } from "@/lib/format";
import { notificationHref, notificationStyle } from "@/lib/notification-routes";
import { useNotifications } from "@/lib/queries";
import type { AppNotification, Audience } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Liste des notifications d'un espace (cloche et page « Notifications »). */
export function NotificationList({
  audience,
  limit,
  onNavigate,
  compact,
}: {
  audience: Audience;
  limit?: number;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending } = useNotifications(audience);

  const open = (n: AppNotification) => {
    if (!n.readAt) {
      api
        .post<{ unread: number }>(`/notifications/${n.id}/read`)
        .then((r) => queryClient.setQueryData(["unread", audience], r.unread))
        .catch(() => {});
      queryClient.setQueryData(["notifications", audience], (old: typeof data) =>
        old
          ? {
              ...old,
              unread: Math.max(0, old.unread - 1),
              items: old.items.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
            }
          : old,
      );
    }
    // L'événement (place confirmée, trajet terminé…) doit figurer dans les listes.
    for (const key of [["reservations"], ["bookings"], ["trips"], ["offers"], ["vehicles"], ["reviews", "given"]]) {
      queryClient.invalidateQueries({ queryKey: key });
    }
    onNavigate?.();
    router.push(notificationHref(audience, n.kind, n.targetId));
  };

  if (isPending) {
    return (
      <div className="space-y-3 p-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = (data?.items ?? []).slice(0, limit);
  if (!items.length) {
    return (
      <EmptyState
        icon={<BellOff />}
        title="Aucune notification"
        text="Vous serez prévenu ici dès qu’une réservation, une demande ou un avis vous concerne."
        className={compact ? "py-8" : undefined}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {items.map((n, i) => {
        const style = notificationStyle(n.kind);
        const Icon = style.icon;
        return (
          <motion.li key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <button
              type="button"
              onClick={() => open(n)}
              className={cn(
                "flex w-full items-start gap-3 rounded-[16px] p-3 text-left transition hover:bg-surface-alt",
                !n.readAt && "bg-brand-soft/60",
              )}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: `color-mix(in srgb, ${style.color} 14%, white)`, color: style.color }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className={cn("text-[14px] text-ink", n.readAt ? "font-semibold" : "font-extrabold")}>{n.title}</span>
                  <span className="shrink-0 pt-0.5 text-[11.5px] text-faint">{relative(n.createdAt)}</span>
                </span>
                <span className={cn("mt-0.5 block text-[13px] leading-snug text-muted", compact && "line-clamp-2")}>{n.body}</span>
              </span>
              {!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />}
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** « Tout marquer comme lu ». */
export function MarkAllRead({ audience }: { audience: Audience }) {
  const queryClient = useQueryClient();
  const { data } = useNotifications(audience);
  if (!data?.unread) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await api.post("/notifications/read-all", {}, { audience }).catch(() => {});
        queryClient.setQueryData(["unread", audience], 0);
        queryClient.invalidateQueries({ queryKey: ["notifications", audience] });
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-brand transition hover:bg-brand-soft"
    >
      <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
    </button>
  );
}

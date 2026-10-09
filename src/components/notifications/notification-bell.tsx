"use client";

import * as Popover from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUnreadCount } from "@/lib/queries";
import type { Audience } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MarkAllRead, NotificationList } from "./notification-list";

/** Cloche avec pastille et aperçu des dernières notifications. */
export function NotificationBell({ audience, className }: { audience: Audience; className?: string }) {
  const [open, setOpen] = useState(false);
  const { data: unread = 0 } = useUnreadCount(audience);
  const page = audience === "PRO" ? "/pro/notifications" : "/notifications";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications (${unread} non lues)` : "Notifications"}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-alt hover:text-ink",
            className,
          )}
        >
          <motion.span animate={unread ? { rotate: [0, -14, 12, -8, 6, 0] } : {}} transition={{ duration: 0.7, repeat: unread ? Infinity : 0, repeatDelay: 6 }}>
            <Bell className="h-[21px] w-[21px]" />
          </motion.span>
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10.5px] font-extrabold text-white ring-2 ring-white"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-[70] w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-[22px] border border-line bg-white shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-[16px] font-extrabold text-ink">Notifications</span>
            <MarkAllRead audience={audience} />
          </div>
          <div className="max-h-[min(460px,65vh)] overflow-y-auto p-2">
            <NotificationList audience={audience} limit={8} compact onNavigate={() => setOpen(false)} />
          </div>
          <Link
            href={page}
            onClick={() => setOpen(false)}
            className="block border-t border-line py-3 text-center text-[13.5px] font-bold text-brand transition hover:bg-brand-soft"
          >
            Voir toutes les notifications
          </Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

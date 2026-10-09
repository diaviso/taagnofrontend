"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { MarkAllRead, NotificationList } from "@/components/notifications/notification-list";
import { Card } from "@/components/ui/misc";

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">Notifications</h1>
          <MarkAllRead audience="VOYAGEUR" />
        </div>
        <Card className="mt-5 p-2">
          <NotificationList audience="VOYAGEUR" />
        </Card>
      </div>
    </RequireAuth>
  );
}

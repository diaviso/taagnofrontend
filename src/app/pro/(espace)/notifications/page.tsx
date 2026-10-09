"use client";

import { MarkAllRead, NotificationList } from "@/components/notifications/notification-list";
import { ProPageHeader } from "@/components/pro/widgets";
import { Card } from "@/components/ui/misc";

export default function ProNotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <ProPageHeader title="Notifications" actions={<MarkAllRead audience="PRO" />} />
      <Card className="p-2">
        <NotificationList audience="PRO" />
      </Card>
    </div>
  );
}

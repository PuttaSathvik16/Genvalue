"use client";

import { NotificationsFeed } from "@/components/notifications/NotificationsFeed";
import { useLmsPortalPath } from "@/hooks/useLmsPortalPath";

export default function NotificationsPage() {
  const { toPortal } = useLmsPortalPath();

  return (
    <NotificationsFeed
      resolveActionUrl={(url) => {
        if (url.startsWith("/dashboard")) {
          return toPortal(url);
        }
        return url;
      }}
    />
  );
}

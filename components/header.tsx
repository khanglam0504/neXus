"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notification-bell";

/** AGT-145: Notifications dropdown shows recent activityEvents (unified source, no stale notifications table) */
function useNotificationsForHeader() {
  const rawEvents = useQuery(api.activityEvents.list, { limit: 5 });

  const list = Array.isArray(rawEvents)
    ? rawEvents.map((e) => {
        const agentName = (e as { agentName?: string }).agentName ?? "System";
        const title = (e as { title?: string }).title ?? "";
        const eventType = (e as { eventType?: string }).eventType ?? "status_change";
        const type: "mention" | "assignment" | "status_change" =
          eventType === "mention" || eventType === "assignment" || eventType === "status_change"
            ? eventType
            : "status_change";
        return {
          id: (e as { _id: string })._id,
          type,
          agentName: agentName.charAt(0).toUpperCase() + agentName.slice(1),
          agentAvatar: agentName.slice(0, 2).toUpperCase(),
          title,
          timestamp: new Date((e as { timestamp?: number }).timestamp ?? 0),
          isUnread: false,
        };
      })
    : [];

  return { notifications: list, onMarkAllRead: () => {} };
}

export function Header() {
  const pathname = usePathname();
  const { notifications, onMarkAllRead } = useNotificationsForHeader();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.length > 0
    ? segments.map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
    : ["Dashboard"];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-8">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">EVOX</span>
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-zinc-600" />
            <span className={i === breadcrumbs.length - 1 ? "text-zinc-50" : "text-zinc-400"}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
        />
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
            SP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

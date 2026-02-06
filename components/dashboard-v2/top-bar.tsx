"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

interface TopBarProps {
  agentsActive?: number;
  tasksInQueue?: number;
  inProgress?: number;
  doneToday?: number;
  totalTasks?: number;
  onSettingsClick?: () => void;
  /** AGT-181: Bell opens Activity drawer */
  notificationTotalUnread?: number;
  onBellClick?: () => void;
}

export function TopBar({
  agentsActive = 0,
  tasksInQueue = 0,
  inProgress = 0,
  doneToday = 0,
  totalTasks = 0,
  onSettingsClick,
  notificationTotalUnread = 0,
  onBellClick,
}: TopBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">EVOX</h1>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Command Center</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
          In Progress <span className="font-medium text-foreground">{inProgress}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
          Done <span className="font-medium text-foreground">{doneToday}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
          Total <span className="font-medium text-foreground">{totalTasks}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-xs">
          <div className="font-mono text-foreground">{time}</div>
          <div className="text-muted-foreground">{date}</div>
        </div>
        <NotificationBell
          totalUnread={notificationTotalUnread}
          onBellClick={onBellClick}
        />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Online
        </div>
        {onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}

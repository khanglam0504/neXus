"use client";

import { useMemo, useState } from "react";
import { TaskCard } from "./task-card";
import type { KanbanTask } from "./task-card";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type { KanbanTask };

type KanbanStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

const COLUMNS: { status: KanbanStatus; title: string; emoji: string }[] = [
  { status: "backlog", title: "BACKLOG", emoji: "📋" },
  { status: "todo", title: "TODO", emoji: "📝" },
  { status: "in_progress", title: "IN PROGRESS", emoji: "🔄" },
  { status: "done", title: "DONE", emoji: "✅" },
];

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
  onAssigneeClick?: (agentId: string) => void;
  className?: string;
}

export function KanbanBoard({ tasks, onTaskClick, onAssigneeClick, className = "" }: KanbanBoardProps) {
  const [mobileColumnIndex, setMobileColumnIndex] = useState(1); // Default to TODO
  const [showMobileAnalytics, setShowMobileAnalytics] = useState(false);

  const byStatus = (status: KanbanStatus) => {
    if (status === "in_progress") {
      return tasks.filter((t) => t.status === "in_progress" || t.status === "review");
    }
    return tasks.filter((t) => t.status === status);
  };

  const counts = useMemo(() => {
    const backlog = tasks.filter((t) => t.status === "backlog").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress" || t.status === "review").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const total = backlog + todo + inProgress + done;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { backlog, todo, inProgress, done, total, completionRate };
  }, [tasks]);

  const columnCounts = [counts.backlog, counts.todo, counts.inProgress, counts.done];

  // Mobile: single column view with swipe
  const handlePrevColumn = () => setMobileColumnIndex((i) => Math.max(0, i - 1));
  const handleNextColumn = () => setMobileColumnIndex((i) => Math.min(COLUMNS.length - 1, i + 1));

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Mobile column switcher */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-border bg-card">
        <button
          onClick={handlePrevColumn}
          disabled={mobileColumnIndex === 0}
          className="p-2 rounded-lg hover:bg-accent disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">{COLUMNS[mobileColumnIndex].emoji}</span>
          <span className="font-medium">{COLUMNS[mobileColumnIndex].title}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
            {columnCounts[mobileColumnIndex]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMobileAnalytics(!showMobileAnalytics)}
            className={cn(
              "p-2 rounded-lg hover:bg-accent",
              showMobileAnalytics && "bg-accent"
            )}
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextColumn}
            disabled={mobileColumnIndex === COLUMNS.length - 1}
            className="p-2 rounded-lg hover:bg-accent disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile analytics dropdown */}
      {showMobileAnalytics && (
        <div className="md:hidden border-b border-border bg-card p-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-muted/50 p-2 text-center">
              <div className="text-xl font-semibold text-amber-500">{counts.completionRate}%</div>
              <div className="text-[10px] text-muted-foreground uppercase">Complete</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-2 text-center">
              <div className="text-xl font-semibold text-blue-500">{counts.inProgress}</div>
              <div className="text-[10px] text-muted-foreground uppercase">In Progress</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-2 text-center">
              <div className="text-xl font-semibold text-yellow-500">{counts.todo}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Queue</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-2 text-center">
              <div className="text-xl font-semibold text-green-500">{counts.done}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Done</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Single column view */}
      <div className="md:hidden flex-1 overflow-y-auto p-3">
        {(() => {
          const col = COLUMNS[mobileColumnIndex];
          const columnTasks = byStatus(col.status);
          const isEmpty = columnTasks.length === 0;
          
          if (isEmpty) {
            return (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No tasks in {col.title.toLowerCase()}
              </p>
            );
          }
          
          return (
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                  onAssigneeClick={onAssigneeClick}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* Mobile: Column dots indicator */}
      <div className="md:hidden flex justify-center gap-1.5 py-2 border-t border-border bg-card">
        {COLUMNS.map((col, i) => (
          <button
            key={col.status}
            onClick={() => setMobileColumnIndex(i)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              i === mobileColumnIndex ? "bg-primary w-4" : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Desktop: Full kanban view */}
      <div className="hidden md:flex h-full gap-3 overflow-x-auto p-4">
        {COLUMNS.map((col) => {
          const columnTasks = byStatus(col.status);
          const isEmpty = columnTasks.length === 0;
          const isDone = col.status === "done";
          return (
            <div
              key={col.status}
              className="flex flex-1 min-w-[200px] lg:min-w-[220px] flex-col rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{col.title}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{columnTasks.length}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-2 min-h-0">
                {isEmpty && isDone ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No completed tasks</p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onAssigneeClick={onAssigneeClick}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Desktop: Analytics panel */}
        <div className="hidden lg:flex w-52 shrink-0 flex-col rounded-lg border border-border bg-card">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Analytics</h3>
          </div>
          <div className="flex-1 space-y-3 p-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Completion</span>
              <div className="mt-1 text-2xl font-semibold text-amber-500 dark:text-amber-400">{counts.completionRate}%</div>
              <div className="text-xs text-muted-foreground">({counts.done}/{counts.total})</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, counts.completionRate)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">In Progress</span>
                </div>
                <span className="text-lg font-semibold text-blue-500 dark:text-blue-400">{counts.inProgress}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Queue</span>
                </div>
                <span className="text-lg font-semibold text-yellow-500 dark:text-yellow-400">{counts.todo}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Backlog</span>
                </div>
                <span className="text-lg font-semibold text-foreground/60">{counts.backlog}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Done</span>
                </div>
                <span className="text-lg font-semibold text-green-500 dark:text-green-400">{counts.done}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

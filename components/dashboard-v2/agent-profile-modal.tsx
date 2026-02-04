"use client";

import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { AgentProfile } from "./agent-profile";

interface AgentProfileModalProps {
  open: boolean;
  agentId: Id<"agents"> | null;
  name: string;
  role: string;
  status: string;
  avatar: string;
  onClose: () => void;
}

/** AGT-181: Agent Profile Modal — opens on sidebar agent click, matches Settings modal style */
export function AgentProfileModal({
  open,
  agentId,
  name,
  role,
  status,
  avatar,
  onClose,
}: AgentProfileModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open || !agentId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="h-[95vh] sm:h-auto sm:max-h-[90vh] w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Agent Profile content — handles its own header */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AgentProfile
            agentId={agentId}
            name={name}
            role={role}
            status={status}
            avatar={avatar}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

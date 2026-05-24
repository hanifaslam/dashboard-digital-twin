"use client";

import { FileText } from "lucide-react";

import type { ActivityLogItem } from "@/types/dashboard";

interface ActivityLogBarProps {
  latestLog?: ActivityLogItem | null;
}

export function ActivityLogBar({ latestLog }: ActivityLogBarProps) {
  return (
    <div className="tech-card flex items-center gap-4 rounded-xl border border-cyan-500/15 bg-slate-950/80 p-3 backdrop-blur-lg">
      <div className="shrink-0 border-r border-cyan-500/20 pr-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 animate-pulse text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">
            Live Activity Log
          </span>
        </div>
      </div>

      <div className="relative h-5 flex-1 overflow-hidden">
        <div className="absolute inset-0 flex flex-col gap-1 text-[10px] leading-tight text-cyan-100/90">
          <div className="flex items-center gap-2 animate-in slide-in-from-bottom-[8px] duration-300">
            <span className="select-none font-extrabold text-cyan-400">▶</span>
            <span className="select-all">
              {latestLog
                ? `[${latestLog.time_label}] ${latestLog.message}`
                : "Waiting for telemetry updates..."}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-[9px] text-cyan-500/50">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span>{latestLog?.category ?? "Realtime stream active"}</span>
      </div>
    </div>
  );
}

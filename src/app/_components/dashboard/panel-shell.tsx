"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelShellProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  headerContent?: ReactNode;
  subtitle?: string;
}

export function PanelShell({
  title,
  icon: Icon,
  children,
  className,
  headerContent,
  subtitle,
}: PanelShellProps) {
  return (
    <div
      className={cn(
        "tech-card flex flex-col gap-4 rounded-xl border border-cyan-500/20 bg-slate-950/75 p-4 backdrop-blur-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{title}</span>
            {subtitle ? (
              <span className="text-[10px] font-medium text-white/45">
                {subtitle}
              </span>
            ) : null}
          </div>
        </div>
        {headerContent}
      </div>

      {children}
    </div>
  );
}

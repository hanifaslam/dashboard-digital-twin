"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toUpperCase();

  const statusConfig: Record<string, { color: string; label: string }> = {
    AVAILABLE: {
      color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
      label: "Available",
    },
    BUSY: {
      color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
      label: "Not Available",
    },
    OFFLINE: {
      color: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
      label: "Offline",
    },
  };

  const config = statusConfig[s] || {
    color: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-100",
    label: status,
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold rounded-md",
        config.color,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}

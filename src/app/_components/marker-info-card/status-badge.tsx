"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toUpperCase();

  const statusConfig: Record<
    string,
    { color: string; label: string; dot: string; glow: string }
  > = {
    AVAILABLE: {
      color: "bg-green-500/10 text-green-400 border-green-500/30",
      glow: "",
      dot: "bg-green-400 ",
      label: "Available",
    },
    BUSY: {
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      glow: "",
      dot: "bg-red-400 ",
      label: "Busy",
    },
    OFFLINE: {
      color: "bg-white/5 text-white/50 border-white/10",
      glow: "shadow-none",
      dot: "bg-white/30",
      label: "Offline",
    },
  };

  const config = statusConfig[s] || {
    color: "bg-primary/10 text-primary border-primary/30",
    glow: "",
    dot: "bg-primary",
    label: status,
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-all duration-300",
          config.color,
          config.glow,
          className,
        )}
      >
        {config.label}
      </Badge>
    </motion.div>
  );
}

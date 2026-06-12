"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface SystemClockProps {
  className?: string;
  variant?: "default" | "compact";
}

export function SystemClock({ className, variant = "default" }: SystemClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTime(new Date());
    }, 0);
    const interval = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  if (!time) {
    if (variant === "compact") {
      return <div className={cn("h-10 w-32 animate-pulse rounded-lg border border-cyan-500/15 bg-slate-950/60", className)} />;
    }
    return (
      <div
        className={cn(
          "h-[84px] w-full animate-pulse rounded-xl border border-cyan-500/20 bg-slate-950/75",
          className,
        )}
      />
    );
  }

  const timeString = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (variant === "compact") {
    return (
      <div className={cn("flex h-10 items-center justify-center gap-3 rounded-lg border border-cyan-500/15 bg-slate-950/60 px-4 backdrop-blur-md", className)}>
        <div className="flex flex-row items-baseline gap-2 leading-none">
          <span className="text-[13px] font-bold text-white tabular-nums tracking-wide">{timeString}</span>
          <span className="text-[10px] font-medium text-cyan-400/80">{dateString}</span>
        </div>
      </div>
    );
  }

  const fullDateString = time.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "tech-card inline-flex flex-col rounded-xl border border-cyan-500/20 bg-slate-950/75 px-5 py-4 backdrop-blur-lg",
        className,
      )}
    >
      <div className="text-[2.2rem] font-bold leading-none tracking-tight text-white tabular-nums">
        {timeString}
      </div>
      <div className="mt-2 text-sm font-medium text-white/55">
        {fullDateString}
      </div>
    </div>
  );
}

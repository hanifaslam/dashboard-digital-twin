"use client";

import { useEffect, useState } from "react";

interface SystemClockProps {
  className?: string;
}

export function SystemClock({ className = "" }: SystemClockProps) {
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
    return (
      <div
        className={`h-[84px] w-full animate-pulse rounded-xl border border-cyan-500/20 bg-slate-950/75 ${className}`}
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`inline-flex flex-col tech-card rounded-xl border border-cyan-500/20 bg-slate-950/75 px-5 py-4 backdrop-blur-lg ${className}`}
    >
      <div className="text-[2.2rem] font-bold leading-none tracking-tight text-white tabular-nums">
        {timeString}
      </div>
      <div className="mt-2 text-sm font-medium text-white/55">
        {dateString}
      </div>
    </div>
  );
}

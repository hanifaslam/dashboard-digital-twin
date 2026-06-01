"use client";

import { TrendingDown, TrendingUp, Zap } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { PanelShell } from "./panel-shell";

interface EnergyMonitoringCardProps {
  buildingLabel: string;
  currentPowerLabel?: string;
  currentPowerWatts?: number;
  changePercent?: number;
  chartPoints: string;
  trendWindowSeconds?: number;
  lastUpdatedAt?: string | null;
  isLoading?: boolean;
  hideChart?: boolean;
}

export function EnergyMonitoringCard({
  buildingLabel,
  currentPowerLabel,
  currentPowerWatts,
  changePercent,
  chartPoints,
  trendWindowSeconds,
  lastUpdatedAt,
  isLoading = false,
  hideChart = false,
}: EnergyMonitoringCardProps) {
  const formattedChange = `${changePercent && changePercent > 0 ? "+" : ""}${(
    changePercent ?? 0
  ).toFixed(1)}%`;
  const ChangeIcon = (changePercent ?? 0) >= 0 ? TrendingUp : TrendingDown;
  const changeTone =
    (changePercent ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400";
  const hasTrendData = chartPoints.length > 0;

  return (
    <PanelShell
      title="Energy Monitoring"
      icon={Zap}
      subtitle={buildingLabel}
      className="w-full"
    >
      {isLoading ? (
        <div className="flex flex-col">
          <div className="flex items-baseline justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-28 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="ml-auto h-4 w-14 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
          </div>
          <AnimatePresence initial={false}>
            {!hideChart && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full overflow-hidden"
              >
                <Skeleton className="mt-4 h-[90px] w-full bg-white/10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.08)]">
                {currentPowerLabel ?? `${currentPowerWatts ?? 0} W`}
              </span>
              <span className="mt-0.5 text-[9px] font-medium text-white/60">
                Current active demand
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${changeTone}`}
              >
                <ChangeIcon className="h-3.5 w-3.5" />
                {formattedChange}
              </span>
              <span className="text-[8px] font-medium text-cyan-500/40">
                vs average
              </span>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!hideChart && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full overflow-hidden"
              >
                <div className="mt-4 relative flex h-[90px] w-full items-end overflow-hidden rounded-lg border border-cyan-500/10 bg-slate-950/40">
                <div className="pointer-events-none absolute inset-0 bg-size-[10px_10px] bg-image-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)]" />
                {hasTrendData ? (
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 300 80"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.72 0.17 195)"
                          stopOpacity="0.45"
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.72 0.17 195)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 0,80 L ${chartPoints} L 300,80 Z`}
                      fill="url(#chartGlow)"
                    />
                    <polyline
                      fill="none"
                      stroke="oklch(0.72 0.17 195)"
                      strokeWidth="2.5"
                      points={chartPoints}
                      className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                    />
                  </svg>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-cyan-100/45">
                    No live energy data
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-[8px] font-medium text-cyan-500/35">
                  {lastUpdatedAt ? `Updated ${lastUpdatedAt}` : "Waiting for update"}
                </div>
                <div className="absolute bottom-1 right-2 text-[8px] font-medium text-cyan-500/35">
                  Time Window: {trendWindowSeconds ?? 0}s
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PanelShell>
  );
}

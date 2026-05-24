"use client";

import { Zap } from "lucide-react";

import { PanelShell } from "./panel-shell";

interface EnergyMonitoringCardProps {
  buildingLabel: string;
  currentPower: number;
  chartPoints: string;
}

export function EnergyMonitoringCard({
  buildingLabel,
  currentPower,
  chartPoints,
}: EnergyMonitoringCardProps) {
  return (
    <PanelShell
      title="Energy Monitoring"
      icon={Zap}
      subtitle={buildingLabel}
      className="w-full"
    >
      <div className="flex items-baseline justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tracking-tight text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.08)]">
            {currentPower}{" "}
            <span className="text-xs font-bold text-white/85">W</span>
          </span>
          <span className="mt-0.5 text-[9px] font-medium text-white/60">
            Current active demand
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
            ▲ +4.2%
          </span>
          <span className="text-[8px] font-medium text-cyan-500/40">
            vs 1h average
          </span>
        </div>
      </div>

      <div className="relative flex h-[90px] w-full items-end overflow-hidden rounded-lg border border-cyan-500/10 bg-slate-950/40">
        <div className="absolute inset-0 pointer-events-none bg-size-[10px_10px] bg-image-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)]" />
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
        <div className="absolute bottom-1 right-2 text-[8px] font-medium text-cyan-500/35">
          Time Window: 40s
        </div>
      </div>
    </PanelShell>
  );
}

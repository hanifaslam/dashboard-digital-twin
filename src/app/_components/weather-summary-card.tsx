"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Moon, SunMedium, Wind } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import { useWeatherSummaryQuery } from "@/hooks/api/use-weather";
import { cn } from "@/lib/utils";

function WeatherIcon({
  isDay,
  compact = false,
}: {
  isDay: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("relative shrink-0", compact ? "h-12 w-12" : "h-14 w-14")}
    >
      <div className="absolute right-0 top-0">
        {isDay ? (
          <SunMedium
            className={cn(
              "text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.35)]",
              compact ? "h-7 w-7" : "h-8 w-8",
            )}
          />
        ) : (
          <Moon
            className={cn(
              "text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.25)]",
              compact ? "h-6 w-6" : "h-7 w-7",
            )}
          />
        )}
      </div>
      <div
        className={cn(
          "absolute bottom-1 right-0 rounded-full bg-white/85 blur-[0.5px]",
          compact ? "h-4 w-8" : "h-5 w-9",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 right-3 rounded-full bg-slate-200/95",
          compact ? "h-4 w-5" : "h-5 w-6",
        )}
      />
      <div
        className={cn(
          "absolute bottom-1 rounded-full bg-white/90",
          compact ? "right-5 h-3.5 w-4.5" : "right-6 h-4 w-5",
        )}
      />
    </div>
  );
}

function WeatherStat({
  label,
  value,
  accentClassName,
  compact = false,
}: {
  label: string;
  value: string;
  accentClassName?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "font-bold text-cyan-50",
          compact ? "text-base" : "text-lg",
          accentClassName,
        )}
      >
        {value}
      </span>
      <span className="text-[10px] font-medium text-cyan-100/45">{label}</span>
    </div>
  );
}

export function WeatherSummaryCard() {
  const { data, isLoading, isError } = useWeatherSummaryQuery();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="tech-card rounded-xl border border-cyan-500/20 bg-slate-950/75 p-4 backdrop-blur-lg transition-all duration-300">
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-10 w-28 bg-white/10" />
              <Skeleton className="h-4 w-20 bg-white/10" />
            </div>
            <Skeleton className="h-14 w-14 rounded-2xl bg-white/10" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        </div>
      ) : isError || !data ? (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-cyan-400">
              Weather Overview
            </span>
            <p className="text-sm text-cyan-50/80">Weather data unavailable</p>
            <p className="text-[10px] text-cyan-100/40">
              Check weather API configuration in `.env`
            </p>
          </div>
          <Wind className="h-8 w-8 text-cyan-500/35" />
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Main Weather Information (Always Visible) */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-cyan-100/55">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-semibold">{data.city}</span>
              </div>

              <div className="flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-tight text-cyan-50">
                  {data.temperature}
                </span>
                <span className="pb-1 text-2xl font-semibold text-cyan-100/90">
                  °C
                </span>
              </div>

              <p className="text-base font-medium text-cyan-100/70">
                {data.condition}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <WeatherIcon isDay={data.isDay} compact />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    !isExpanded && "rotate-180",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Collapsible Stats Section (Humidity, Wind, UV Index) */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-4 border-t border-cyan-500/10 mt-3 pt-3">
                  <WeatherStat label="Humidity" value={`${data.humidity}%`} />
                  <WeatherStat label="Wind" value={`${data.windSpeed} km/h`} />
                  <WeatherStat
                    label="UV Index"
                    value={`UV ${data.uvIndex}`}
                    accentClassName="text-cyan-100"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

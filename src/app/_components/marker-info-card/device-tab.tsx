"use client";

import { Droplet, Monitor, Power, Thermometer, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  useControlDeviceMutation,
  useDeviceListQuery,
} from "@/hooks/api/digital-twin/use-device";
import { useDeviceSocket } from "@/hooks/api/socket/use-device-socket";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn, parseAxiosError } from "@/lib/utils";
import type { ListDeviceResponse } from "@/types/response/digital-twin/device-response";

interface DeviceTabProps {
  roomId: string;
}

const environmentMetrics = [
  {
    id: "temperature",
    label: "Temperature",
    value: "28.2",
    unit: "°C",
    description: "Slightly warm",
    accent: "text-red-400",
    indicatorClassName:
      "[&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-400 [&>[data-slot=progress-indicator]]:via-orange-400 [&>[data-slot=progress-indicator]]:to-red-400",
    statusClassName: "text-amber-300",
    dotClassName: "bg-amber-400",
    iconClassName:
      "bg-red-500/8 text-red-400/90 shadow-[0_0_12px_rgba(248,113,113,0.14)]",
    progress: 42,
    Icon: Thermometer,
  },
  {
    id: "humidity",
    label: "Humidity",
    value: "68.7",
    unit: "%",
    description: "Normal",
    accent: "text-blue-400",
    indicatorClassName:
      "[&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-sky-400 [&>[data-slot=progress-indicator]]:to-blue-500",
    statusClassName: "text-emerald-300",
    dotClassName: "bg-emerald-400",
    iconClassName:
      "bg-blue-500/8 text-blue-300/90 shadow-[0_0_12px_rgba(96,165,250,0.12)]",
    progress: 68,
    Icon: Droplet,
  },
] as const;

export function DeviceTab({ roomId }: DeviceTabProps) {
  useDeviceSocket();

  const { data: devicesResp, isLoading } = useDeviceListQuery({
    room_id: roomId,
  });
  const controlMutation = useControlDeviceMutation();

  const devices = devicesResp?.data ?? [];

  const handleToggleControl = async (device: ListDeviceResponse) => {
    const isTurningOn = !device.is_on;

    try {
      await controlMutation.mutateAsync({
        id: device.id,
        command: String(isTurningOn),
      });
      toast.success(
        `Device ${isTurningOn ? "turned on" : "turned off"} successfully`,
      );
    } catch (error: unknown) {
      toast.error(parseAxiosError(error, "Failed to control device"));
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="mb-4 flex flex-none items-center gap-2">
        <Monitor className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-semibold text-white/90">
          Device Control
        </span>
      </div>

      <div className="-mx-5 flex-1 overflow-y-auto px-5 custom-scrollbar">
        <div className="flex flex-col gap-3 pb-5">
          <div className="glass-card rounded-xl p-3.5 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-xs font-semibold text-white/90">
                Environment Monitoring
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {environmentMetrics.map((metric) => {
                const Icon = metric.Icon;

                return (
                  <div
                    key={metric.id}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="text-[11px] font-semibold text-white/70">
                        {metric.label}
                      </span>
                      <div
                        className={cn("rounded-lg p-1.5", metric.iconClassName)}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <span
                        className={cn(
                          "text-2xl font-bold tracking-tight",
                          metric.accent,
                        )}
                      >
                        {metric.value}
                        <span className="text-xl">{metric.unit}</span>
                      </span>
                    </div>

                    <Progress
                      value={metric.progress}
                      className={cn(
                        "mb-2.5 h-1.5 w-full bg-white/10",
                        metric.indicatorClassName,
                      )}
                    />

                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-medium",
                        metric.statusClassName,
                      )}
                    >
                      <span
                        className={cn("h-2 w-2 rounded-full", metric.dotClassName)}
                      />
                      <span>{metric.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-3 w-16 bg-white/10" />
                  </div>
                </div>
                <Skeleton className="h-6 w-10 rounded-full bg-white/10" />
              </div>
            ))
          ) : devices.length > 0 ? (
            devices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-card group relative overflow-hidden rounded-xl"
              >
                <div
                  className={cn(
                    "absolute bottom-0 left-0 top-0 w-1 transition-colors duration-300",
                    device.is_on
                      ? "bg-cyan-400"
                      : "bg-transparent group-hover:bg-white/10",
                  )}
                />

                <div className="flex flex-col p-4">
                  <div className="mb-3 flex items-center justify-between pl-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-full p-2.5 transition-all duration-300",
                          device.is_on
                            ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                            : "bg-white/5 text-white/40",
                        )}
                      >
                        <Power className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white/90">
                          {device.name}
                        </span>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              device.is_online
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                : "bg-red-500",
                            )}
                          />
                          <span className="text-[10px] font-medium text-white/50">
                            {device.is_online ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Switch
                        checked={device.is_on ?? false}
                        onCheckedChange={() => handleToggleControl(device)}
                        disabled={
                          !(device.is_online ?? false) ||
                          controlMutation.isPending
                        }
                        className={cn(
                          device.is_on
                            ? "data-[state=checked]:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            : "data-[state=unchecked]:bg-white/20",
                        )}
                      />
                      <span
                        className={cn(
                          "mr-1 text-[10px] font-semibold transition-colors",
                          device.is_on ? "text-cyan-400" : "text-white/30",
                        )}
                      >
                        {device.is_on ? "Active" : "Standby"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 pl-2 pr-1">
                    <div className="mb-1 flex items-center justify-between text-[10px] text-white/50">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>Power</span>
                      </div>
                      <span className="text-white/80">
                        {device.power ?? "0"} W
                      </span>
                    </div>
                    <Progress
                      value={device.is_on ? getPowerPercentage(device.power) : 0}
                      className={cn(
                        "h-1 bg-white/10",
                        device.is_on &&
                          "[&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-yellow-500/50 [&>[data-slot=progress-indicator]]:to-yellow-400 [&>[data-slot=progress-indicator]]:shadow-[0_0_8px_rgba(250,204,21,0.8)]",
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center opacity-50">
              <Monitor className="mb-4 h-10 w-10 text-white/20" />
              <p className="text-[11px] font-medium text-white/50">
                No devices detected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getPowerPercentage(power: number | string | null | undefined) {
  return Math.min((Number(power) || 0) / 10, 100);
}

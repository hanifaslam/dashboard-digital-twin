"use client";

import { Droplet, Monitor, Power, Thermometer, Zap } from "lucide-react";
import {
  useDeviceListQuery,
  useControlDeviceMutation,
} from "@/hooks/api/digital-twin/use-device";
import { useDeviceSocket } from "@/hooks/api/socket/use-device-socket";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ListDeviceResponse } from "@/types/response/digital-twin/device-response";
import { cn, parseAxiosError } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
    trackClassName: "bg-gradient-to-r from-amber-400 via-orange-400 to-red-400",
    statusClassName: "text-amber-300",
    dotClassName: "bg-amber-400",
    iconClassName:
      "text-red-400/90 bg-red-500/8 shadow-[0_0_12px_rgba(248,113,113,0.14)]",
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
    trackClassName: "bg-gradient-to-r from-sky-400 to-blue-500",
    statusClassName: "text-emerald-300",
    dotClassName: "bg-emerald-400",
    iconClassName:
      "text-blue-300/90 bg-blue-500/8 shadow-[0_0_12px_rgba(96,165,250,0.12)]",
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

  const devices = devicesResp?.data || [];

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
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex items-center mb-4 flex-none gap-2">
        <Monitor className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-white/90">
          Device Control
        </span>
      </div>

      <div className="flex-1 overflow-y-auto -mx-5 px-5 custom-scrollbar">
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

                    <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          metric.trackClassName,
                        )}
                        style={{ width: `${metric.progress}%` }}
                      />
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-medium",
                        metric.statusClassName,
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          metric.dotClassName,
                        )}
                      />
                      <span>{metric.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5"
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
            devices.map((device, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={device.id}
                className="glass-card rounded-xl overflow-hidden relative group"
              >
                {/* Highlight bar left */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300",
                    device.is_on
                      ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      : "bg-transparent group-hover:bg-white/10",
                  )}
                />

                <div className="p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2.5 rounded-full transition-all duration-300",
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
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
                          "text-[10px] font-semibold transition-colors mr-1",
                          device.is_on ? "text-cyan-400" : "text-white/30",
                        )}
                      >
                        {device.is_on ? "Active" : "Standby"}
                      </span>
                    </div>
                  </div>

                  {/* Power Visualization Bar */}
                  <div className="pl-2 pr-1 mt-1">
                    <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>Power</span>
                      </div>
                      <span className="text-white/80">
                        {device.power ?? "0"} W
                      </span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          device.is_on
                            ? "bg-gradient-to-r from-yellow-500/50 to-yellow-400"
                            : "bg-transparent",
                        )}
                        style={{
                          width: device.is_on
                            ? `${Math.min((Number(device.power) || 0) / 10, 100)}%`
                            : "0%",
                          boxShadow: device.is_on
                            ? "0 0 8px rgba(250,204,21,0.8)"
                            : "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
              <Monitor className="h-10 w-10 text-white/20 mb-4" />
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

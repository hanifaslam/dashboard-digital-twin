"use client";

import { Monitor, Power } from "lucide-react";
import {
  useDeviceListQuery,
  useControlDeviceMutation,
} from "@/hooks/api/digital-twin/use-device";
import { useDeviceSocket } from "@/hooks/api/socket/use-device-socket";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ListDeviceResponse } from "@/types/response/digital-twin/device-response";
import { cn, parseAxiosError } from "@/lib/utils";

interface DeviceTabProps {
  roomId: string;
}

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
    <div className="w-full flex flex-col">
      <div className="flex items-center mb-3 flex-none">
        <span className="text-sm font-semibold text-foreground">
          Devices in Room
        </span>
      </div>

      <ScrollArea className="h-[30vh] w-full">
        <div className="flex flex-col gap-3 pr-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          ))
        ) : devices.length > 0 ? (
          devices.map((device) => (
            <div
              key={device.id}
              className="flex flex-col p-3 rounded-lg border border-border bg-card/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-md",
                      device.is_on
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Power className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none mb-1">
                      {device.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Power: {device.power ?? "0"} W
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      device.is_on ? "text-gray-600 dark:text-gray-300" : "text-muted-foreground",
                    )}
                  >
                    {device.is_on ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={device.is_on ?? false}
                    onCheckedChange={() => handleToggleControl(device)}
                    disabled={
                      !(device.is_online ?? false) || controlMutation.isPending
                    }
                  />
                </div>
              </div>
              {!(device.is_online ?? false) && (
                <span className="text-[10px] text-destructive text-right mt-1">
                  Device is offline
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="h-[20vh] w-full flex flex-col items-center justify-center text-center">
            <Monitor className="h-10 w-10 text-muted-foreground/40 mb-4" />
            <p className="text-xs text-muted-foreground">
              No devices in this room
            </p>
          </div>
        )}
        </div>
      </ScrollArea>
    </div>
  );
}

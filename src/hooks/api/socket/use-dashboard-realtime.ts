"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/hooks/api/use-dashboard";
import { socket } from "@/lib/socket";
import type {
  ActivityLogItem,
  DeviceLiveSummary,
  EnergyMonitoringSummary,
} from "@/types/dashboard";

interface UseDashboardRealtimeOptions {
  buildingId: string | null;
  activityLimit?: number;
}

export function useDashboardRealtime({
  buildingId,
  activityLimit = 20,
}: UseDashboardRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const subscribeToBuilding = (targetBuildingId: string | null) => {
      if (!targetBuildingId) {
        return;
      }

      socket.emit("energy-monitoring:subscribe", {
        building_id: targetBuildingId,
      });
    };

    const unsubscribeFromBuilding = (targetBuildingId: string | null) => {
      if (!targetBuildingId || !socket.connected) {
        return;
      }

      socket.emit("energy-monitoring:unsubscribe", {
        building_id: targetBuildingId,
      });
    };

    const handleConnect = () => {
      subscribeToBuilding(buildingId);
      void queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.deviceLiveSummary(),
      });
      void queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.liveActivityLog(activityLimit),
      });

      if (buildingId) {
        void queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.energyMonitoringSummary(buildingId),
        });
      }
    };

    const handleDeviceLiveSummary = (payload: DeviceLiveSummary) => {
      queryClient.setQueryData(
        dashboardQueryKeys.deviceLiveSummary(),
        payload,
      );
    };

    const handleEnergyMonitoring = (payload: EnergyMonitoringSummary) => {
      queryClient.setQueryData(
        dashboardQueryKeys.energyMonitoringSummary(payload.building_id),
        payload,
      );
    };

    const handleActivityLog = (payload: ActivityLogItem) => {
      queryClient.setQueryData<ActivityLogItem[]>(
        dashboardQueryKeys.liveActivityLog(activityLimit),
        (currentItems) => {
          const nextItems = currentItems ?? [];
          const deduplicatedItems = nextItems.filter(
            (item) => item.id !== payload.id,
          );

          return [payload, ...deduplicatedItems].slice(0, activityLimit);
        },
      );
    };

    socket.on("connect", handleConnect);
    socket.on("device-live-summary:update", handleDeviceLiveSummary);
    socket.on("energy-monitoring:update", handleEnergyMonitoring);
    socket.on("activity-log:update", handleActivityLog);

    subscribeToBuilding(buildingId);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("device-live-summary:update", handleDeviceLiveSummary);
      socket.off("energy-monitoring:update", handleEnergyMonitoring);
      socket.off("activity-log:update", handleActivityLog);
      unsubscribeFromBuilding(buildingId);
    };
  }, [activityLimit, buildingId, queryClient]);
}

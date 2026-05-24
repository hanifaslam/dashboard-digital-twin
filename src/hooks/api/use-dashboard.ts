"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardService } from "@/service/dashboard-service";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  buildings: () => [...dashboardQueryKeys.all, "buildings"] as const,
  deviceLiveSummary: () =>
    [...dashboardQueryKeys.all, "device-live-summary"] as const,
  energyMonitoringSummary: (buildingId: string | null) =>
    [...dashboardQueryKeys.all, "energy-monitoring-summary", buildingId] as const,
  liveActivityLog: (limit: number) =>
    [...dashboardQueryKeys.all, "live-activity-log", limit] as const,
};

export function useDashboardBuildingsQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.buildings(),
    queryFn: () => DashboardService.getBuildings(),
  });
}

export function useDeviceLiveSummaryQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.deviceLiveSummary(),
    queryFn: () => DashboardService.getDeviceLiveSummary(),
  });
}

export function useEnergyMonitoringSummaryQuery(buildingId: string | null) {
  return useQuery({
    queryKey: dashboardQueryKeys.energyMonitoringSummary(buildingId),
    queryFn: () => DashboardService.getEnergyMonitoringSummary(buildingId!),
    enabled: Boolean(buildingId),
  });
}

export function useLiveActivityLogQuery(limit = 20) {
  return useQuery({
    queryKey: dashboardQueryKeys.liveActivityLog(limit),
    queryFn: () => DashboardService.getLiveActivityLog(limit),
  });
}

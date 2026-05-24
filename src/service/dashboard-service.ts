import axiosInstance from "@/lib/axios";
import { API_ENDPOINT } from "@/types/endpoint";
import type {
  ActivityLogItem,
  DashboardApiResponse,
  DashboardBuilding,
  DeviceLiveSummary,
  EnergyMonitoringSummary,
} from "@/types/dashboard";

async function getResponseData<T>(
  url: string,
  params?: Record<string, unknown>,
) {
  const response = await axiosInstance.get<DashboardApiResponse<T>>(url, {
    params,
  });

  return response.data.data;
}

export const DashboardService = {
  getBuildings() {
    return getResponseData<DashboardBuilding[]>(API_ENDPOINT.DASHBOARD.BUILDINGS);
  },

  getDeviceLiveSummary() {
    return getResponseData<DeviceLiveSummary>(
      API_ENDPOINT.DASHBOARD.DEVICE_LIVE_SUMMARY,
    );
  },

  getEnergyMonitoringSummary(buildingId: string) {
    return getResponseData<EnergyMonitoringSummary>(
      API_ENDPOINT.DASHBOARD.ENERGY_MONITORING_SUMMARY,
      {
        building_id: buildingId,
      },
    );
  },

  getLiveActivityLog(limit = 20) {
    return getResponseData<ActivityLogItem[]>(
      API_ENDPOINT.DASHBOARD.LIVE_ACTIVITY_LOG,
      {
        limit,
      },
    );
  },
};

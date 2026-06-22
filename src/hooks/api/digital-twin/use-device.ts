import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceService, DeviceListParams } from "@/service/digital-twin/device-service";

export function useDeviceListQuery(params: DeviceListParams) {
  return useQuery({
    queryKey: ["devices", params],
    queryFn: async () => {
      const resp = await DeviceService.list(params);
      if (resp && resp.data) {
        resp.data = resp.data.map((device) => ({
          ...device,
          power: device.power ?? device.latest_telemetry?.power ?? undefined,
          voltage: device.voltage ?? device.latest_telemetry?.voltage ?? undefined,
          current: device.current ?? device.latest_telemetry?.current ?? undefined,
          energy: device.energy ?? device.latest_telemetry?.energy ?? undefined,
          frequency: device.frequency ?? device.latest_telemetry?.frequency ?? undefined,
          power_factor: device.power_factor ?? device.latest_telemetry?.power_factor ?? undefined,
        }));
      }
      return resp;
    },
  });
}

export function useControlDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: string }) =>
      DeviceService.control(id, command),
    onSuccess: () => {
      // Invalidate devices queries
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useCCTVStreamsQuery() {
  return useQuery({
    queryKey: ["cctv-streams"],
    queryFn: async () => {
      const resp = await DeviceService.getCCTVStreams();
      return resp.data;
    },
  });
}

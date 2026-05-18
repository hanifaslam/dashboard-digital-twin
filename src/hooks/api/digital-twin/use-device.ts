import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceService, DeviceListParams } from "@/service/digital-twin/device-service";

export function useDeviceListQuery(params: DeviceListParams) {
  return useQuery({
    queryKey: ["devices", params],
    queryFn: () => DeviceService.list(params),
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

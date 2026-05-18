import { socket } from "@/lib/socket";
import { BaseResponse } from "@/types/base-api";
import { ListDeviceResponse } from "@/types/response/digital-twin/device-response";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useDeviceSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleDeviceStatus = (payload: {
      device_id: string;
      is_on?: boolean;
      is_online?: boolean;
    }) => {
      queryClient.setQueriesData<BaseResponse<ListDeviceResponse>>(
        { queryKey: ["devices"], exact: false },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((device) => {
              if (device.id === payload.device_id) {
                return {
                  ...device,
                  is_on: payload.is_on ?? device.is_on ?? false,
                  is_online: payload.is_online ?? device.is_online ?? false,
                };
              }
              return device;
            }),
          };
        }
      );
    };

    const handleSensorData = (payload: {
      room_id: string;
      power?: number | string | null;
      voltage?: number | string | null;
    }) => {
      queryClient.setQueriesData<BaseResponse<ListDeviceResponse>>(
        { queryKey: ["devices"], exact: false },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((device) => {
              if (device.room_id === payload.room_id) {
                return {
                  ...device,
                  power: (payload.power as string | number) ?? device.power,
                };
              }
              return device;
            }),
          };
        }
      );
    };

    socket.on("device-status", handleDeviceStatus);
    socket.on("sensor-data", handleSensorData);

    return () => {
      socket.off("device-status", handleDeviceStatus);
      socket.off("sensor-data", handleSensorData);
    };
  }, [queryClient]);
};

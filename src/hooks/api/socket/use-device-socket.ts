import { socket } from "@/lib/socket";
import { BaseResponse } from "@/types/base-api";
import { ListDeviceResponse } from "@/types/response/digital-twin/device-response";
import { RoomEnvironmentResponse } from "@/types/response/digital-twin/room-environment-response";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useDeviceSocket = (roomId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const subscribeToRoomEnvironment = (targetRoomId?: string) => {
      if (!targetRoomId) {
        return;
      }

      socket.emit("room-environment:subscribe", {
        room_id: targetRoomId,
      });
    };

    const unsubscribeFromRoomEnvironment = (targetRoomId?: string) => {
      if (!targetRoomId || !socket.connected) {
        return;
      }

      socket.emit("room-environment:unsubscribe", {
        room_id: targetRoomId,
      });
    };

    const handleConnect = () => {
      subscribeToRoomEnvironment(roomId);

      if (roomId) {
        void queryClient.invalidateQueries({
          queryKey: ["room-environment", "show", roomId],
          exact: false,
        });
      }
    };

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

    const handleRoomEnvironmentUpdate = (payload: RoomEnvironmentResponse) => {
      if (!roomId || payload.room_id !== roomId) {
        return;
      }

      queryClient.setQueriesData<RoomEnvironmentResponse>(
        {
          queryKey: ["room-environment", "show", roomId],
          exact: false,
        },
        () => payload,
      );
    };

    socket.on("connect", handleConnect);
    socket.on("device-status", handleDeviceStatus);
    socket.on("sensor-data", handleSensorData);
    socket.on("room-environment:update", handleRoomEnvironmentUpdate);
    subscribeToRoomEnvironment(roomId);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("device-status", handleDeviceStatus);
      socket.off("sensor-data", handleSensorData);
      socket.off("room-environment:update", handleRoomEnvironmentUpdate);
      unsubscribeFromRoomEnvironment(roomId);
    };
  }, [queryClient, roomId]);
};

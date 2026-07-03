import { socket } from "@/lib/socket";
import { LecturerResponse } from "@/types/response/digital-twin/lecturer-response";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const LECTURER_QUERY_KEY = {
  list: (id: string, q?: string) => ["lecturer", "list", id, q] as const,
};

export function useLecturerListQuery(id: string, q?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const requestData = () => {
      socket.emit("room-lecturers:get", { room_id: id, q });
    };

    const handleData = (payload: {
      room_id: string;
      lecturers: LecturerResponse[];
    }) => {
      // console.log(
      //   `[Socket] Received room-lecturers:data for room ${payload.room_id}:`,
      //   payload.lecturers,
      // );
      if (payload.room_id === id) {
        queryClient.setQueryData(
          LECTURER_QUERY_KEY.list(id, q),
          payload.lecturers,
        );
      }
    };

    socket.on("connect", requestData);
    socket.on("room-lecturers:data", handleData);
    socket.on("lecturer-status-updated", requestData);

    if (socket.connected) {
      requestData();
    }

    return () => {
      socket.off("connect", requestData);
      socket.off("room-lecturers:data", handleData);
      socket.off("lecturer-status-updated", requestData);
    };
  }, [id, q, queryClient]);

  return useQuery({
    queryKey: LECTURER_QUERY_KEY.list(id, q),
    queryFn: () => {
      return new Promise<LecturerResponse[]>((resolve) => {
        const onData = (payload: {
          room_id: string;
          lecturers: LecturerResponse[];
        }) => {
          if (payload.room_id === id) {
            clearTimeout(timeout);
            socket.off("room-lecturers:data", onData);
            resolve(payload.lecturers);
          }
        };

        const timeout = setTimeout(() => {
          socket.off("room-lecturers:data", onData);
          resolve([]); // Fallback empty if timeout
        }, 10000); // 10s timeout

        socket.on("room-lecturers:data", onData);

        if (socket.connected) {
          socket.emit("room-lecturers:get", { room_id: id, q });
        } else {
          socket.connect();
        }
      });
    },
    enabled: !!id,
    staleTime: Infinity, // Keep fresh as socket handles updates
  });
}

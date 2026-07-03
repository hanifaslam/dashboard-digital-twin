import { socket } from '@/lib/socket'
import { ScheduleResponse } from '@/types/response/digital-twin/schedule-response'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const SCHEDULE_QUERY_KEY = {
  list: (id: string) => ['schedule', 'list', id] as const
}

export function useScheduleListQuery(id: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const requestData = () => {
      socket.emit('room-schedules:get', { room_id: id });
    };

    const handleData = (payload: { room_id: string; schedules: ScheduleResponse[] }) => {
      if (payload.room_id === id) {
        queryClient.setQueryData(SCHEDULE_QUERY_KEY.list(id), payload.schedules);
      }
    };

    socket.on('connect', requestData);
    socket.on('room-schedules:data', handleData);
    socket.on('schedule-updated', requestData);

    if (socket.connected) {
      requestData();
    }

    return () => {
      socket.off('connect', requestData);
      socket.off('room-schedules:data', handleData);
      socket.off('schedule-updated', requestData);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: SCHEDULE_QUERY_KEY.list(id),
    queryFn: () => {
      return new Promise<ScheduleResponse[]>((resolve) => {
        const onData = (payload: { room_id: string; schedules: ScheduleResponse[] }) => {
          if (payload.room_id === id) {
            clearTimeout(timeout);
            socket.off('room-schedules:data', onData);
            resolve(payload.schedules);
          }
        };

        const timeout = setTimeout(() => {
          socket.off('room-schedules:data', onData);
          resolve([]); // Fallback empty if timeout
        }, 10000); // 10s timeout

        socket.on('room-schedules:data', onData);

        if (socket.connected) {
          socket.emit('room-schedules:get', { room_id: id });
        } else {
          socket.connect();
        }
      });
    },
    enabled: !!id,
    staleTime: Infinity, // Keep fresh as socket handles updates
  })
}

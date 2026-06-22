import { RoomService } from '@/service/digital-twin/room-service'
import { RoomResponse } from '@/types/response/digital-twin/room-response'
import { useQuery } from '@tanstack/react-query'

export const ROOM_QUERY_KEY = {
  show: (id: string) => ['room', 'show', id] as const
}

export function useRoomShowQuery(id: string) {
  return useQuery({
    queryKey: ROOM_QUERY_KEY.show(id),
    queryFn: () => RoomService.show(id),
    enabled: !!id,
    refetchOnMount: 'always',
    staleTime: 0,
    select: (res) => res.data as unknown as RoomResponse
  })
}

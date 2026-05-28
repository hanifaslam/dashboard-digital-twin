import { useQuery } from '@tanstack/react-query'

import {
  RoomEnvironmentParams,
  RoomEnvironmentService
} from '@/service/digital-twin/room-environment-service'
import { RoomEnvironmentResponse } from '@/types/response/digital-twin/room-environment-response'

export const ROOM_ENVIRONMENT_QUERY_KEY = {
  show: (roomId: string, params?: RoomEnvironmentParams) =>
    ['room-environment', 'show', roomId, params?.sensor_type ?? null] as const
}

export function useRoomEnvironmentQuery(
  roomId: string,
  params?: RoomEnvironmentParams
) {
  return useQuery({
    queryKey: ROOM_ENVIRONMENT_QUERY_KEY.show(roomId, params),
    queryFn: async () =>
      (await RoomEnvironmentService.show(roomId, params))
        .data as unknown as RoomEnvironmentResponse,
    enabled: !!roomId
  })
}

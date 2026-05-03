import { api } from '@/lib/axios'
import { API_ENDPOINT } from '@/types/endpoint'
import { RoomResponse } from '@/types/response/digital-twin/room-response'

export const RoomService = {
  show: (id: string) =>
    api.get<RoomResponse>(
      API_ENDPOINT.DIGITAL_TWIN.ROOM.BASE.replace(':id', id)
    )
}

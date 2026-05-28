import { api } from '@/lib/axios'
import { API_ENDPOINT } from '@/types/endpoint'
import { RoomEnvironmentResponse } from '@/types/response/digital-twin/room-environment-response'

export interface RoomEnvironmentParams {
  sensor_type?: string
}

export const RoomEnvironmentService = {
  show: (roomId: string, params?: RoomEnvironmentParams) =>
    api.get<RoomEnvironmentResponse>(
      API_ENDPOINT.DIGITAL_TWIN.ROOM_ENVIRONMENT.BASE.replace(':roomId', roomId),
      { params }
    )
}

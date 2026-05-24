import { api } from '@/lib/axios'
import { API_ENDPOINT } from '@/types/endpoint'
import { LecturerResponse } from '@/types/response/digital-twin/lecturer-response'

export const LecturerService = {
  list: (id: string, q?: string) =>
    api.get<LecturerResponse>(
      API_ENDPOINT.DIGITAL_TWIN.LECTURER.BASE.replace(':id', id),
      { params: { q } }
    )
}

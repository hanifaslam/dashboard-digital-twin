import { api } from '@/lib/axios'
import { API_ENDPOINT } from '@/types/endpoint'
import { ScheduleResponse } from '@/types/response/digital-twin/schedule-response'

export const ScheduleService = {
  list: (id: string) =>
    api.get<ScheduleResponse>(
      API_ENDPOINT.DIGITAL_TWIN.SCHEDULE.BASE.replace(':id', id)
    )
}

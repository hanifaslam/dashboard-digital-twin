import { ScheduleService } from '@/service/digital-twin/schedule-service'
import { ScheduleResponse } from '@/types/response/digital-twin/schedule-response'
import { useQuery } from '@tanstack/react-query'

export const SCHEDULE_QUERY_KEY = {
  list: (id: string) => ['schedule', 'list', id] as const
}

export function useScheduleListQuery(id: string) {
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEY.list(id),
    queryFn: () => ScheduleService.list(id),
    enabled: !!id,
    refetchOnMount: 'always',
    staleTime: 0,
    select: (res) => res.data as ScheduleResponse[]
  })
}

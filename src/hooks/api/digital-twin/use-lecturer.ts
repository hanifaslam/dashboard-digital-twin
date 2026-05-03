import { LecturerService } from '@/service/digital-twin/lecturer-service'
import { LecturerResponse } from '@/types/response/digital-twin/lecturer-response'
import { useQuery } from '@tanstack/react-query'

export const LECTURER_QUERY_KEY = {
  list: (id: string) => ['lecturer', 'list', id] as const
}

export function useLecturerListQuery(id: string) {
  return useQuery({
    queryKey: LECTURER_QUERY_KEY.list(id),
    queryFn: () => LecturerService.list(id),
    enabled: !!id,
    select: (res) => res.data as LecturerResponse[]
  })
}

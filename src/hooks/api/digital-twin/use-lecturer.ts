import { LecturerService } from '@/service/digital-twin/lecturer-service'
import { LecturerResponse } from '@/types/response/digital-twin/lecturer-response'
import { useQuery } from '@tanstack/react-query'

export const LECTURER_QUERY_KEY = {
  list: (id: string, q?: string) => ['lecturer', 'list', id, q] as const
}

export function useLecturerListQuery(id: string, q?: string) {
  return useQuery({
    queryKey: LECTURER_QUERY_KEY.list(id, q),
    queryFn: () => LecturerService.list(id, q),
    enabled: !!id,
    refetchOnMount: 'always',
    staleTime: 0,
    select: (res) => res.data as LecturerResponse[]
  })
}

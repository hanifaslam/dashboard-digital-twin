export interface BaseResponse<T> {
  success: boolean
  message: string
  metadata: Metadata
  data: T[]
}

export interface Metadata {
  per_page: number
  current_page: number
  total_row: number
  total_page: number
}

export interface BaseParams {
  // for query params
  page?: number
  per_page?: number
  q?: string
}

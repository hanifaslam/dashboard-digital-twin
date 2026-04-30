import { BaseResponse } from '@/types/base-api'
import { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Partial<BaseResponse<unknown>>
    return data.message || fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

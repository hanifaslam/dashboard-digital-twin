import { useGlobalErrorDialog } from '@/hooks/use-global-error-dialog'
import { authEvents } from '@/lib/auth-event'
import { BaseResponse } from '@/types/base-api'
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { toast } from 'sonner'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 20000,
  withCredentials: true
})

let csrfToken: string | null = null

const DISABLE_CSRF = process.env.NEXT_PUBLIC_DISABLE_CSRF === 'true'

let isSessionExpiredToastShown = false

async function fetchCsrfToken() {
  const res = await axiosInstance.get<{ csrfToken: string }>('/auth/csrf-token')
  csrfToken = res.data.csrfToken
  return csrfToken
}

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {


    if (
      config.method &&
      ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())
    ) {
      if (!DISABLE_CSRF && !csrfToken) {
        await fetchCsrfToken()
      }
      if (csrfToken) {
        const headers = new AxiosHeaders()
        if (config.headers) {
          const existing = config.headers as Record<string, unknown>
          for (const [key, value] of Object.entries(existing)) {
            if (value === undefined) continue
            if (Array.isArray(value)) {
              headers.set(
                key,
                value.map((v) => String(v))
              )
            } else {
              headers.set(key, String(value))
            }
          }
        }
        headers.set('X-CSRF-Token', csrfToken)
        config.headers = headers
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const status = error.response?.status
    const data = error.response?.data as { message?: string } | undefined

    if (
      (status === 403 &&
        data?.message?.toLowerCase().includes('invalid csrf token')) ||
      (data?.message?.toLowerCase().includes('token csrf tidak valid') &&
        error.config)
    ) {
      const originalConfig = error.config as AxiosRequestConfig & {
        _retry_csrf?: boolean
      }
      if (!originalConfig._retry_csrf) {
        originalConfig._retry_csrf = true
        try {
          await fetchCsrfToken()
          return await axiosInstance.request(originalConfig)
        } catch (e) {
          return await Promise.reject(e)
        }
      }
    }

    if (status === 401) {
      const requestUrl = error.config?.url || ''
      const isAuthCheckRequest =
        requestUrl.includes('auth/me') || requestUrl === 'profile'

      localStorage.removeItem('auth-data')
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !isAuthCheckRequest
      ) {
        if (!isSessionExpiredToastShown) {
          isSessionExpiredToastShown = true
          toast.error('Session has expired. Please log in again.')
          authEvents.emitUnauthorized()
          setTimeout(() => {
            isSessionExpiredToastShown = false
          }, 3000)
        }
      }
    }

    if (status === 500 && data?.message === 'Database error occurred') {
      useGlobalErrorDialog
        .getState()
        .open(
          'We are currently experiencing a system issue. Our team has been notified and is working to resolve it. Please try again later.',
          'System Maintenance',
          error.config?.method
        )
    }

    return Promise.reject(error)
  }
)

async function request<T = unknown, D = unknown>(
  config: AxiosRequestConfig<D>
): Promise<BaseResponse<T>> {
  const res = await axiosInstance.request<
    BaseResponse<T>,
    AxiosResponse<BaseResponse<T>>,
    D
  >(config)
  return res.data
}

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => request<T, D>({ ...config, method: 'POST', url, data }),
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => request<T, D>({ ...config, method: 'PUT', url, data }),
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => request<T, D>({ ...config, method: 'PATCH', url, data }),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url })
}

export default axiosInstance

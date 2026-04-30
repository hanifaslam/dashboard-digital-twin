import { parseAxiosError } from '@/lib/utils'
import { BaseResponse } from '@/types/base-api'

import { useCallback, useMemo, useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

type Mutation<TInput, TResData> = (
  data: TInput
) => Promise<BaseResponse<TResData>>

type FieldErrorConfig = {
  field: string
  triggers: string[]
  message?: string
}

type Options<TInput extends FieldValues, TResData> = {
  mutation: Mutation<TInput, TResData>
  form: UseFormReturn<TInput>
  uniqueErrors?: Array<FieldErrorConfig>
  autoReset?: boolean
  resetDelay?: number
  successMessage?: string
  errorMessage?: string
  notifySuccess?: (msg: string) => void
  notifyError?: (msg: string) => void
  onSuccess?: (res: BaseResponse<TResData>) => void
  onError?: (err: unknown) => boolean | void
}

export function useSubmit<TInput extends FieldValues, TResData = unknown>(
  opts: Options<TInput, TResData>
) {
  const {
    mutation,
    form,
    autoReset = true,
    resetDelay = 100,
    notifySuccess,
    notifyError,
    successMessage = 'Sukses',
    errorMessage = 'Terjadi kesalahan pada sistem',
    onSuccess,
    onError,
    uniqueErrors
  } = opts

  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    if (!autoReset) return
    setTimeout(() => form.reset(), resetDelay)
  }, [autoReset, form, resetDelay])

  const uniqueErrorConfigs = useMemo(
    () => (uniqueErrors && uniqueErrors.length > 0 ? uniqueErrors : []),
    [uniqueErrors]
  )

  const trySetUniqueFieldError = useCallback(
    (maybeMessage: unknown) => {
      if (!uniqueErrorConfigs || uniqueErrorConfigs.length === 0) return false

      try {
        const text = String(maybeMessage || '').toLowerCase()

        for (const cfg of uniqueErrorConfigs) {
          if (!cfg || !cfg.triggers || cfg.triggers.length === 0) continue
          const matches = cfg.triggers.some((t) =>
            text.includes(String(t || '').toLowerCase())
          )
          if (!matches) continue

          try {
            const setErrorFn = form.setError as unknown as (
              name: string,
              error: { type: string; message: string },
              options?: { shouldFocus?: boolean }
            ) => void

            setErrorFn(
              cfg.field,
              {
                type: 'server',
                message: cfg.message || 'Value is already used'
              },
              { shouldFocus: true }
            )
            return true
          } catch {
            continue
          }
        }
      } catch {
        console.error('Failed to parse unique field error message')
      }
      return false
    },
    [form, uniqueErrorConfigs]
  )

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (data: TInput) => {
        setIsSubmitting(true)
        try {
          const res = await mutation(data)

          if (!res?.success && res?.message !== 'success') {
            const handledByOnError = onError?.(res) === true
            const handledByUniqueError = trySetUniqueFieldError(res?.message)
            if (!handledByOnError && !handledByUniqueError) {
              notifyError?.(res?.message || errorMessage)
            }
            return
          }

          notifySuccess?.(successMessage)
          onSuccess?.(res)
          resetForm()
        } catch (err: unknown) {
          const handledByOnError = onError?.(err) === true
          const msg = parseAxiosError(err, errorMessage)
          const handledByUniqueError = trySetUniqueFieldError(msg)
          if (!handledByOnError && !handledByUniqueError) {
            notifyError?.(msg)
          }
        } finally {
          setIsSubmitting(false)
        }
      }),
    [
      form,
      mutation,
      notifyError,
      notifySuccess,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      resetForm,
      trySetUniqueFieldError
    ]
  )

  return { onSubmit, isSubmitting, resetForm }
}

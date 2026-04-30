'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import * as React from 'react'

export type UrlParamValue =
  | string
  | number
  | readonly string[]
  | null
  | undefined

interface UseUrlTableParamsOptions<TCsvParamName extends string = string> {
  defaultPage?: number
  defaultPerPage?: number
  pageParamName?: string
  perPageParamName?: string
  searchParamName?: string
  csvParamNames?: readonly TCsvParamName[]
}

interface UseUrlTableParamsResult<TCsvParamName extends string = string> {
  page: number
  perPage: number
  search: string
  csvParams: Record<TCsvParamName, string[]>
  setParams: (updates: Record<string, UrlParamValue>) => void
}

function parseCsvParam(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parsePositiveNumber(value: string | null, fallback: number) {
  if (!value) return fallback

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function serializeParamValue(value: UrlParamValue) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(',') : null
  }

  return value
}

export function useUrlTableParams<TCsvParamName extends string = string>({
  defaultPage = 1,
  defaultPerPage = 10,
  pageParamName = 'page',
  perPageParamName = 'per_page',
  searchParamName = 'q',
  csvParamNames = []
}: UseUrlTableParamsOptions<TCsvParamName> = {}): UseUrlTableParamsResult<TCsvParamName> {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = React.useMemo(
    () =>
      parsePositiveNumber(searchParams.get(pageParamName), defaultPage),
    [defaultPage, pageParamName, searchParams]
  )

  const perPage = React.useMemo(
    () =>
      parsePositiveNumber(
        searchParams.get(perPageParamName),
        defaultPerPage
      ),
    [defaultPerPage, perPageParamName, searchParams]
  )

  const search = searchParams.get(searchParamName) ?? ''

  const csvParams = React.useMemo(() => {
    return csvParamNames.reduce(
      (acc, paramName) => ({
        ...acc,
        [paramName]: parseCsvParam(searchParams.get(paramName))
      }),
      {} as Record<TCsvParamName, string[]>
    )
  }, [csvParamNames, searchParams])

  const setParams = React.useCallback(
    (updates: Record<string, UrlParamValue>) => {
      const params = new URLSearchParams(window.location.search)

      Object.entries(updates).forEach(([key, value]) => {
        const serializedValue = serializeParamValue(value)

        if (serializedValue === null || serializedValue === undefined) {
          params.delete(key)
          return
        }

        const stringValue = String(serializedValue)

        if (!stringValue) {
          params.delete(key)
          return
        }

        params.set(key, stringValue)
      })

      const queryString = params.toString()
      window.history.replaceState(
        null,
        '',
        queryString ? `${pathname}?${queryString}` : pathname
      )
    },
    [pathname]
  )

  return {
    page,
    perPage,
    search,
    csvParams,
    setParams
  }
}

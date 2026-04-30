'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const color = mounted && resolvedTheme === 'dark' ? '#ffffff' : '#1b3250'

  return (
    <ProgressProvider color={color} options={{ showSpinner: false }}>
      {children}
    </ProgressProvider>
  )
}

export default NProgressProvider

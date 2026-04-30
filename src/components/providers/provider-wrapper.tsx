'use client'

import { ConfirmProvider } from '@/components/providers/confirm-provider'
import NProgressProvider from '@/components/providers/progress-provider'
import { GlobalErrorDialog } from '@/components/common/modal/global-error-dialog'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthGuardProvider } from './auth-guard-provider'
import { QueryProvider } from './query-provider'

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthGuardProvider>
        <NProgressProvider>
          <TooltipProvider>
            <ConfirmProvider>
              {children}
              <GlobalErrorDialog />
              <Toaster
                position="top-center"
                expand={false}
                visibleToasts={1}
                richColors={false}
                closeButton={true}
                toastOptions={{
                  duration: 4000
                }}
              />
            </ConfirmProvider>
          </TooltipProvider>
        </NProgressProvider>
      </AuthGuardProvider>
    </QueryProvider>
  )
}

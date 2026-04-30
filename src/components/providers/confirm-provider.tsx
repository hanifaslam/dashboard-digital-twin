'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import * as React from 'react'

type ConfirmOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  icon?: React.ReactNode
  iconClassName?: string
  dialogClassName?: string
  confirmButtonClassName?: string
  cancelButtonClassName?: string
  destructive?: boolean
}

type ConfirmContextType = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null)
  const resolverRef = React.useRef<(v: boolean) => void>(() => {})

  // Expose a function that opens dialog and resolves a promise
  const confirm = React.useCallback((opts: ConfirmOptions) => {
    setOptions({
      confirmText: 'Konfirmasi',
      cancelText: 'Batal',
      ...opts
    })
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  // Handlers
  const handleCancel = React.useCallback(() => {
    setOpen(false)
    resolverRef.current(false)
  }, [])

  const handleConfirm = React.useCallback(() => {
    setOpen(false)
    resolverRef.current(true)
  }, [])

  const defaultConfirmBtn =
    'w-full font-semibold rounded-md ' +
    (options?.destructive
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-primary text-primary-foreground hover:bg-primary/90')

  const defaultCancelBtn =
    'w-full font-semibold rounded-md border border-input bg-background hover:bg-accent'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent
          className={cn(
            'max-w-md rounded-sm z-100 p-4',
            options?.dialogClassName
          )}
          autoFocus={false}
        >
          <AlertDialogHeader className="place-items-center! text-center!">
            {options?.icon && (
              <div
                className={cn(
                  'mb-4 flex justify-center',
                  options.iconClassName
                )}
              >
                {options.icon}
              </div>
            )}

            <AlertDialogTitle
              className={cn(
                'text-center! font-semibold text-2xl w-full',
                !options?.icon && 'mt-2'
              )}
            >
              {options?.title}
            </AlertDialogTitle>

            {!!options?.description && (
              <AlertDialogDescription className="text-center!">
                {options.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <div className="mt-2 grid w-full grid-cols-2 gap-4">
            <AlertDialogCancel
              onClick={handleCancel}
              className={cn(
                defaultCancelBtn,
                'min-h-12 text-base',
                options?.cancelButtonClassName
              )}
            >
              {options?.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                defaultConfirmBtn,
                'min-h-12 text-base',
                options?.confirmButtonClassName
              )}
            >
              {options?.confirmText}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

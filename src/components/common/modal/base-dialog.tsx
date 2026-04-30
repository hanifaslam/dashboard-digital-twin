import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  content: React.ReactNode
  footer?: React.ReactNode
  className?: string
  headerBorder?: boolean
  headerClassName?: string
  contentClassName?: string
}

export default function BaseDialog({
  open,
  onOpenChange,
  title,
  content,
  footer,
  className,
  headerBorder,
  headerClassName,
  contentClassName
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('[&>button]:hidden p-0 gap-0', className)}>
        <div
          className={cn(
            'px-6 pt-6 pb-4',
            headerBorder && 'border-b',
            headerClassName
          )}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center justify-between flex-1">
                {title}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className={cn('px-6 pb-2', contentClassName)}>{content}</div>

        {footer && (
          <div className="px-6 pb-6 pt-4">
            <DialogFooter>{footer}</DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

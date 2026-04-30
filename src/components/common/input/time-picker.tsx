'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ClockIcon } from 'lucide-react'
import * as React from 'react'

export interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedHour, setSelectedHour] = React.useState<number>(10)
  const [selectedMinute, setSelectedMinute] = React.useState<number>(10)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && value && value.includes(':')) {
      const [hourStr, minuteStr] = value.split(':')
      const hour = parseInt(hourStr, 10)
      const minute = parseInt(minuteStr, 10)
      if (!isNaN(hour) && !isNaN(minute)) {
        setSelectedHour(hour)
        setSelectedMinute(minute)
      }
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const hourScrollRef = React.useRef<HTMLDivElement>(null)
  const minuteScrollRef = React.useRef<HTMLDivElement>(null)

  const handleSelect = () => {
    const timeString = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
    onChange?.(timeString)
    setOpen(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedElement = hourScrollRef.current.querySelector(
            `[data-hour="${selectedHour}"]`
          ) as HTMLElement
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'center' })
          }
        }
        if (minuteScrollRef.current) {
          const selectedElement = minuteScrollRef.current.querySelector(
            `[data-minute="${selectedMinute}"]`
          ) as HTMLElement
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'center' })
          }
        }
      }, 0)
    }
  }, [open, selectedHour, selectedMinute])

  const displayValue = value || placeholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col items-center p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <ScrollArea className="h-32 w-16 ">
                <div ref={hourScrollRef} onWheel={handleWheel}>
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      data-hour={hour}
                      onClick={() => setSelectedHour(hour)}
                      className={cn(
                        'w-full py-1 text-center hover:bg-accent transition-colors',
                        selectedHour === hour &&
                          'bg-primary text-primary-foreground font-semibold'
                      )}
                    >
                      {String(hour).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <span className="text-2xl font-bold">:</span>

            <div className="flex flex-col items-center">
              <ScrollArea className="h-32 w-16 ">
                <div ref={minuteScrollRef} onWheel={handleWheel}>
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      data-minute={minute}
                      onClick={() => setSelectedMinute(minute)}
                      className={cn(
                        'w-full py-1 text-center hover:bg-accent transition-colors',
                        selectedMinute === minute &&
                          'bg-primary text-primary-foreground font-semibold'
                      )}
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Select
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Form-compatible wrapper for react-hook-form
export interface FormTimePickerProps
  extends Omit<TimePickerProps, 'value' | 'onChange'> {
  value?: string | null
  onChange?: (time: string) => void
  error?: boolean
}

export function FormTimePicker({
  value,
  onChange,
  error,
  className,
  ...props
}: FormTimePickerProps) {
  return (
    <TimePicker
      value={value ?? undefined}
      onChange={onChange}
      className={cn(error && 'border-destructive', className)}
      {...props}
    />
  )
}

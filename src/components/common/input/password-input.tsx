'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState } from 'react'

export interface PasswordInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type'
> {
  showToggle?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <InputGroup className={cn(className)}>
        <InputGroupInput
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        {showToggle && (
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </InputGroupAddon>
        )}
      </InputGroup>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }

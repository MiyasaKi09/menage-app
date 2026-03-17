import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-charcoal/12 bg-cream px-3 py-2 text-base font-lora ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-charcoal/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow/50 focus-visible:ring-offset-2 focus-visible:border-yellow/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

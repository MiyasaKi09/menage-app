import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl bg-cream/60 border border-charcoal/[0.08] px-4 py-2 text-[15px] font-lora text-charcoal ring-offset-background placeholder:text-charcoal/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow/10 focus-visible:border-yellow/30 focus-visible:bg-cream disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200',
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

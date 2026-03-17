import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium font-cinzel tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 rounded-xl border-0',
  {
    variants: {
      variant: {
        default: 'bg-yellow text-charcoal hover:bg-yellow/85 shadow-sm hover:shadow-md',
        destructive: 'bg-red text-white hover:bg-red/85 shadow-sm hover:shadow-md',
        outline: 'bg-transparent border border-charcoal/10 hover:border-charcoal/20 hover:bg-charcoal/[0.03] text-charcoal',
        secondary: 'bg-blue text-white hover:bg-blue/85 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-charcoal/[0.04] text-charcoal/60 hover:text-charcoal',
        success: 'bg-green text-white hover:bg-green/85 shadow-sm hover:shadow-md',
        link: 'text-charcoal/60 underline-offset-4 hover:underline hover:text-charcoal',
      },
      size: {
        default: 'h-11 px-5 text-[14px]',
        sm: 'h-9 px-3.5 text-[13px]',
        lg: 'h-12 px-7 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold font-cinzel tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-charcoal/30 rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-yellow text-black hover:bg-yellow/90 shadow-golden hover:shadow-golden-lg',
        destructive: 'bg-red text-white hover:bg-red/90 shadow-brutal hover:shadow-brutal-lg',
        outline: 'bg-transparent border-charcoal/50 hover:bg-charcoal hover:text-cream shadow-brutal-sm hover:shadow-brutal',
        secondary: 'bg-blue text-white hover:bg-blue/90 shadow-brutal hover:shadow-brutal-lg',
        ghost: 'border-none shadow-none hover:bg-yellow/10',
        success: 'bg-green text-white hover:bg-green/90 shadow-brutal hover:shadow-brutal-lg',
        link: 'border-none shadow-none text-charcoal underline-offset-4 hover:underline hover:text-yellow',
      },
      size: {
        default: 'h-12 px-6 py-3 text-sm',
        sm: 'h-10 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        icon: 'h-12 w-12',
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

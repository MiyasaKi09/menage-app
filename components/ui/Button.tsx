import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase font-outfit transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-4 border-black',
  {
    variants: {
      variant: {
        default: 'bg-yellow text-black hover:translate-x-1 hover:translate-y-1 shadow-brutal hover:shadow-none',
        destructive: 'bg-red text-white hover:translate-x-1 hover:translate-y-1 shadow-brutal hover:shadow-none',
        outline: 'bg-transparent hover:bg-black hover:text-white shadow-brutal hover:shadow-none',
        secondary: 'bg-blue text-white hover:translate-x-1 hover:translate-y-1 shadow-brutal hover:shadow-none',
        ghost: 'border-none shadow-none hover:bg-cream',
        success: 'bg-green text-black hover:translate-x-1 hover:translate-y-1 shadow-brutal hover:shadow-none',
        link: 'border-none shadow-none text-black underline-offset-4 hover:underline',
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

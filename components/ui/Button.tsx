import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 rounded-[14px] border-0',
  {
    variants: {
      variant: {
        default: 'bg-yellow text-foreground hover:bg-yellow/85 shadow-sm hover:shadow-md',
        destructive: 'bg-red text-white hover:bg-red/85 shadow-sm hover:shadow-md',
        outline: 'bg-transparent border border-[#E8E0D4] hover:border-foreground/15 hover:bg-foreground/[0.03] text-foreground',
        secondary: 'bg-blue text-white hover:bg-blue/85 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-foreground/[0.04] text-foreground/60 hover:text-foreground',
        success: 'bg-green text-white hover:bg-green/85 shadow-sm hover:shadow-md',
        link: 'text-foreground/60 underline-offset-4 hover:underline hover:text-foreground',
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

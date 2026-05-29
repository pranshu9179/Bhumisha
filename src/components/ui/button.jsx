/* eslint-disable react-refresh/only-export-components */
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/95',
        secondary: 'border-border bg-white text-dark hover:border-primary/40 hover:bg-primary/5',
        ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-dark',
        accent: 'border-accent bg-accent text-white shadow-lg shadow-accent/25 hover:-translate-y-0.5 hover:bg-accent/90',
        danger: 'border-danger bg-danger text-white hover:bg-danger/90',
        subtle: 'border-white/60 bg-white/70 text-dark backdrop-blur-sm hover:bg-white',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 px-5 text-base',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { buttonVariants }

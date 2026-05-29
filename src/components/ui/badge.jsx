import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-accent/12 text-amber-700',
        danger: 'bg-danger/10 text-danger',
        slate: 'bg-slate-100 text-slate-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

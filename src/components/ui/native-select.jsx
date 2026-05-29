import { cn } from '@/lib/utils'

export function NativeSelect({ className, ...props }) {
  return (
    <select
      className={cn(
        'flex h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-dark outline-none ring-0 transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(22,101,52,0.08)]',
        className,
      )}
      {...props}
    />
  )
}

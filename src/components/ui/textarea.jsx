import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(22,101,52,0.08)]',
        className,
      )}
      {...props}
    />
  )
}

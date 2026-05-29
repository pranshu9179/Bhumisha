import { Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title = 'Nothing to show yet',
  description = 'New activity will appear here when records are available.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-primary/20 bg-white/70 p-8 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <Sprout className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-dark">{title}</h3>
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      </div>
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

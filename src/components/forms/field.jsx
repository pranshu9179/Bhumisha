import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function Field({ label, hint, error, className, children }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  )
}

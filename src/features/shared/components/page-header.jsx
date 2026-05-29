import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PageHeader({ eyebrow, title, description, actions, compact = false }) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-primary/10 bg-[linear-gradient(135deg,rgba(22,101,52,0.09),rgba(255,255,255,0.9),rgba(245,158,11,0.10))]',
        compact ? 'p-5' : 'p-6 sm:p-7',
      )}
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <div className="space-y-2">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-dark sm:text-4xl">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      </div>
    </Card>
  )
}

export function DemoAction({ onClick, label = 'Reset demo data' }) {
  return (
    <Button variant="subtle" onClick={onClick}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}

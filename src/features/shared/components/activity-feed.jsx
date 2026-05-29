import { Clock3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

export function ActivityFeed({ items = [], title = 'Recent activity', description = 'Latest workflow actions across the platform.' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Clock3 className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-dark">
                {item.actor} · {item.action}
              </p>
              <p className="text-sm text-slate-500">{item.target}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{formatDate(item.timestamp, 'DD MMM · hh:mm A')}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

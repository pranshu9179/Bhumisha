import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCompactNumber, formatCurrency } from '@/lib/format'

function displayValue(value) {
  if (typeof value === 'number') {
    return value > 9999 ? formatCurrency(value) : formatCompactNumber(value)
  }
  return value
}

export function StatCard({ label, value, delta, accent = 'primary' }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex min-h-32 flex-col justify-between gap-6 p-5">
        <div
          className={`absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl ${
            accent === 'accent' ? 'bg-accent/18' : accent === 'danger' ? 'bg-danger/14' : 'bg-primary/16'
          }`}
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-3xl font-semibold tracking-tight text-dark">{displayValue(value)}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowUpRight className="h-4 w-4" />
          {delta}
        </div>
      </CardContent>
    </Card>
  )
}

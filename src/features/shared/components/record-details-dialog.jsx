import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDate, sentenceCase } from '@/lib/format'

function formatValue(value) {
  if (value == null || value === '') {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => formatValue(item)).join(', ') : '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatDate(value, 'DD MMM YYYY · hh:mm A')
  }

  return String(value)
}

export function RecordDetailsDialog({
  title = 'Record details',
  description = 'Detailed row information.',
  record,
  fields,
  triggerLabel = 'View',
}) {
  const detailFields =
    fields ||
    Object.entries(record || {})
      .filter(([key]) => key !== 'password')
      .map(([key, value]) => ({
        label: sentenceCase(key),
        value,
      }))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={(event) => event.stopPropagation()}
        >
          <Eye className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {detailFields.map((field) => (
            <div
              key={field.label}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                {field.label}
              </p>
              <div className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-dark">
                {formatValue(field.value)}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

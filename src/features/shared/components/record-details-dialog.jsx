import { Eye } from 'lucide-react'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDate, sentenceCase } from '@/lib/format'

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)
}

function isMediaUrl(value) {
  return (
    typeof value === 'string' &&
    (/^(https?:|blob:|data:)/i.test(value) || value.startsWith('/')) &&
    /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value)
  )
}

function pickMediaValue(value) {
  if (!value) return ''
  if (Array.isArray(value)) return value.find((item) => pickMediaValue(item)) || ''
  if (typeof value === 'object') {
    return pickMediaValue(
      value.secure_url ||
        value.secureUrl ||
        value.url ||
        value.media_url ||
        value.image_url ||
        value.file_url ||
        value.path ||
        value.file_path ||
        value.profile_image ||
        value.avatar,
    )
  }
  return isMediaUrl(value) ? value : ''
}

function formatValue(value) {
  if (value == null || value === '') {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => formatValue(item)).join('\n') : '-'
  }

  if (typeof value === 'object') {
    return (
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== null && nestedValue !== '')
        .map(([key, nestedValue]) => `${sentenceCase(key)}: ${formatValue(nestedValue)}`)
        .join('\n') || '-'
    )
  }

  if (isIsoDate(value)) {
    return formatDate(value, 'DD MMM YYYY, hh:mm A')
  }

  return String(value)
}

function FieldValue({ label, value }) {
  const mediaValue = pickMediaValue(value)

  if (mediaValue) {
    return (
      <div className="mt-3 space-y-2">
        <PreviewableImage
          src={mediaValue}
          alt={label}
          className="h-32 w-full rounded-lg object-cover"
          fallbackClassName="h-32 w-full"
          previewTitle={label}
        />
        <a
          href={mediaValue}
          target="_blank"
          rel="noreferrer"
          className="block break-all text-xs font-medium text-primary underline"
          onClick={(event) => event.stopPropagation()}
        >
          Open image
        </a>
      </div>
    )
  }

  return (
    <div className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-dark">
      {formatValue(value)}
    </div>
  )
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
      .filter(([key]) => !['password', 'sku', 'product_code'].includes(key))
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
              <FieldValue label={field.label} value={field.value} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

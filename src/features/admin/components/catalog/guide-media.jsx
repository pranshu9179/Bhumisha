import { useState } from 'react'
import { PreviewableImage } from '@/components/media/previewable-image'

function getDisplayMediaUrl(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.url || item.media_url || item.image_url || item.file_url || item.path || item.file_path || ''
}

export function GuideMediaPreview({ item, alt, className = 'h-28 w-full rounded-xl object-cover' }) {
  const [failed, setFailed] = useState(false)
  const url = getDisplayMediaUrl(item)

  if (!url) {
    return <p className="break-words text-sm text-slate-500">{String(item || '-')}</p>
  }

  if (failed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="break-words text-sm font-medium text-primary underline">
        Open image
      </a>
    )
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return <video src={url} className={className} controls muted preload="metadata" onError={() => setFailed(true)} />
  }

  return <PreviewableImage src={url} alt={alt} className={className} previewTitle={alt} />
}

export function GuideMediaStrip({ media = [] }) {
  if (!media.length) return <span className="text-sm text-slate-400">No media</span>

  return (
    <div className="flex items-center gap-2">
      {media.slice(0, 3).map((item, index) => (
        <GuideMediaPreview
          key={`${getDisplayMediaUrl(item) || 'media'}-${index}`}
          item={item}
          alt={`Guide media ${index + 1}`}
          className="h-12 w-12 rounded-lg border border-border object-cover"
        />
      ))}
      {media.length > 3 ? <span className="text-xs font-semibold text-slate-500">+{media.length - 3}</span> : null}
    </div>
  )
}

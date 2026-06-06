import { ExternalLink, ImageOff, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function PreviewableImage({
  src,
  alt = 'Image preview',
  className,
  fallbackClassName,
  previewTitle,
  previewDescription = 'Use the controls to inspect this image.',
  buttonClassName,
  imageClassName,
  loading = 'lazy',
  stopPropagation = true,
}) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const [zoom, setZoom] = useState(1)
  const imageSrc = typeof src === 'string' ? src.trim() : ''

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)
    if (!nextOpen) setZoom(1)
  }

  const handleClick = (event) => {
    if (stopPropagation) event.stopPropagation()
    if (imageSrc && !failed) setOpen(true)
  }

  if (!imageSrc || failed) {
    return (
      <div className={cn('flex items-center justify-center rounded-lg bg-slate-100 text-slate-400', fallbackClassName || className)}>
        <ImageOff className="h-4 w-4" />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className={cn('group overflow-hidden rounded-lg text-left outline-none ring-0 focus-visible:shadow-[0_0_0_4px_rgba(22,101,52,0.14)]', buttonClassName)}
        onClick={handleClick}
      >
        <img
          src={imageSrc}
          alt={alt}
          className={cn('transition duration-200 group-hover:scale-[1.03]', className)}
          loading={loading}
          onError={() => setFailed(true)}
        />
      </button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl">
          <div className="border-b border-border px-6 pb-4 pt-6">
            <DialogHeader className="mb-0 pr-10">
              <DialogTitle>{previewTitle || alt}</DialogTitle>
              <DialogDescription>{previewDescription}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
            <div className="text-sm font-medium text-slate-500">{Math.round(zoom * 100)}%</div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}>
                <ZoomOut className="h-4 w-4" />
                Zoom out
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setZoom(1)}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setZoom((value) => Math.min(4, value + 0.25))}>
                <ZoomIn className="h-4 w-4" />
                Zoom in
              </Button>
              <Button type="button" size="sm" variant="secondary" asChild>
                <a href={imageSrc} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </Button>
            </div>
          </div>
          <div className="max-h-[68vh] overflow-auto bg-slate-950/95 p-6">
            <div className="flex min-h-[44vh] items-center justify-center">
              <img
                src={imageSrc}
                alt={alt}
                className={cn('max-h-[64vh] max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-200', imageClassName)}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                draggable={false}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

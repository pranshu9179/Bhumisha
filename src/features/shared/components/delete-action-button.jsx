import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function DeleteActionButton({
  label = 'Delete',
  confirmMessage = 'Do you want to delete this?',
  confirmTitle = 'Confirm deletion',
  onDelete,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async (event) => {
    event?.stopPropagation?.()

    try {
      setSubmitting(true)
      await onDelete?.()
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="danger"
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
          <DialogDescription>{confirmMessage}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="danger"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

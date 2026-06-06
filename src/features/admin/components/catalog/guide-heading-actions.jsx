import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGuideHeadingDeleteMutation, useGuideHeadingRestoreMutation } from '@/services/api/hooks'

export function GuideHeadingDeleteButton({ heading, onDeleted }) {
  const [open, setOpen] = useState(false)
  const mutation = useGuideHeadingDeleteMutation()

  const handleDelete = async (event) => {
    event?.stopPropagation?.()
    try {
      await mutation.mutateAsync(heading.id)
      onDeleted?.(heading)
      toast.success('Guide heading deleted successfully.')
      setOpen(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to delete guide heading.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete guide heading</DialogTitle>
          <DialogDescription>
            Soft delete {heading.title || 'this guide heading'}? You can restore it from the Deleted tab in this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="danger" disabled={mutation.isPending} onClick={handleDelete}>
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function GuideHeadingRestoreButton({ heading, onRestored }) {
  const [open, setOpen] = useState(false)
  const mutation = useGuideHeadingRestoreMutation()

  const handleRestore = async (event) => {
    event?.stopPropagation?.()
    try {
      await mutation.mutateAsync(heading.id)
      onRestored?.(heading.id)
      toast.success('Guide heading restored successfully.')
      setOpen(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to restore guide heading.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={(event) => event.stopPropagation()}
        >
          <RotateCcw className="h-4 w-4" />
          Restore
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore guide heading</DialogTitle>
          <DialogDescription>
            Restore {heading.title || 'this guide heading'} so it appears in active heading lists again?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" disabled={mutation.isPending} onClick={handleRestore}>
            {mutation.isPending ? 'Restoring...' : 'Restore'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { GuideMediaPreview } from '@/features/admin/components/catalog/guide-media'
import { useGuideDetailDeleteMutation, useGuideDetailMediaAppendMutation, useGuideDetailMediaDeleteMutation } from '@/services/api/hooks'

export function GuideDetailMediaDialog({ detail }) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState(null)
  const appendMutation = useGuideDetailMediaAppendMutation()
  const deleteMutation = useGuideDetailMediaDeleteMutation()

  const handleAppend = async () => {
    try {
      await appendMutation.mutateAsync({ id: detail.id, files })
      setFiles(null)
      toast.success('Media appended successfully.')
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to append media.')
    }
  }

  const handleRemove = async (index) => {
    try {
      await deleteMutation.mutateAsync({ detailId: detail.id, index })
      toast.success('Media removed successfully.')
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to remove media.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" onClick={(event) => event.stopPropagation()}>
          Media ({detail.media?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Guide detail media</DialogTitle>
          <DialogDescription>Append new files or remove an existing media item by its current index.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Append media">
            <Input type="file" multiple onChange={(event) => setFiles(event.target.files)} />
          </Field>
          <div className="flex justify-end">
            <Button type="button" disabled={appendMutation.isPending || !files?.length} onClick={handleAppend}>
              {appendMutation.isPending ? 'Uploading...' : 'Append media'}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(detail.media || []).map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                <GuideMediaPreview item={item} alt={`Media ${index + 1}`} />
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  className="mt-3 w-full"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleRemove(index)}
                >
                  Remove index {index}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function GuideDetailDeleteButton({ detail }) {
  const [open, setOpen] = useState(false)
  const mutation = useGuideDetailDeleteMutation()

  const handleDelete = async (event) => {
    event?.stopPropagation?.()
    try {
      await mutation.mutateAsync(detail.id)
      toast.success('Guide detail deleted successfully.')
      setOpen(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to delete guide detail.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="danger" onClick={(event) => event.stopPropagation()}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete guide detail</DialogTitle>
          <DialogDescription>
            Soft delete {detail.title || 'this guide detail'}? If this is the last active detail, the parent guide record may also be soft-deleted by the backend.
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


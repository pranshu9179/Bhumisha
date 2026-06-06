import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useProductDeleteMutation } from '@/services/api/hooks'

export function CropToggleButton({ crop }) {
  const [open, setOpen] = useState(false)
  const mutation = useProductDeleteMutation()
  const isDeleted = crop.status === 'deleted'
  const Icon = isDeleted ? RotateCcw : Trash2

  const handleToggle = async (event) => {
    event?.stopPropagation?.()
    try {
      await mutation.mutateAsync(crop.id)
      toast.success(isDeleted ? 'Crop restored successfully.' : 'Crop deleted successfully.')
      setOpen(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to update crop status.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={isDeleted ? 'secondary' : 'danger'}
          onClick={(event) => event.stopPropagation()}
        >
          <Icon className="h-4 w-4" />
          {isDeleted ? 'Restore' : 'Delete'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isDeleted ? 'Restore crop' : 'Delete crop'}</DialogTitle>
          <DialogDescription>
            {isDeleted
              ? `Restore ${crop.name || 'this crop'} so it appears in active crop lists again?`
              : `Soft delete ${crop.name || 'this crop'}? You can restore it later from the Deleted tab.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={isDeleted ? 'default' : 'danger'}
            disabled={mutation.isPending}
            onClick={handleToggle}
          >
            {mutation.isPending ? 'Updating...' : isDeleted ? 'Restore' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


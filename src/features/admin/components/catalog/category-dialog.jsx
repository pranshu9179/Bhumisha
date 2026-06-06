import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { categorySchema } from '@/features/admin/components/catalog/catalog-schemas'
import { useCategorySaveMutation } from '@/services/api/hooks'

export function CategoryDialog({ open, onOpenChange, category }) {
  const mutation = useCategorySaveMutation()
  const isEditing = Boolean(category?.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      name_hi: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: category?.name || '',
      name_hi: category?.name_hi || '',
    })
  }, [category, open, reset])

  const onSubmit = async (values) => {
    const payload = {
      cropCategory: values.name.trim(),
      cropCategory_hi: values.name_hi?.trim() || null,
    }

    try {
      await mutation.mutateAsync({ id: category?.id, payload })
      toast.success(isEditing ? 'Crop category updated successfully.' : 'Crop category added successfully.')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save crop category.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit crop category' : 'Add crop category'}</DialogTitle>
          <DialogDescription>Maintain the English and Hindi names used by crop records and advisory content.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field
            label="English category name"
            hint="This name must be unique. The backend currently also checks soft-deleted categories."
            error={errors.name?.message}
          >
            <Input {...register('name')} />
          </Field>
          <Field label="Hindi category name" error={errors.name_hi?.message}>
            <Input lang="hi" dir="auto" {...register('name_hi')} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save crop category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


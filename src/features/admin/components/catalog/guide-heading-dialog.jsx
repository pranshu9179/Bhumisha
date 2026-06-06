import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { guideHeadingSchema } from '@/features/admin/components/catalog/catalog-schemas'
import { useGuideHeadingSaveMutation } from '@/services/api/hooks'

export function GuideHeadingDialog({ open, onOpenChange, heading }) {
  const mutation = useGuideHeadingSaveMutation()
  const isEditing = Boolean(heading?.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(guideHeadingSchema),
    defaultValues: {
      title: '',
      title_hi: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: heading?.title || '',
      title_hi: heading?.title_hi || '',
    })
  }, [heading, open, reset])

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync({
        id: heading?.id,
        payload: {
          title: values.title.trim(),
          title_hi: values.title_hi?.trim() || null,
        },
      })
      toast.success(isEditing ? 'Guide heading updated successfully.' : 'Guide heading created successfully.')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save guide heading.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit guide heading' : 'Add guide heading'}</DialogTitle>
          <DialogDescription>Manage bilingual guide section headings used inside crop advisory content.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="English heading" error={errors.title?.message}>
            <Input {...register('title')} />
          </Field>
          <Field label="Hindi heading" error={errors.title_hi?.message}>
            <Input lang="hi" dir="auto" {...register('title_hi')} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save heading'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


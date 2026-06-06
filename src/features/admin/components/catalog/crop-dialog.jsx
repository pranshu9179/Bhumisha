import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { cropSchema } from '@/features/admin/components/catalog/catalog-schemas'
import { getFirstFile, isValidCropImage } from '@/features/admin/components/catalog/catalog-utils'
import { useProductSaveMutation } from '@/services/api/hooks'

export function CropDialog({ open, onOpenChange, crop, categories = [] }) {
  const mutation = useProductSaveMutation()
  const isEditing = Boolean(crop?.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: '',
      name_hi: '',
      description: '',
      description_hi: '',
      categoryId: '',
      crop_theme_image: undefined,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: crop?.name || '',
      name_hi: crop?.name_hi || '',
      description: crop?.description || '',
      description_hi: crop?.description_hi || '',
      categoryId: crop?.categoryId ? String(crop.categoryId) : '',
      crop_theme_image: undefined,
    })
  }, [crop, open, reset])

  const onSubmit = async (values) => {
    const image = getFirstFile(values.crop_theme_image)

    if (!isEditing && !image) {
      toast.error('Crop theme image is required.')
      return
    }

    if (!isValidCropImage(image)) {
      toast.error('Use a JPEG, JPG, or PNG image up to 50MB.')
      return
    }

    const payload = {
      name: values.name.trim(),
      name_hi: values.name_hi?.trim() || null,
      description: values.description.trim(),
      description_hi: values.description_hi?.trim() || null,
      crop_category_id: values.categoryId,
    }

    if (image) {
      payload.crop_theme_image = image
    }

    try {
      await mutation.mutateAsync({ id: crop?.id, payload })
      toast.success(isEditing ? 'Crop updated successfully.' : 'Crop created successfully.')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save crop.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit crop' : 'Add crop'}</DialogTitle>
          <DialogDescription>Manage bilingual crop details, category mapping, and the crop theme image.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Field label="English crop name" error={errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="Hindi crop name" error={errors.name_hi?.message}>
            <Input lang="hi" dir="auto" {...register('name_hi')} />
          </Field>
          <Field label="Crop category" error={errors.categoryId?.message}>
            <NativeSelect {...register('categoryId')}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.name_hi ? ` / ${category.name_hi}` : ''}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label={isEditing ? 'Theme image' : 'Theme image required'}
            hint={isEditing ? 'Upload a new JPEG/PNG only if you want to replace the existing image.' : 'JPEG, PNG, or JPG up to the backend limit.'}
          >
            <Input type="file" accept="image/jpeg,image/png,image/jpg" {...register('crop_theme_image')} />
          </Field>
          <Field label="English description" error={errors.description?.message} className="md:col-span-2">
            <Textarea rows={4} {...register('description')} />
          </Field>
          <Field label="Hindi description" error={errors.description_hi?.message} className="md:col-span-2">
            <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
          </Field>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save crop'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


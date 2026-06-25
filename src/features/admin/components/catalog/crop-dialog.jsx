import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { cropSchema } from '@/features/admin/components/catalog/catalog-schemas'
import { areValidCropImages, getFiles } from '@/features/admin/components/catalog/catalog-utils'
import { useCropImagesMutation, useProductSaveMutation } from '@/services/api/hooks'

export function CropDialog({ open, onOpenChange, crop, categories = [] }) {
  const mutation = useProductSaveMutation()
  const imageMutation = useCropImagesMutation()
  const isEditing = Boolean(crop?.id)
  const [deleteIndexes, setDeleteIndexes] = useState([])
  const existingImages = useMemo(() => crop?.images || (crop?.image ? [crop.image] : []), [crop])
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
      sequence: '',
      crop_theme_image: undefined,
      deleteIndexes: [],
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
      sequence: crop?.sequence != null ? String(crop.sequence) : '',
      crop_theme_image: undefined,
      deleteIndexes: [],
    })
  }, [crop, open, reset])

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setDeleteIndexes([])
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = async (values) => {
    const imageFiles = getFiles(values.crop_theme_image)
    const retainedImageCount = existingImages.length - deleteIndexes.length
    const finalImageCount = retainedImageCount + imageFiles.length

    if (!isEditing && imageFiles.length === 0) {
      toast.error('Upload at least one crop theme image.')
      return
    }

    if (imageFiles.length > 10 || finalImageCount > 10) {
      toast.error('A crop can have up to 10 theme images.')
      return
    }

    if (!areValidCropImages(imageFiles)) {
      toast.error('Use JPEG, JPG, or PNG images up to 50MB each.')
      return
    }

    const payload = {
      name: values.name.trim(),
      name_hi: values.name_hi?.trim() || null,
      description: values.description?.trim() || null,
      description_hi: values.description_hi?.trim() || null,
      crop_category_id: Number(values.categoryId),
      sequence: values.sequence ? Number(values.sequence) : null,
    }

    if (!isEditing) {
      payload.crop_theme_image = imageFiles
    }

    try {
      await mutation.mutateAsync({ id: crop?.id, payload })
      if (isEditing && (imageFiles.length > 0 || deleteIndexes.length > 0)) {
        await imageMutation.mutateAsync({
          id: crop.id,
          payload: {
            crop_theme_image: imageFiles,
            deleteIndexes,
          },
        })
      }
      toast.success(isEditing ? 'Crop updated successfully.' : 'Crop created successfully.')
      reset()
      handleOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save crop.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit crop' : 'Add crop'}</DialogTitle>
          <DialogDescription>Manage bilingual crop details, display sequence, category mapping, and up to 10 crop theme images.</DialogDescription>
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
          <Field label="Display sequence" hint="Optional numeric order for crop listing." error={errors.sequence?.message}>
            <Input type="number" min="0" step="1" placeholder="1" {...register('sequence')} />
          </Field>
          <Field
            label={isEditing ? 'Add theme images' : 'Theme images required'}
            hint={isEditing ? 'Append JPEG/PNG images. Maximum 10 total.' : 'Upload 1-10 JPEG, PNG, or JPG images.'}
            error={errors.crop_theme_image?.message}
          >
            <Input type="file" accept="image/jpeg,image/png,image/jpg" multiple {...register('crop_theme_image')} />
          </Field>
          {isEditing && existingImages.length > 0 ? (
            <div className="space-y-3 md:col-span-2">
              <div>
                <p className="text-sm font-medium text-dark">Current theme images</p>
                <p className="text-xs text-slate-500">Select images to remove when saving this crop.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {existingImages.map((image, index) => {
                  const checked = deleteIndexes.includes(index)
                  return (
                    <label
                      key={`${image}-${index}`}
                      className="flex gap-3 rounded-xl border border-border bg-white p-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={checked}
                        onChange={(event) => {
                          setDeleteIndexes((current) =>
                            event.target.checked
                              ? [...current, index]
                              : current.filter((item) => item !== index),
                          )
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <PreviewableImage
                          src={image}
                          alt={`${crop?.name || 'Crop'} theme ${index + 1}`}
                          className="h-20 w-full rounded-lg object-cover"
                          fallbackClassName="h-20 w-full rounded-lg"
                          previewTitle={`${crop?.name || 'Crop'} theme ${index + 1}`}
                        />
                        <p className="mt-2 truncate text-xs text-slate-500">Image {index + 1}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ) : null}
          <Field label="English description" error={errors.description?.message} className="md:col-span-2">
            <Textarea rows={4} {...register('description')} />
          </Field>
          <Field label="Hindi description" error={errors.description_hi?.message} className="md:col-span-2">
            <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
          </Field>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || imageMutation.isPending}>
              {mutation.isPending || imageMutation.isPending ? 'Saving...' : 'Save crop'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

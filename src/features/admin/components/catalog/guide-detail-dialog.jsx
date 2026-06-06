import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { guideDetailCreateSchema, guideDetailEditSchema } from '@/features/admin/components/catalog/catalog-schemas'
import { createEmptyGuideDetailRow } from '@/features/admin/components/catalog/catalog-utils'
import { useGuideDetailSaveMutation } from '@/services/api/hooks'

export function GuideDetailDialog({ open, onOpenChange, detail, crops = [], headings = [] }) {
  const mutation = useGuideDetailSaveMutation()
  const isEditing = Boolean(detail?.id)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? guideDetailEditSchema : guideDetailCreateSchema),
    defaultValues: {
      crop_id: '',
      crops_guid_heading_id: '',
      title: '',
      title_hi: '',
      description: '',
      description_hi: '',
      details: [createEmptyGuideDetailRow()],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  })

  useEffect(() => {
    if (!open) return
    reset({
      crop_id: detail?.cropId ? String(detail.cropId) : '',
      crops_guid_heading_id: detail?.headingId ? String(detail.headingId) : '',
      title: detail?.title || '',
      title_hi: detail?.title_hi || '',
      description: detail?.description || '',
      description_hi: detail?.description_hi || '',
      details: [createEmptyGuideDetailRow()],
    })
  }, [detail, open, reset])

  const handleAddRow = () => {
    append(createEmptyGuideDetailRow())
  }

  const handleRemoveRow = (index) => {
    if (fields.length > 1) remove(index)
  }

  const onSubmit = async (values) => {
    const payload = isEditing
      ? {
          crop_id: values.crop_id,
          crops_guid_heading_id: values.crops_guid_heading_id,
          title: values.title.trim(),
          title_hi: values.title_hi?.trim() || undefined,
          description: values.description.trim(),
          description_hi: values.description_hi?.trim() || undefined,
        }
      : {
          crop_id: values.crop_id,
          crops_guid_heading_id: values.crops_guid_heading_id,
          details: values.details.map((row) => ({
            title: row.title.trim(),
            title_hi: row.title_hi?.trim() || null,
            description: row.description.trim(),
            description_hi: row.description_hi?.trim() || null,
          })),
          media: values.details.map((row) => row.media),
        }

    try {
      await mutation.mutateAsync({ id: detail?.id, payload })
      toast.success(isEditing ? 'Guide detail updated successfully.' : 'Guide details created successfully.')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save guide detail.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit guide detail' : 'Add guide detail'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the selected bilingual guide detail content.'
              : 'Map one crop and guide heading to multiple bilingual detail rows with optional images.'}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Crop" error={errors.crop_id?.message}>
            <NativeSelect {...register('crop_id')}>
              <option value="">Select crop</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                  {crop.name_hi ? ` / ${crop.name_hi}` : ''}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Guide heading" error={errors.crops_guid_heading_id?.message}>
            <NativeSelect {...register('crops_guid_heading_id')}>
              <option value="">Select heading</option>
              {headings.map((heading) => (
                <option key={heading.id} value={heading.id}>
                  {heading.title}
                  {heading.title_hi ? ` / ${heading.title_hi}` : ''}
                </option>
              ))}
            </NativeSelect>
          </Field>
          {isEditing ? (
            <>
              <Field label="English title" error={errors.title?.message}>
                <Input {...register('title')} />
              </Field>
              <Field label="Hindi title" error={errors.title_hi?.message}>
                <Input lang="hi" dir="auto" {...register('title_hi')} />
              </Field>
              <Field label="English description" error={errors.description?.message} className="md:col-span-2">
                <Textarea rows={4} {...register('description')} />
              </Field>
              <Field label="Hindi description" error={errors.description_hi?.message} className="md:col-span-2">
                <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
              </Field>
            </>
          ) : (
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detail rows</p>
                  {errors.details?.message ? <p className="mt-1 text-xs font-medium text-danger">{errors.details.message}</p> : null}
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={handleAddRow}>
                  <Plus className="h-3.5 w-3.5" />
                  Add row
                </Button>
              </div>
              {fields.map((field, index) => {
                const detailErrors = errors.details?.[index] || {}

                return (
                  <div key={field.id} className="rounded-xl border border-border bg-white/80 p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-primary">Detail #{index + 1}</p>
                      {fields.length > 1 ? (
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveRow(index)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="English title" error={detailErrors.title?.message}>
                        <Input placeholder="Detail title" {...register(`details.${index}.title`)} />
                      </Field>
                      <Field label="Hindi title" error={detailErrors.title_hi?.message}>
                        <Input lang="hi" dir="auto" placeholder="Hindi title" {...register(`details.${index}.title_hi`)} />
                      </Field>
                      <Field label="English description" error={detailErrors.description?.message} className="md:col-span-2">
                        <Textarea rows={4} placeholder="Description..." {...register(`details.${index}.description`)} />
                      </Field>
                      <Field label="Hindi description" error={detailErrors.description_hi?.message} className="md:col-span-2">
                        <Textarea rows={4} lang="hi" dir="auto" placeholder="Hindi description..." {...register(`details.${index}.description_hi`)} />
                      </Field>
                      <Field label="Images" hint="Optional images for this detail row." className="md:col-span-2">
                        <Input type="file" accept="image/*" multiple {...register(`details.${index}.media`)} />
                      </Field>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEditing ? 'Save detail' : 'Create guide'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


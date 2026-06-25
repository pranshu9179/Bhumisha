import { zodResolver } from '@hookform/resolvers/zod'
import { Edit2, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useCropDiseaseDeleteMutation, useCropDiseaseSaveMutation, useCropDiseases, useProducts } from '@/services/api/hooks'

const diseaseSchema = z
  .object({
    crop_id: z.string().min(1, 'Crop is required'),
    title: z.string().optional(),
    title_hi: z.string().optional(),
    description: z.string().optional(),
    description_hi: z.string().optional(),
    disease_image: z.any().optional(),
  })
  .superRefine((values, context) => {
    if (!values.title?.trim() && !values.title_hi?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['title'],
        message: 'Add at least one disease title.',
      })
    }
  })

function fileListToArray(value) {
  if (!value) return []
  if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value)
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function CropDiseaseDialog({ open, onOpenChange, disease, crops = [] }) {
  const mutation = useCropDiseaseSaveMutation()
  const [removedImages, setRemovedImages] = useState([])
  const isEditing = Boolean(disease?.id)
  const retainedImages = useMemo(
    () => (disease?.existing_medial_url || []).filter((image) => !removedImages.includes(image)),
    [disease?.existing_medial_url, removedImages],
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(diseaseSchema),
    defaultValues: {
      crop_id: '',
      title: '',
      title_hi: '',
      description: '',
      description_hi: '',
      disease_image: undefined,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      crop_id: disease?.cropId ? String(disease.cropId) : '',
      title: disease?.title || '',
      title_hi: disease?.title_hi || '',
      description: disease?.description || '',
      description_hi: disease?.description_hi || '',
      disease_image: undefined,
    })
  }, [disease, open, reset])

  const onSubmit = async (values) => {
    const images = fileListToArray(values.disease_image)

    if (images.length > 10) {
      toast.error('Upload up to 10 disease images.')
      return
    }

    const payload = {
      crop_id: values.crop_id,
      title: values.title?.trim() || '',
      title_hi: values.title_hi?.trim() || '',
      description: values.description?.trim() || '',
      description_hi: values.description_hi?.trim() || '',
      existing_medial_url: retainedImages,
      existing_media_public_ids: disease?.mediaPublicIds || [],
      disease_image: images,
    }

    try {
      await mutation.mutateAsync({ id: disease?.id, payload })
      toast.success(isEditing ? 'Disease updated successfully.' : 'Disease created successfully.')
      reset()
      setRemovedImages([])
      onOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save crop disease.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit crop disease' : 'Add crop disease'}</DialogTitle>
          <DialogDescription>Manage crop-linked disease titles, symptoms descriptions, and visual references.</DialogDescription>
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
          <Field label="Disease images" hint="Upload up to 10 images. Existing images are retained unless removed.">
            <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp" {...register('disease_image')} />
          </Field>
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
          {retainedImages.length ? (
            <div className="grid gap-3 md:col-span-2 md:grid-cols-4">
              {retainedImages.map((image) => (
                <div key={image} className="relative overflow-hidden rounded-lg border border-border">
                  <PreviewableImage
                    src={image}
                    alt="Disease visual"
                    className="h-28 w-full object-cover"
                    fallbackClassName="h-28 w-full"
                    previewTitle="Disease visual"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => setRemovedImages((items) => [...items, image])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save disease'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CropDiseasesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDisease, setEditingDisease] = useState(null)
  const [cropFilter, setCropFilter] = useState('')
  const activeParams = useMemo(
    () => ({ page: 1, limit: 100, crop_id: cropFilter || undefined }),
    [cropFilter],
  )
  const deletedParams = useMemo(
    () => ({ page: 1, limit: 100, status: 'true', crop_id: cropFilter || undefined }),
    [cropFilter],
  )
  const { data: activeDiseaseResponse = [], isLoading: activeLoading } = useCropDiseases(activeParams)
  const { data: deletedDiseaseResponse = [], isLoading: deletedLoading } = useCropDiseases(deletedParams)
  const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })
  const deleteMutation = useCropDiseaseDeleteMutation()

  const cropMap = useMemo(() => Object.fromEntries(crops.map((crop) => [String(crop.id), crop.name])), [crops])
  const activeDiseases = useMemo(
    () => activeDiseaseResponse.filter((disease) => disease.status !== 'deleted'),
    [activeDiseaseResponse],
  )
  const deletedDiseases = useMemo(
    () => deletedDiseaseResponse.filter((disease) => disease.status === 'deleted'),
    [deletedDiseaseResponse],
  )
  const allDiseases = useMemo(() => {
    const byId = new Map()
    activeDiseases.concat(deletedDiseases).forEach((disease) => byId.set(String(disease.id), disease))
    return Array.from(byId.values())
  }, [activeDiseases, deletedDiseases])

  const filterSlot = (
    <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="max-w-xs">
      <option value="">All crops</option>
      {crops.map((crop) => (
        <option key={crop.id} value={crop.id}>
          {crop.name}
        </option>
      ))}
    </NativeSelect>
  )

  const columns = useMemo(
    () => [
      {
        header: 'Visual',
        accessorKey: 'medial_url',
        enableSorting: false,
        cell: ({ row }) =>
          <PreviewableImage
            src={row.original.medial_url?.[0]}
            alt={row.original.title || 'Disease'}
            className="h-12 w-16 rounded-lg object-cover"
            fallbackClassName="h-12 w-16"
            previewTitle={`${row.original.title || 'Disease'} visual`}
          />,
      },
      { header: 'Disease', accessorKey: 'title' },
      { header: 'Hindi title', accessorKey: 'title_hi', cell: ({ row }) => row.original.title_hi || '-' },
      { header: 'Crop', accessorKey: 'cropId', cell: ({ row }) => cropMap[String(row.original.cropId)] || row.original.cropName || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.title || 'Disease'} details`}
              description="Crop disease details and retained media references."
              record={row.original}
              fields={[
                { label: 'ID', value: row.original.id },
                { label: 'Crop', value: cropMap[String(row.original.cropId)] || row.original.cropName },
                { label: 'English title', value: row.original.title },
                { label: 'Hindi title', value: row.original.title_hi },
                { label: 'English description', value: row.original.description },
                { label: 'Hindi description', value: row.original.description_hi },
                { label: 'Images', value: row.original.medial_url?.join(', ') },
                { label: 'Status', value: row.original.status },
              ]}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                setEditingDisease(row.original)
                setDialogOpen(true)
              }}
              disabled={row.original.status === 'deleted'}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.title || 'this disease'} from the catalog?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Disease deleted successfully.'))
              }
              disabled={row.original.status === 'deleted'}
            />
          </div>
        ),
      },
    ],
    [cropMap, deleteMutation],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Diagnostic catalog"
        title="Crop diseases"
        description="Create, update, and manage crop disease visual references used for crop diagnostics."
        compact
        actions={
          <Button
            onClick={() => {
              setEditingDisease(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add disease
          </Button>
        }
      />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeDiseases.length})</TabsTrigger>
          <TabsTrigger value="deleted">Deleted ({deletedDiseases.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allDiseases.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeDiseases}
            searchPlaceholder="Search active diseases"
            emptyMessage={activeLoading ? 'Loading diseases...' : 'No active diseases found.'}
            filterSlot={filterSlot}
            onBulkDelete={async (rows) => {
              for (const row of rows) {
                await deleteMutation.mutateAsync(row.id)
              }
              toast.success(`${rows.length} disease${rows.length === 1 ? '' : 's'} deleted successfully.`)
            }}
            bulkDeleteConfirmMessage="Delete selected crop diseases?"
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DataTable
            columns={columns}
            data={deletedDiseases}
            searchPlaceholder="Search deleted diseases"
            emptyMessage={deletedLoading ? 'Loading deleted diseases...' : 'No deleted diseases found.'}
            filterSlot={filterSlot}
          />
        </TabsContent>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={allDiseases}
            searchPlaceholder="Search diseases"
            emptyMessage={activeLoading || deletedLoading ? 'Loading diseases...' : 'No diseases found.'}
            filterSlot={filterSlot}
            onBulkDelete={async (rows) => {
              const deletableRows = rows.filter((row) => row.status !== 'deleted')
              for (const row of deletableRows) {
                await deleteMutation.mutateAsync(row.id)
              }
              toast.success(`${deletableRows.length} disease${deletableRows.length === 1 ? '' : 's'} deleted successfully.`)
            }}
            bulkDeleteConfirmMessage="Delete selected active crop diseases? Deleted rows will be skipped."
          />
        </TabsContent>
      </Tabs>

      <CropDiseaseDialog
        key={editingDisease?.id || 'new-disease'}
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingDisease(null)
        }}
        disease={editingDisease}
        crops={crops.filter((crop) => crop.status !== 'deleted')}
      />
    </div>
  )
}

export default CropDiseasesPage

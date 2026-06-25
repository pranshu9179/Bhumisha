import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Link2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useGuideHeadings, useGuideParentDeleteMutation, useGuideParentSaveMutation, useGuideParents, useProducts } from '@/services/api/hooks'

const schema = z.object({
  crops_guid_heading_id: z.string().min(1, 'Heading is required'),
  crop_id: z.string().min(1, 'Crop is required'),
})

function apiId(value) {
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

export function GuideParentsPage() {
  const [editingId, setEditingId] = useState(null)
  const { data: parents = [] } = useGuideParents()
  const { data: headings = [] } = useGuideHeadings()
  const { data: crops = [] } = useProducts()
  const saveMutation = useGuideParentSaveMutation()
  const deleteMutation = useGuideParentDeleteMutation()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      crops_guid_heading_id: '',
      crop_id: '',
    },
  })

  const headingMap = useMemo(() => Object.fromEntries(headings.map((heading) => [heading.id, heading.title])), [headings])
  const cropMap = useMemo(() => Object.fromEntries(crops.map((crop) => [crop.id, crop.name])), [crops])

  const columns = useMemo(
    () => [
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => row.original.cropName || cropMap[row.original.cropId] || '-' },
      { header: 'Heading', accessorKey: 'headingName', cell: ({ row }) => row.original.headingName || headingMap[row.original.headingId] || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Guide parent ${row.original.id}`}
              description="Crop to guide heading parent link."
              record={row.original}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                setEditingId(row.original.id)
                form.reset({
                  crops_guid_heading_id: String(row.original.crops_guid_heading_id || row.original.headingId || ''),
                  crop_id: String(row.original.crop_id || row.original.cropId || ''),
                })
              }}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={(event) => {
                event.stopPropagation()
                return deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Guide parent deleted.'))
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [cropMap, deleteMutation, form, headingMap],
  )

  const saveParent = async (values) => {
    await saveMutation.mutateAsync({
      id: editingId,
      payload: {
        crops_guid_heading_id: apiId(values.crops_guid_heading_id),
        crop_id: apiId(values.crop_id),
      },
    })
    toast.success(editingId ? 'Guide parent updated.' : 'Guide parent created.')
    setEditingId(null)
    form.reset({ crops_guid_heading_id: '', crop_id: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crop guides"
        title="Guide parents"
        description="Link crops to guide headings through the documented crop guide parent endpoints."
        compact
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2 font-semibold text-dark">
            <Link2 className="h-4 w-4" />
            {editingId ? 'Update parent link' : 'New parent link'}
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(saveParent)}>
            <Field label="Crop" error={form.formState.errors.crop_id?.message}>
              <NativeSelect {...form.register('crop_id')}>
                <option value="">Select crop</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Heading" error={form.formState.errors.crops_guid_heading_id?.message}>
              <NativeSelect {...form.register('crops_guid_heading_id')}>
                <option value="">Select heading</option>
                {headings.map((heading) => (
                  <option key={heading.id} value={heading.id}>
                    {heading.title}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="flex justify-end gap-2 md:col-span-2">
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null)
                    form.reset({ crops_guid_heading_id: '', crop_id: '' })
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saveMutation.isPending}>
                {editingId ? 'Update link' : 'Create link'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={parents} searchPlaceholder="Search guide parent links" />
    </div>
  )
}

export default GuideParentsPage

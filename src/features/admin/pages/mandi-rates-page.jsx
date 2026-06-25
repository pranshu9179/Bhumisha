import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { useMandiRateDeleteMutation, useMandiRateSaveMutation, useMandiRates, useProducts } from '@/services/api/hooks'

const schema = z.object({
  record_date: z.string().min(1, 'Date is required'),
  crop_id: z.string().min(1, 'Crop is required'),
  min_price: z.coerce.number().min(1, 'Minimum price is required'),
  max_price: z.coerce.number().min(1, 'Maximum price is required'),
  total_modal: z.coerce.number().min(1, 'Modal price is required'),
})

const defaultValues = {
  record_date: new Date().toISOString().slice(0, 10),
  crop_id: '',
  min_price: 0,
  max_price: 0,
  total_modal: 0,
}

export function MandiRatesPage() {
  const [editingId, setEditingId] = useState(null)
  const { data: rates = [] } = useMandiRates()
  const { data: crops = [] } = useProducts()
  const saveMutation = useMandiRateSaveMutation()
  const deleteMutation = useMandiRateDeleteMutation()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const columns = useMemo(
    () => [
      { header: 'Date', accessorKey: 'record_date', cell: ({ row }) => formatDate(row.original.record_date) },
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => row.original.cropName || row.original.crop_name || '-' },
      { header: 'Min', accessorKey: 'min_price', cell: ({ row }) => formatCurrency(row.original.min_price) },
      { header: 'Max', accessorKey: 'max_price', cell: ({ row }) => formatCurrency(row.original.max_price) },
      { header: 'Modal', accessorKey: 'total_modal', cell: ({ row }) => formatCurrency(row.original.total_modal) },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Mandi rate ${formatDate(row.original.record_date)}`}
              description="Mandi rate record from /mandi."
              record={row.original}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                setEditingId(row.original.id)
                form.reset({
                  record_date: String(row.original.record_date || '').slice(0, 10),
                  crop_id: String(row.original.crop_id || row.original.cropId || ''),
                  min_price: row.original.min_price,
                  max_price: row.original.max_price,
                  total_modal: row.original.total_modal,
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
                  .then(() => toast.success('Mandi rate deleted.'))
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation, form],
  )

  const saveRate = async (values) => {
    await saveMutation.mutateAsync({
      id: editingId,
      payload: {
        ...values,
        crop_id: Number(values.crop_id),
      },
    })
    toast.success(editingId ? 'Mandi rate updated.' : 'Mandi rate created.')
    setEditingId(null)
    form.reset(defaultValues)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Market prices"
        title="Mandi rates"
        description="Create, update, and remove daily mandi price records."
        compact
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2 font-semibold text-dark">
            <Plus className="h-4 w-4" />
            {editingId ? 'Update mandi rate' : 'New mandi rate'}
          </div>
          <form className="grid gap-4 md:grid-cols-5" onSubmit={form.handleSubmit(saveRate)}>
            <Field label="Date" error={form.formState.errors.record_date?.message}>
              <Input type="date" {...form.register('record_date')} />
            </Field>
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
            <Field label="Minimum Value (₹)" error={form.formState.errors.min_price?.message}>
              <Input type="number" {...form.register('min_price')} />
            </Field>
            <Field label="Maximum Value (₹)" error={form.formState.errors.max_price?.message}>
              <Input type="number" {...form.register('max_price')} />
            </Field>
            <Field label="Total Modal Value (₹)" error={form.formState.errors.total_modal?.message}>
              <Input type="number" {...form.register('total_modal')} />
            </Field>
            <div className="flex justify-end gap-2 md:col-span-5">
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null)
                    form.reset(defaultValues)
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saveMutation.isPending}>
                {editingId ? 'Update rate' : 'Create rate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={rates} searchPlaceholder="Search mandi rates" />
    </div>
  )
}

export default MandiRatesPage

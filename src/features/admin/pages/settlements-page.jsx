import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeIndianRupee, Plus } from 'lucide-react'
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
import { useSettlementSaveMutation, useSettlements, useVendors } from '@/services/api/hooks'

const schema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  amount: z.coerce.number().min(1, 'Amount is required'),
  remark: z.string().optional(),
  proof_image: z.any().optional(),
})

function apiId(value) {
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

export function SettlementsPage() {
  const { data: vendors = [] } = useVendors()
  const [vendorFilter, setVendorFilter] = useState('')
  const { data: settlements = [] } = useSettlements({
    vendorId: vendorFilter || undefined,
  })
  const saveMutation = useSettlementSaveMutation()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vendorId: '',
      amount: 0,
      remark: '',
      proof_image: null,
    },
  })

  const vendorMap = useMemo(
    () => Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor.company_name || vendor.full_name || vendor.username || vendor.id])),
    [vendors],
  )

  const columns = useMemo(
    () => [
      { header: 'Vendor', accessorKey: 'vendorName', cell: ({ row }) => row.original.vendorName || vendorMap[row.original.vendorId] || '-' },
      { header: 'Amount', accessorKey: 'amount', cell: ({ row }) => formatCurrency(row.original.amount) },
      { header: 'Remark', accessorKey: 'remark' },
      { header: 'Proof', accessorKey: 'proofImage', cell: ({ row }) => (row.original.proofImage || row.original.proof_image ? 'Uploaded' : '-') },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <RecordDetailsDialog
            title={`Settlement ${row.original.id}`}
            description="Settlement payment record and proof metadata."
            record={row.original}
          />
        ),
      },
    ],
    [vendorMap],
  )

  const createSettlement = async (values) => {
    await saveMutation.mutateAsync({
      vendorId: apiId(values.vendorId),
      amount: values.amount,
      remark: values.remark,
      proof_image: values.proof_image?.[0],
    })
    form.reset({ vendorId: '', amount: 0, remark: '', proof_image: null })
    toast.success('Settlement recorded.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor payments"
        title="Settlements"
        description="Record vendor payouts with optional proof images and review settlement history."
        compact
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2 font-semibold text-dark">
            <Plus className="h-4 w-4" />
            New settlement
          </div>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={form.handleSubmit(createSettlement)}>
            <Field label="Vendor" error={form.formState.errors.vendorId?.message}>
              <NativeSelect {...form.register('vendorId')}>
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name || vendor.full_name || vendor.username || vendor.id}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Amount" error={form.formState.errors.amount?.message}>
              <Input type="number" {...form.register('amount')} />
            </Field>
            <Field label="Remark">
              <Input {...form.register('remark')} />
            </Field>
            <Field label="Proof image">
              <Input type="file" accept="image/*" {...form.register('proof_image')} />
            </Field>
            <div className="flex justify-end md:col-span-2 xl:col-span-4">
              <Button type="submit" disabled={saveMutation.isPending}>
                <BadgeIndianRupee className="h-4 w-4" />
                Record settlement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={settlements}
        searchPlaceholder="Search settlements"
        filterSlot={(
          <NativeSelect value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)} className="max-w-xs">
            <option value="">All vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.company_name || vendor.full_name || vendor.username || vendor.id}
              </option>
            ))}
          </NativeSelect>
        )}
      />
    </div>
  )
}

export default SettlementsPage

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
import { useBrokerageDeals, useSalesReport, useSettlementSaveMutation, useSettlements, useVendors } from '@/services/api/hooks'

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

  const selectedVendorId = form.watch('vendorId')
  const { data: allDeals = [] } = useBrokerageDeals()
  const { data: salesReport = {} } = useSalesReport({ vendorId: selectedVendorId || undefined })
  const { data: vendorSettlements = [] } = useSettlements({ vendorId: selectedVendorId || undefined })

  const balanceInfo = useMemo(() => {
    if (!selectedVendorId) return null

    const vendorDeals = allDeals.filter(d => String(d.vendor_id || d.vendorId) === String(selectedVendorId))
    const totalCommission = vendorDeals.reduce((sum, deal) => sum + Number(deal.commission_amount || deal.commissionAmount || 0), 0)
    
    const totalSales = Number(salesReport.totalAmount || salesReport.total_amount || 0)

    // Calculate how much admin has already paid to this vendor
    // Only count settlements that are essentially "paid" to vendor. Assuming all logged settlements are paid.
    const alreadyPaid = vendorSettlements.reduce((sum, s) => sum + Number(s.amount || 0), 0)

    if (totalCommission > totalSales) {
      const leftAmount = totalCommission - totalSales
      return { 
        type: 'admin_collects', 
        amount: leftAmount, 
        totalSales,
        totalCommission,
        alreadyPaid,
        message: `Admin has to take ${formatCurrency(leftAmount)} from vendor.` 
      }
    } else {
      const totalAdminOwes = totalSales - totalCommission
      const remainingToPay = Math.max(0, totalAdminOwes - alreadyPaid)
      return { 
        type: 'admin_pays', 
        amount: remainingToPay, 
        totalAdminOwes, 
        totalSales,
        totalCommission,
        alreadyPaid, 
        message: `Admin has to give ${formatCurrency(remainingToPay)} to vendor.` 
      }
    }
  }, [selectedVendorId, allDeals, salesReport, vendorSettlements])

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

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-dark/70">Select Vendor for Settlement & Ledger</label>
        <NativeSelect className="max-w-md bg-white shadow-sm" {...form.register('vendorId')}>
          <option value="">Select vendor to view ledger...</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.company_name || vendor.full_name || vendor.username || vendor.id}
            </option>
          ))}
        </NativeSelect>
        {form.formState.errors.vendorId && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.vendorId.message}</p>
        )}
      </div>

      {balanceInfo && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm">
              <CardContent className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-dark/60 mb-2">Total Valid Sales (कुल बिक्री)</div>
                <div className="text-3xl font-bold text-dark">₹{balanceInfo.totalSales.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-l-4 border-l-emerald-500 shadow-sm">
              <CardContent className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-dark/60 mb-2">Share Owed to Vendor (वेंडर का हिस्सा)</div>
                <div className="text-3xl font-bold text-dark">₹{balanceInfo.totalSales.toLocaleString('en-IN')}</div>
                <div className="text-xs text-dark/50 mt-2">Vendor is entitled to Min Vendor Price for all sales.</div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-l-4 border-l-rose-500 shadow-sm">
              <CardContent className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-dark/60 mb-2">Service Deals Commission</div>
                <div className="text-3xl font-bold text-dark">₹{balanceInfo.totalCommission.toLocaleString('en-IN')}</div>
                <div className="text-xs text-dark/50 mt-2">Owed to Admin from facilitated machinery/service deals.</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="h-full shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wider text-dark/70 mb-3">Outstanding Balance (बकाया हिसाब)</div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${balanceInfo.type === 'admin_pays' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    <div className={`h-2 w-2 rounded-full ${balanceInfo.type === 'admin_pays' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {balanceInfo.type === 'admin_pays' ? 'Vendor owes Admin (वेंडर द्वारा देय)' : 'Admin owes Vendor (एडमिन द्वारा देय)'}
                  </div>
                </div>
                
                <div>
                  <div className={`text-4xl font-serif ${balanceInfo.type === 'admin_pays' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{(balanceInfo.type === 'admin_pays' ? balanceInfo.totalAdminOwes : balanceInfo.amount).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-dark/60 mt-1 font-medium">Total Settled so far: ₹{balanceInfo.alreadyPaid.toLocaleString('en-IN')}</div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium text-dark/60 mb-1">Remaining Balance to Settle:</div>
                  <div className="text-2xl font-serif text-rose-600">
                    ₹{balanceInfo.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 font-semibold text-emerald-700 mb-6">
                  <BadgeIndianRupee className="h-5 w-5" />
                  Log Settlement Payment (भुगतान सेटलमेंट दर्ज करें)
                </div>
                <form className="space-y-4" onSubmit={form.handleSubmit(createSettlement)}>
                  <Field label="SETTLEMENT AMOUNT (राशि) *" error={form.formState.errors.amount?.message}>
                    <Input 
                      type="number" 
                      placeholder="Enter amount settled..."
                      {...form.register('amount')} 
                      disabled={balanceInfo.type === 'admin_collects'}
                      max={balanceInfo.type === 'admin_pays' ? balanceInfo.amount : undefined} 
                      min={1}
                    />
                  </Field>
                  <Field label="REMARK / NOTE (टिप्पणी) *">
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add payment method, txn ref details..."
                      {...form.register('remark')} 
                    />
                  </Field>
                  <Field label="Upload Payment Proof Photo (optional)">
                    <Input type="file" accept="image/*" {...form.register('proof_image')} className="text-sm file:mr-4 file:bg-transparent file:text-sm file:font-medium" />
                  </Field>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saveMutation.isPending || balanceInfo.type === 'admin_collects'}>
                      Log Settlement
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!balanceInfo && (
        <Card className="bg-dark/5 border-dashed shadow-none">
          <CardContent className="p-12 text-center text-dark/60 font-medium">
            Select a vendor from the dropdown above to view their financial ledger and log settlements.
          </CardContent>
        </Card>
      )}

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

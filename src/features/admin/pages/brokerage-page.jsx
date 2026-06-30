import { zodResolver } from '@hookform/resolvers/zod'
import { Handshake, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useBrokerageDealSaveMutation, useBrokerageDeals, useBrokerageLeadSaveMutation, useBrokerageLeads, useServiceBookings, useUsers, useVendors } from '@/services/api/hooks'

const leadSchema = z.object({
  categoryName: z.string().min(2, 'Category is required'),
  notes: z.string().optional(),
})

const dealSchema = z.object({
  leadRequestId: z.string().optional(),
  serviceBookingId: z.string().optional(),
  vendorId: z.string().min(1, 'Vendor is required'),
  userId: z.string().min(1, 'User is required'),
  dealAmount: z.coerce.number().min(1, 'Deal amount is required'),
  commissionAmount: z.coerce.number().min(0, 'Commission cannot be negative'),
  notes: z.string().optional(),
}).refine((values) => !(values.leadRequestId && values.serviceBookingId), {
  message: 'Use either a lead request or a service booking.',
  path: ['serviceBookingId'],
})

function apiId(value) {
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

export function BrokeragePage() {
  const { data: leads = [] } = useBrokerageLeads()
  const { data: serviceBookings = [] } = useServiceBookings({ page: 1, limit: 100 })
  const { data: deals = [] } = useBrokerageDeals()
  const { data: vendors = [] } = useVendors()
  const { data: users = [] } = useUsers({ role: 'user' })
  const leadMutation = useBrokerageLeadSaveMutation()
  const dealMutation = useBrokerageDealSaveMutation()
  const leadForm = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      categoryName: 'Soil Testing',
      notes: '',
    },
  })
  const dealForm = useForm({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      leadRequestId: '',
      serviceBookingId: '',
      vendorId: '',
      userId: '',
      dealAmount: 0,
      commissionAmount: 0,
      notes: '',
    },
  })

  const [isLogDealOpen, setIsLogDealOpen] = useState(false)
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user.name])), [users])

  const leadColumns = useMemo(
    () => [
      { header: 'Lead', accessorKey: 'id' },
      { header: 'Category', accessorKey: 'categoryName' },
      { header: 'Requester', accessorKey: 'userName', cell: ({ row }) => row.original.userName || row.original.customerName || userMap[row.original.userId] || '-' },
      { header: 'Phone', accessorKey: 'customerPhone', cell: ({ row }) => row.original.customerPhone || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Notes', accessorKey: 'notes' },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.categoryName || row.original.id} lead`}
              description="Brokerage lead details and request metadata."
              record={row.original}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                dealForm.setValue('leadRequestId', row.original.id)
                dealForm.setValue('serviceBookingId', '')
                dealForm.setValue('userId', row.original.userId || '')
              }}
            >
              Use lead
            </Button>
          </div>
        ),
      },
    ],
    [dealForm, userMap],
  )

  const dealColumns = useMemo(
    () => [
      { header: 'Deal', accessorKey: 'id' },
      {
        header: 'Source',
        accessorKey: 'source',
        cell: ({ row }) => row.original.serviceBookingId ? `Booking ${row.original.serviceBookingId}` : row.original.leadRequestId ? `Lead ${row.original.leadRequestId}` : '-',
      },
      { header: 'Category', accessorKey: 'category_name', cell: ({ row }) => row.original.category_name || '-' },
      { header: 'Vendor', accessorKey: 'vendor_name', cell: ({ row }) => row.original.vendor_name || row.original.vendorName || '-' },
      { header: 'Customer', accessorKey: 'customer_name', cell: ({ row }) => row.original.customer_name || row.original.customerName || '-' },
      { header: 'Deal amount', accessorKey: 'dealAmount', cell: ({ row }) => Number(row.original.dealAmount || 0).toLocaleString('en-IN') },
      { header: 'Commission', accessorKey: 'commissionAmount', cell: ({ row }) => Number(row.original.commissionAmount || 0).toLocaleString('en-IN') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <RecordDetailsDialog
            title={`Deal ${row.original.id}`}
            description="Brokerage deal details from /brokerage/deals."
            record={row.original}
          />
        ),
      },
    ],
    [],
  )

  const serviceBookingColumns = useMemo(
    () => [
      { header: 'Booking', accessorKey: 'id' },
      { header: 'Category', accessorKey: 'category_name', cell: ({ row }) => row.original.category_name || row.original.categoryName || '-' },
      { header: 'Farmer', accessorKey: 'name', cell: ({ row }) => row.original.name || row.original.user_name || '-' },
      { header: 'Phone', accessorKey: 'phone_number', cell: ({ row }) => row.original.phone_number || row.original.phoneNumber || '-' },
      { header: 'Vendor', accessorKey: 'vendor_name', cell: ({ row }) => row.original.vendor_name || row.original.vendorName || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Service booking ${row.original.id}`}
              description="Service booking details available for brokerage deal logging."
              record={row.original}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                dealForm.setValue('serviceBookingId', row.original.id)
                dealForm.setValue('leadRequestId', '')
                dealForm.setValue('vendorId', row.original.vendorId || row.original.vendor_id || '')
                dealForm.setValue('userId', row.original.userId || row.original.user_id || '')
                setIsLogDealOpen(true)
              }}
            >
              Use booking
            </Button>
          </div>
        ),
      },
    ],
    [dealForm],
  )

  const createLead = async (values) => {
    await leadMutation.mutateAsync({
      categoryName: values.categoryName,
      notes: values.notes,
    })
    leadForm.reset({ categoryName: 'Soil Testing', notes: '' })
    toast.success('Brokerage lead created.')
  }

  const createDeal = async (values) => {
    await dealMutation.mutateAsync({
      leadRequestId: values.leadRequestId ? apiId(values.leadRequestId) : undefined,
      serviceBookingId: values.serviceBookingId ? apiId(values.serviceBookingId) : undefined,
      vendorId: apiId(values.vendorId),
      userId: apiId(values.userId),
      dealAmount: values.dealAmount,
      commissionAmount: values.commissionAmount,
      notes: values.notes,
    })
    dealForm.reset()
    toast.success('Brokerage deal logged.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Group B services"
        title="Brokerage leads and deals"
        description="Capture service leads, review incoming requests, and log completed deals with commission values."
        compact
      />

      {/* <div className="grid gap-4 xl:grid-cols-2">
        <Card> ... Leads form ... </Card>
        <Card> ... Log deal form ... </Card>
      </div> */}

      <Tabs defaultValue="service-bookings" className="space-y-4">
        <TabsList>
          {/* <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger> */}
          <TabsTrigger value="service-bookings">Service bookings ({serviceBookings.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
        </TabsList>
        {/* <TabsContent value="leads">
          <DataTable columns={leadColumns} data={leads} searchPlaceholder="Search brokerage leads" />
        </TabsContent> */}
        <TabsContent value="service-bookings">
          <DataTable columns={serviceBookingColumns} data={serviceBookings} searchPlaceholder="Search service bookings" />
        </TabsContent>
        <TabsContent value="deals">
          <DataTable columns={dealColumns} data={deals} searchPlaceholder="Search brokerage deals" />
        </TabsContent>
      </Tabs>

      <Dialog open={isLogDealOpen} onOpenChange={setIsLogDealOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Log deal
            </DialogTitle>
            <DialogDescription>
              Record a completed brokerage deal with commission details.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={dealForm.handleSubmit(async (values) => {
              await createDeal(values)
              setIsLogDealOpen(false)
            })}
          >
            <input type="hidden" {...dealForm.register('leadRequestId')} />
            <input type="hidden" {...dealForm.register('serviceBookingId')} />
            
            <Field label="Vendor" error={dealForm.formState.errors.vendorId?.message}>
              <NativeSelect {...dealForm.register('vendorId')}>
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name || vendor.full_name || vendor.username || vendor.id}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="User" error={dealForm.formState.errors.userId?.message}>
              <NativeSelect {...dealForm.register('userId')}>
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Deal amount" error={dealForm.formState.errors.dealAmount?.message}>
              <Input type="number" {...dealForm.register('dealAmount')} />
            </Field>
            <Field label="Commission" error={dealForm.formState.errors.commissionAmount?.message}>
              <Input type="number" {...dealForm.register('commissionAmount')} />
            </Field>
            <Field label="Notes" className="md:col-span-2">
              <Input {...dealForm.register('notes')} />
            </Field>
            <div className="flex justify-end md:col-span-2 pt-2">
              <Button type="submit" disabled={dealMutation.isPending}>
                Log deal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BrokeragePage

import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Handshake } from 'lucide-react'
import { Field } from '@/components/forms/field'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { useOrderUpdateMutation, useOrders, usePaymentStatusMutation, useReturnHandleMutation, useReturnRequests, useSalesReport, useServiceBookingStatusMutation, useServiceBookings, useShopProducts, useVendors, useBrokerageDealSaveMutation, useUsers } from '@/services/api/hooks'

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

const ORDER_STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Failed']
const SERVICE_BOOKING_STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled']
const COMMERCE_TABS = ['orders', 'returns', 'service-bookings', 'sales']

function selectedStatus(options, value) {
  const normalized = String(value || '').toLowerCase()
  return options.find((option) => option.toLowerCase() === normalized) || options[0]
}

function vendorLabel(vendor) {
  return vendor?.company_name || vendor?.companyName || vendor?.full_name || vendor?.fullName || vendor?.name || vendor?.username || vendor?.id
}

function orderVendorName(order, vendorMap) {
  return order.vendorName || order.vendor_name || vendorMap[order.vendorId] || vendorMap[order.vendor_id]
}

function productVendorLabel(product, vendorMap) {
  return (
    product?.vendorName ||
    product?.vendor_name ||
    product?.company_name ||
    product?.companyName ||
    vendorMap[product?.vendorId] ||
    vendorMap[product?.vendor_id] ||
    vendorMap[product?.userId] ||
    vendorMap[product?.user_id]
  )
}

function orderProductVendorName(order, productVendorMap) {
  return productVendorMap[order.productId] || productVendorMap[order.product_id] || productVendorMap[order.productName] || productVendorMap[order.product_name]
}

function isToday(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: orders = [] } = useOrders()
  const { data: returnRequests = [] } = useReturnRequests()
  const { data: serviceBookings = [] } = useServiceBookings({ page: 1, limit: 100 })
  const { data: vendors = [] } = useVendors()
  const { data: products = [] } = useShopProducts({ limit: 100 })
  const [salesFilters, setSalesFilters] = useState({
    vendorId: '',
    month: '',
    year: String(new Date().getFullYear()),
  })
  const salesParams = useMemo(
    () => ({
      vendorId: salesFilters.vendorId || undefined,
      month: salesFilters.month || undefined,
      year: salesFilters.year || undefined,
    }),
    [salesFilters],
  )
  const { data: salesReport = {} } = useSalesReport(salesParams)
  const statusMutation = useOrderUpdateMutation()
  const paymentMutation = usePaymentStatusMutation()
  const returnMutation = useReturnHandleMutation()
  const serviceBookingStatusMutation = useServiceBookingStatusMutation()
  const requestedTab = searchParams.get('tab') || 'orders'
  const currentTab = COMMERCE_TABS.includes(requestedTab) ? requestedTab : 'orders'
  
  const filterDate = searchParams.get('filter_date')
  const filterStatus = searchParams.get('filter_status')

  const filteredOrders = useMemo(() => {
    let result = orders
    if (filterDate === 'today') {
      result = result.filter((o) => isToday(o.createdAt || o.created_at))
    }
    if (filterStatus) {
      const normalizedStatus = filterStatus.toLowerCase()
      result = result.filter((o) => {
        const status = String(o.orderStatus || o.order_status || o.fulfillmentStatus || '').toLowerCase()
        if (normalizedStatus === 'pending') {
          return ['pending', 'processing'].includes(status)
        }
        if (normalizedStatus === 'dispatched') {
          return ['dispatched', 'shipped'].includes(status)
        }
        return status === normalizedStatus
      })
    }
    return result
  }, [orders, filterDate, filterStatus])

  const filteredServiceBookings = useMemo(() => {
    let result = serviceBookings
    if (filterDate === 'today') {
      result = result.filter((b) => isToday(b.createdAt || b.created_at))
    }
    if (filterStatus) {
      result = result.filter((b) => String(b.status || '').toLowerCase() === filterStatus.toLowerCase())
    }
    return result
  }, [serviceBookings, filterDate, filterStatus])

  const vendorMap = useMemo(
    () =>
      Object.fromEntries(
        vendors
          .flatMap((vendor) => [vendor.id, vendor.vendor_id, vendor.vendorId, vendor.userId, vendor.user_id].filter(Boolean).map((id) => [id, vendorLabel(vendor)])),
      ),
    [vendors],
  )
  const productVendorMap = useMemo(
    () =>
      Object.fromEntries(
        products.flatMap((product) => {
          const label = productVendorLabel(product, vendorMap)
          if (!label) return []
          return [product.id, product.product_id, product.productId, product.name, product.product_name]
            .filter(Boolean)
            .map((id) => [id, label])
        }),
      ),
    [products, vendorMap],
  )

  const columns = useMemo(
    () => [
      { header: 'Order ID', accessorKey: 'id' },
      { header: 'Vendor', accessorKey: 'vendorName', cell: ({ row }) => orderVendorName(row.original, vendorMap) || orderProductVendorName(row.original, productVendorMap) || '-' },
      { header: 'Customer', accessorKey: 'customerName' },
      { header: 'Product', accessorKey: 'productName', cell: ({ row }) => row.original.productName || row.original.product_name || '-' },
      { header: 'Qty', accessorKey: 'quantity' },
      { header: 'Total', accessorKey: 'total', cell: ({ row }) => formatCurrency(row.original.total) },
      { header: 'Payment', accessorKey: 'paymentStatus', cell: ({ row }) => <StatusBadge value={row.original.paymentStatus} /> },
      { header: 'Fulfillment', accessorKey: 'fulfillmentStatus', cell: ({ row }) => <StatusBadge value={row.original.fulfillmentStatus} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Order metadata, payment state, and fulfillment context."
              record={row.original}
            />
            <NativeSelect
              className="h-9 w-32"
              value={selectedStatus(PAYMENT_STATUS_OPTIONS, row.original.payment_status || row.original.paymentStatus)}
              disabled={paymentMutation.isPending}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                paymentMutation
                  .mutateAsync({ id: row.original.id, payload: { paymentStatus: event.target.value } })
                  .then(() => toast.success(`Payment marked ${event.target.value}.`))
              }
            >
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              className="h-9 w-36"
              value={selectedStatus(ORDER_STATUS_OPTIONS, row.original.order_status || row.original.orderStatus || row.original.fulfillmentStatus)}
              disabled={statusMutation.isPending}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                statusMutation
                  .mutateAsync({ id: row.original.id, payload: { orderStatus: event.target.value } })
                  .then(() => toast.success(`Order moved to ${event.target.value}.`))
              }
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
          </div>
        ),
      },
    ],
    [paymentMutation, productVendorMap, statusMutation, vendorMap],
  )

  const returnColumns = useMemo(
    () => [
      { header: 'Return ID', accessorKey: 'id' },
      { header: 'Order', accessorKey: 'orderId' },
      { header: 'Product', accessorKey: 'productName' },
      { header: 'Quantity', accessorKey: 'quantity' },
      { header: 'Reason', accessorKey: 'reason' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Return ${row.original.id}`}
              description="Return request metadata, evidence, and handling status."
              record={row.original}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                return returnMutation
                  .mutateAsync({ id: row.original.id, status: 'Accepted' })
                  .then(() => toast.success('Return request accepted.'))
              }}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={(event) => {
                event.stopPropagation()
                return returnMutation
                  .mutateAsync({ id: row.original.id, status: 'Rejected' })
                  .then(() => toast.success('Return request rejected.'))
              }}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ],
    [returnMutation],
  )
  const serviceBookingColumns = useMemo(
    () => [
      { header: 'Booking', accessorKey: 'id' },
      { header: 'Farmer', accessorKey: 'name', cell: ({ row }) => row.original.name || row.original.user_name || '-' },
      { header: 'Phone', accessorKey: 'phone_number', cell: ({ row }) => row.original.phone_number || row.original.phoneNumber || '-' },
      { header: 'Vendor', accessorKey: 'vendor_name', cell: ({ row }) => row.original.vendor_name || row.original.vendorName || vendorMap[row.original.vendor_id] || '-' },
      { header: 'Category', accessorKey: 'category_name', cell: ({ row }) => row.original.category_name || row.original.categoryName || '-' },
      { header: 'Remark', accessorKey: 'remark', cell: ({ row }) => row.original.remark || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt || row.original.created_at, 'DD MMM') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Service booking ${row.original.id}`}
              description="Service booking request, vendor, user, and status details."
              record={row.original}
            />
            <NativeSelect
              className="h-9 w-36"
              value={selectedStatus(SERVICE_BOOKING_STATUS_OPTIONS, row.original.status)}
              disabled={serviceBookingStatusMutation.isPending}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                serviceBookingStatusMutation
                  .mutateAsync({ id: row.original.id, status: event.target.value })
                  .then(() => toast.success(`Service booking marked ${event.target.value}.`))
              }
            >
              {SERVICE_BOOKING_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
          </div>
        ),
      },
    ],
    [serviceBookingStatusMutation, vendorMap],
  )
  const salesRows = salesReport.rows || salesReport.data || []
  const salesColumns = useMemo(
    () => [
      { header: 'Order', accessorKey: 'orderId' },
      { header: 'Vendor', accessorKey: 'vendorName', cell: ({ row }) => row.original.vendorName || row.original.vendor_name || '-' },
      { header: 'Customer', accessorKey: 'customerName', cell: ({ row }) => row.original.customerName || row.original.customer_name || '-' },
      { header: 'Product', accessorKey: 'productName', cell: ({ row }) => row.original.productName || row.original.product_name || '-' },
      { header: 'Qty', accessorKey: 'quantity' },
      { header: 'Item total', accessorKey: 'itemTotal', cell: ({ row }) => formatCurrency(row.original.itemTotal || row.original.item_total) },
      { header: 'Order status', accessorKey: 'orderStatus', cell: ({ row }) => <StatusBadge value={row.original.orderStatus || row.original.order_status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt || row.original.created_at, 'DD MMM YYYY') },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commerce operations"
        title="Orders oversight"
        description="Track marketplace orders and fulfillment using documented order endpoints."
        compact
      />
      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          const nextParams = new URLSearchParams(searchParams)
          nextParams.set('tab', value)
          setSearchParams(nextParams, { replace: true })
        }}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="orders">Orders ({filteredOrders.length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({returnRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <DataTable columns={columns} data={filteredOrders} searchPlaceholder="Search orders, customers, vendors..." />
        </TabsContent>
        <TabsContent value="returns">
          <DataTable columns={returnColumns} data={returnRequests} searchPlaceholder="Search return requests" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function ServiceBookingsPage() {
  const [searchParams] = useSearchParams()
  const { data: serviceBookings = [] } = useServiceBookings({ page: 1, limit: 100 })
  const { data: vendors = [] } = useVendors()
  const { data: users = [] } = useUsers({ role: 'user' })
  const serviceBookingStatusMutation = useServiceBookingStatusMutation()
  const dealMutation = useBrokerageDealSaveMutation()
  
  const [isLogDealOpen, setIsLogDealOpen] = useState(false)
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

  const filterDate = searchParams.get('filter_date')
  const filterStatus = searchParams.get('filter_status')

  const filteredServiceBookings = useMemo(() => {
    let result = serviceBookings
    if (filterDate === 'today') {
      result = result.filter((b) => isToday(b.createdAt || b.created_at))
    }
    if (filterStatus) {
      result = result.filter((b) => String(b.status || '').toLowerCase() === filterStatus.toLowerCase())
    }
    return result
  }, [serviceBookings, filterDate, filterStatus])

  const vendorMap = useMemo(
    () =>
      Object.fromEntries(
        vendors.flatMap((vendor) => [vendor.id, vendor.vendor_id, vendor.vendorId, vendor.userId, vendor.user_id].filter(Boolean).map((id) => [id, vendorLabel(vendor)])),
      ),
    [vendors],
  )

  const columns = useMemo(
    () => [
      { header: 'Booking', accessorKey: 'id' },
      { header: 'Farmer', accessorKey: 'name', cell: ({ row }) => row.original.name || row.original.user_name || '-' },
      { header: 'Phone', accessorKey: 'phone_number', cell: ({ row }) => row.original.phone_number || row.original.phoneNumber || '-' },
      { header: 'Vendor', accessorKey: 'vendor_name', cell: ({ row }) => row.original.vendor_name || row.original.vendorName || vendorMap[row.original.vendor_id] || '-' },
      { header: 'Category', accessorKey: 'category_name', cell: ({ row }) => row.original.category_name || row.original.categoryName || '-' },
      { header: 'Remark', accessorKey: 'remark', cell: ({ row }) => row.original.remark || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt || row.original.created_at, 'DD MMM') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Service booking ${row.original.id}`}
              description="Service booking request, vendor, user, and status details."
              record={row.original}
            />
            <NativeSelect
              className="h-9 w-36"
              value={selectedStatus(SERVICE_BOOKING_STATUS_OPTIONS, row.original.status)}
              disabled={serviceBookingStatusMutation.isPending}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                serviceBookingStatusMutation
                  .mutateAsync({ id: row.original.id, status: event.target.value })
                  .then(() => toast.success(`Service booking marked ${event.target.value}.`))
              }
            >
              {SERVICE_BOOKING_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
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
    [serviceBookingStatusMutation, vendorMap, dealForm],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Services operations"
        title="Service Bookings"
        description="Track marketplace service bookings."
        compact
      />
      <Tabs value="service-bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="service-bookings">Service bookings ({filteredServiceBookings.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="service-bookings">
          <DataTable columns={columns} data={filteredServiceBookings} searchPlaceholder="Search service bookings" />
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

export function SalesReportPage() {
  const { data: vendors = [] } = useVendors()
  const [salesFilters, setSalesFilters] = useState({
    vendorId: '',
    month: '',
    year: String(new Date().getFullYear()),
  })
  const salesParams = useMemo(
    () => ({
      vendorId: salesFilters.vendorId || undefined,
      month: salesFilters.month || undefined,
      year: salesFilters.year || undefined,
    }),
    [salesFilters],
  )
  const { data: salesReport = {} } = useSalesReport(salesParams)

  const salesRows = salesReport.rows || salesReport.data || []
  const salesColumns = useMemo(
    () => [
      { header: 'Order', accessorKey: 'orderId' },
      { header: 'Vendor', accessorKey: 'vendorName', cell: ({ row }) => row.original.vendorName || row.original.vendor_name || '-' },
      { header: 'Customer', accessorKey: 'customerName', cell: ({ row }) => row.original.customerName || row.original.customer_name || '-' },
      { header: 'Product', accessorKey: 'productName', cell: ({ row }) => row.original.productName || row.original.product_name || '-' },
      { header: 'Qty', accessorKey: 'quantity' },
      { header: 'Item total', accessorKey: 'itemTotal', cell: ({ row }) => formatCurrency(row.original.itemTotal || row.original.item_total) },
      { header: 'Order status', accessorKey: 'orderStatus', cell: ({ row }) => <StatusBadge value={row.original.orderStatus || row.original.order_status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt || row.original.created_at, 'DD MMM YYYY') },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commerce operations"
        title="Sales Report"
        description="View detailed sales report."
        compact
      />
      <Tabs value="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales report</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-white/70 bg-white/80 p-4 md:grid-cols-[1fr_160px_160px_auto]">
            <NativeSelect
              value={salesFilters.vendorId}
              onChange={(event) => setSalesFilters((filters) => ({ ...filters, vendorId: event.target.value }))}
            >
              <option value="">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendorLabel(vendor)}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              value={salesFilters.month}
              onChange={(event) => setSalesFilters((filters) => ({ ...filters, month: event.target.value }))}
            >
              <option value="">All months</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </NativeSelect>
            <Input
              type="number"
              value={salesFilters.year}
              onChange={(event) => setSalesFilters((filters) => ({ ...filters, year: event.target.value }))}
              placeholder="Year"
            />
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Total {formatCurrency(salesReport.totalAmount || salesReport.total_amount || 0)}
            </div>
          </div>
          <DataTable columns={salesColumns} data={salesRows} searchPlaceholder="Search sales report" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

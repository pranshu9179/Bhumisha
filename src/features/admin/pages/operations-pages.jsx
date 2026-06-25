import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { useOrderUpdateMutation, useOrders, usePaymentStatusMutation, useReturnHandleMutation, useReturnRequests, useSalesReport, useUsers } from '@/services/api/hooks'

const ORDER_STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Failed']

function selectedStatus(options, value) {
  const normalized = String(value || '').toLowerCase()
  return options.find((option) => option.toLowerCase() === normalized) || options[0]
}

export function OrdersPage() {
  const { data: orders = [] } = useOrders()
  const { data: returnRequests = [] } = useReturnRequests()
  const { data: vendors = [] } = useUsers({ role: 'vendor' })
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
  const vendorMap = useMemo(() => Object.fromEntries(vendors.map((item) => [item.id, item.name])), [vendors])

  const columns = useMemo(
    () => [
      { header: 'Order ID', accessorKey: 'id' },
      { header: 'Vendor', accessorKey: 'vendorId', cell: ({ row }) => vendorMap[row.original.vendorId] || '-' },
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
    [paymentMutation, statusMutation, vendorMap],
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
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({returnRequests.length})</TabsTrigger>
          <TabsTrigger value="sales">Sales report</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <DataTable columns={columns} data={orders} searchPlaceholder="Search orders, customers, vendors..." />
        </TabsContent>
        <TabsContent value="returns">
          <DataTable columns={returnColumns} data={returnRequests} searchPlaceholder="Search return requests" />
        </TabsContent>
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-white/70 bg-white/80 p-4 md:grid-cols-[1fr_160px_160px_auto]">
            <NativeSelect
              value={salesFilters.vendorId}
              onChange={(event) => setSalesFilters((filters) => ({ ...filters, vendorId: event.target.value }))}
            >
              <option value="">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name || vendor.company_name || vendor.username || vendor.id}
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

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { useOrderUpdateMutation, useOrders } from '@/services/api/hooks'

const ORDER_STATUSES = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]

function fulfillmentStatus(order) {
  return String(order.orderStatus || order.order_status || order.fulfillmentStatus || '').toLowerCase()
}

function currentStatusValue(order) {
  const status = fulfillmentStatus(order)
  const match = ORDER_STATUSES.find((s) => s.value.toLowerCase() === status)
  return match ? match.value : 'Pending'
}

function filterByFulfillment(orders, tab) {
  if (tab === 'all') return orders
  if (tab === 'active') return orders.filter((order) => !['delivered', 'cancelled'].includes(fulfillmentStatus(order)))
  if (tab === 'pending') return orders.filter((order) => ['pending', 'processing'].includes(fulfillmentStatus(order)))
  if (tab === 'dispatched') return orders.filter((order) => fulfillmentStatus(order) === 'dispatched')
  if (tab === 'shipped') return orders.filter((order) => fulfillmentStatus(order) === 'shipped')
  if (tab === 'delivered') return orders.filter((order) => fulfillmentStatus(order) === 'delivered')
  if (tab === 'cancelled') return orders.filter((order) => fulfillmentStatus(order) === 'cancelled')
  return orders
}

const ORDER_TABS = ['active', 'pending', 'dispatched', 'shipped', 'delivered', 'cancelled', 'all']

export function VendorOrdersPage() {
  const { data: orders = [] } = useOrders()
  const mutation = useOrderUpdateMutation()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab') || 'active'
  const tab = ORDER_TABS.includes(requestedTab) ? requestedTab : 'active'

  const updateOrder = useCallback(async (orderId, status) => {
    await mutation.mutateAsync({
      id: orderId,
      payload: { orderStatus: status },
    })
    toast.success(`Order status changed to ${status}.`)
  }, [mutation])

  const counts = useMemo(
    () => ({
      active: filterByFulfillment(orders, 'active').length,
      pending: filterByFulfillment(orders, 'pending').length,
      dispatched: filterByFulfillment(orders, 'dispatched').length,
      shipped: filterByFulfillment(orders, 'shipped').length,
      delivered: filterByFulfillment(orders, 'delivered').length,
      cancelled: filterByFulfillment(orders, 'cancelled').length,
      all: orders.length,
    }),
    [orders],
  )

  const columns = useMemo(
    () => [
      { header: 'Order', accessorKey: 'id' },
      { header: 'Customer', accessorKey: 'customerName' },
      { header: 'Product', accessorKey: 'productName', cell: ({ row }) => row.original.productName || row.original.product_name || '-' },
      { header: 'Qty', accessorKey: 'quantity' },
      { header: 'Total', accessorKey: 'total', cell: ({ row }) => formatCurrency(row.original.total) },
      { header: 'Payment', accessorKey: 'paymentStatus', cell: ({ row }) => <StatusBadge value={row.original.paymentStatus} /> },
      { header: 'Fulfillment', accessorKey: 'fulfillmentStatus', cell: ({ row }) => <StatusBadge value={row.original.fulfillmentStatus} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM, hh:mm A') },
      {
        header: 'Status Change',
        id: 'statusChange',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Vendor-facing order details and fulfillment state."
              record={row.original}
            />
            <Select
              value={currentStatusValue(row.original)}
              onValueChange={(value) => updateOrder(row.original.id, value)}
              disabled={mutation.isPending}
            >
              <SelectTrigger className="h-9 w-[150px] text-sm font-medium">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
    ],
    [mutation.isPending, updateOrder],
  )

  const setTab = (value) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', value)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Order desk"
        title="Vendor orders"
        description="Review incoming orders, payment state, and fulfillment progress from one queue."
        compact
      />
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex w-full max-w-full flex-wrap justify-start">
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="dispatched">Dispatched ({counts.dispatched})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({counts.cancelled})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>
        {ORDER_TABS.map((statusTab) => (
          <TabsContent key={statusTab} value={statusTab}>
            <DataTable
              columns={columns}
              data={filterByFulfillment(orders, statusTab)}
              searchPlaceholder="Search orders or customers"
              emptyMessage="No orders found in this tab."
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default VendorOrdersPage

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { ChartCard } from '@/components/charts/chart-card'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useOrderDeleteMutation, useOrderUpdateMutation, useOrders, useProducts } from '@/services/api/hooks'

export function VendorOrdersPage() {
  const user = useCurrentUser()
  const { data: orders = [] } = useOrders({ vendorId: user?.id })
  const deleteMutation = useOrderDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Order', accessorKey: 'id' },
      { header: 'Customer', accessorKey: 'customerName' },
      { header: 'Total', accessorKey: 'total', cell: ({ row }) => formatCurrency(row.original.total) },
      { header: 'Payment', accessorKey: 'paymentStatus', cell: ({ row }) => <StatusBadge value={row.original.paymentStatus} /> },
      { header: 'Fulfillment', accessorKey: 'fulfillmentStatus', cell: ({ row }) => <StatusBadge value={row.original.fulfillmentStatus} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM · hh:mm A') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Vendor-facing order details and fulfillment state."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage={`Delete order ${row.original.id} from your demo order list?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Order deleted successfully.'))
              }
            />
          </div>
        ),
      },
    ],
    [deleteMutation],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Order desk"
        title="Vendor orders"
        description="Review incoming orders, payment state, and fulfillment progress from one queue."
        compact
      />
      <DataTable columns={columns} data={orders} searchPlaceholder="Search orders or customers" />
    </div>
  )
}

export function VendorDispatchPage() {
  const user = useCurrentUser()
  const { data: orders = [] } = useOrders({ vendorId: user?.id })
  const mutation = useOrderUpdateMutation()

  const dispatchable = orders.filter((order) => order.fulfillmentStatus !== 'delivered')

  const updateOrder = async (orderId, status) => {
    await mutation.mutateAsync({
      id: orderId,
      payload: { fulfillmentStatus: status },
    })
    toast.success(`Order moved to ${status}.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dispatch board"
        title="Dispatch management"
        description="Move orders from processing to dispatched and delivered while keeping fulfillment visible."
        compact
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {dispatchable.map((order) => (
          <Card key={order.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-dark">{order.id}</p>
                  <p className="text-sm text-slate-500">{order.customerName}</p>
                </div>
                <StatusBadge value={order.fulfillmentStatus} />
              </div>
              <p className="text-lg font-semibold text-dark">{formatCurrency(order.total)}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => updateOrder(order.id, 'processing')}>
                  Processing
                </Button>
                <Button size="sm" onClick={() => updateOrder(order.id, 'dispatched')}>
                  Dispatch
                </Button>
                <Button size="sm" variant="accent" onClick={() => updateOrder(order.id, 'delivered')}>
                  Deliver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function VendorReportsPage() {
  const user = useCurrentUser()
  const { data: orders = [] } = useOrders({ vendorId: user?.id })
  const { data: products = [] } = useProducts({ vendorId: user?.id })

  const chartData = products.map((product) => ({
    label: product.name.split(' ').slice(0, 2).join(' '),
    stock: product.stock,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor insights"
        title="Performance reports"
        description="Monitor revenue, inventory depth, and the distribution of performance across your product portfolio."
        compact
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="Inventory by SKU" description="Stock depth across products in the current vendor catalog.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="stock" fill="#166534" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-3xl font-semibold text-dark">{formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Orders</p>
              <p className="text-3xl font-semibold text-dark">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Published products</p>
              <p className="text-3xl font-semibold text-dark">{products.filter((product) => product.status === 'published').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

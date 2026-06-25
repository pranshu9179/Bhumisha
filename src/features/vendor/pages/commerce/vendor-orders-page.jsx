import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { useOrders } from '@/services/api/hooks'

export function VendorOrdersPage() {
  const { data: orders = [] } = useOrders()

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
          </div>
        ),
      },
    ],
    [],
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

export default VendorOrdersPage

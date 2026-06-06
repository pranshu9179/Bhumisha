import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useCurrentUser } from '@/hooks/use-current-user'
import { formatCurrency, formatDate } from '@/lib/format'
import { useOrderDeleteMutation, useOrders } from '@/services/api/hooks'

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

export default VendorOrdersPage

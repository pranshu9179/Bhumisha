import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useProductDeleteMutation, useProducts } from '@/services/api/hooks'

export function VendorInventoryPage() {
  const user = useCurrentUser()
  const { data: products = [] } = useProducts({ vendorId: user?.id })
  const deleteMutation = useProductDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Product', accessorKey: 'name' },
      { header: 'SKU', accessorKey: 'sku' },
      { header: 'Stock', accessorKey: 'stock' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Replenishment',
        id: 'replenishment',
        cell: ({ row }) => (row.original.stock <= 20 ? <StatusBadge value="critical" /> : <StatusBadge value="active" />),
      },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} stock details`}
              description="Inventory view for the selected SKU."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.name} from inventory?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Inventory item deleted successfully.'))
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
        eyebrow="Stock control"
        title="Inventory"
        description="Track SKU availability, replenish low stock, and keep marketplace listings healthy."
        compact
      />
      <DataTable columns={columns} data={products} searchPlaceholder="Search inventory" />
    </div>
  )
}

export default VendorInventoryPage

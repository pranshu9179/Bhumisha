import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { PreviewableImage } from '@/components/media/previewable-image'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useVendorShopProducts } from '@/features/vendor/hooks/use-vendor-shop-products'
import { useShopProductDeleteMutation } from '@/services/api/hooks'

export function VendorInventoryPage() {
  const { data: products = [] } = useVendorShopProducts()
  const deleteMutation = useShopProductDeleteMutation()

  const columns = useMemo(
    () => [
      {
        header: 'Product',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <PreviewableImage
              src={row.original.image_url || row.original.image}
              alt={row.original.name}
              className="h-10 w-10 rounded-lg object-cover"
              fallbackClassName="h-10 w-10 rounded-lg"
              previewTitle={`${row.original.name} image`}
            />
            <span className="font-medium text-dark">{row.original.name}</span>
          </div>
        ),
      },
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
              description="Inventory view for the selected product."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.name} from inventory?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Product deleted successfully.'))
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
        description="Track product availability, replenish low stock, and keep marketplace listings healthy."
        compact
      />
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search inventory"
        onBulkDelete={async (rows) => {
          for (const row of rows) {
            await deleteMutation.mutateAsync(row.id)
          }
          toast.success(`${rows.length} product${rows.length === 1 ? '' : 's'} deleted successfully.`)
        }}
        bulkDeleteConfirmMessage="Delete selected inventory products?"
      />
    </div>
  )
}

export default VendorInventoryPage

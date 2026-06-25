import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useVendorShopProducts } from '@/features/vendor/hooks/use-vendor-shop-products'
import { formatCurrency } from '@/lib/format'
import { useShopProductDeleteMutation } from '@/services/api/hooks'

export function VendorProductsPage() {
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
              className="h-12 w-12 rounded-lg object-cover"
              fallbackClassName="h-12 w-12 rounded-lg"
              previewTitle={`${row.original.name} image`}
            />
            <div>
              <p className="font-semibold text-dark">{row.original.name}</p>
              <p className="text-xs text-slate-400">{(row.original.tags || []).join(', ')}</p>
            </div>
          </div>
        ),
      },
      { header: 'Price', accessorKey: 'price', cell: ({ row }) => formatCurrency(row.original.price) },
      { header: 'Stock', accessorKey: 'stock' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Product-level details for this vendor listing."
              record={row.original}
            />
            <Button asChild size="sm" variant="secondary" onClick={(event) => event.stopPropagation()}>
              <Link to={`/vendor/products/${row.original.id}/edit`}>Edit</Link>
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.name} from the catalog?`}
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
        eyebrow="Catalog"
        title="Vendor products"
        description="Manage your storefront catalog, track listing health, and open edit flows for product updates."
        compact
        actions={
          <Button asChild>
            <Link to="/vendor/products/new">Add product</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products..."
        onBulkDelete={async (rows) => {
          for (const row of rows) {
            await deleteMutation.mutateAsync(row.id)
          }
          toast.success(`${rows.length} product${rows.length === 1 ? '' : 's'} deleted successfully.`)
        }}
        bulkDeleteConfirmMessage="Delete selected products from the catalog?"
      />
    </div>
  )
}

export default VendorProductsPage

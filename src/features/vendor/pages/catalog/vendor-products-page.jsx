import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useCurrentUser } from '@/hooks/use-current-user'
import { formatCurrency } from '@/lib/format'
import { useProductDeleteMutation, useProducts } from '@/services/api/hooks'

export function VendorProductsPage() {
  const user = useCurrentUser()
  const { data: products = [] } = useProducts({ vendorId: user?.id })
  const deleteMutation = useProductDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Product', accessorKey: 'name' },
      { header: 'SKU', accessorKey: 'sku' },
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
              confirmMessage={`Delete ${row.original.name} from your product list?`}
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
        description="Manage your storefront catalog, track listing health, and open edit flows for SKU-level updates."
        compact
        actions={
          <Button asChild>
            <Link to="/vendor/products/new">Add product</Link>
          </Button>
        }
      />
      <DataTable columns={columns} data={products} searchPlaceholder="Search products, SKUs..." />
    </div>
  )
}

export default VendorProductsPage

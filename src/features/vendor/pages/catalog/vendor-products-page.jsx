import { Edit2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { belongsToVendor, vendorIdentifiers } from '@/features/vendor/hooks/use-vendor-shop-products'
import { useCurrentUser } from '@/hooks/use-current-user'
import { formatCurrency } from '@/lib/format'
import { useShopProductDeleteMutation, useShopProducts, useVendorProfile } from '@/services/api/hooks'

function productBasePath(role) {
  if (role === 'admin') return '/admin/product-list'
  if (role === 'employee') return '/employee/products'
  return '/vendor/products'
}

function productImage(product) {
  return product.image_url || product.image || product.images?.[0]
}

function productId(product) {
  return product?.id || product?.product_id || product?.productId || product?._id || product?.english?.id || product?.english?.product_id
}

export function VendorProductsPage() {
  const user = useCurrentUser()
  const role = user?.role || 'vendor'
  const basePath = productBasePath(role)
  const canApprove = role === 'admin' || role === 'employee'
  const canCreate = ['admin', 'employee', 'vendor'].includes(role)
  const [filters, setFilters] = useState({
    tag: '',
    city: 'Bhopal',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
  })
  const productParams = useMemo(
    () => ({
      page: 1,
      limit: 12,
      search: '',
      tag: filters.tag.trim() || undefined,
      city: filters.city.trim(),
      district: filters.district.trim(),
      state: filters.state.trim(),
      crop_id: '',
    }),
    [filters],
  )
  const { data: products = [], isLoading } = useShopProducts(productParams)
  const { data: vendorProfile } = useVendorProfile({ enabled: role === 'vendor' })
  const vendorIds = useMemo(() => vendorIdentifiers(user, vendorProfile), [user, vendorProfile])
  const deleteMutation = useShopProductDeleteMutation()

  const filtersSlot = (
    <div className="grid w-full gap-2 md:grid-cols-4 xl:max-w-4xl">
      <Input
        value={filters.tag}
        onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}
        placeholder="Tag"
      />
      <Input
        value={filters.city}
        onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
        placeholder="City"
      />
      <Input
        value={filters.district}
        onChange={(event) => setFilters((current) => ({ ...current, district: event.target.value }))}
        placeholder="District"
      />
      <Input
        value={filters.state}
        onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))}
        placeholder="State"
      />
    </div>
  )

  const columns = useMemo(
    () => [
      {
        header: 'Product',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <PreviewableImage
              src={productImage(row.original)}
              alt={row.original.name}
              className="h-12 w-12 rounded-lg object-cover"
              fallbackClassName="h-12 w-12 rounded-lg"
              previewTitle={`${row.original.name} image`}
            />
            <div>
              <p className="font-semibold text-dark">{row.original.name}</p>
              <p className="text-xs text-slate-400">{row.original.company_name || (row.original.tags || []).join(', ')}</p>
            </div>
          </div>
        ),
      },
      { header: 'Category', accessorKey: 'categoryName', cell: ({ row }) => row.original.categoryName || row.original.category_name || '-' },
      { header: 'MRP', accessorKey: 'mrp', cell: ({ row }) => formatCurrency(row.original.mrp) },
      { header: 'Price', accessorKey: 'price', cell: ({ row }) => formatCurrency(row.original.price) },
      { header: 'Vendor price', accessorKey: 'vendor_price', cell: ({ row }) => formatCurrency(row.original.vendor_price) },
      { header: 'Stock', accessorKey: 'stock' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => {
          const id = productId(row.original)
          const isOwnProduct = belongsToVendor(row.original, vendorIds)
          const canEdit = Boolean(id) && (canApprove || isOwnProduct)
          const canDelete = Boolean(id) && (canApprove || (role === 'vendor' && isOwnProduct))

          return (
            <div className="flex flex-wrap items-center gap-2">
              <RecordDetailsDialog
                title={`${row.original.name} details`}
                description="Product-level details from /api/products/all."
                record={row.original}
              />
              {canEdit ? (
                <Button asChild size="sm" variant="secondary" onClick={(event) => event.stopPropagation()}>
                  <Link to={`${basePath}/${id}/edit`}>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              ) : null}
              {canDelete ? (
                <DeleteActionButton
                  confirmMessage={`Delete ${row.original.name} from the catalog?`}
                  disabled={deleteMutation.isPending}
                  onDelete={() =>
                    deleteMutation
                      .mutateAsync(id)
                      .then(() => toast.success('Product deleted successfully.'))
                  }
                />
              ) : null}
            </div>
          )
        },
      },
    ],
    [basePath, canApprove, deleteMutation, role, vendorIds],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={role === 'vendor' ? 'Vendor products' : 'Marketplace products'}
        description={role === 'vendor'
          ? 'Manage your listings and review active products available in the marketplace.'
          : 'Create, approve, and update marketplace products using the documented product APIs.'}
        compact
        actions={
          canCreate ? (
            <Button asChild>
              <Link to={`${basePath}/new`}>
                <Plus className="h-4 w-4" />
                Add product
              </Link>
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search name, description, tags..."
        emptyMessage={isLoading ? 'Loading products...' : 'No products found.'}
        filterSlot={filtersSlot}
      />
    </div>
  )
}

export default VendorProductsPage

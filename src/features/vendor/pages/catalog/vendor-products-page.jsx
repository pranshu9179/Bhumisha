import { CheckCircle2, Edit2, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
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
import { useShopProductDeleteMutation, useShopProducts, useShopProductSaveMutation, useVendorProfile } from '@/services/api/hooks'

function productBasePath(role) {
  if (role === 'admin') return '/admin/product-list'
  if (role === 'employee') return '/employee/products'
  return '/vendor/products'
}

function productImage(product) {
  return product.image_url || product.image || product.images?.[0]
}

function numberOrUndefined(value) {
  if (value === '' || value === undefined || value === null) return undefined
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export function VendorProductsPage() {
  const user = useCurrentUser()
  const role = user?.role || 'vendor'
  const basePath = productBasePath(role)
  const canApprove = role === 'admin' || role === 'employee'
  const canCreate = ['admin', 'employee', 'vendor'].includes(role)
  const [filters, setFilters] = useState({
    tag: '',
    city: '',
    district: '',
    state: '',
  })
  const productParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      tag: filters.tag.trim() || undefined,
      city: filters.city.trim() || undefined,
      district: filters.district.trim() || undefined,
      state: filters.state.trim() || undefined,
    }),
    [filters],
  )
  const { data: products = [], isLoading } = useShopProducts(productParams)
  const { data: vendorProfile } = useVendorProfile({ enabled: role === 'vendor' })
  const vendorIds = useMemo(() => vendorIdentifiers(user, vendorProfile), [user, vendorProfile])
  const deleteMutation = useShopProductDeleteMutation()
  const saveMutation = useShopProductSaveMutation()

  const handleApproval = useCallback(async (product, is_approved) => {
    const retainedImages = product.retained_images || product.images || []
    await saveMutation.mutateAsync({
      id: product.id,
      payload: {
        name: product.name,
        tags: product.tags,
        category_id: numberOrUndefined(product.category_id || product.categoryId),
        sub_category_id: numberOrUndefined(product.sub_category_id || product.subCategoryId),
        mrp: product.mrp,
        vendor_price: product.vendor_price,
        description: product.description,
        price: product.price,
        stock: product.stock,
        retained_images: retainedImages,
        is_approved,
      },
    })
    toast.success(is_approved ? 'Product approved successfully.' : 'Product moved back to review.')
  }, [saveMutation])

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
          const isOwnProduct = belongsToVendor(row.original, vendorIds)
          const canEdit = canApprove || isOwnProduct
          const canDelete = role === 'vendor' && isOwnProduct

          return (
            <div className="flex flex-wrap items-center gap-2">
              <RecordDetailsDialog
                title={`${row.original.name} details`}
                description="Product-level details from /api/products/all."
                record={row.original}
              />
              {canEdit ? (
                <Button asChild size="sm" variant="secondary" onClick={(event) => event.stopPropagation()}>
                  <Link to={`${basePath}/${row.original.id}/edit`}>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              ) : null}
              {canApprove ? (
                <Button
                  type="button"
                  size="sm"
                  variant={row.original.is_approved ? 'secondary' : 'default'}
                  disabled={saveMutation.isPending}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleApproval(row.original, !row.original.is_approved)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {row.original.is_approved ? 'Unapprove' : 'Approve'}
                </Button>
              ) : null}
              {canDelete ? (
                <DeleteActionButton
                  confirmMessage={`Delete ${row.original.name} from the catalog?`}
                  disabled={deleteMutation.isPending}
                  onDelete={() =>
                    deleteMutation
                      .mutateAsync(row.original.id)
                      .then(() => toast.success('Product deleted successfully.'))
                  }
                />
              ) : null}
            </div>
          )
        },
      },
    ],
    [basePath, canApprove, deleteMutation, handleApproval, role, saveMutation, vendorIds],
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

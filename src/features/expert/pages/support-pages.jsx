import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { PreviewableImage } from '@/components/media/previewable-image'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency } from '@/lib/format'
import { useShopProducts } from '@/services/api/hooks'

export function ExpertProductsPage() {
  const [searchParams] = useSearchParams()
  const selectedTag = searchParams.get('tag')?.trim() || ''
  const productParams = useMemo(
    () => ({ status: 'published', search: selectedTag || undefined }),
    [selectedTag],
  )
  const { data: products = [] } = useShopProducts(productParams)

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
            <div>
              <p className="font-semibold text-dark">{row.original.name}</p>
              <p className="text-xs text-slate-400">{row.original.company_name || (row.original.tags || []).join(', ')}</p>
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
        enableSorting: false,
        cell: ({ row }) => (
          <RecordDetailsDialog
            title={`${row.original.name} details`}
            description="Published product details available to experts."
            record={row.original}
          />
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Product catalog"
        title={selectedTag ? `Published products for #${selectedTag}` : 'Published products'}
        description={selectedTag ? 'Showing products matched with the selected query tag.' : 'Browse products from the documented product APIs.'}
        compact
      />
      <DataTable columns={columns} data={products} searchPlaceholder="Search products" />
    </div>
  )
}

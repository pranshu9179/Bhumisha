import { Edit2, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CropDialog } from '@/features/admin/components/catalog/crop-dialog'
import { CropToggleButton } from '@/features/admin/components/catalog/crop-toggle-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useCategories, useProductDeleteMutation, useProducts } from '@/services/api/hooks'

export function AdminProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const { data: activeProductResponse = [], isLoading: activeLoading } = useProducts({ page: 1, limit: 100, status: 'false' })
  const { data: deletedProductResponse = [], isLoading: deletedLoading } = useProducts({ page: 1, limit: 100, status: 'true' })
  const { data: categories = [] } = useCategories({ page: 1, limit: 100 })
  const deleteMutation = useProductDeleteMutation()
  const activeCategories = useMemo(() => categories.filter((category) => category.status !== 'deleted'), [categories])
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((item) => [String(item.id), item.name])), [categories])

  const filterByCategory = useCallback(
    (items) =>
      categoryFilter
        ? items.filter((item) => String(item.categoryId) === String(categoryFilter))
        : items,
    [categoryFilter],
  )

  const activeProducts = useMemo(
    () => activeProductResponse.filter((product) => product.status !== 'deleted'),
    [activeProductResponse],
  )
  const deletedProducts = useMemo(
    () => deletedProductResponse.filter((product) => product.status === 'deleted'),
    [deletedProductResponse],
  )
  const products = useMemo(() => {
    const byId = new Map()
    activeProducts.concat(deletedProducts).forEach((product) => byId.set(String(product.id), product))
    return Array.from(byId.values())
  }, [activeProducts, deletedProducts])
  const visibleActiveProducts = useMemo(() => filterByCategory(activeProducts), [activeProducts, filterByCategory])
  const visibleDeletedProducts = useMemo(() => filterByCategory(deletedProducts), [deletedProducts, filterByCategory])
  const visibleProducts = useMemo(() => filterByCategory(products), [filterByCategory, products])

  const openCreateDialog = () => {
    setEditingCrop(null)
    setDialogOpen(true)
  }

  const openEditDialog = useCallback((crop) => {
    setEditingCrop(crop)
    setDialogOpen(true)
  }, [])

  const categoryFilterSlot = (
    <NativeSelect value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="max-w-xs">
      <option value="">All categories</option>
      {activeCategories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </NativeSelect>
  )

  const columns = useMemo(
    () => [
      {
        header: 'Image',
        accessorKey: 'image',
        enableSorting: false,
        cell: ({ row }) =>
          (
            <PreviewableImage
              src={row.original.image}
              alt={row.original.name || 'Crop'}
              className="h-12 w-16 rounded-lg object-cover"
              fallbackClassName="h-12 w-16"
              previewTitle={`${row.original.name || 'Crop'} image`}
            />
          ),
      },
      { header: 'English crop', accessorKey: 'name' },
      { header: 'Hindi crop', accessorKey: 'name_hi', cell: ({ row }) => row.original.name_hi || '-' },
      { header: 'Category', accessorKey: 'categoryId', cell: ({ row }) => categoryMap[String(row.original.categoryId)] || row.original.categoryName || '-' },
      { header: 'Sequence', accessorKey: 'sequence', cell: ({ row }) => row.original.sequence ?? '-' },
      { header: 'Images', accessorKey: 'images', cell: ({ row }) => row.original.images?.length || (row.original.image ? 1 : 0) },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Crop profile, category, bilingual descriptions, and theme image metadata."
              record={row.original}
              fields={[
                { label: 'ID', value: row.original.id },
                { label: 'English crop', value: row.original.name },
                { label: 'Hindi crop', value: row.original.name_hi },
                { label: 'English description', value: row.original.description },
                { label: 'Hindi description', value: row.original.description_hi },
                { label: 'Category', value: categoryMap[String(row.original.categoryId)] || row.original.categoryName },
                { label: 'Sequence', value: row.original.sequence },
                { label: 'Images', value: row.original.images?.join(', ') || row.original.image },
                { label: 'Status', value: row.original.status },
                { label: 'Created', value: row.original.createdAt },
                { label: 'Updated', value: row.original.updatedAt },
              ]}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                openEditDialog(row.original)
              }}
              disabled={row.original.status === 'deleted'}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <CropToggleButton crop={row.original} />
          </div>
        ),
      },
    ],
    [categoryMap, openEditDialog],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog governance"
        title="Crops"
        description="Create, edit, soft delete, and restore bilingual crop records with category mapping and theme images."
        compact
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add crop
          </Button>
        }
      />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({visibleActiveProducts.length})</TabsTrigger>
          <TabsTrigger value="deleted">Deleted ({visibleDeletedProducts.length})</TabsTrigger>
          <TabsTrigger value="all">All ({visibleProducts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={visibleActiveProducts}
            searchPlaceholder="Search active crops"
            emptyMessage={activeLoading ? 'Loading crops...' : 'No active crops found.'}
            filterSlot={categoryFilterSlot}
            onBulkDelete={async (rows) => {
              for (const row of rows) {
                await deleteMutation.mutateAsync(row.id)
              }
              toast.success(`${rows.length} crop${rows.length === 1 ? '' : 's'} deleted successfully.`)
            }}
            bulkDeleteConfirmMessage="Delete selected crops?"
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DataTable
            columns={columns}
            data={visibleDeletedProducts}
            searchPlaceholder="Search deleted crops"
            emptyMessage={deletedLoading ? 'Loading deleted crops...' : 'No deleted crops found.'}
            filterSlot={categoryFilterSlot}
          />
        </TabsContent>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={visibleProducts}
            searchPlaceholder="Search crops"
            emptyMessage={activeLoading || deletedLoading ? 'Loading crops...' : 'No crops found.'}
            filterSlot={categoryFilterSlot}
            onBulkDelete={async (rows) => {
              const deletableRows = rows.filter((row) => row.status !== 'deleted')
              for (const row of deletableRows) {
                await deleteMutation.mutateAsync(row.id)
              }
              toast.success(`${deletableRows.length} crop${deletableRows.length === 1 ? '' : 's'} deleted successfully.`)
            }}
            bulkDeleteConfirmMessage="Delete selected active crops? Deleted rows will be skipped."
          />
        </TabsContent>
      </Tabs>

      <CropDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingCrop(null)
        }}
        crop={editingCrop}
        categories={activeCategories}
      />
    </div>
  )
}

export default AdminProductsPage

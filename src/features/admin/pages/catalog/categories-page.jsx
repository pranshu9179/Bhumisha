import { Edit2, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryDialog } from '@/features/admin/components/catalog/category-dialog'
import { CategoryToggleButton } from '@/features/admin/components/catalog/category-toggle-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useCategories, useCategoryDeleteMutation } from '@/services/api/hooks'

export function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const { data: categories = [], isLoading } = useCategories({ page: 1, limit: 100 })
  const deleteMutation = useCategoryDeleteMutation()

  const activeCategories = useMemo(
    () => categories.filter((category) => category.status !== 'deleted'),
    [categories],
  )
  const deletedCategories = useMemo(
    () => categories.filter((category) => category.status === 'deleted'),
    [categories],
  )

  const openCreateDialog = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const openEditDialog = useCallback((category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }, [])

  const columns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'English name', accessorKey: 'name' },
      { header: 'Hindi name', accessorKey: 'name_hi', cell: ({ row }) => row.original.name_hi || '-' },
      { header: 'Products', accessorKey: 'productCount' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Crop category bilingual taxonomy metadata."
              record={row.original}
              fields={[
                { label: 'ID', value: row.original.id },
                { label: 'English name', value: row.original.name },
                { label: 'Hindi name', value: row.original.name_hi },
                { label: 'Status', value: row.original.status },
                { label: 'Products', value: row.original.productCount },
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
            <CategoryToggleButton category={row.original} />
          </div>
        ),
      },
    ],
    [openEditDialog],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog governance"
        title="Crop categories"
        description="Create, edit, soft delete, and restore bilingual crop category names for English and Hindi content."
        compact
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add crop category
          </Button>
        }
      />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCategories.length})</TabsTrigger>
          <TabsTrigger value="deleted">Deleted ({deletedCategories.length})</TabsTrigger>
          <TabsTrigger value="all">All ({categories.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeCategories}
            searchPlaceholder="Search active crop categories"
            emptyMessage={isLoading ? 'Loading crop categories...' : 'No active crop categories found.'}
            onBulkDelete={async (rows) => {
              for (const row of rows) {
                await deleteMutation.mutateAsync(row.id)
              }
              toast.success(`${rows.length} crop categor${rows.length === 1 ? 'y' : 'ies'} deleted successfully.`)
            }}
            bulkDeleteConfirmMessage="Delete selected crop categories?"
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DataTable
            columns={columns}
            data={deletedCategories}
            searchPlaceholder="Search deleted crop categories"
            emptyMessage={isLoading ? 'Loading crop categories...' : 'No deleted crop categories found.'}
          />
        </TabsContent>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={categories}
            searchPlaceholder="Search crop categories"
            emptyMessage={isLoading ? 'Loading crop categories...' : 'No crop categories found.'}
            onBulkDelete={async (rows) => {
              const deletableRows = rows.filter((row) => row.status !== 'deleted')
              for (const row of deletableRows) {
                await deleteMutation.mutateAsync(row.id)
              }
              toast.success(`${deletableRows.length} crop categor${deletableRows.length === 1 ? 'y' : 'ies'} deleted successfully.`)
            }}
            bulkDeleteConfirmMessage="Delete selected active crop categories? Deleted rows will be skipped."
          />
        </TabsContent>
      </Tabs>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingCategory(null)
        }}
        category={editingCategory}
      />
    </div>
  )
}

export default CategoriesPage

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency } from '@/lib/format'
import { useCategories, useCategoryDeleteMutation, useCategorySaveMutation, useProductDeleteMutation, useProducts, useUsers } from '@/services/api/hooks'

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  status: z.string().min(1, 'Status is required'),
})

function CategoryDialog({ open, onOpenChange }) {
  const mutation = useCategorySaveMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      status: 'active',
    },
  })

  const onSubmit = async (values) => {
    await mutation.mutateAsync(values)
    toast.success('Category added successfully.')
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product category</DialogTitle>
          <DialogDescription>Organize products for analytics, recommendations, and vendor catalog governance.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Category name" error={errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <NativeSelect {...register('status')}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </NativeSelect>
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminProductsPage() {
  const { data: products = [] } = useProducts()
  const { data: categories = [] } = useCategories()
  const { data: vendors = [] } = useUsers({ role: 'vendor' })
  const deleteMutation = useProductDeleteMutation()
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((item) => [item.id, item.name])), [categories])
  const vendorMap = useMemo(() => Object.fromEntries(vendors.map((item) => [item.id, item.name])), [vendors])

  const columns = useMemo(
    () => [
      { header: 'Product', accessorKey: 'name' },
      { header: 'Vendor', accessorKey: 'vendorId', cell: ({ row }) => vendorMap[row.original.vendorId] || '-' },
      { header: 'Category', accessorKey: 'categoryId', cell: ({ row }) => categoryMap[row.original.categoryId] || '-' },
      { header: 'SKU', accessorKey: 'sku' },
      { header: 'Price', accessorKey: 'price', cell: ({ row }) => formatCurrency(row.original.price) },
      { header: 'Stock', accessorKey: 'stock' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Marketplace product profile and catalog metadata."
              record={row.original}
              fields={[
                { label: 'Product', value: row.original.name },
                { label: 'Vendor', value: vendorMap[row.original.vendorId] || row.original.vendorId },
                { label: 'Category', value: categoryMap[row.original.categoryId] || row.original.categoryId },
                { label: 'SKU', value: row.original.sku },
                { label: 'Price', value: formatCurrency(row.original.price) },
                { label: 'Stock', value: row.original.stock },
                { label: 'Status', value: row.original.status },
                { label: 'Rating', value: row.original.rating },
              ]}
            />
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.name} from the marketplace catalog?`}
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
    [categoryMap, deleteMutation, vendorMap],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog governance"
        title="Marketplace products"
        description="Review vendor listings, pricing, stock depth, and recommendation-linked catalog coverage."
        compact
      />
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products, SKUs, vendors..."
      />
    </div>
  )
}

export function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: categories = [] } = useCategories()
  const deleteMutation = useCategoryDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Category', accessorKey: 'name' },
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
              description="Category-level taxonomy metadata."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage={`Delete the ${row.original.name} category from the demo catalog?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Category deleted successfully.'))
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
        eyebrow="Catalog governance"
        title="Product taxonomy"
        description="Create and maintain category structures used across the marketplace and advisory recommendations."
        compact
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        }
      />
      <DataTable columns={columns} data={categories} searchPlaceholder="Search categories" />
      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

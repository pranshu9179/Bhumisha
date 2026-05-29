import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency } from '@/lib/format'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useCategories, useProductDeleteMutation, useProductDetail, useProductSaveMutation, useProducts } from '@/services/api/hooks'

const schema = z.object({
  name: z.string().min(2, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().min(3, 'SKU is required'),
  price: z.coerce.number().min(1, 'Price must be greater than zero'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  status: z.string().min(1, 'Status is required'),
})

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
            <Button
              asChild
              size="sm"
              variant="secondary"
              onClick={(event) => event.stopPropagation()}
            >
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

export function VendorProductFormPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: categories = [] } = useCategories()
  const { data: product } = useProductDetail(id)
  const mutation = useProductSaveMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      categoryId: '',
      sku: '',
      price: 0,
      stock: 0,
      status: 'draft',
    },
  })

  useEffect(() => {
    if (product && id) {
      reset(product)
    }
  }, [id, product, reset])

  const onSubmit = async (values) => {
    await mutation.mutateAsync({
      id,
      payload: {
        ...values,
        vendorId: user.id,
      },
    })
    toast.success(id ? 'Product updated successfully.' : 'Product created successfully.')
    navigate('/vendor/products')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog editor"
        title={id ? 'Edit product' : 'Add product'}
        description="Create or refine product listings that will appear in the marketplace and expert suggestion catalog."
        compact
      />
      <Card>
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Product name" error={errors.name?.message}>
              <Input {...register('name')} />
            </Field>
            <Field label="Category" error={errors.categoryId?.message}>
              <NativeSelect {...register('categoryId')}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="SKU" error={errors.sku?.message}>
              <Input {...register('sku')} />
            </Field>
            <Field label="Price" error={errors.price?.message}>
              <Input type="number" {...register('price')} />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <Input type="number" {...register('stock')} />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <NativeSelect {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending review</option>
              </NativeSelect>
            </Field>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/vendor/products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : id ? 'Save changes' : 'Create product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

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

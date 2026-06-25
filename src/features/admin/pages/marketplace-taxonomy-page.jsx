import { zodResolver } from '@hookform/resolvers/zod'
import { Boxes, Edit2, Network, RotateCcw, Store, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { PreviewableImage } from '@/components/media/previewable-image'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import {
  useProductCategories,
  useProductCategoryDeleteMutation,
  useProductCategorySaveMutation,
  useProductSubcategories,
  useProductSubcategoryDeleteMutation,
  useProductSubcategorySaveMutation,
  useVendorCategories,
  useVendorCategoryDeleteMutation,
  useVendorCategorySaveMutation,
} from '@/services/api/hooks'

const productCategorySchema = z.object({
  name: z.string().min(2, 'English name is required'),
  name_hi: z.string().optional(),
  sub_category_required: z.string().optional(),
})

const subcategorySchema = z.object({
  category_id: z.string().min(1, 'Parent category is required'),
  name: z.string().min(2, 'English name is required'),
  name_hi: z.string().optional(),
  image: z.any().optional(),
})

const vendorCategorySchema = z.object({
  name: z.string().min(2, 'English name is required'),
  name_hi: z.string().optional(),
  allowed_services: z.string().min(1, 'Allowed service mode is required'),
})

function categoryName(categoryMap, id) {
  return categoryMap[String(id)] || id || '-'
}

function apiPayload(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function TaxonomyToggleButton({ row, mutation, label }) {
  const isDeleted = row.status === 'deleted'

  const handleToggle = async (event) => {
    event.stopPropagation()
    await mutation.mutateAsync(row.id)
    toast.success(isDeleted ? `${label} restored.` : `${label} deleted.`)
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={isDeleted ? 'secondary' : 'danger'}
      disabled={mutation.isPending}
      onClick={handleToggle}
    >
      {isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
      {isDeleted ? 'Restore' : 'Delete'}
    </Button>
  )
}

function ProductCategoryEditDialog({ category, open, onOpenChange }) {
  const mutation = useProductCategorySaveMutation()
  const form = useForm({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      name: '',
      name_hi: '',
      sub_category_required: 'false',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: category?.name || '',
      name_hi: category?.name_hi || '',
      sub_category_required: category?.sub_category_required ? 'true' : 'false',
    })
  }, [category, form, open])

  const save = async (values) => {
    await mutation.mutateAsync({
      id: category?.id,
      payload: {
        ...apiPayload(values),
        sub_category_required: values.sub_category_required === 'true',
      },
    })
    toast.success('Product category updated.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit product category</DialogTitle>
          <DialogDescription>Update the documented /product-categories fields.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(save)}>
          <Field label="English name" error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </Field>
          <Field label="Hindi name">
            <Input {...form.register('name_hi')} />
          </Field>
          <Field label="Subcategories" className="md:col-span-2">
            <NativeSelect {...form.register('sub_category_required')}>
              <option value="false">Optional</option>
              <option value="true">Required</option>
            </NativeSelect>
          </Field>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SubcategoryEditDialog({ subcategory, categories, open, onOpenChange }) {
  const mutation = useProductSubcategorySaveMutation()
  const form = useForm({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      category_id: '',
      name: '',
      name_hi: '',
      image: undefined,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      category_id: subcategory?.category_id ? String(subcategory.category_id) : '',
      name: subcategory?.name || '',
      name_hi: subcategory?.name_hi || '',
      image: undefined,
    })
  }, [form, open, subcategory])

  const save = async (values) => {
    await mutation.mutateAsync({
      id: subcategory?.id,
      payload: {
        ...apiPayload(values),
        category_id: Number(values.category_id),
      },
    })
    toast.success('Product subcategory updated.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit product subcategory</DialogTitle>
          <DialogDescription>Update the multipart subcategory fields, including the optional image.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(save)}>
          <Field label="Parent category" error={form.formState.errors.category_id?.message}>
            <NativeSelect {...form.register('category_id')}>
              <option value="">Select product category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Image">
            <Input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" {...form.register('image')} />
          </Field>
          <Field label="English name" error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </Field>
          <Field label="Hindi name">
            <Input {...form.register('name_hi')} />
          </Field>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VendorCategoryEditDialog({ category, open, onOpenChange }) {
  const mutation = useVendorCategorySaveMutation()
  const form = useForm({
    resolver: zodResolver(vendorCategorySchema),
    defaultValues: {
      name: '',
      name_hi: '',
      allowed_services: 'product_only',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: category?.name || '',
      name_hi: category?.name_hi || '',
      allowed_services: category?.allowed_services || 'product_only',
    })
  }, [category, form, open])

  const save = async (values) => {
    await mutation.mutateAsync({
      id: category?.id,
      payload: apiPayload(values),
    })
    toast.success('Vendor category updated.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit vendor category</DialogTitle>
          <DialogDescription>Update the documented /vendor-categories fields.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(save)}>
          <Field label="English name" error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </Field>
          <Field label="Hindi name">
            <Input {...form.register('name_hi')} />
          </Field>
          <Field label="Allowed services" className="md:col-span-2" error={form.formState.errors.allowed_services?.message}>
            <NativeSelect {...form.register('allowed_services')}>
              <option value="product_only">Product only</option>
              <option value="both">Products and services</option>
            </NativeSelect>
          </Field>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MarketplaceTaxonomyPage() {
  const [editingProductCategory, setEditingProductCategory] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [editingVendorCategory, setEditingVendorCategory] = useState(null)
  const { data: productCategories = [] } = useProductCategories({ status: 'all' })
  const { data: productSubcategories = [] } = useProductSubcategories({ status: 'all' })
  const { data: vendorCategories = [] } = useVendorCategories({ status: 'all' })
  const productCategoryMutation = useProductCategorySaveMutation()
  const subcategoryMutation = useProductSubcategorySaveMutation()
  const vendorCategoryMutation = useVendorCategorySaveMutation()
  const productCategoryDeleteMutation = useProductCategoryDeleteMutation()
  const subcategoryDeleteMutation = useProductSubcategoryDeleteMutation()
  const vendorCategoryDeleteMutation = useVendorCategoryDeleteMutation()

  const productCategoryForm = useForm({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      name: '',
      name_hi: '',
      sub_category_required: 'false',
    },
  })

  const subcategoryForm = useForm({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      category_id: '',
      name: '',
      name_hi: '',
      image: undefined,
    },
  })

  const vendorCategoryForm = useForm({
    resolver: zodResolver(vendorCategorySchema),
    defaultValues: {
      name: '',
      name_hi: '',
      allowed_services: 'product_only',
    },
  })

  const activeProductCategories = useMemo(
    () => productCategories.filter((category) => category.status !== 'deleted'),
    [productCategories],
  )
  const deletedProductCategories = useMemo(
    () => productCategories.filter((category) => category.status === 'deleted'),
    [productCategories],
  )
  const activeProductSubcategories = useMemo(
    () => productSubcategories.filter((subcategory) => subcategory.status !== 'deleted'),
    [productSubcategories],
  )
  const deletedProductSubcategories = useMemo(
    () => productSubcategories.filter((subcategory) => subcategory.status === 'deleted'),
    [productSubcategories],
  )
  const activeVendorCategories = useMemo(
    () => vendorCategories.filter((category) => category.status !== 'deleted'),
    [vendorCategories],
  )
  const deletedVendorCategories = useMemo(
    () => vendorCategories.filter((category) => category.status === 'deleted'),
    [vendorCategories],
  )
  const categoryMap = useMemo(
    () => Object.fromEntries(productCategories.map((category) => [String(category.id), category.name])),
    [productCategories],
  )

  const productCategoryColumns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'English name', accessorKey: 'name' },
      { header: 'Hindi name', accessorKey: 'name_hi', cell: ({ row }) => row.original.name_hi || '-' },
      {
        header: 'Subcategory',
        accessorKey: 'sub_category_required',
        cell: ({ row }) => (row.original.sub_category_required ? 'Required' : 'Optional'),
      },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} product category`}
              description="Marketplace product category from /product-categories."
              record={row.original}
            />
            <Button type="button" size="sm" variant="secondary" onClick={(event) => {
              event.stopPropagation()
              setEditingProductCategory(row.original)
            }}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <TaxonomyToggleButton row={row.original} mutation={productCategoryDeleteMutation} label="Product category" />
          </div>
        ),
      },
    ],
    [productCategoryDeleteMutation],
  )

  const subcategoryColumns = useMemo(
    () => [
      {
        header: 'Image',
        accessorKey: 'image',
        enableSorting: false,
        cell: ({ row }) => (
          <PreviewableImage
            src={row.original.image}
            alt={row.original.name || 'Subcategory'}
            className="h-12 w-16 rounded-lg object-cover"
            fallbackClassName="h-12 w-16"
            previewTitle={`${row.original.name || 'Subcategory'} image`}
          />
        ),
      },
      { header: 'ID', accessorKey: 'id' },
      { header: 'Parent category', accessorKey: 'category_id', cell: ({ row }) => categoryName(categoryMap, row.original.category_id) },
      { header: 'English name', accessorKey: 'name' },
      { header: 'Hindi name', accessorKey: 'name_hi', cell: ({ row }) => row.original.name_hi || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} subcategory`}
              description="Marketplace product subcategory from /product-categories/subcategory."
              record={row.original}
            />
            <Button type="button" size="sm" variant="secondary" onClick={(event) => {
              event.stopPropagation()
              setEditingSubcategory(row.original)
            }}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <TaxonomyToggleButton row={row.original} mutation={subcategoryDeleteMutation} label="Product subcategory" />
          </div>
        ),
      },
    ],
    [categoryMap, subcategoryDeleteMutation],
  )

  const vendorCategoryColumns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'English name', accessorKey: 'name' },
      { header: 'Hindi name', accessorKey: 'name_hi', cell: ({ row }) => row.original.name_hi || '-' },
      { header: 'Allowed services', accessorKey: 'allowed_services', cell: ({ row }) => <StatusBadge value={row.original.allowed_services} /> },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} vendor category`}
              description="Vendor capability category from /vendor-categories."
              record={row.original}
            />
            <Button type="button" size="sm" variant="secondary" onClick={(event) => {
              event.stopPropagation()
              setEditingVendorCategory(row.original)
            }}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <TaxonomyToggleButton row={row.original} mutation={vendorCategoryDeleteMutation} label="Vendor category" />
          </div>
        ),
      },
    ],
    [vendorCategoryDeleteMutation],
  )

  const createProductCategory = async (values) => {
    await productCategoryMutation.mutateAsync({
      payload: {
        ...apiPayload(values),
        sub_category_required: values.sub_category_required === 'true',
      },
    })
    productCategoryForm.reset()
    toast.success('Product category created.')
  }

  const createSubcategory = async (values) => {
    await subcategoryMutation.mutateAsync({
      payload: {
        ...apiPayload(values),
        category_id: Number(values.category_id),
      },
    })
    subcategoryForm.reset()
    toast.success('Product subcategory created.')
  }

  const createVendorCategory = async (values) => {
    await vendorCategoryMutation.mutateAsync({ payload: apiPayload(values) })
    vendorCategoryForm.reset({ name: '', name_hi: '', allowed_services: 'product_only' })
    toast.success('Vendor category created.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace taxonomy"
        title="Product and vendor categories"
        description="Manage product categories, image-backed subcategories, and vendor capability categories."
        compact
      />

      <Tabs defaultValue="product-categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="product-categories">Product categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="vendor-categories">Vendor categories</TabsTrigger>
        </TabsList>

        <TabsContent value="product-categories" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <form className="grid gap-4 md:grid-cols-[1fr_1fr_220px_auto]" onSubmit={productCategoryForm.handleSubmit(createProductCategory)}>
                <Field label="English name" error={productCategoryForm.formState.errors.name?.message}>
                  <Input {...productCategoryForm.register('name')} />
                </Field>
                <Field label="Hindi name">
                  <Input {...productCategoryForm.register('name_hi')} />
                </Field>
                <Field label="Subcategories">
                  <NativeSelect {...productCategoryForm.register('sub_category_required')}>
                    <option value="false">Optional</option>
                    <option value="true">Required</option>
                  </NativeSelect>
                </Field>
                <div className="flex items-end">
                  <Button type="submit" disabled={productCategoryMutation.isPending}>
                    <Boxes className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active ({activeProductCategories.length})</TabsTrigger>
              <TabsTrigger value="deleted">Deleted ({deletedProductCategories.length})</TabsTrigger>
              <TabsTrigger value="all">All ({productCategories.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <DataTable
                columns={productCategoryColumns}
                data={activeProductCategories}
                searchPlaceholder="Search active product categories"
              />
            </TabsContent>
            <TabsContent value="deleted">
              <DataTable
                columns={productCategoryColumns}
                data={deletedProductCategories}
                searchPlaceholder="Search deleted product categories"
              />
            </TabsContent>
            <TabsContent value="all">
              <DataTable
                columns={productCategoryColumns}
                data={productCategories}
                searchPlaceholder="Search product categories"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <form className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]" onSubmit={subcategoryForm.handleSubmit(createSubcategory)}>
                <Field label="Parent category" error={subcategoryForm.formState.errors.category_id?.message}>
                  <NativeSelect {...subcategoryForm.register('category_id')}>
                    <option value="">Select product category</option>
                    {activeProductCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Image">
                  <Input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" {...subcategoryForm.register('image')} />
                </Field>
                <Field label="English name" error={subcategoryForm.formState.errors.name?.message}>
                  <Input {...subcategoryForm.register('name')} />
                </Field>
                <Field label="Hindi name">
                  <Input {...subcategoryForm.register('name_hi')} />
                </Field>
                <div className="flex items-end">
                  <Button type="submit" disabled={subcategoryMutation.isPending}>
                    <Network className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active ({activeProductSubcategories.length})</TabsTrigger>
              <TabsTrigger value="deleted">Deleted ({deletedProductSubcategories.length})</TabsTrigger>
              <TabsTrigger value="all">All ({productSubcategories.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <DataTable
                columns={subcategoryColumns}
                data={activeProductSubcategories}
                searchPlaceholder="Search active subcategories"
              />
            </TabsContent>
            <TabsContent value="deleted">
              <DataTable
                columns={subcategoryColumns}
                data={deletedProductSubcategories}
                searchPlaceholder="Search deleted subcategories"
              />
            </TabsContent>
            <TabsContent value="all">
              <DataTable
                columns={subcategoryColumns}
                data={productSubcategories}
                searchPlaceholder="Search subcategories"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="vendor-categories" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <form className="grid gap-4 md:grid-cols-[1fr_1fr_220px_auto]" onSubmit={vendorCategoryForm.handleSubmit(createVendorCategory)}>
                <Field label="English name" error={vendorCategoryForm.formState.errors.name?.message}>
                  <Input {...vendorCategoryForm.register('name')} />
                </Field>
                <Field label="Hindi name">
                  <Input {...vendorCategoryForm.register('name_hi')} />
                </Field>
                <Field label="Allowed services" error={vendorCategoryForm.formState.errors.allowed_services?.message}>
                  <NativeSelect {...vendorCategoryForm.register('allowed_services')}>
                    <option value="product_only">Product only</option>
                    <option value="both">Products and services</option>
                  </NativeSelect>
                </Field>
                <div className="flex items-end">
                  <Button type="submit" disabled={vendorCategoryMutation.isPending}>
                    <Store className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active ({activeVendorCategories.length})</TabsTrigger>
              <TabsTrigger value="deleted">Deleted ({deletedVendorCategories.length})</TabsTrigger>
              <TabsTrigger value="all">All ({vendorCategories.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <DataTable
                columns={vendorCategoryColumns}
                data={activeVendorCategories}
                searchPlaceholder="Search active vendor categories"
              />
            </TabsContent>
            <TabsContent value="deleted">
              <DataTable
                columns={vendorCategoryColumns}
                data={deletedVendorCategories}
                searchPlaceholder="Search deleted vendor categories"
              />
            </TabsContent>
            <TabsContent value="all">
              <DataTable
                columns={vendorCategoryColumns}
                data={vendorCategories}
                searchPlaceholder="Search vendor categories"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <ProductCategoryEditDialog
        category={editingProductCategory}
        open={Boolean(editingProductCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingProductCategory(null)
        }}
      />
      <SubcategoryEditDialog
        subcategory={editingSubcategory}
        categories={activeProductCategories}
        open={Boolean(editingSubcategory)}
        onOpenChange={(open) => {
          if (!open) setEditingSubcategory(null)
        }}
      />
      <VendorCategoryEditDialog
        category={editingVendorCategory}
        open={Boolean(editingVendorCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingVendorCategory(null)
        }}
      />
    </div>
  )
}

export default MarketplaceTaxonomyPage

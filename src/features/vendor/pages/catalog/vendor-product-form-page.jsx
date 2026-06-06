import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useCategories, useProductDetail, useProductSaveMutation } from '@/services/api/hooks'
import { vendorProductSchema } from '@/features/vendor/pages/catalog/vendor-product-schema'

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
    resolver: zodResolver(vendorProductSchema),
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
            <div className="flex justify-end gap-3 md:col-span-2">
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

export default VendorProductFormPage

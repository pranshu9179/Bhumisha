import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { PreviewableImage } from '@/components/media/previewable-image'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useProductCategories, useProductSubcategories, useProducts, useShopProductDetail, useShopProductSaveMutation } from '@/services/api/hooks'
import { vendorProductSchema } from '@/features/vendor/pages/catalog/vendor-product-schema'

function productBasePath(role) {
  if (role === 'admin') return '/admin/product-list'
  if (role === 'employee') return '/employee/products'
  return '/vendor/products'
}

function numberOrUndefined(value) {
  if (value === '' || value === undefined || value === null) return undefined
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

function retainedImages(product) {
  return product?.retained_images || product?.images || []
}

function validRouteId(value) {
  if (!value || value === 'undefined' || value === 'null') return undefined
  return value
}

export function VendorProductFormPage() {
  const user = useCurrentUser()
  const role = user?.role || 'vendor'
  const basePath = productBasePath(role)
  const canApprove = role === 'admin' || role === 'employee'
  const navigate = useNavigate()
  const { id } = useParams()
  const productId = validRouteId(id)
  const { data: categories = [] } = useProductCategories()
  const { data: subcategories = [] } = useProductSubcategories()
  const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })
  const { data: product } = useShopProductDetail(productId)
  const mutation = useShopProductSaveMutation()
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorProductSchema),
    defaultValues: {
      name: '',
      name_hi: '',
      description: '',
      description_hi: '',
      category_id: '',
      sub_category_id: '',
      crop_id: '',
      // product_type: 'organic',
      price: '',
      mrp: 0,
      vendor_price: 0,
      stock: 0,
      image: undefined,
      tags: '',
      status: 'draft',
      is_approved: 'false',
    },
  })
  const selectedImages = useWatch({ control, name: 'image' })
  const selectedCategoryId = useWatch({ control, name: 'category_id' })
  const selectedImageCount = selectedImages?.length || 0
  const previousCategoryIdRef = useRef('')
  const activeSubcategories = useMemo(
    () => subcategories.filter((subcategory) => subcategory.status !== 'deleted'),
    [subcategories],
  )
  const filteredSubcategories = useMemo(
    () =>
      selectedCategoryId
        ? activeSubcategories.filter(
            (subcategory) =>
              String(subcategory.category_id || subcategory.categoryId || '') === String(selectedCategoryId),
          )
        : [],
    [activeSubcategories, selectedCategoryId],
  )

  useEffect(() => {
    if (product && productId) {
      reset({
        ...product,
        category_id: product.category_id || product.categoryId || '',
        sub_category_id: product.sub_category_id || product.subCategoryId || '',
        crop_id: product.crop_id || product.cropId || '',
        // product_type: product.product_type || product.productType || 'organic',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
        image: undefined,
        is_approved: product.is_approved ? 'true' : 'false',
      })
    }
  }, [productId, product, reset])

  useEffect(() => {
    const currentCategoryId = selectedCategoryId || ''

    if (!previousCategoryIdRef.current) {
      previousCategoryIdRef.current = currentCategoryId
      return
    }

    if (currentCategoryId !== previousCategoryIdRef.current) {
      setValue('sub_category_id', '')
      previousCategoryIdRef.current = currentCategoryId
    }
  }, [selectedCategoryId, setValue])

  const onSubmit = async (values) => {
    if (id && !productId) {
      toast.error('Product id is missing. Please go back to the product list and open the product again.')
      return
    }

    const tags = values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    await mutation.mutateAsync({
      id: productId,
      payload: {
        name: values.name,
        name_hi: values.name_hi?.trim() || undefined,
        description: values.description,
        description_hi: values.description_hi?.trim() || undefined,
        price: values.price === '' ? undefined : values.price,
        mrp: values.mrp,
        vendor_price: values.vendor_price,
        stock: values.stock,
        image: values.image,
        tags: JSON.stringify(tags),
        retained_images: productId ? retainedImages(product) : undefined,
        category_id: numberOrUndefined(values.category_id),
        sub_category_id: numberOrUndefined(values.sub_category_id),
        crop_id: numberOrUndefined(values.crop_id),
        is_approved: canApprove ? values.is_approved === 'true' || (!id && canApprove) : undefined,
        // product_type: values.product_type,
      },
    })
    toast.success(productId ? 'Product updated successfully.' : 'Product created successfully.')
    navigate(basePath)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog editor"
        title={productId ? 'Edit product' : 'Add product'}
        description={canApprove ? 'Create approved products or update approval state for marketplace listings.' : 'Create or refine your listings. Vendor edits are sent back for admin approval.'}
        compact
      />
      <Card className="max-w-5xl">
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="PRODUCT NAME" error={errors.name?.message} className="md:col-span-2">
              <Input {...register('name')} />
            </Field>
            <Field label="HINDI PRODUCT NAME" error={errors.name_hi?.message} className="md:col-span-2">
              <Input lang="hi" dir="auto" {...register('name_hi')} />
            </Field>
            <Field label="DESCRIPTION" error={errors.description?.message} className="md:col-span-2">
              <Textarea rows={4} {...register('description')} />
            </Field>
            <Field label="HINDI DESCRIPTION" error={errors.description_hi?.message} className="md:col-span-2">
              <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
            </Field>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
              <Field label="MRP (INR) *" error={errors.mrp?.message}>
                <Input type="number" {...register('mrp')} />
              </Field>
              <Field label="MIN VENDOR PRICE (LEAST TO RECEIVE) *" error={errors.vendor_price?.message}>
                <Input type="number" {...register('vendor_price')} />
              </Field>
              <Field label="SELLING PRICE (INR)" error={errors.price?.message}>
                <Input type="number" placeholder={canApprove ? 'Selling price' : 'Set by Admin'} readOnly={!canApprove} {...register('price')} />
              </Field>
            </div>
            <Field label="STOCK" error={errors.stock?.message} className="md:col-span-2">
              <Input type="number" {...register('stock')} />
            </Field>
            {/* <Field label="Product type" error={errors.product_type?.message}>
              <NativeSelect {...register('product_type')}>
                <option value="organic">Organic</option>
                <option value="general">General</option>
              </NativeSelect>
            </Field> */}
            <Field
              label="Product Images (तस्वीरें)"
              hint={`Total images selected: ${selectedImageCount} / 10`}
              error={errors.image?.message}
              className="md:col-span-2 rounded-lg border border-slate-200 p-3"
            >
              <div className="rounded-lg border border-dashed border-slate-400 bg-white p-3 text-center">
                <Input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" multiple {...register('image')} />
              </div>
            </Field>
            {productId && (product?.image_url || product?.image) ? (
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-500">Current image</p>
                <PreviewableImage
                  src={product.image_url || product.image}
                  alt={product.name || 'Product image'}
                  className="h-28 w-36 rounded-lg object-cover"
                  fallbackClassName="h-28 w-36 rounded-lg"
                  previewTitle={`${product.name || 'Product'} image`}
                />
              </div>
            ) : null}
            {productId && retainedImages(product).length > 1 ? (
              <div className="grid gap-3 md:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
                {retainedImages(product).map((image, index) => (
                  <PreviewableImage
                    key={`${product.id}-image-${index}`}
                    src={image}
                    alt={`${product.name || 'Product'} image ${index + 1}`}
                    className="h-28 w-full rounded-lg object-cover"
                    fallbackClassName="h-28 w-full rounded-lg"
                    previewTitle={`${product.name || 'Product'} image ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
            <Field label="PRODUCT CATEGORY *" error={errors.category_id?.message} className="md:col-span-2">
              <NativeSelect {...register('category_id')}>
                <option value="">Select an option</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="SUBCATEGORY" error={errors.sub_category_id?.message} className="md:col-span-2">
              <NativeSelect {...register('sub_category_id')} disabled={!selectedCategoryId}>
                <option value="">{selectedCategoryId ? 'Select subcategory' : 'Select product category first'}</option>
                {filteredSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="RELATED CROP" error={errors.crop_id?.message} className="md:col-span-2">
              <NativeSelect {...register('crop_id')}>
                <option value="">No crop mapping</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                    {crop.name_hi ? ` / ${crop.name_hi}` : ''}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="SEARCH TAGS (COMMA SEPARATED)" hint="Comma-separated tags, e.g. seeds, organic, wheat" error={errors.tags?.message} className="md:col-span-2">
              <Input {...register('tags')} />
            </Field>
            {canApprove ? (
              <Field label="APPROVAL" error={errors.is_approved?.message} className="md:col-span-2">
                <NativeSelect {...register('is_approved')}>
                  <option value="true">Approved</option>
                  <option value="false">Pending review</option>
                </NativeSelect>
              </Field>
            ) : null}
            {/* <Field label="Status" error={errors.status?.message}>
              <NativeSelect {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending review</option>
              </NativeSelect>
            </Field> */}
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="secondary" onClick={() => navigate(basePath)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? 'Saving...' : productId ? 'Save Product Listing' : 'Save Product Listing'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default VendorProductFormPage

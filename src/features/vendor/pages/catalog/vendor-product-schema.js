import { z } from 'zod'

export const vendorProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Product category is required'),
  sub_category_id: z.string().optional(),
  product_type: z.string().optional(),
  price: z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  mrp: z.coerce.number().min(1, 'MRP must be greater than zero'),
  vendor_price: z.coerce.number().min(1, 'Vendor price must be greater than zero'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  image: z
    .any()
    .optional()
    .refine((value) => {
      if (!value?.length) return true
      return value.length <= 10
    }, 'Upload up to 10 product images.')
    .refine((value) => {
      if (!value?.length) return true
      return Array.from(value).every((file) => ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type))
    }, 'Upload a JPG, PNG, or WEBP image.')
    .refine((value) => {
      if (!value?.length) return true
      return Array.from(value).every((file) => file.size <= 5 * 1024 * 1024)
    }, 'Each image must be 5MB or smaller.'),
  tags: z.string().min(1, 'At least one product tag is required'),
  status: z.string().optional(),
})

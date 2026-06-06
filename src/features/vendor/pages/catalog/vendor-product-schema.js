import { z } from 'zod'

export const vendorProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().min(3, 'SKU is required'),
  price: z.coerce.number().min(1, 'Price must be greater than zero'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  status: z.string().min(1, 'Status is required'),
})

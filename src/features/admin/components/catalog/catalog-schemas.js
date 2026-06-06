import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'English category name is required'),
  name_hi: z.string().trim().optional(),
})

export const cropSchema = z.object({
  name: z.string().trim().min(2, 'English crop name is required'),
  name_hi: z.string().trim().optional(),
  description: z.string().trim().min(2, 'English description is required'),
  description_hi: z.string().trim().optional(),
  categoryId: z.string().min(1, 'Crop category is required'),
  crop_theme_image: z.any().optional(),
})

export const guideHeadingSchema = z.object({
  title: z.string().trim().min(2, 'English heading is required'),
  title_hi: z.string().trim().optional(),
})

export const guideDetailRowSchema = z.object({
  title: z.string().trim().min(2, 'English detail title is required'),
  title_hi: z.string().trim().optional(),
  description: z.string().trim().min(2, 'English description is required'),
  description_hi: z.string().trim().optional(),
  media: z.any().optional(),
})

export const guideDetailCreateSchema = z.object({
  crop_id: z.string().min(1, 'Crop is required'),
  crops_guid_heading_id: z.string().min(1, 'Guide heading is required'),
  details: z.array(guideDetailRowSchema).min(1, 'Add at least one guide detail.'),
})

export const guideDetailEditSchema = z.object({
  crop_id: z.string().min(1, 'Crop is required'),
  crops_guid_heading_id: z.string().min(1, 'Guide heading is required'),
  title: z.string().trim().min(2, 'English detail title is required'),
  title_hi: z.string().trim().optional(),
  description: z.string().trim().min(2, 'English description is required'),
  description_hi: z.string().trim().optional(),
})


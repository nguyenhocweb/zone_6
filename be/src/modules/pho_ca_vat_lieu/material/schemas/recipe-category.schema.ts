import { z } from 'zod';

export const RecipeCategoryCreateSchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải từ 2 ký tự trở lên'),
  code: z.string().trim().optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['customer_product', 'internal_prep', 'both']).optional().default('both'),
  is_active: z.boolean().optional().default(true),
});

export const RecipeCategoryUpdateSchema = RecipeCategoryCreateSchema.partial();

export type RecipeCategoryCreateDto = z.infer<typeof RecipeCategoryCreateSchema>;
export type RecipeCategoryUpdateDto = z.infer<typeof RecipeCategoryUpdateSchema>;

export interface RecipeCategoryResponse {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

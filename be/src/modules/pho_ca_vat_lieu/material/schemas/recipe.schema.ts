import { z } from 'zod';

export const RecipeIngredientSchema = z.object({
  material_id: z.string().optional().nullable(),
  material_name: z.string().min(1, 'Tên nguyên vật liệu không được để trống'),
  quantity: z.coerce.number().min(0, 'Số lượng không được âm'),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  cost: z.coerce.number().optional().default(0),
  notes: z.string().optional().nullable(),
});

export const RecipeStepSchema = z.object({
  step_number: z.coerce.number().min(1),
  title: z.string().min(1, 'Tiêu đề bước không được để trống'),
  instruction: z.string().min(1, 'Nội dung hướng dẫn không được để trống'),
  duration_seconds: z.coerce.number().optional().nullable(),
  tips: z.string().optional().nullable(),
});

export const RecipeCreateSchema = z.object({
  _id: z.string().optional(),
  store_id: z.string().optional().nullable(),
  name: z.string().min(2, 'Tên công thức/món phải từ 2 ký tự trở lên'),
  code: z.string().trim().optional(),
  type: z.enum(['internal_prep', 'customer_product'], {
    errorMap: () => ({ message: 'Loại món phải là internal_prep (nội bộ) hoặc customer_product (khách hàng)' }),
  }),
  category_id: z.string().optional().nullable(),
  category: z.string().min(2, 'Danh mục món không được để trống'),
  price: z.coerce.number().min(0, 'Giá bán không được âm').default(0),
  estimated_cost: z.coerce.number().min(0).optional().default(0),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  serving_size: z.string().optional().default('1 ly'),
  serving_mode: z.enum(['cold', 'hot', 'both']).optional().default('cold'),
  cold_cup_id: z.string().optional().nullable(),
  cold_cup_name: z.string().optional().nullable(),
  hot_cup_id: z.string().optional().nullable(),
  hot_cup_name: z.string().optional().nullable(),
  prep_time_minutes: z.coerce.number().min(0).optional().default(5),
  shelf_life: z.string().optional().nullable(),
  storage_method: z.string().optional().nullable(),
  ingredients: z.array(RecipeIngredientSchema).default([]),
  steps: z.array(RecipeStepSchema).default([]),
  is_active: z.boolean().default(true),
});

export const RecipeUpdateSchema = RecipeCreateSchema.partial();

export type RecipeIngredientDto = z.infer<typeof RecipeIngredientSchema>;
export type RecipeStepDto = z.infer<typeof RecipeStepSchema>;
export type RecipeCreateDto = z.infer<typeof RecipeCreateSchema>;
export type RecipeUpdateDto = z.infer<typeof RecipeUpdateSchema>;

export interface RecipeIngredientResponse {
  material_id: string | null;
  material_name: string;
  quantity: number;
  unit: string;
  cost?: number;
  notes: string | null;
}

export interface RecipeStepResponse {
  step_number: number;
  title: string;
  instruction: string;
  duration_seconds: number | null;
  tips: string | null;
}

export interface RecipeResponse {
  id: string;
  store_id?: string | null;
  name: string;
  code: string;
  type: 'internal_prep' | 'customer_product';
  category_id?: string | null;
  category: string;
  price: number;
  estimated_cost?: number;
  description: string | null;
  image_url: string | null;
  serving_size: string;
  serving_mode?: 'cold' | 'hot' | 'both';
  cold_cup_id?: string | null;
  cold_cup_name?: string | null;
  hot_cup_id?: string | null;
  hot_cup_name?: string | null;
  prep_time_minutes: number;
  shelf_life: string | null;
  storage_method: string | null;
  ingredients_count: number;
  steps_count: number;
  // Công thức bí mật (chỉ trả về cho nhân viên trở lên)
  ingredients?: RecipeIngredientResponse[];
  steps?: RecipeStepResponse[];
  has_recipe_access: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeListResponse {
  recipes: RecipeResponse[];
  total: number;
  internal_prep_count: number;
  customer_product_count: number;
}

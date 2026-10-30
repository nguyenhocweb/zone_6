import { z } from 'zod';

export const recipeIngredientFormSchema = z.object({
  material_id: z.string().optional().nullable(),
  material_name: z.string().min(1, 'Tên nguyên vật liệu không được để trống'),
  quantity: z.number().min(0, 'Số lượng không được âm'),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  cost: z.number().optional(),
  notes: z.string().optional().nullable(),
});

export const recipeStepFormSchema = z.object({
  step_number: z.number().min(1),
  title: z.string().min(1, 'Tiêu đề bước không được để trống'),
  instruction: z.string().min(1, 'Nội dung hướng dẫn không được để trống'),
  duration_seconds: z.number().optional().nullable(),
  tips: z.string().optional().nullable(),
});

export const recipeFormSchema = z.object({
  name: z.string().min(2, 'Tên món/công thức phải từ 2 ký tự trở lên'),
  code: z.string().trim().optional(),
  type: z.enum(['internal_prep', 'customer_product']),
  category_id: z.string().optional().nullable(),
  category: z.string().min(2, 'Danh mục không được để trống'),
  price: z.number().min(0, 'Giá bán không thể âm'),
  estimated_cost: z.number().min(0).optional(),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  serving_size: z.string().optional(),
  serving_mode: z.enum(['cold', 'hot', 'both']).optional(),
  cold_cup_id: z.string().optional().nullable(),
  cold_cup_name: z.string().optional().nullable(),
  hot_cup_id: z.string().optional().nullable(),
  hot_cup_name: z.string().optional().nullable(),
  prep_time_minutes: z.number().min(0).optional(),
  shelf_life: z.string().optional().nullable(),
  storage_method: z.string().optional().nullable(),
  ingredients: z.array(recipeIngredientFormSchema),
  steps: z.array(recipeStepFormSchema),
  is_active: z.boolean(),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

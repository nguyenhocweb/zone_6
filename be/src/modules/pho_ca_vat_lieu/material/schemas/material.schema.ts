import { z } from 'zod';

export const MaterialCreateSchema = z.object({
  store_id: z.string().optional().nullable(),
  name: z.string().min(2, 'Tên vật liệu phải từ 2 ký tự trở lên'),
  code: z.string().trim().optional(),
  category: z.enum(['packaging', 'ingredient', 'topping', 'other'], {
    errorMap: () => ({ message: 'Danh mục phải là packaging, ingredient, topping hoặc other' }),
  }),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  cost_per_unit: z.coerce.number().min(0, 'Giá vốn không thể âm').default(0),
  quantity_in_stock: z.coerce.number().min(0, 'Số lượng tồn không thể âm').default(0),
  min_threshold: z.coerce.number().min(0, 'Ngưỡng tối thiểu không thể âm').default(10),
  temperature_mode: z.enum(['cold', 'hot', 'both', 'other']).optional().default('both'),
  cup_size: z.string().optional().nullable(),
  usage_scope: z.enum(['customer_product', 'internal_prep', 'both']).optional().default('both'),
  portion_unit: z.string().optional().nullable(),
  selling_price: z.coerce.number().min(0, 'Giá bán không thể âm').optional().default(0),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const MaterialUpdateSchema = MaterialCreateSchema.partial();

export const MaterialStockUpdateSchema = z.object({
  quantity_change: z.coerce.number(), // Dương: nhập kho, Âm: xuất kho
  reason: z.string().optional(),
});

export type MaterialCreateDto = z.infer<typeof MaterialCreateSchema>;
export type MaterialUpdateDto = z.infer<typeof MaterialUpdateSchema>;
export type MaterialStockUpdateDto = z.infer<typeof MaterialStockUpdateSchema>;

export interface MaterialResponse {
  id: string;
  store_id: string | null;
  name: string;
  code: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  is_low_stock: boolean;
  temperature_mode?: 'cold' | 'hot' | 'both' | 'other' | string;
  cup_size?: string | null;
  usage_scope?: 'customer_product' | 'internal_prep' | 'both' | string;
  portion_unit?: string | null;
  selling_price?: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialListResponse {
  materials: MaterialResponse[];
  total: number;
  packaging_count: number;
  ingredient_count: number;
  low_stock_count: number;
}

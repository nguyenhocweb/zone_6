import { z } from 'zod';

export const materialFormSchema = z.object({
  name: z.string().min(2, 'Tên vật liệu phải từ 2 ký tự trở lên'),
  code: z.string().trim().optional(),
  category: z.enum(['packaging', 'ingredient', 'topping', 'other']),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  cost_per_unit: z.number().min(0, 'Giá vốn không thể âm'),
  quantity_in_stock: z.number().min(0, 'Số lượng tồn không thể âm'),
  min_threshold: z.number().min(0, 'Ngưỡng tối thiểu không thể âm'),
  temperature_mode: z.enum(['cold', 'hot', 'both', 'other']).optional(),
  cup_size: z.string().optional().nullable(),
  usage_scope: z.enum(['customer_product', 'internal_prep', 'both']).optional(),
  portion_unit: z.string().optional().nullable(),
  selling_price: z.number().min(0, 'Giá bán không thể âm').optional(),
  description: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;

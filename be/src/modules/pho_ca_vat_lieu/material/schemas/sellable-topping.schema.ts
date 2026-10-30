import { z } from 'zod';

export const SellableToppingCreateSchema = z.object({
  store_id: z.string().optional().nullable(),
  topping_id: z.string().optional().nullable(),
  name: z.string().min(2, 'Tên topping bán ra phải từ 2 ký tự trở lên'),
  code: z.string().trim().optional(),
  portion_unit: z.string().min(1, 'Cách thức bán ra không được để trống (vd: 1 vá, 1 miếng, 1 viên)'),
  selling_price: z.coerce.number().min(0, 'Giá bán không thể âm').default(0),
  cost_estimate: z.coerce.number().min(0, 'Giá vốn ước tính không thể âm').optional().default(0),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const SellableToppingUpdateSchema = SellableToppingCreateSchema.partial();

export type SellableToppingCreateDto = z.infer<typeof SellableToppingCreateSchema>;
export type SellableToppingUpdateDto = z.infer<typeof SellableToppingUpdateSchema>;

export interface SellableToppingResponse {
  id: string;
  store_id: string | null;
  topping_id: string | null;
  name: string;
  code: string;
  portion_unit: string;
  selling_price: number;
  cost_estimate: number;
  gross_profit_margin: number; // Tỷ lệ lãi gộp (%)
  stock_quantity?: number; // Số lượng tồn kho thực tế từ bảng toppings
  stock_unit?: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellableToppingListResponse {
  items: SellableToppingResponse[];
  total: number;
}

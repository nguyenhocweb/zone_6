import { z } from 'zod';

export const SubscriptionCreateSchema = z.object({
  name: z.string().min(2, 'Tên gói tối thiểu 2 ký tự').max(100, 'Tên gói tối đa 100 ký tự'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').nullable().optional(),
  price: z.number().min(0, 'Giá không được âm'),
  duration_days: z.number().int().min(1, 'Thời hạn tối thiểu 1 ngày').default(30),
  max_projects: z.number().int().min(1, 'Số slot tối thiểu 1').default(1),
  is_active: z.boolean().default(true),
});

export const SubscriptionUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  price: z.number().min(0).optional(),
  duration_days: z.number().int().min(1).optional(),
  max_projects: z.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
});

export const SubscriptionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type SubscriptionCreateDto = z.infer<typeof SubscriptionCreateSchema>;
export type SubscriptionUpdateDto = z.infer<typeof SubscriptionUpdateSchema>;
export type SubscriptionQueryDto = z.infer<typeof SubscriptionQuerySchema>;

export interface SubscriptionResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  max_projects: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedSubscriptionsResponse {
  items: SubscriptionResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

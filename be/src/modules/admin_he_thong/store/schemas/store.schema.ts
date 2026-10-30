import { z } from 'zod';

export const StoreCreateSchema = z.object({
  store_name: z.string().min(2, 'Tên chi nhánh phải từ 2 ký tự trở lên').trim(),
  store_code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Mã chi nhánh phải từ 2 ký tự')
    .max(20, 'Mã chi nhánh tối đa 20 ký tự')
    .optional(),
  address: z.string().min(3, 'Địa chỉ phải từ 3 ký tự trở lên').trim(),
  phone: z.string().trim().optional().nullable(),
  latitude: z.number().min(-90).max(90, 'Vĩ độ không hợp lệ'),
  longitude: z.number().min(-180).max(180, 'Kinh độ không hợp lệ'),
  geofence_radius_meters: z.number().min(10).max(5000).default(100),
  allowed_checkin_before_minutes: z.number().min(5).max(180).default(30),
  allowed_checkin_after_minutes: z.number().min(5).max(360).default(30),
  is_geofence_required: z.boolean().default(true),
  is_time_window_strict: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

export const StoreUpdateSchema = StoreCreateSchema.partial();

export const StoreStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'Trạng thái hoạt động (is_active) là bắt buộc' }),
});

export type StoreCreateDto = z.infer<typeof StoreCreateSchema>;
export type StoreUpdateDto = z.infer<typeof StoreUpdateSchema>;
export type StoreStatusDto = z.infer<typeof StoreStatusSchema>;

export interface StoreResponse {
  id: string;
  store_name: string;
  store_code: string;
  address: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreListResponse {
  stores: StoreResponse[];
  total: number;
  active_count: number;
  inactive_count: number;
}

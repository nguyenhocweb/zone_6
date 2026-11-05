import { z } from 'zod';

export const storeCreateSchema = z.object({
  store_name: z.string().min(2, 'Tên chi nhánh phải từ 2 ký tự trở lên'),
  store_code: z.string().trim().optional(),
  address: z.string().min(3, 'Địa chỉ chi nhánh phải từ 3 ký tự trở lên'),
  phone: z.string().trim().optional().nullable(),
  latitude: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  longitude: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
  geofence_radius_meters: z.number().min(10, 'Bán kính tối thiểu 10m').max(5000, 'Bán kính tối đa 5000m'),
  allowed_checkin_before_minutes: z.number().min(5).max(180),
  allowed_checkin_after_minutes: z.number().min(5).max(360),
  is_geofence_required: z.boolean(),
  is_time_window_strict: z.boolean(),
  is_active: z.boolean(),
  vat_enabled: z.boolean().default(false).optional(),
  vat_rate: z.number().min(0).max(100).default(8).optional(),
  vat_apply_mode: z.enum(['ALL', 'SPECIFIC_SHIFTS']).default('ALL').optional(),
  vat_applied_shifts: z.array(z.string()).default([]).optional(),
});

export type StoreCreateFormValues = z.infer<typeof storeCreateSchema>;

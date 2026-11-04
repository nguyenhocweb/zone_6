import { z } from 'zod';

export const StoreConfigUpdateSchema = z.object({
  store_name: z.string().min(1, 'Tên quán không được để trống').optional(),
  address: z.string().min(1, 'Địa chỉ không được để trống').optional(),
  latitude: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  longitude: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
  geofence_radius_meters: z
    .number()
    .min(10, 'Bán kính định vị tối thiểu 10 mét')
    .max(5000, 'Bán kính định vị tối đa 5000 mét'),
  allowed_checkin_before_minutes: z
    .number()
    .min(0, 'Số phút trước ca không được âm')
    .max(240, 'Số phút tối đa 240 phút (4 giờ)'),
  allowed_checkin_after_minutes: z
    .number()
    .min(0, 'Số phút sau ca không được âm')
    .max(480, 'Số phút tối đa 480 phút (8 giờ)'),
  is_geofence_required: z.boolean().default(true),
  is_time_window_strict: z.boolean().default(true),
  ordering_mode: z.enum(['STAFF_ONLY', 'CUSTOMER_SELF_ORDER', 'HYBRID']).default('HYBRID').optional(),
  table_geofence_radius_meters: z.number().min(5).max(500).default(30).optional(),
  is_table_geofence_strict: z.boolean().default(true).optional(),
  vat_enabled: z.boolean().default(false).optional(),
  vat_rate: z.number().min(0, 'Thuế VAT không được âm').max(100, 'Thuế VAT tối đa 100%').default(8).optional(),
  vat_apply_mode: z.enum(['ALL', 'SPECIFIC_SHIFTS']).default('ALL').optional(),
  vat_applied_shifts: z.array(z.string()).default([]).optional(),
});

export type StoreConfigUpdateDto = z.infer<typeof StoreConfigUpdateSchema>;

export const VerifyLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type VerifyLocationDto = z.infer<typeof VerifyLocationSchema>;

export interface StoreConfigResponse {
  id: string;
  store_name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  ordering_mode?: 'STAFF_ONLY' | 'CUSTOMER_SELF_ORDER' | 'HYBRID';
  table_geofence_radius_meters?: number;
  is_table_geofence_strict?: boolean;
  vat_enabled?: boolean;
  vat_rate?: number;
  vat_apply_mode?: 'ALL' | 'SPECIFIC_SHIFTS';
  vat_applied_shifts?: string[];
  updated_at?: string | Date;
}

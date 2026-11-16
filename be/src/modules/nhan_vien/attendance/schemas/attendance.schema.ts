import { z } from 'zod';

export const CheckInPayloadSchema = z.object({
  store_id: z.string().nullable().optional(),
  week_start_date: z.string().min(1, 'week_start_date là bắt buộc'),
  day: z.string().min(1, 'day là bắt buộc'),
  shift: z.string().min(1, 'shift là bắt buộc'),
  role: z.string().min(1, 'role là bắt buộc'),
  staff_name: z.string().min(1, 'staff_name là bắt buộc'),
  // BẮT BUỘC: Ảnh chụp điểm danh (Data URL base64 hoặc URL ảnh)
  photo_url: z
    .string({ required_error: 'Ảnh chụp check-in là bắt buộc!' })
    .min(10, 'Ảnh chụp check-in là bắt buộc và không được để trống!'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional().default(0),
  address: z.string().optional().default(''),
  device_info: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  // Chế độ chụp chung ca cho 2 nhân sự
  is_group_checkin: z.boolean().optional().default(false),
  partner_roles: z.array(z.string()).optional().default([]),
  partner_names: z.array(z.string()).optional().default([]),
});

export type CheckInPayloadDto = z.infer<typeof CheckInPayloadSchema>;

export const GetAttendanceSlotQuerySchema = z.object({
  week_start_date: z.string().min(1),
  day: z.string().min(1),
  shift: z.string().min(1),
  role: z.string().min(1),
});

export type GetAttendanceSlotQueryDto = z.infer<typeof GetAttendanceSlotQuerySchema>;

export const CheckOutPayloadSchema = z.object({
  attendance_id: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().optional(),
});

export type CheckOutPayloadDto = z.infer<typeof CheckOutPayloadSchema>;

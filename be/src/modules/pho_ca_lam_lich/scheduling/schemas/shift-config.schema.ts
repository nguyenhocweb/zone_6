import { z } from 'zod';

export const ShiftConfigCreateSchema = z.object({
  shift_name: z.string({ required_error: 'Tên ca làm không được để trống' }).min(2, 'Tên ca phải có ít nhất 2 ký tự').max(50),
  shift_code: z.string().optional(),
  start_time: z.string({ required_error: 'Giờ bắt đầu không được để trống' }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ bắt đầu không đúng định dạng HH:mm'),
  end_time: z.string({ required_error: 'Giờ kết thúc không được để trống' }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ kết thúc không đúng định dạng HH:mm'),
  work_hours: z.number().min(0.5).max(24).optional(),
  min_staff: z.number({ required_error: 'Số nhân viên tối thiểu không được để trống' }).int().min(1, 'Số nhân viên tối thiểu phải từ 1 trở lên').default(2),
  max_staff: z.number().int().min(1).optional().default(4),
  min_barista: z.number().int().min(0).optional().default(1),
  min_service: z.number().int().min(0).optional().default(1),
  color: z.string().optional().default('#D4AF37'),
  apply_days: z.array(z.string()).optional().default(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  display_order: z.number().int().optional().default(1),
  store_id: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  description: z.string().optional().default(''),
});

export const ShiftConfigUpdateSchema = ShiftConfigCreateSchema.partial();

export type ShiftConfigCreateInput = z.infer<typeof ShiftConfigCreateSchema>;
export type ShiftConfigUpdateInput = z.infer<typeof ShiftConfigUpdateSchema>;

import { z } from 'zod';

export const InventoryAuditItemSchema = z.object({
  material_id: z.string().min(1, 'Mã vật tư không được để trống'),
  material_code: z.string().min(1, 'Mã code vật tư không được để trống'),
  material_name: z.string().min(1, 'Tên vật tư không được để trống'),
  category: z.enum(['packaging', 'ingredient', 'topping']),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  system_quantity: z.coerce.number().min(0, 'Số lượng hệ thống không được âm'),
  actual_quantity: z.coerce.number().min(0, 'Số lượng thực tế không được âm'),
  difference: z.coerce.number().optional().default(0),
  count_mode: z.enum(['single', 'batch']).optional().default('single'),
  pack_count: z.coerce.number().optional().nullable(),
  pack_size: z.coerce.number().optional().nullable(),
  loose_count: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const InventoryAuditCreateSchema = z.object({
  store_id: z.string().min(1, 'Chi nhánh kiểm kho không được để trống'),
  audit_shift: z.string().optional().nullable(),
  items: z.array(InventoryAuditItemSchema).min(1, 'Phiếu kiểm kho phải có ít nhất 1 vật tư'),
  adjustment_notes: z.string().optional().nullable(),
});

export const InventoryAuditUpdateSchema = z.object({
  items: z.array(InventoryAuditItemSchema).optional(),
  status: z.enum(['pending_review', 'adjusted', 'confirmed']).optional(),
  adjustment_notes: z.string().optional().nullable(),
  apply_to_stock: z.boolean().optional().default(false), // Đồng bộ số lượng thực tế vào tồn kho
});

export const AuditShiftItemSchema = z.object({
  shift_id: z.string().min(1, 'Mã ca không được để trống'),
  shift_name: z.string().min(1, 'Tên ca không được để trống'),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  is_required: z.boolean().default(true),
});

export const InventoryAuditConfigUpdateSchema = z.object({
  store_id: z.string().optional().nullable(),
  allowed_creator_roles: z
    .array(z.string())
    .min(1, 'Cần chỉ định ít nhất 1 vai trò được phép tạo phiếu kiểm kho'),
  allowed_reviewer_roles: z
    .array(z.string())
    .min(1, 'Cần chỉ định ít nhất 1 vai trò được phép sửa/duyệt phiếu kiểm kho'),
  audit_shifts: z
    .array(AuditShiftItemSchema)
    .min(1, 'Cần thiết lập ít nhất 1 ca kiểm kho trong ngày'),
  frequency_type: z.enum(['daily', 'interval_days', 'weekly']).default('daily'),
  interval_days: z.coerce.number().min(1, 'Khoảng cách ngày phải từ 1 trở lên').max(365).default(1),
  days_of_week: z.array(z.coerce.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  reminder_time: z.string().optional().default('22:00'),
  is_active: z.boolean().default(true),
});

export type InventoryAuditItemDto = z.infer<typeof InventoryAuditItemSchema>;
export type InventoryAuditCreateDto = z.infer<typeof InventoryAuditCreateSchema>;
export type InventoryAuditUpdateDto = z.infer<typeof InventoryAuditUpdateSchema>;
export type AuditShiftItemDto = z.infer<typeof AuditShiftItemSchema>;
export type InventoryAuditConfigUpdateDto = z.infer<typeof InventoryAuditConfigUpdateSchema>;

export interface InventoryAuditResponse {
  id: string;
  audit_code: string;
  store_id: string;
  created_by_id: string;
  created_by_name: string;
  created_by_user_code?: string | null;
  created_by_email?: string | null;
  created_by_role: string;
  audit_shift?: string | null;
  items: InventoryAuditItemDto[];
  total_items_checked: number;
  discrepancy_count: number;
  status: 'pending_review' | 'adjusted' | 'confirmed';
  reviewed_by_id?: string | null;
  reviewed_by_name?: string | null;
  reviewed_by_user_code?: string | null;
  reviewed_by_role?: string | null;
  reviewed_at?: string | null;
  adjustment_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryAuditScheduleStatus {
  today_is_due: boolean;
  next_due_date: string;
  target_shifts_today: AuditShiftItemDto[];
  completed_shifts_today: string[];
  is_today_completed: boolean;
  last_audit_date?: string | null;
}

export interface InventoryAuditConfigResponse {
  id: string;
  store_id?: string | null;
  store_name?: string | null;
  allowed_creator_roles: string[];
  allowed_reviewer_roles: string[];
  audit_shifts: AuditShiftItemDto[];
  frequency_type: 'daily' | 'interval_days' | 'weekly';
  interval_days: number;
  days_of_week: number[];
  reminder_time: string;
  is_active: boolean;
  schedule_status?: InventoryAuditScheduleStatus;
  updated_by_id?: string | null;
  updated_by_name?: string | null;
  updated_by_role?: string | null;
  updated_at: string;
}

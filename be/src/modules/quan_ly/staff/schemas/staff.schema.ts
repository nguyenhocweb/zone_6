import { z } from 'zod';
import { USER_ROLES, type UserRole } from './user-roles.js';

export const StaffCreateSchema = z.object({
  name: z
    .string({ required_error: 'Vui lòng nhập họ tên nhân viên' })
    .min(2, 'Họ tên nhân viên tối thiểu 2 ký tự')
    .max(100, 'Họ tên nhân viên tối đa 100 ký tự')
    .transform((val) => val.trim()),
  email: z
    .string({ required_error: 'Vui lòng nhập email nhân viên' })
    .email('Định dạng email không hợp lệ')
    .transform((val) => val.trim().toLowerCase()),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Vai trò nhân viên không hợp lệ' }),
  }),
  position: z.string().optional().default('Nhân viên'),
  hourly_rate: z
    .number({ invalid_type_error: 'Mức lương cơ sở phải là số' })
    .min(0, 'Mức lương không được âm')
    .optional()
    .default(18000),
  user_code: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toUpperCase() : undefined)),
  assigned_store_id: z.string().optional().nullable(),
  assigned_stores: z.array(z.string()).optional().default([]),
});

export type StaffCreateDto = z.infer<typeof StaffCreateSchema>;

export const StaffUpdateSchema = z.object({
  hourly_rate: z
    .number({ invalid_type_error: 'Mức lương phải là số' })
    .min(0, 'Mức lương không được âm')
    .optional(),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Vai trò nhân viên không hợp lệ' }),
  }).optional(),
  position: z.string().optional(),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),
  assigned_store_id: z.string().optional().nullable(),
  assigned_stores: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export type StaffUpdateDto = z.infer<typeof StaffUpdateSchema>;

export interface StaffItemResponse {
  id: string;
  user_code: string;
  name: string;
  email: string;
  phone: string | null;
  hourly_rate: number;
  qr_code: string;
  role: UserRole;
  role_label: string;
  role_level: number;
  position: string;
  assigned_store_id: string | null;
  assigned_store_name?: string | null;
  assigned_stores?: string[];
  is_active: boolean;
  created_at: string;
}

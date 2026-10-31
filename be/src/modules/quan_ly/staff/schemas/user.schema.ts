import { z } from 'zod';
import { USER_ROLES, type UserRole, USER_ROLE_LABELS } from './user-roles.js';

// Schema Đăng Nhập (Login Only)
export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập email' })
    .email('Định dạng email không hợp lệ')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu' })
    .min(1, 'Mật khẩu không được để trống'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// Schema User
export const UserCreateSchema = z.object({
  user_code: z.string().min(2).max(20).transform((val) => val.trim().toUpperCase()),
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  email: z.string().email('Định dạng email không hợp lệ').transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Vai trò người dùng không hợp lệ' }),
  }),
  phone: z.string().optional().nullable(),
  hourly_rate: z.number().min(0).optional().default(18000),
  position: z.string().optional().default('Nhân viên'),
  assigned_store_id: z.string().optional().nullable(),
  assigned_stores: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional().default(true),
});

export type UserCreateDto = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = UserCreateSchema.partial().omit({ user_code: true });
export type UserUpdateDto = z.infer<typeof UserUpdateSchema>;

// Schema Cập Nhật Hồ Sơ Cá Nhân (User tự cập nhật thông tin)
export const UserUpdateMeSchema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100).optional(),
  phone: z.string().optional().nullable(),
  position: z.string().optional(),
});
export type UserUpdateMeDto = z.infer<typeof UserUpdateMeSchema>;

// Schema Đổi Mật Khẩu (Luồng riêng: Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới)
export const ChangePasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: 'Vui lòng nhập mật khẩu cũ' })
      .min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z
      .string({ required_error: 'Vui lòng nhập mật khẩu mới' })
      .min(6, 'Mật khẩu mới phải có tối thiểu 6 ký tự'),
    confirmPassword: z
      .string({ required_error: 'Vui lòng nhập lại mật khẩu mới' })
      .min(1, 'Vui lòng nhập lại mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu cũ',
    path: ['newPassword'],
  });
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export interface UserResponse {
  id: string;
  user_code: string;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  role_level: number;
  permissions: string[];
  phone?: string | null;
  qr_code?: string;
  hourly_rate?: number;
  position?: string;
  assigned_store_id?: string | null;
  assigned_stores?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  expires_in: number;
}

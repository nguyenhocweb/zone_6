import { z } from 'zod';

export const CreatePayOSConfigSchema = z.object({
  name: z.string().min(2, 'Tên cấu hình tối thiểu 2 ký tự').max(100, 'Tên cấu hình tối đa 100 ký tự'),
  client_id: z.string().min(5, 'PayOS Client ID không hợp lệ'),
  api_key: z.string().min(5, 'PayOS API Key không hợp lệ'),
  checksum_key: z.string().min(5, 'PayOS Checksum Key không hợp lệ'),
  bank_name: z.string().min(2, 'Tên ngân hàng thụ hưởng không hợp lệ').max(50),
  account_number: z.string().min(3, 'Số tài khoản ngân hàng không hợp lệ').max(50),
  account_holder_name: z.string().min(2, 'Tên chủ tài khoản không hợp lệ').max(100),
  is_default: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

export const UpdatePayOSConfigSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  client_id: z.string().min(5).optional(),
  api_key: z.string().min(5).optional(),
  checksum_key: z.string().min(5).optional(),
  bank_name: z.string().min(2).max(50).optional(),
  account_number: z.string().min(3).max(50).optional(),
  account_holder_name: z.string().min(2).max(100).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export const TestPayOSConfigSchema = z.object({
  id: z.string().optional(),
  client_id: z.string().optional(),
  api_key: z.string().optional(),
  checksum_key: z.string().optional(),
});

export type CreatePayOSConfigDTO = z.infer<typeof CreatePayOSConfigSchema>;
export type UpdatePayOSConfigDTO = z.infer<typeof UpdatePayOSConfigSchema>;
export type TestPayOSConfigDTO = z.infer<typeof TestPayOSConfigSchema>;


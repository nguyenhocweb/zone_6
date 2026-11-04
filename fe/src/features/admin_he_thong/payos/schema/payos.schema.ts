import { z } from 'zod';

export const payOSFormSchema = z.object({
  name: z.string().min(2, 'Tên cấu hình tối thiểu 2 ký tự').max(100, 'Tên cấu hình tối đa 100 ký tự'),
  client_id: z.string().min(5, 'PayOS Client ID tối thiểu 5 ký tự'),
  api_key: z.string().min(5, 'PayOS API Key tối thiểu 5 ký tự'),
  checksum_key: z.string().min(5, 'PayOS Checksum Key tối thiểu 5 ký tự'),
  bank_name: z.string().min(2, 'Vui lòng chọn hoặc nhập tên ngân hàng'),
  account_number: z.string().min(3, 'Số tài khoản không hợp lệ'),
  account_holder_name: z.string().min(2, 'Vui lòng nhập tên chủ tài khoản'),
  is_default: z.boolean(),
  is_active: z.boolean(),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

export type PayOSFormValues = z.infer<typeof payOSFormSchema>;

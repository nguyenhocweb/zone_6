import { z } from "zod";

export const staffCreateFormSchema = z.object({
  name: z
    .string()
    .min(2, "Họ và tên nhân viên tối thiểu 2 ký tự")
    .max(100, "Họ và tên tối đa 100 ký tự"),
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Định dạng email không hợp lệ"),
  phone: z
    .string()
    .optional()
    .nullable(),
  role: z.enum([
    "admin_he_thong",
    "quan_ly",
    "truong_ca",
    "pho_ca_lam_lich",
    "pho_ca_vat_lieu",
    "nhan_vien",
  ]),
  position: z.string().optional().default("service"),
  assigned_store_id: z.string().optional().nullable(),
  hourly_rate: z
    .number()
    .min(0, "Mức lương cơ sở không được âm")
    .default(18000),
  user_code: z.string().optional(),
});

export type StaffCreateFormData = z.infer<typeof staffCreateFormSchema>;

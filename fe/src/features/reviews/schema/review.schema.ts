import { z } from 'zod';

export const RequestOtpFormSchema = z.object({
  store_id: z.string().min(1, 'Vui lòng chọn chi nhánh muốn đánh giá'),
  email: z.string().trim().email('Địa chỉ email không hợp lệ'),
  reviewer_name: z
    .string()
    .trim()
    .max(80, 'Tên hiển thị tối đa 80 ký tự')
    .optional()
    .default(''),
  rating: z.number().int().min(1, 'Vui lòng chọn số sao').max(5),
  tags: z.array(z.string()).max(6).default([]),
  comment: z
    .string()
    .trim()
    .min(10, 'Nội dung đánh giá tối thiểu 10 ký tự')
    .max(1000, 'Nội dung đánh giá tối đa 1000 ký tự'),
});

export const VerifyOtpSchema = z.object({
  otp_code: z.string().trim().regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số'),
});

export const OwnerReplySchema = z.object({
  owner_reply: z
    .string()
    .trim()
    .min(2, 'Nội dung phản hồi tối thiểu 2 ký tự')
    .max(1000, 'Nội dung phản hồi tối đa 1000 ký tự'),
});

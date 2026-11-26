import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const RequestReviewOtpSchema = z.object({
  store_id: z.string().regex(objectIdRegex, 'Mã chi nhánh không hợp lệ'),
  email: z.string().trim().email('Địa chỉ email không hợp lệ').max(120, 'Email tối đa 120 ký tự'),
  website_hp: z.string().max(0, 'Phát hiện bot').optional(),
});

export const SubmitReviewSchema = z.object({
  store_id: z.string().regex(objectIdRegex, 'Mã chi nhánh không hợp lệ'),
  email: z.string().trim().email('Địa chỉ email không hợp lệ').max(120),
  otp_code: z.string().trim().regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số'),
  reviewer_name: z
    .string()
    .trim()
    .max(80, 'Tên hiển thị tối đa 80 ký tự')
    .optional()
    .default(''),
  rating: z.number().int().min(1, 'Số sao tối thiểu là 1').max(5, 'Số sao tối đa là 5'),
  tags: z.array(z.string().trim().max(40)).max(6, 'Tối đa 6 thẻ nhận xét').optional().default([]),
  comment: z
    .string()
    .trim()
    .min(10, 'Nội dung đánh giá tối thiểu 10 ký tự')
    .max(1000, 'Nội dung đánh giá tối đa 1000 ký tự'),
  has_images: z.boolean().optional().default(false),
});

export const AttachReviewImagesSchema = z.object({
  images: z
    .array(z.string().url('URL ảnh không hợp lệ'))
    .min(1, 'Cần ít nhất 1 ảnh')
    .max(4, 'Tối đa 4 ảnh cho mỗi đánh giá'),
  upload_proof: z.string().min(10, 'Thiếu mã xác thực upload'),
});

export const ReplyReviewSchema = z.object({
  owner_reply: z
    .string()
    .trim()
    .min(2, 'Nội dung phản hồi tối thiểu 2 ký tự')
    .max(1000, 'Nội dung phản hồi tối đa 1000 ký tự'),
});

export const ToggleReviewStatusSchema = z.object({
  status: z.enum(['PUBLISHED', 'HIDDEN']),
  hidden_reason: z.string().trim().max(300).optional(),
});

export const RequestActionOtpSchema = z.object({
  email: z.string().trim().email('Địa chỉ email không hợp lệ').max(120),
  action: z.enum(['UPDATE', 'DELETE']),
});

export const VerifyActionOtpSchema = z.object({
  email: z.string().trim().email('Địa chỉ email không hợp lệ').max(120),
  otp_code: z.string().trim().regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số'),
  action: z.enum(['UPDATE', 'DELETE']),
});

export const UpdatePublicReviewSchema = z.object({
  action_proof: z.string().min(10, 'Thiếu mã xác thực OTP'),
  reviewer_name: z.string().trim().max(80, 'Tên hiển thị tối đa 80 ký tự').optional().default(''),
  rating: z.number().int().min(1, 'Số sao tối thiểu là 1').max(5, 'Số sao tối đa là 5'),
  tags: z.array(z.string().trim().max(40)).max(6).optional().default([]),
  comment: z
    .string()
    .trim()
    .min(10, 'Nội dung đánh giá tối thiểu 10 ký tự')
    .max(1000, 'Nội dung đánh giá tối đa 1000 ký tự'),
  kept_images: z.array(z.string().url()).max(4).optional().default([]),
  has_new_images: z.boolean().optional().default(false),
});

export const DeletePublicReviewSchema = z.object({
  email: z.string().trim().email('Địa chỉ email không hợp lệ').max(120),
  otp_code: z.string().trim().regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số'),
});

export type RequestReviewOtpDto = z.infer<typeof RequestReviewOtpSchema>;
export type SubmitReviewDto = z.infer<typeof SubmitReviewSchema>;
export type AttachReviewImagesDto = z.infer<typeof AttachReviewImagesSchema>;
export type ReplyReviewDto = z.infer<typeof ReplyReviewSchema>;
export type ToggleReviewStatusDto = z.infer<typeof ToggleReviewStatusSchema>;
export type RequestActionOtpDto = z.infer<typeof RequestActionOtpSchema>;
export type VerifyActionOtpDto = z.infer<typeof VerifyActionOtpSchema>;
export type UpdatePublicReviewDto = z.infer<typeof UpdatePublicReviewSchema>;
export type DeletePublicReviewDto = z.infer<typeof DeletePublicReviewSchema>;

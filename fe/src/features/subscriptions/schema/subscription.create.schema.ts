import { z } from "zod";

export const subscriptionCreateSchema = z.object({
  name: z.string().min(2, "Tên gói dịch vụ phải có tối thiểu 2 ký tự").max(100, "Tên gói tối đa 100 ký tự"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  price: z.number().min(0, "Giá tiền không được nhỏ hơn 0"),
  duration_days: z.number().int().min(1, "Thời hạn tối thiểu là 1 ngày"),
  max_projects: z.number().int().min(1, "Số lượng dự án tối thiểu là 1"),
});

export type SubscriptionCreateFormValues = z.infer<typeof subscriptionCreateSchema>;

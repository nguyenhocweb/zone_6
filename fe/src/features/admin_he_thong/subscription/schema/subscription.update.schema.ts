import { z } from "zod";

export const subscriptionUpdateSchema = z.object({
  name: z.string().min(2, "Tên gói phải từ 2 ký tự").max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  duration_days: z.number().int().min(1).optional(),
  max_projects: z.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
});

export type SubscriptionUpdateFormValues = z.infer<typeof subscriptionUpdateSchema>;

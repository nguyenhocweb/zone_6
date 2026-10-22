import { describe, it, expect } from "vitest";
import { subscriptionCreateSchema } from "@/features/subscriptions/schema/subscription.create.schema";

describe("Subscription Create Schema Validation", () => {
  it("Hợp lệ: Vượt qua khi dữ liệu đúng quy chuẩn", () => {
    const validData = {
      name: "Gói Cao Cấp",
      description: "Đầy đủ tính năng",
      price: 500000,
      duration_days: 30,
      max_projects: 5,
    };
    const result = subscriptionCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("Không hợp lệ: Báo lỗi khi tên gói quá ngắn hoặc giá âm", () => {
    const invalidData = {
      name: "A",
      price: -100,
      duration_days: 0,
      max_projects: 0,
    };
    const result = subscriptionCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.name).toBeDefined();
      expect(fieldErrors.price).toBeDefined();
      expect(fieldErrors.duration_days).toBeDefined();
      expect(fieldErrors.max_projects).toBeDefined();
    }
  });
});

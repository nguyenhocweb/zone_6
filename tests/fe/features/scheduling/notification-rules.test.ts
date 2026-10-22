import { describe, it, expect } from "vitest";
import {
  NotificationSeverity,
  NotificationType,
} from "@/features/scheduling/type/notification.type";

/**
 * Hàm phân loại mức độ ưu tiên theo đúng đặc tả yêu cầu của người dùng:
 * 1. Ca trống chưa có người làm trước 2 ngày: GẤP (urgent)
 * 2. Ca trống chưa có người làm trước 1 ngày (nhắc lại): GẤP (urgent)
 * 3. Hết ca mà chưa checkin: CAO (high)
 * 4. Ca trống sắp tới > 2 ngày: TRUNG BÌNH (medium)
 * 5. Thông báo chung: THẤP (low)
 */
export function classifyShiftNotification(params: {
  hasStaff: boolean;
  isCheckedIn: boolean;
  isShiftEnded: boolean;
  diffHoursUntilStart?: number;
}): { type: NotificationType; severity: NotificationSeverity } | null {
  const { hasStaff, isCheckedIn, isShiftEnded, diffHoursUntilStart } = params;

  // Trường hợp 1: Có người làm, đã hết ca nhưng chưa checkin -> CAO
  if (hasStaff && isShiftEnded && !isCheckedIn) {
    return {
      type: "UNCHECKED_EXPIRED_SHIFT",
      severity: "high",
    };
  }

  // Trường hợp 2 & 3: Ca trống chưa có người làm
  if (!hasStaff && diffHoursUntilStart !== undefined && diffHoursUntilStart > 0) {
    if (diffHoursUntilStart <= 24) {
      // Trước 1 ngày -> GẤP (nhắc lần 2)
      return {
        type: "EMPTY_SLOT_1_DAY",
        severity: "urgent",
      };
    }
    if (diffHoursUntilStart <= 48) {
      // Trước 2 ngày -> GẤP
      return {
        type: "EMPTY_SLOT_2_DAYS",
        severity: "urgent",
      };
    }
    if (diffHoursUntilStart <= 96) {
      // Trước 3-4 ngày -> TRUNG BÌNH
      return {
        type: "EMPTY_SLOT_UPCOMING",
        severity: "medium",
      };
    }
  }

  return null;
}

export function sortNotificationsByPriority<T extends { severity: NotificationSeverity; created_at: string }>(
  items: T[]
): T[] {
  const weights: Record<NotificationSeverity, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...items].sort((a, b) => {
    const diff = weights[b.severity] - weights[a.severity];
    if (diff !== 0) return diff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

describe("Quy tắc phân loại và sắp xếp thông báo ca làm Trưởng Ca", () => {
  it("phải phân loại mức độ CAO khi hết ca mà nhân viên chưa check-in", () => {
    const result = classifyShiftNotification({
      hasStaff: true,
      isCheckedIn: false,
      isShiftEnded: true,
    });

    expect(result).not.toBeNull();
    expect(result?.severity).toBe("high");
    expect(result?.type).toBe("UNCHECKED_EXPIRED_SHIFT");
  });

  it("không báo động khi ca đã kết thúc và đã được điểm danh check-in", () => {
    const result = classifyShiftNotification({
      hasStaff: true,
      isCheckedIn: true,
      isShiftEnded: true,
    });

    expect(result).toBeNull();
  });

  it("phải phân loại mức độ GẤP khi ca trống trước 2 ngày (24h - 48h)", () => {
    const result = classifyShiftNotification({
      hasStaff: false,
      isCheckedIn: false,
      isShiftEnded: false,
      diffHoursUntilStart: 36, // 36 giờ trước ca (1.5 ngày)
    });

    expect(result).not.toBeNull();
    expect(result?.severity).toBe("urgent");
    expect(result?.type).toBe("EMPTY_SLOT_2_DAYS");
  });

  it("phải phân loại mức độ GẤP và nhắc lần 2 khi ca trống trước 1 ngày (<= 24h)", () => {
    const result = classifyShiftNotification({
      hasStaff: false,
      isCheckedIn: false,
      isShiftEnded: false,
      diffHoursUntilStart: 18, // 18 giờ trước ca (< 1 ngày)
    });

    expect(result).not.toBeNull();
    expect(result?.severity).toBe("urgent");
    expect(result?.type).toBe("EMPTY_SLOT_1_DAY");
  });

  it("phải phân loại mức độ TRUNG BÌNH khi ca trống trước 3-4 ngày (> 48h)", () => {
    const result = classifyShiftNotification({
      hasStaff: false,
      isCheckedIn: false,
      isShiftEnded: false,
      diffHoursUntilStart: 72, // 3 ngày
    });

    expect(result).not.toBeNull();
    expect(result?.severity).toBe("medium");
    expect(result?.type).toBe("EMPTY_SLOT_UPCOMING");
  });

  it("phải sắp xếp thông báo theo thứ tự ưu tiên: Gấp -> Cao -> Trung bình -> Thấp", () => {
    const list = [
      { id: "1", severity: "low" as const, created_at: "2026-10-19T08:00:00Z" },
      { id: "2", severity: "high" as const, created_at: "2026-10-19T09:00:00Z" },
      { id: "3", severity: "urgent" as const, created_at: "2026-10-19T07:00:00Z" },
      { id: "4", severity: "medium" as const, created_at: "2026-10-19T10:00:00Z" },
    ];

    const sorted = sortNotificationsByPriority(list);
    expect(sorted.map((s) => s.severity)).toEqual([
      "urgent",
      "high",
      "medium",
      "low",
    ]);
  });
});

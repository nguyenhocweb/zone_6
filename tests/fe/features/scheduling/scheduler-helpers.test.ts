import { describe, it, expect } from "vitest";
import {
  isEligibleForShift,
  getSlotCandidates,
  recalculateMatrix,
  getCurrentMonday,
  getNextMonday,
  getWeekDatesInfo,
  formatDateToISO,
} from "@/features/scheduling/util/scheduler-helpers";
import {
  ScheduleMatrixResponse,
  SlotAssignment,
  StaffRegistrationInput,
} from "@/features/scheduling/type/scheduling.type";

describe("Scheduling Helpers & Candidate Filter", () => {
  it("Kiểm tra đăng ký ca hợp lệ (isEligibleForShift)", () => {
    expect(isEligibleForShift("Sáng, Chiều", "Sáng")).toBe(true);
    expect(isEligibleForShift("Sáng, Chiều", "Chiều")).toBe(true);
    expect(isEligibleForShift("Sáng, Chiều", "Tối")).toBe(false);
    expect(isEligibleForShift("Cả ngày", "Khuya")).toBe(true);
    expect(isEligibleForShift("OFF", "Sáng")).toBe(false);
    expect(isEligibleForShift("", "Sáng")).toBe(false);
  });

  it("Loại trừ nhân sự cùng ca ở ô còn lại khi gợi ý ứng viên", () => {
    // Giả sử Thứ 2, Ca Sáng có 2 vị trí: Pha chế và Giữ xe.
    // "Ngọc" đã được xếp vào "Giữ xe" Ca Sáng Thứ 2.
    // Khi mở sửa ô "Pha chế" Ca Sáng Thứ 2, Ngọc PHẢI BỊ LOẠI TRỪ khỏi gợi ý.
    const allSlots: SlotAssignment[] = [
      {
        day: "Thứ 2",
        shift: "Sáng",
        role: "Pha chế",
        staff_name: null, // Ô đang chỉnh sửa
        is_empty: true,
        is_disabled: false,
        is_leader: false,
      },
      {
        day: "Thứ 2",
        shift: "Sáng",
        role: "Giữ xe",
        staff_name: "Ngọc", // Đã có ở ô còn lại cùng ca
        is_empty: false,
        is_disabled: false,
        is_leader: false,
      },
    ];

    const registrations: StaffRegistrationInput[] = [
      { stt: 1, name: "Nguyên", mon: "Sáng" },
      { stt: 2, name: "Ngọc", mon: "Sáng" }, // Cùng đăng ký Sáng, nhưng đã xếp ô Giữ xe
      { stt: 3, name: "Trâm", mon: "Tối" },  // Không đăng ký Sáng
    ];

    const targetSlot = allSlots[0]; // Pha chế Ca Sáng Thứ 2
    const result = getSlotCandidates(targetSlot, allSlots, registrations);

    // 1. Ngọc phải nằm trong danh sách excludedSameShiftStaff
    expect(result.excludedSameShiftStaff).toContain("Ngọc");

    // 2. Gợi ý chỉ bao gồm Nguyên (đăng ký Sáng và không bị trùng cùng ca)
    const suggestedNames = result.suggestedCandidates.map((c) => c.name);
    expect(suggestedNames).toContain("Nguyên");
    expect(suggestedNames).not.toContain("Ngọc");
    expect(suggestedNames).not.toContain("Trâm");
  });

  it("Tính toán lại ma trận (recalculateMatrix) khi xóa hoặc thêm nhân sự", () => {
    const baseMatrix: ScheduleMatrixResponse = {
      success: true,
      week_range: "Tuần Test",
      evening_shift_mode: 2,
      slots: [
        {
          day: "Thứ 2",
          shift: "Sáng",
          role: "Pha chế",
          staff_name: "Nguyên",
          is_empty: false,
          is_disabled: false,
          is_leader: false,
        },
        {
          day: "Thứ 2",
          shift: "Sáng",
          role: "Giữ xe",
          staff_name: "Lộc",
          is_empty: false,
          is_disabled: false,
          is_leader: false,
        },
      ],
      workloads: [
        { name: "Nguyên", target_shifts: 2, assigned_shifts: 1, status: "Thiếu" },
        { name: "Lộc", target_shifts: 2, assigned_shifts: 1, status: "Thiếu" },
      ],
      registrations: [
        { stt: 1, name: "Nguyên", mon: "Sáng" },
        { stt: 2, name: "Lộc", mon: "Sáng" },
      ],
      total_slots_needed: 2,
      total_slots_filled: 2,
      total_empty_slots: 0,
    };

    // Khi xóa Nguyên khỏi ca Pha chế:
    const newSlots: SlotAssignment[] = [
      {
        ...baseMatrix.slots[0],
        staff_name: null,
        is_empty: true,
      },
      baseMatrix.slots[1],
    ];

    const updated = recalculateMatrix(baseMatrix, newSlots);
    expect(updated.total_slots_filled).toBe(1);
    expect(updated.total_empty_slots).toBe(1);

    const nguyenWorkload = updated.workloads.find((w) => w.name === "Nguyên");
    expect(nguyenWorkload?.assigned_shifts).toBe(0);
    expect(nguyenWorkload?.status).toBe("Thiếu");

    const locWorkload = updated.workloads.find((w) => w.name === "Lộc");
    expect(locWorkload?.assigned_shifts).toBe(1);

    // Khi phân 3 ca (> 2 ca chỉ tiêu) cho Lộc:
    const exceedSlots: SlotAssignment[] = [
      { day: "Thứ 2", shift: "Sáng", role: "Pha chế", staff_name: "Lộc", is_empty: false, is_disabled: false, is_leader: false },
      { day: "Thứ 3", shift: "Sáng", role: "Pha chế", staff_name: "Lộc", is_empty: false, is_disabled: false, is_leader: false },
      { day: "Thứ 4", shift: "Sáng", role: "Pha chế", staff_name: "Lộc", is_empty: false, is_disabled: false, is_leader: false },
    ];
    const exceedUpdated = recalculateMatrix(baseMatrix, exceedSlots);
    const locExceed = exceedUpdated.workloads.find((w) => w.name === "Lộc");
    expect(locExceed?.assigned_shifts).toBe(3);
    expect(locExceed?.status).toBe("Vượt");
  });

  it("Tính toán chính xác ngày tháng Thứ 2 tuần tới theo thời gian hiện tại", () => {
    // Giả sử mốc thời gian hiện tại là Thứ 2, 12/10/2026
    const baseDate = new Date(2026, 9, 12); // Month is 0-indexed: 9 = October
    const currentMon = getCurrentMonday(baseDate);
    expect(formatDateToISO(currentMon)).toBe("2026-10-12");

    // Tuần tới: Thứ 2 tiếp theo phải là 19/10/2026
    const nextMon = getNextMonday(baseDate);
    expect(formatDateToISO(nextMon)).toBe("2026-10-19");

    // Lấy thông tin 7 ngày trong tuần tới
    const weekInfo = getWeekDatesInfo(nextMon);
    expect(weekInfo.startDateStr).toBe("2026-10-19");
    expect(weekInfo.weekRange).toBe("19/10/2026 – 25/10/2026");

    // Kiểm tra từng ngày từ Thứ 2 -> Chủ Nhật
    expect(weekInfo.dayDates["Thứ 2"]).toBe("19/10");
    expect(weekInfo.dayDates["Thứ 3"]).toBe("20/10");
    expect(weekInfo.dayDates["Thứ 4"]).toBe("21/10");
    expect(weekInfo.dayDates["Thứ 5"]).toBe("22/10");
    expect(weekInfo.dayDates["Thứ 6"]).toBe("23/10");
    expect(weekInfo.dayDates["Thứ 7"]).toBe("24/10");
    expect(weekInfo.dayDates["Chủ Nhật"]).toBe("25/10");

    // Ngày đầy đủ
    expect(weekInfo.dayFullDates["Thứ 2"]).toBe("19/10/2026");
    expect(weekInfo.dayFullDates["Chủ Nhật"]).toBe("25/10/2026");
  });

  it("Tính toán chính xác tuần tới khi gọi từ bất kỳ ngày nào trong tuần (VD: Thứ 5, Chủ Nhật)", () => {
    // Thứ 5, 15/10/2026
    const thuDate = new Date(2026, 9, 15);
    const nextMonFromThu = getNextMonday(thuDate);
    expect(formatDateToISO(nextMonFromThu)).toBe("2026-10-19");

    // Chủ Nhật, 18/10/2026
    const sunDate = new Date(2026, 9, 18);
    const nextMonFromSun = getNextMonday(sunDate);
    expect(formatDateToISO(nextMonFromSun)).toBe("2026-10-19");
  });
});

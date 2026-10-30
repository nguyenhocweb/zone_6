import {
  ScheduleMatrixResponse,
  SlotAssignment,
  StaffRegistrationInput,
  StaffWorkloadSummary,
} from "../type/scheduling.type";

export const DAYS_ORDER = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

export const DAY_FIELD_MAP: Record<string, keyof StaffRegistrationInput> = {
  "Thứ 2": "mon",
  "Thứ 3": "tue",
  "Thứ 4": "wed",
  "Thứ 5": "thu",
  "Thứ 6": "fri",
  "Thứ 7": "sat",
  "Chủ Nhật": "sun",
};

/**
 * Định dạng Date thành chuỗi YYYY-MM-DD
 */
export const formatDateToISO = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Định dạng Date thành DD/MM
 */
export const formatDateToShort = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

/**
 * Định dạng Date thành DD/MM/YYYY
 */
export const formatDateToFull = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Lấy Thứ 2 tuần hiện tại (This Week Monday)
 */
export const getCurrentMonday = (baseDate: Date): Date => {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Lấy Thứ 2 tuần trước (Previous Week Monday) tính theo thời gian hiện tại
 */
export const getPreviousMonday = (baseDate: Date): Date => {
  const monday = getCurrentMonday(baseDate);
  monday.setDate(monday.getDate() - 7);
  return monday;
};

/**
 * Lấy Thứ 2 tuần tới (Next Week Monday) tính theo thời gian hiện tại
 */
export const getNextMonday = (baseDate: Date): Date => {
  const monday = getCurrentMonday(baseDate);
  monday.setDate(monday.getDate() + 7);
  return monday;
};

/** Số tiếng bắt buộc phải khóa trước khi tuần làm việc bắt đầu (00:00 Thứ Hai) */
export const MANDATORY_LOCK_HOURS_BEFORE = 28;

/**
 * Kiểm tra xem một tuần đã bị khóa bắt buộc theo thời gian chưa (phải khóa trước 28 tiếng trước 00:00 Thứ Hai).
 * Nếu đã quá thời hạn hoặc tuần đã/đang diễn ra thì trả về true (ĐÃ KHÓA).
 */
export const isWeekMandatorilyLocked = (mondayDateOrStr: Date | string): boolean => {
  let mondayDate: Date;
  if (typeof mondayDateOrStr === "string") {
    const parts = mondayDateOrStr.trim().split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return false;
    mondayDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  } else {
    mondayDate = new Date(mondayDateOrStr);
    mondayDate.setHours(0, 0, 0, 0);
  }
  const mandatoryLockDeadline = new Date(
    mondayDate.getTime() - MANDATORY_LOCK_HOURS_BEFORE * 60 * 60 * 1000
  );
  const now = new Date();
  return now.getTime() >= mandatoryLockDeadline.getTime();
};

export interface WeekDatesInfo {
  startDateStr: string; // "YYYY-MM-DD"
  weekRange: string;    // "19/10/2026 – 25/10/2026"
  dayDates: Record<string, string>; // { "Thứ 2": "19/10", ... }
  dayFullDates: Record<string, string>; // { "Thứ 2": "19/10/2026", ... }
}

/**
 * Tính toàn bộ ngày tháng cho 7 ngày trong tuần từ một ngày Thứ 2 cụ thể
 */
export const getWeekDatesInfo = (mondayDate: Date): WeekDatesInfo => {
  const dayDates: Record<string, string> = {};
  const dayFullDates: Record<string, string> = {};

  DAYS_ORDER.forEach((dayName, idx) => {
    const cur = new Date(mondayDate);
    cur.setDate(mondayDate.getDate() + idx);
    dayDates[dayName] = formatDateToShort(cur);
    dayFullDates[dayName] = formatDateToFull(cur);
  });

  const sunday = new Date(mondayDate);
  sunday.setDate(mondayDate.getDate() + 6);

  const weekRange = `${formatDateToShort(mondayDate)}/${mondayDate.getFullYear()} – ${formatDateToShort(sunday)}/${sunday.getFullYear()}`;

  return {
    startDateStr: formatDateToISO(mondayDate),
    weekRange,
    dayDates,
    dayFullDates,
  };
};

export const SHIFT_HOURS_MAP: Record<string, { startH: number; startM: number; endH: number; endM: number }> = {
  sáng: { startH: 7, startM: 0, endH: 12, endM: 30 },
  chiều: { startH: 12, startM: 30, endH: 17, endM: 30 },
  tối: { startH: 17, startM: 30, endH: 23, endM: 0 },
  khuya: { startH: 23, startM: 0, endH: 31, endM: 0 }, // 07:00 sáng hôm sau
};

export const DAY_OFFSET_MAP: Record<string, number> = {
  "thứ 2": 0,
  "thứ 3": 1,
  "thứ 4": 2,
  "thứ 5": 3,
  "thứ 6": 4,
  "thứ 7": 5,
  "chủ nhật": 6,
};

/**
 * Tính toán thời gian bắt đầu và kết thúc của một ca làm trong tuần
 */
export const getSlotTimeRange = (
  weekStartDateStr: string,
  dayName: string,
  shiftName: string
): { startTime: Date; endTime: Date } | null => {
  if (!weekStartDateStr) return null;
  const parts = weekStartDateStr.trim().split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return null;

  const mondayDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const normalizedDay = dayName.toLowerCase().trim();
  const dayOffset = DAY_OFFSET_MAP[normalizedDay] ?? 0;

  const workDate = new Date(mondayDate);
  workDate.setDate(mondayDate.getDate() + dayOffset);

  const normalizedShift = shiftName.toLowerCase().trim();
  let shiftTime = SHIFT_HOURS_MAP.sáng;
  if (normalizedShift.includes("chiều")) shiftTime = SHIFT_HOURS_MAP.chiều;
  else if (normalizedShift.includes("tối")) shiftTime = SHIFT_HOURS_MAP.tối;
  else if (normalizedShift.includes("khuya")) shiftTime = SHIFT_HOURS_MAP.khuya;

  const startTime = new Date(workDate);
  startTime.setHours(shiftTime.startH, shiftTime.startM, 0, 0);

  const endTime = new Date(workDate);
  if (shiftTime.endH >= 24) {
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(shiftTime.endH - 24, shiftTime.endM, 0, 0);
  } else {
    endTime.setHours(shiftTime.endH, shiftTime.endM, 0, 0);
  }

  return { startTime, endTime };
};

export interface SlotWorkStatus {
  isCompleted: boolean;          // Ca đã kết thúc (đã làm)
  isInProgress: boolean;         // Đang trong ca (đang làm)
  isFuture: boolean;             // Chưa tới giờ ca (tương lai)
  isOlderThanPreviousWeek: boolean; // Quá giới hạn tuần trước
  canEdit: boolean;              // Được phép điều chỉnh (chỉ khi chưa tới ca)
  hasWorkedOrCheckedIn: boolean; // Đã làm ngày đó hoặc đang làm và đã checkin
  canCheckIn: boolean;           // Được phép tích check-in (đang làm hoặc trong khung giờ cho phép)
  isTooEarlyForCheckIn: boolean; // Ca tương lai chưa tới khung giờ check-in
  isTooLateForCheckIn: boolean;  // Đã quá hạn chót check-in
  isValidCheckInWindow: boolean; // Đang trong khung giờ check-in hợp lệ
  checkInMessage: string;        // Thông điệp trạng thái điểm danh
}

/**
 * Kiểm tra trạng thái ca làm:
 * - canEdit: Chỉ được điều chỉnh phân công khi chưa tới ca của ngày đó
 * - canCheckIn: Chỉ được tích check-in cho ca ĐANG LÀM và ĐÃ LÀM trong giới hạn tuần trước trở lại đây
 * - isFuture: Ca trong tương lai chưa bắt đầu -> TUYỆT ĐỐI KHÔNG ĐƯỢC TÍCH HỘ
 * - isOlderThanPreviousWeek: Ca quá hạn tuần trước -> KHÔNG ĐƯỢC ĐIỂM DANH BÙ
 */
export const getSlotWorkStatus = (
  weekStartDateStr: string,
  dayName: string,
  shiftName: string,
  currentNow?: Date,
  checkinWindowMinutes?: { before?: number; after?: number }
): SlotWorkStatus => {
  const range = getSlotTimeRange(weekStartDateStr, dayName, shiftName);
  if (!range) {
    return {
      isCompleted: false,
      isInProgress: false,
      isFuture: true,
      isOlderThanPreviousWeek: false,
      canEdit: true,
      hasWorkedOrCheckedIn: false,
      canCheckIn: false,
      isTooEarlyForCheckIn: true,
      isTooLateForCheckIn: false,
      isValidCheckInWindow: false,
      checkInMessage: "Không xác định được thời gian ca làm",
    };
  }

  const now = currentNow || new Date();
  const nowMs = now.getTime();
  const startMs = range.startTime.getTime();
  const endMs = range.endTime.getTime();

  const previousMonday = getPreviousMonday(now);
  const previousMondayMs = previousMonday.getTime();

  const isCompleted = nowMs >= endMs;
  const isInProgress = nowMs >= startMs && nowMs < endMs;
  const isFuture = nowMs < startMs;
  const isOlderThanPreviousWeek = startMs < previousMondayMs;

  // QUY TẮC ĐIỂM DANH (CHECK-IN) THEO CẤU HÌNH HỆ THỐNG:
  // Cho phép check-in trước ca làm (mặc định 90p theo cấu hình Zone 6, hoặc truyền từ quán)
  // và sau ca làm (mặc định 120p theo cấu hình Zone 6, hoặc truyền từ quán)
  const allowedBefore = checkinWindowMinutes?.before ?? 90;
  const allowedAfter = checkinWindowMinutes?.after ?? 120;

  const earliestAllowedMs = startMs - allowedBefore * 60 * 1000;
  const latestAllowedMs = startMs + allowedAfter * 60 * 1000;

  const isTooEarlyForCheckIn = nowMs < earliestAllowedMs;
  const isTooLateForCheckIn = nowMs > latestAllowedMs;
  const isValidCheckInWindow = !isTooEarlyForCheckIn && !isTooLateForCheckIn && !isOlderThanPreviousWeek;
  const canCheckIn = isValidCheckInWindow;

  let checkInMessage = "";
  if (isTooEarlyForCheckIn) {
    checkInMessage = `Ca ${shiftName} (${dayName}) chưa tới khung giờ check-in! Cấu hình cho phép check-in trước ca tối đa ${allowedBefore} phút.`;
  } else if (isTooLateForCheckIn) {
    checkInMessage = `Ca ${shiftName} (${dayName}) đã quá giờ làm! Quá hạn chót check-in (${allowedAfter} phút sau khi vào ca).`;
  } else if (isCompleted) {
    checkInMessage = `Ca ${shiftName} (${dayName}) đã kết thúc (quá giờ làm).`;
  } else if (isOlderThanPreviousWeek) {
    checkInMessage = `Ca ${shiftName} (${dayName}) đã vượt quá giới hạn tuần trước, không thể điểm danh bù.`;
  } else if (isFuture && !isTooEarlyForCheckIn) {
    checkInMessage = `Ca ${shiftName} (${dayName}) đang trong khung giờ check-in sớm (trước ${allowedBefore}p) - Hợp lệ.`;
  } else if (isInProgress) {
    checkInMessage = `Ca ${shiftName} (${dayName}) đang làm - Hợp lệ.`;
  }

  return {
    isCompleted,
    isInProgress,
    isFuture,
    isOlderThanPreviousWeek,
    canEdit: isFuture,
    hasWorkedOrCheckedIn: isCompleted || isInProgress,
    canCheckIn,
    isTooEarlyForCheckIn,
    isTooLateForCheckIn,
    isValidCheckInWindow,
    checkInMessage,
  };
};

export const normalizeText = (text?: string | null): string => {
  if (!text) return "";
  return text.trim().toLowerCase();
};

export const isEligibleForShift = (
  rawVal: string | undefined | null,
  shiftName: string
): boolean => {
  const val = normalizeText(rawVal);
  if (!val || val === "off" || val === "nghỉ" || val === "bận") return false;
  if (val.includes("cả ngày") || val.includes("full") || val.includes("all")) return true;

  const shiftLower = shiftName.toLowerCase();
  if (shiftLower.includes("sáng") && (val.includes("sáng") || /\b(s|sang)\b/i.test(val))) return true;
  if (shiftLower.includes("chiều") && (val.includes("chiều") || /\b(c|chieu)\b/i.test(val))) return true;
  if (shiftLower.includes("tối") && (val.includes("tối") || /\b(t|toi)\b/i.test(val))) return true;
  if (shiftLower.includes("khuya") && (val.includes("khuya") || /\b(k|khuya)\b/i.test(val))) return true;
  return false;
};

export interface CandidateInfo {
  name: string;
  stt: number;
  registeredNote: string;
  assignedShifts: number;
  assignedShiftToday: string | null; // Tên ca đã làm hôm đó (nếu có)
  isEligible: boolean;
}

export interface SlotCandidatesResult {
  // Những bạn đăng ký ca này, TRỪ ĐI bạn đã có cùng ca ở ô còn lại
  suggestedCandidates: CandidateInfo[];
  // Những bạn đã xếp ở ô còn lại của cùng ca (bị loại trừ)
  excludedSameShiftStaff: string[];
  // Tất cả nhân sự còn lại trong quán
  otherCandidates: CandidateInfo[];
}

/**
 * Lấy danh sách ứng viên gợi ý cho một ô ca:
 * - Lọc những bạn ĐĂNG KÝ ca đó
 * - TRỪ ĐI bạn đã có nếu cùng ca và đã ghi ở ô còn lại
 */
export const getSlotCandidates = (
  targetSlot: SlotAssignment,
  allSlots: SlotAssignment[],
  registrations: StaffRegistrationInput[] = []
): SlotCandidatesResult => {
  // 1. Tìm các bạn đã có cùng ca ở ô còn lại
  const otherSameShiftSlots = allSlots.filter(
    (s) =>
      s.day === targetSlot.day &&
      s.shift === targetSlot.shift &&
      s.role !== targetSlot.role &&
      Boolean(s.staff_name)
  );

  const excludedSameShiftStaff = otherSameShiftSlots
    .map((s) => s.staff_name as string)
    .filter(Boolean);

  const excludedSet = new Set(excludedSameShiftStaff.map((n) => n.toLowerCase()));

  // 2. Tìm các bạn đã xếp ca khác trong cùng ngày (nhưng khác ca)
  const otherSameDayMap = new Map<string, string>();
  allSlots
    .filter(
      (s) =>
        s.day === targetSlot.day &&
        !(s.shift === targetSlot.shift && s.role === targetSlot.role) &&
        Boolean(s.staff_name)
    )
    .forEach((s) => {
      if (s.staff_name) {
        otherSameDayMap.set(s.staff_name.toLowerCase(), `Ca ${s.shift}`);
      }
    });

  // 3. Đếm số ca đã xếp trong tuần của từng nhân sự
  const shiftCounts = new Map<string, number>();
  allSlots.forEach((s) => {
    if (s.staff_name && !s.is_disabled && !s.is_empty) {
      const lower = s.staff_name.toLowerCase();
      shiftCounts.set(lower, (shiftCounts.get(lower) || 0) + 1);
    }
  });

  const dayKey = DAY_FIELD_MAP[targetSlot.day];
  const suggested: CandidateInfo[] = [];
  const others: CandidateInfo[] = [];

  registrations.forEach((staff) => {
    const rawPref = dayKey ? ((staff[dayKey] as string) || "") : "";
    const lowerName = staff.name.toLowerCase();
    const isExcludedFromSameShift = excludedSet.has(lowerName);
    const eligible = isEligibleForShift(rawPref, targetSlot.shift);
    const count = shiftCounts.get(lowerName) || 0;
    const shiftToday = otherSameDayMap.get(lowerName) || null;

    const candidate: CandidateInfo = {
      name: staff.name,
      stt: staff.stt,
      registeredNote: rawPref || "Chưa đăng ký",
      assignedShifts: count,
      assignedShiftToday: shiftToday,
      isEligible: eligible,
    };

    if (isExcludedFromSameShift) {
      // Bị loại trừ tuyệt đối vì cùng ca ở ô còn lại
      return;
    }

    if (eligible) {
      suggested.push(candidate);
    } else {
      others.push(candidate);
    }
  });

  // Sắp xếp gợi ý: Ưu tiên người chưa có ca hôm nay và có tổng số ca trong tuần thấp hơn
  suggested.sort((a, b) => {
    // Ưu tiên chưa có ca hôm nay trước
    if (!a.assignedShiftToday && b.assignedShiftToday) return -1;
    if (a.assignedShiftToday && !b.assignedShiftToday) return 1;
    // Cân bằng số ca
    if (a.assignedShifts !== b.assignedShifts) {
      return a.assignedShifts - b.assignedShifts;
    }
    return a.stt - b.stt;
  });

  others.sort((a, b) => a.stt - b.stt);

  return {
    suggestedCandidates: suggested,
    excludedSameShiftStaff,
    otherCandidates: others,
  };
};

/**
 * Tính toán lại toàn bộ metrics và bảng workloads khi có slot thay đổi
 */
export const recalculateMatrix = (
  prevMatrix: ScheduleMatrixResponse,
  newSlots: SlotAssignment[]
): ScheduleMatrixResponse => {
  const registrations = prevMatrix.registrations || [];

  // Đếm số ca của từng nhân sự
  const counts = new Map<string, number>();
  let totalFilled = 0;
  let totalEmpty = 0;
  let totalNeeded = 0;

  newSlots.forEach((slot) => {
    if (slot.is_disabled) return;
    totalNeeded += 1;

    if (slot.staff_name && slot.staff_name.trim() !== "" && !slot.is_empty) {
      totalFilled += 1;
      const lower = slot.staff_name.toLowerCase();
      counts.set(lower, (counts.get(lower) || 0) + 1);
    } else {
      totalEmpty += 1;
    }
  });

  // Cập nhật bảng Workload
  const updatedWorkloads: StaffWorkloadSummary[] = registrations.map((staff) => {
    const assigned = counts.get(staff.name.toLowerCase()) || 0;
    let status: "Đủ" | "Thiếu" | "Vượt" = "Đủ";
    if (assigned < 2) {
      status = "Thiếu";
    } else if (assigned > 2) {
      status = "Vượt";
    }
    return {
      name: staff.name,
      target_shifts: 2,
      assigned_shifts: assigned,
      status,
    };
  });

  return {
    ...prevMatrix,
    slots: newSlots,
    workloads: updatedWorkloads,
    total_slots_needed: totalNeeded,
    total_slots_filled: totalFilled,
    total_empty_slots: totalEmpty,
  };
};

import type { 
  ScheduleMatrixResponse, 
  SchedulingConfigRequest, 
  SlotAssignment, 
  StaffRegistrationInput, 
  StaffWorkloadSummary 
} from '../schemas/scheduling.schema.js';

export const DAYS_ORDER = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export const DAY_FIELD_MAP: Record<string, keyof StaffRegistrationInput> = {
  'Thứ 2': 'mon',
  'Thứ 3': 'tue',
  'Thứ 4': 'wed',
  'Thứ 5': 'thu',
  'Thứ 6': 'fri',
  'Thứ 7': 'sat',
  'Chủ Nhật': 'sun',
};

export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.trim().toLowerCase();
}

export function isEligibleForShift(rawVal: string, shiftName: string): boolean {
  const val = normalizeText(rawVal);
  if (!val || val === 'off') return false;
  if (val.includes('cả ngày')) return true;

  const shiftLower = shiftName.toLowerCase();
  if (shiftLower === 'sáng' && val.includes('sáng')) return true;
  if (shiftLower === 'chiều' && val.includes('chiều')) return true;
  if (shiftLower === 'tối' && val.includes('tối')) return true;
  if (shiftLower === 'khuya' && val.includes('khuya')) return true;
  return false;
}

export function computeWeekScheduleDates(startDateStr?: string | null): {
  startDate: string;
  weekRange: string;
  dayDates: Record<string, string>;
} {
  let startDt: Date | null = null;
  if (startDateStr) {
    const parsed = new Date(startDateStr);
    if (!isNaN(parsed.getTime())) {
      startDt = parsed;
    }
  }

  if (!startDt) {
    const today = new Date();
    // getDay(): 0 is Sunday, 1 is Monday...
    const dayOfWeek = today.getDay();
    const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    startDt = new Date(today);
    startDt.setDate(today.getDate() + daysToNextMonday);
  }

  const dayDates: Record<string, string> = {};
  const endDt = new Date(startDt);
  endDt.setDate(startDt.getDate() + 6);

  DAYS_ORDER.forEach((dayName, idx) => {
    const curDate = new Date(startDt!);
    curDate.setDate(startDt!.getDate() + idx);
    const d = String(curDate.getDate()).padStart(2, '0');
    const m = String(curDate.getMonth() + 1).padStart(2, '0');
    dayDates[dayName] = `${d}/${m}`;
  });

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const isoDate = startDt.toISOString().split('T')[0];
  const weekRange = `${formatDate(startDt)} – ${formatDate(endDt)}`;

  return {
    startDate: isoDate,
    weekRange,
    dayDates,
  };
}

export class AutoSchedulerEngine {
  private config: SchedulingConfigRequest;
  private staffList: StaffRegistrationInput[];
  private staffByName: Map<string, StaffRegistrationInput>;
  private eveningMode: number;

  constructor(config: SchedulingConfigRequest) {
    this.config = config;
    this.staffList = config.registrations;
    this.staffByName = new Map(config.registrations.map(s => [s.name, s]));
    this.eveningMode = config.evening_shift_mode;
  }

  run(): ScheduleMatrixResponse {
    const shiftSpecs: Array<[string, string]> = [
      ['Sáng', 'Pha chế'],
      ['Sáng', 'Giữ xe'],
      ['Chiều', 'Pha chế'],
      ['Chiều', 'Giữ xe'],
      ['Tối', 'Pha chế'],
      ['Tối', 'Giữ xe'],
      ['Khuya', 'All'],
    ];

    const allActiveSlots: Array<[string, string, string]> = [];
    const disabledSlots = new Set<string>();

    for (const day of DAYS_ORDER) {
      for (const [shiftName, roleName] of shiftSpecs) {
        if (shiftName === 'Tối' && roleName === 'Giữ xe' && this.eveningMode === 1) {
          disabledSlots.add(`${day}:${shiftName}:${roleName}`);
        } else {
          allActiveSlots.push([day, shiftName, roleName]);
        }
      }
    }

    const slotKey = (d: string, s: string, r: string) => `${d}:${s}:${r}`;

    const slotCandidatesMap = new Map<string, string[]>();
    const staffTotalRegDays = new Map<string, number>();

    for (const staff of this.staffList) {
      let cnt = 0;
      for (const d of DAYS_ORDER) {
        const field = DAY_FIELD_MAP[d];
        if (staff[field]) cnt++;
      }
      staffTotalRegDays.set(staff.name, cnt);
    }

    for (const [day, shiftName, roleName] of allActiveSlots) {
      const field = DAY_FIELD_MAP[day];
      const cands: string[] = [];
      for (const staff of this.staffList) {
        const pref = String(staff[field] || '');
        if (isEligibleForShift(pref, shiftName)) {
          cands.push(staff.name);
        }
      }
      slotCandidatesMap.set(slotKey(day, shiftName, roleName), cands);
    }

    const assignedSlots = new Map<string, string | null>();
    for (const [d, s, r] of allActiveSlots) {
      assignedSlots.set(slotKey(d, s, r), null);
    }

    const dailyStaffShifts = new Map<string, Map<string, string[]>>();
    for (const d of DAYS_ORDER) {
      dailyStaffShifts.set(d, new Map());
    }

    const getDailyShifts = (d: string, name: string) => {
      const dayMap = dailyStaffShifts.get(d)!;
      if (!dayMap.has(name)) dayMap.set(name, []);
      return dayMap.get(name)!;
    };

    const staffShiftCounts = new Map<string, number>(this.staffList.map(s => [s.name, 0]));
    const khuyaCounts = new Map<string, number>(this.staffList.map(s => [s.name, 0]));

    // 1. Phân bổ chiến lược ca Khuya
    const nightSlots = allActiveSlots.filter(([_, s]) => s === 'Khuya');

    for (const [day, shiftName, roleName] of nightSlots) {
      const k = slotKey(day, shiftName, roleName);
      const cands = slotCandidatesMap.get(k) || [];
      if (!cands.length) continue;

      const dIdx = DAYS_ORDER.indexOf(day);
      const prevD = dIdx > 0 ? DAYS_ORDER[dIdx - 1] : null;
      const nextD = dIdx < DAYS_ORDER.length - 1 ? DAYS_ORDER[dIdx + 1] : null;

      let nextNightMandatory: string | null = null;
      if (nextD) {
        const nextCands = slotCandidatesMap.get(slotKey(nextD, 'Khuya', 'All')) || [];
        if (nextCands.length === 1) {
          nextNightMandatory = nextCands[0];
        }
      }

      const candsSorted = [...cands].sort((a, b) => {
        const aWorkedYest = prevD && getDailyShifts(prevD, a).includes('Khuya') ? 1 : 0;
        const bWorkedYest = prevD && getDailyShifts(prevD, b).includes('Khuya') ? 1 : 0;
        const aMandatoryNext = nextNightMandatory === a ? 1 : 0;
        const bMandatoryNext = nextNightMandatory === b ? 1 : 0;

        if (aMandatoryNext !== bMandatoryNext) return aMandatoryNext - bMandatoryNext;
        if (aWorkedYest !== bWorkedYest) return aWorkedYest - bWorkedYest;
        
        const aKhuya = khuyaCounts.get(a) || 0;
        const bKhuya = khuyaCounts.get(b) || 0;
        if (aKhuya !== bKhuya) return aKhuya - bKhuya;

        const aTotal = staffShiftCounts.get(a) || 0;
        const bTotal = staffShiftCounts.get(b) || 0;
        return aTotal - bTotal;
      });

      const chosenNight = candsSorted[0];
      assignedSlots.set(k, chosenNight);
      getDailyShifts(day, chosenNight).push(shiftName);
      staffShiftCounts.set(chosenNight, (staffShiftCounts.get(chosenNight) || 0) + 1);
      khuyaCounts.set(chosenNight, (khuyaCounts.get(chosenNight) || 0) + 1);
    }

    // 2. Xếp các slot nghẽn (<= 2 ứng viên)
    const bottleneckSlots = allActiveSlots
      .filter(([d, s, r]) => assignedSlots.get(slotKey(d, s, r)) === null && (slotCandidatesMap.get(slotKey(d, s, r))?.length || 0) <= 2)
      .sort((a, b) => {
        const lenA = slotCandidatesMap.get(slotKey(a[0], a[1], a[2]))?.length || 0;
        const lenB = slotCandidatesMap.get(slotKey(b[0], b[1], b[2]))?.length || 0;
        if (lenA !== lenB) return lenA - lenB;
        return DAYS_ORDER.indexOf(a[0]) - DAYS_ORDER.indexOf(b[0]);
      });

    for (const [day, shiftName, roleName] of bottleneckSlots) {
      const k = slotKey(day, shiftName, roleName);
      const cands = slotCandidatesMap.get(k) || [];
      if (!cands.length) continue;

      let validCands = cands.filter(c => !getDailyShifts(day, c).includes(shiftName));
      if (!validCands.length) validCands = [...cands];

      validCands.sort((a, b) => {
        const aKhuyaToday = getDailyShifts(day, a).includes('Khuya') ? 1 : 0;
        const bKhuyaToday = getDailyShifts(day, b).includes('Khuya') ? 1 : 0;
        if (aKhuyaToday !== bKhuyaToday) return aKhuyaToday - bKhuyaToday;

        const aLen = getDailyShifts(day, a).length;
        const bLen = getDailyShifts(day, b).length;
        if (aLen !== bLen) return aLen - bLen;

        return (staffShiftCounts.get(a) || 0) - (staffShiftCounts.get(b) || 0);
      });

      const chosen = validCands[0];
      assignedSlots.set(k, chosen);
      getDailyShifts(day, chosen).push(shiftName);
      staffShiftCounts.set(chosen, (staffShiftCounts.get(chosen) || 0) + 1);
    }

    // 3. Ưu tiên bảo vệ người đăng ký ít ca (MRV Sort)
    const remainingSlots = allActiveSlots
      .filter(([d, s, r]) => assignedSlots.get(slotKey(d, s, r)) === null)
      .sort((a, b) => {
        const lenA = slotCandidatesMap.get(slotKey(a[0], a[1], a[2]))?.length || 0;
        const lenB = slotCandidatesMap.get(slotKey(b[0], b[1], b[2]))?.length || 0;
        if (lenA !== lenB) return lenA - lenB;
        return DAYS_ORDER.indexOf(a[0]) - DAYS_ORDER.indexOf(b[0]);
      });

    for (const [day, shiftName, roleName] of remainingSlots) {
      const k = slotKey(day, shiftName, roleName);
      const cands = slotCandidatesMap.get(k) || [];
      if (!cands.length) continue;

      const dIdx = DAYS_ORDER.indexOf(day);
      const prevDay = dIdx > 0 ? DAYS_ORDER[dIdx - 1] : null;

      const freeTodayCands: string[] = [];
      for (const c of cands) {
        if (getDailyShifts(day, c).length === 0) {
          if (prevDay && getDailyShifts(prevDay, c).includes('Khuya') && shiftName === 'Sáng') {
            continue;
          }
          freeTodayCands.push(c);
        }
      }

      const fairSort = (a: string, b: string) => {
        const aCount = staffShiftCounts.get(a) || 0;
        const bCount = staffShiftCounts.get(b) || 0;
        if (aCount !== bCount) return aCount - bCount;

        const aReg = staffTotalRegDays.get(a) || 0;
        const bReg = staffTotalRegDays.get(b) || 0;
        if (aReg !== bReg) return aReg - bReg;

        const aStt = this.staffByName.get(a)?.stt || 0;
        const bStt = this.staffByName.get(b)?.stt || 0;
        return aStt - bStt;
      };

      let chosen: string;
      if (freeTodayCands.length) {
        freeTodayCands.sort(fairSort);
        chosen = freeTodayCands[0];
      } else {
        const fallbackCands = cands.filter(c => 
          !getDailyShifts(day, c).includes('Khuya') &&
          !getDailyShifts(day, c).includes(shiftName) &&
          getDailyShifts(day, c).length < 2
        );
        if (fallbackCands.length) {
          fallbackCands.sort(fairSort);
          chosen = fallbackCands[0];
        } else {
          cands.sort(fairSort);
          chosen = cands[0];
        }
      }

      assignedSlots.set(k, chosen);
      getDailyShifts(day, chosen).push(shiftName);
      staffShiftCounts.set(chosen, (staffShiftCounts.get(chosen) || 0) + 1);
    }

    // 4. Cân bằng tải toàn cục (Global Load Leveling)
    let improved = true;
    let iterations = 0;
    while (improved && iterations < 100) {
      improved = false;
      iterations++;

      const underStaff = this.staffList
        .map(s => s.name)
        .filter(n => (staffShiftCounts.get(n) || 0) < 2)
        .sort((a, b) => (staffShiftCounts.get(a) || 0) - (staffShiftCounts.get(b) || 0));

      const overStaff = this.staffList
        .map(s => s.name)
        .filter(n => (staffShiftCounts.get(n) || 0) > 2)
        .sort((a, b) => (staffShiftCounts.get(b) || 0) - (staffShiftCounts.get(a) || 0));

      if (!underStaff.length || !overStaff.length) break;

      for (const uName of underStaff) {
        for (const oName of overStaff) {
          const oCount = staffShiftCounts.get(oName) || 0;
          const uCount = staffShiftCounts.get(uName) || 0;
          if (oCount <= uCount + 1) continue;

          for (const [sKey, holder] of assignedSlots.entries()) {
            if (holder === oName) {
              const [tDay, tShift] = sKey.split(':');
              if (tShift === 'Khuya') continue;

              const cands = slotCandidatesMap.get(sKey) || [];
              if (cands.includes(uName)) {
                if (getDailyShifts(tDay, uName).length === 0) {
                  const tIdx = DAYS_ORDER.indexOf(tDay);
                  const prevT = tIdx > 0 ? DAYS_ORDER[tIdx - 1] : null;
                  if (prevT && getDailyShifts(prevT, uName).includes('Khuya') && tShift === 'Sáng') {
                    continue;
                  }

                  assignedSlots.set(sKey, uName);
                  staffShiftCounts.set(oName, oCount - 1);
                  staffShiftCounts.set(uName, uCount + 1);

                  const oShifts = getDailyShifts(tDay, oName);
                  const oIdx = oShifts.indexOf(tShift);
                  if (oIdx > -1) oShifts.splice(oIdx, 1);

                  getDailyShifts(tDay, uName).push(tShift);
                  improved = true;
                  break;
                }
              }
            }
          }
          if (improved) break;
        }
        if (improved) break;
      }
    }

    // 5. Tổng hợp kết quả
    const slotsResult: SlotAssignment[] = [];
    let totalNeeded = 0;
    let totalFilled = 0;
    let totalEmpty = 0;

    for (const day of DAYS_ORDER) {
      for (const [shiftName, roleName] of shiftSpecs) {
        const k = slotKey(day, shiftName, roleName);
        if (disabledSlots.has(k)) {
          slotsResult.push({
            day,
            shift: shiftName,
            role: roleName,
            staff_name: null,
            is_empty: false,
            is_disabled: true,
            is_leader: false,
            is_checked_in: false,
          });
          continue;
        }

        totalNeeded++;
        const holder = assignedSlots.get(k);
        if (holder) {
          totalFilled++;
          slotsResult.push({
            day,
            shift: shiftName,
            role: roleName,
            staff_name: holder,
            is_empty: false,
            is_disabled: false,
            is_leader: false,
            is_checked_in: false,
          });
        } else {
          totalEmpty++;
          slotsResult.push({
            day,
            shift: shiftName,
            role: roleName,
            staff_name: null,
            is_empty: true,
            is_disabled: false,
            is_leader: false,
            is_checked_in: false,
          });
        }
      }
    }

    const workloads: StaffWorkloadSummary[] = this.staffList.map(staff => {
      const count = staffShiftCounts.get(staff.name) || 0;
      let statusVal: 'Đủ' | 'Thiếu' | 'Vượt' = 'Đủ';
      if (count < 2) statusVal = 'Thiếu';
      else if (count > 2) statusVal = 'Vượt';
      return {
        name: staff.name,
        target_shifts: 2,
        assigned_shifts: count,
        status: statusVal,
      };
    });

    const dates = computeWeekScheduleDates(this.config.start_date);

    return {
      success: true,
      week_range: dates.weekRange,
      start_date: dates.startDate,
      day_dates: dates.dayDates,
      evening_shift_mode: this.eveningMode,
      slots: slotsResult,
      workloads,
      registrations: this.staffList,
      total_slots_needed: totalNeeded,
      total_slots_filled: totalFilled,
      total_empty_slots: totalEmpty,
    };
  }
}

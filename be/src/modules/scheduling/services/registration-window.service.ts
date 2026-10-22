import { Types } from 'mongoose';
import { RegistrationWindowModel, type IRegistrationWindowDoc } from '../models/registration-window.model.js';
import { ShiftRegistrationModel } from '../models/shift-registration.model.js';
import { AppError } from '../../../core/errors.js';

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(str: string): Date {
  const parts = str.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

function getMondayOfDate(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  const d1 = String(monday.getDate()).padStart(2, '0');
  const m1 = String(monday.getMonth() + 1).padStart(2, '0');
  const y1 = monday.getFullYear();

  const d2 = String(sunday.getDate()).padStart(2, '0');
  const m2 = String(sunday.getMonth() + 1).padStart(2, '0');
  const y2 = sunday.getFullYear();

  return `${d1}/${m1}/${y1} – ${d2}/${m2}/${y2}`;
}

/** Số tiếng bắt buộc phải khóa trước khi tuần làm việc bắt đầu (00:00 Thứ Hai) */
export const MANDATORY_LOCK_HOURS_BEFORE = 28;

/**
 * So sánh thời gian hiện tại với ngày bắt đầu làm việc của tuần đó (Thứ Hai 00:00).
 * Quy tắc nghiệp vụ: Bắt buộc phải khóa trước 28 tiếng trước khi bắt đầu làm việc (tức 20:00 Thứ Bảy).
 * Qua thời gian đó thì không được phép mở khóa.
 */
export function isWeekMandatorilyLocked(weekStartDate: string): boolean {
  const parts = weekStartDate.trim().split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return false;
  const mondayDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const mandatoryLockDeadline = new Date(mondayDate.getTime() - MANDATORY_LOCK_HOURS_BEFORE * 60 * 60 * 1000);
  const now = new Date();
  return now.getTime() >= mandatoryLockDeadline.getTime();
}

export interface ConfigureWindowPayload {
  week_start_date: string;
  title?: string;
  is_open: boolean;
  open_at?: string | null;
  close_at?: string | null;
  notes?: string;
}

export interface RegistrationWindowStatus {
  week_start_date: string;
  title: string;
  is_configured: boolean;
  is_open: boolean;
  is_currently_open: boolean;
  open_at: string | null;
  close_at: string | null;
  notes: string;
  time_remaining_ms: number | null;
  created_by_name: string;
  created_by_role: string;
}

export interface RegistrationWeekCard {
  week_start_date: string;
  week_end_date: string;
  week_range: string;
  title: string;
  is_configured: boolean;
  is_open: boolean;
  is_currently_open: boolean;
  open_at: string | null;
  close_at: string | null;
  time_remaining_ms: number | null;
  total_registered: number;
  is_current_week: boolean;
  is_next_week: boolean;
  is_past_week: boolean;
  user_has_registered: boolean;
  user_shifts_count: number;
}

export class RegistrationWindowService {
  /**
   * Lấy trạng thái đợt đăng ký cho tuần chỉ định
   */
  async getWindowStatus(weekStartDate: string): Promise<RegistrationWindowStatus> {
    const trimmedDate = weekStartDate.trim();
    const doc = await RegistrationWindowModel.findOne({ week_start_date: trimmedDate });

    const now = new Date();
    const isMandatoryLocked = isWeekMandatorilyLocked(trimmedDate);

    // Quy tắc: Nếu đã qua hạn bắt buộc khóa trước 28 tiếng, bắt buộc phải khóa
    if (isMandatoryLocked) {
      return {
        week_start_date: trimmedDate,
        title: doc?.title || `Đợt đăng ký lịch làm tuần ${trimmedDate}`,
        is_configured: Boolean(doc),
        is_open: false,
        is_currently_open: false,
        open_at: doc?.open_at ? doc.open_at.toISOString() : null,
        close_at: doc?.close_at ? doc.close_at.toISOString() : null,
        notes: doc?.notes || '',
        time_remaining_ms: 0,
        created_by_name: doc?.created_by_name || '',
        created_by_role: doc?.created_by_role || '',
      };
    }

    if (!doc) {
      // Mặc định nếu người quản lý chưa cấu hình riêng thì mở đăng ký
      return {
        week_start_date: trimmedDate,
        title: `Đăng ký lịch làm tuần ${trimmedDate}`,
        is_configured: false,
        is_open: true,
        is_currently_open: true,
        open_at: null,
        close_at: null,
        notes: '',
        time_remaining_ms: null,
        created_by_name: '',
        created_by_role: '',
      };
    }

    const openAt = doc.open_at ? new Date(doc.open_at) : null;
    const closeAt = doc.close_at ? new Date(doc.close_at) : null;

    let isCurrentlyOpen = doc.is_open;

    // Kiểm tra thời gian bắt đầu mở
    if (isCurrentlyOpen && openAt && now.getTime() < openAt.getTime()) {
      isCurrentlyOpen = false;
    }

    // Kiểm tra thời hạn đóng
    if (isCurrentlyOpen && closeAt && now.getTime() > closeAt.getTime()) {
      isCurrentlyOpen = false;
    }

    const timeRemainingMs = closeAt && isCurrentlyOpen
      ? Math.max(0, closeAt.getTime() - now.getTime())
      : null;

    return {
      week_start_date: doc.week_start_date,
      title: doc.title || `Đợt đăng ký lịch làm tuần ${doc.week_start_date}`,
      is_configured: true,
      is_open: doc.is_open,
      is_currently_open: isCurrentlyOpen,
      open_at: doc.open_at ? doc.open_at.toISOString() : null,
      close_at: doc.close_at ? doc.close_at.toISOString() : null,
      notes: doc.notes || '',
      time_remaining_ms: timeRemainingMs,
      created_by_name: doc.created_by_name || '',
      created_by_role: doc.created_by_role || '',
    };
  }

  /**
   * Cấu hình đợt đăng ký (Chỉ dành cho Quản lý / Trưởng ca / Phó ca làm lịch)
   * Cho phép mở đăng ký, đóng đăng ký, và cài đặt hạn chót ngày giờ cụ thể
   */
  async configureWindow(
    creatorName: string,
    creatorRole: string,
    payload: ConfigureWindowPayload
  ): Promise<IRegistrationWindowDoc> {
    const trimmedDate = payload.week_start_date.trim();
    const isMandatoryLocked = isWeekMandatorilyLocked(trimmedDate);

    // Quy tắc: Bắt buộc phải khóa trước 28 tiếng trước khi bắt đầu làm việc. Qua thời gian đó không cho phép mở lại
    if (Boolean(payload.is_open) && isMandatoryLocked) {
      throw new AppError(
        'Tuần này bắt buộc phải khóa trước 28 tiếng trước khi bắt đầu làm việc. Đã qua thời gian quy định, không được phép mở khóa!',
        400
      );
    }

    const openAt = payload.open_at ? new Date(payload.open_at) : null;
    const closeAt = payload.close_at ? new Date(payload.close_at) : null;

    const updateData = {
      week_start_date: trimmedDate,
      title: payload.title?.trim() || `Đợt đăng ký lịch làm tuần ${trimmedDate}`,
      is_open: Boolean(payload.is_open),
      open_at: openAt,
      close_at: closeAt,
      notes: payload.notes?.trim() || '',
      created_by_name: creatorName,
      created_by_role: creatorRole,
    };

    const doc = await RegistrationWindowModel.findOneAndUpdate(
      { week_start_date: trimmedDate },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return doc;
  }

  /**
   * Kiểm tra xem việc nộp đăng ký ca có được phép tại thời điểm hiện tại không
   */
  async checkRegistrationAllowed(weekStartDate: string): Promise<{ allowed: boolean; message?: string }> {
    if (isWeekMandatorilyLocked(weekStartDate)) {
      return {
        allowed: false,
        message: `Đợt đăng ký ca tuần ${weekStartDate} bắt buộc phải khóa trước 28 tiếng trước ngày bắt đầu làm việc. Đã qua thời gian cho phép đăng ký.`,
      };
    }

    const status = await this.getWindowStatus(weekStartDate);

    if (!status.is_open) {
      return {
        allowed: false,
        message: `Đợt đăng ký lịch làm cho tuần ${weekStartDate} đã được Quản lý đóng lại. Vui lòng liên hệ Trưởng ca/Quản lý.`,
      };
    }

    if (!status.is_currently_open) {
      if (status.close_at && new Date() > new Date(status.close_at)) {
        const formattedDate = new Date(status.close_at).toLocaleString('vi-VN');
        return {
          allowed: false,
          message: `Đợt đăng ký ca làm đã hết hạn vào lúc ${formattedDate}. Biểu mẫu đã tự động đóng.`,
        };
      }

      if (status.open_at && new Date() < new Date(status.open_at)) {
        const formattedDate = new Date(status.open_at).toLocaleString('vi-VN');
        return {
          allowed: false,
          message: `Đợt đăng ký ca làm chưa đến giờ mở (Giờ mở: ${formattedDate}).`,
        };
      }

      return {
        allowed: false,
        message: 'Đợt đăng ký hiện đang đóng.',
      };
    }

    return { allowed: true };
  }

  /**
   * Lấy danh sách các thẻ tuần đăng ký (tình trạng mở / đã khóa, số lượng đã nộp)
   */
  async getAvailableWeeks(currentUserId?: string, _userRole?: string): Promise<RegistrationWeekCard[]> {
    const now = new Date();
    const currentMonday = getMondayOfDate(now);
    const nextMonday = new Date(currentMonday.getTime() + 7 * 86400000);
    const prevMonday = new Date(currentMonday.getTime() - 7 * 86400000);

    const windows = await RegistrationWindowModel.find().lean();
    const registeredWeekDates = await ShiftRegistrationModel.distinct('week_start_date');

    const mondaySet = new Set<string>();
    mondaySet.add(toISODate(prevMonday));
    mondaySet.add(toISODate(currentMonday));
    mondaySet.add(toISODate(nextMonday));

    for (const w of windows) {
      if (w.week_start_date) mondaySet.add(w.week_start_date.trim());
    }
    for (const d of registeredWeekDates) {
      if (d) mondaySet.add(String(d).trim());
    }

    const sortedDates = Array.from(mondaySet).sort((a, b) => a.localeCompare(b));
    const cards: RegistrationWeekCard[] = [];

    const currentMondayStr = toISODate(currentMonday);
    const nextMondayStr = toISODate(nextMonday);

    for (const weekStartStr of sortedDates) {
      const mondayDate = parseISODate(weekStartStr);
      const isMandatoryLocked = isWeekMandatorilyLocked(weekStartStr);
      const sundayDate = new Date(mondayDate.getTime() + 6 * 86400000);
      const weekEndDateStr = toISODate(sundayDate);
      const weekRange = formatWeekRange(mondayDate);

      const winDoc = windows.find((w) => w.week_start_date === weekStartStr);

      let isOpen = winDoc ? winDoc.is_open : true;
      if (isMandatoryLocked) {
        isOpen = false; // Bắt buộc phải khóa
      }

      const openAt = winDoc?.open_at ? new Date(winDoc.open_at) : null;
      const closeAt = winDoc?.close_at ? new Date(winDoc.close_at) : null;

      let isCurrentlyOpen = isOpen;
      if (isMandatoryLocked) {
        isCurrentlyOpen = false;
      } else {
        if (isCurrentlyOpen && openAt && now.getTime() < openAt.getTime()) {
          isCurrentlyOpen = false;
        }
        if (isCurrentlyOpen && closeAt && now.getTime() > closeAt.getTime()) {
          isCurrentlyOpen = false;
        }
      }

      const timeRemainingMs = (closeAt && isCurrentlyOpen && !isMandatoryLocked)
        ? Math.max(0, closeAt.getTime() - now.getTime())
        : null;

      const totalRegistered = await ShiftRegistrationModel.countDocuments({ week_start_date: weekStartStr });

      let userHasRegistered = false;
      let userShiftsCount = 0;

      if (currentUserId) {
        try {
          const userReg = await ShiftRegistrationModel.findOne({
            user_id: new Types.ObjectId(currentUserId),
            week_start_date: weekStartStr,
          }).lean();

          if (userReg) {
            userHasRegistered = true;
            ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach((dayKey) => {
              const val = String((userReg as any)[dayKey] || '').toLowerCase().trim();
              if (val && val !== 'off') {
                userShiftsCount++;
              }
            });
          }
        } catch {
          // ignore invalid ObjectId
        }
      }

      cards.push({
        week_start_date: weekStartStr,
        week_end_date: weekEndDateStr,
        week_range: weekRange,
        title: winDoc?.title || `Đợt đăng ký tuần ${weekRange}`,
        is_configured: Boolean(winDoc),
        is_open: isOpen,
        is_currently_open: isCurrentlyOpen,
        open_at: openAt ? openAt.toISOString() : null,
        close_at: closeAt ? closeAt.toISOString() : null,
        time_remaining_ms: timeRemainingMs,
        total_registered: totalRegistered,
        is_current_week: weekStartStr === currentMondayStr,
        is_next_week: weekStartStr === nextMondayStr,
        is_past_week: weekStartStr < currentMondayStr,
        user_has_registered: userHasRegistered,
        user_shifts_count: userShiftsCount,
      });
    }

    return cards;
  }

  /**
   * Tạo mới đợt đăng ký cho tuần tiếp theo tính theo thời gian thực
   * Quy tắc nghiệp vụ: Hiện tại tuần này chỉ có thể tạo lịch đăng ký cho tuần tiếp theo.
   * Nếu tuần tiếp theo đã có đợt đăng ký và bấm tạo tiếp nữa cho tuần kế tiếp nữa thì thông báo chưa tới tuần đăng ký.
   */
  async createNextWeek(creatorName: string, creatorRole: string): Promise<RegistrationWeekCard> {
    const now = new Date();
    const currentMonday = getMondayOfDate(now);
    const nextMonday = new Date(currentMonday.getTime() + 7 * 86400000);
    const nextMondayStr = toISODate(nextMonday);

    // Kiểm tra xem đợt đăng ký cho tuần tiếp theo đã được tạo trong hệ thống chưa
    const existingNextWeek = await RegistrationWindowModel.findOne({ week_start_date: nextMondayStr });
    if (existingNextWeek) {
      throw new AppError(
        'Chưa tới tuần đăng ký! Hiện tại tuần này chỉ có thể tạo lịch đăng ký cho tuần tiếp theo.',
        400
      );
    }

    // Hạn chót mặc định: trước 28 tiếng khi tuần làm việc bắt đầu (tức 20:00 Thứ 7)
    const defaultCloseAt = new Date(nextMonday.getTime() - MANDATORY_LOCK_HOURS_BEFORE * 60 * 60 * 1000);

    const sundayDate = new Date(nextMonday.getTime() + 6 * 86400000);
    const weekRange = formatWeekRange(nextMonday);

    const doc = await RegistrationWindowModel.findOneAndUpdate(
      { week_start_date: nextMondayStr },
      {
        $set: {
          week_start_date: nextMondayStr,
          title: `Đợt đăng ký lịch làm tuần ${weekRange}`,
          is_open: true,
          open_at: new Date(),
          close_at: defaultCloseAt,
          notes: 'Vui lòng hoàn thành đăng ký ca trước hạn chót 20:00 Thứ 7 (khóa trước 28 tiếng khi tuần mới bắt đầu).',
          created_by_name: creatorName,
          created_by_role: creatorRole,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
      week_start_date: nextMondayStr,
      week_end_date: toISODate(sundayDate),
      week_range: weekRange,
      title: doc.title,
      is_configured: true,
      is_open: true,
      is_currently_open: true,
      open_at: doc.open_at ? doc.open_at.toISOString() : null,
      close_at: doc.close_at ? doc.close_at.toISOString() : null,
      time_remaining_ms: doc.close_at ? Math.max(0, doc.close_at.getTime() - now.getTime()) : null,
      total_registered: 0,
      is_current_week: false,
      is_next_week: true,
      is_past_week: false,
      user_has_registered: false,
      user_shifts_count: 0,
    };
  }

  /**
   * Khóa hoặc Mở nhanh đợt đăng ký cho tuần chỉ định
   */
  async toggleLock(weekStartDate: string, creatorName: string, creatorRole: string): Promise<RegistrationWindowStatus> {
    const trimmedDate = weekStartDate.trim();
    const isMandatoryLocked = isWeekMandatorilyLocked(trimmedDate);

    let doc = await RegistrationWindowModel.findOne({ week_start_date: trimmedDate });

    // Trạng thái hiện tại: nếu đã qua hạn bắt buộc khóa 28 tiếng thì luôn coi là đã khóa
    const currentIsOpen = isMandatoryLocked ? false : (doc ? doc.is_open : false);
    const newIsOpen = !currentIsOpen;

    // Nếu người dùng muốn MỞ LẠI nhưng đã qua mốc 28 tiếng trước khi làm việc: Bắt buộc phải khóa!
    if (newIsOpen && isMandatoryLocked) {
      throw new AppError(
        'Tuần này bắt buộc phải khóa trước 28 tiếng trước khi bắt đầu làm việc. Đã qua thời gian quy định, không được phép mở khóa!',
        400
      );
    }

    await RegistrationWindowModel.findOneAndUpdate(
      { week_start_date: trimmedDate },
      {
        $set: {
          week_start_date: trimmedDate,
          is_open: newIsOpen,
          created_by_name: creatorName,
          created_by_role: creatorRole,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return this.getWindowStatus(trimmedDate);
  }
}

import { WeeklyScheduleModel, type IWeeklyScheduleDoc, type ISlotItem, type IWorkloadItem } from '../models/weekly-schedule.model.js';
import { ScheduleNotificationModel, ALL_ROLE_NOTIFICATION_MODELS } from '../../../shared/notifications/models/notification.model.js';
import { StoreConfigModel } from '../../../admin_he_thong/store-config/models/store-config.model.js';
import { AppError } from '../../../../core/errors.js';

const DAY_OFFSETS: Record<string, number> = {
  'thứ 2': 0,
  't2': 0,
  'thứ 3': 1,
  't3': 1,
  'thứ 4': 2,
  't4': 2,
  'thứ 5': 3,
  't5': 3,
  'thứ 6': 4,
  't6': 4,
  'thứ 7': 5,
  't7': 5,
  'chủ nhật': 6,
  'cn': 6,
};

const SHIFT_HOURS: Record<string, { startH: number; startM: number; endH: number; endM: number }> = {
  'sáng': { startH: 7, startM: 0, endH: 12, endM: 30 },
  'chiều': { startH: 12, startM: 30, endH: 17, endM: 30 },
  'tối': { startH: 17, startM: 30, endH: 23, endM: 0 },
  'khuya': { startH: 23, startM: 0, endH: 31, endM: 0 }, // 07:00 ngày hôm sau
};

function parseISODate(str: string): Date {
  const parts = str.trim().split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

/**
 * Tính toán thời gian bắt đầu và kết thúc của một ca làm trong tuần
 */
export function getShiftTimeRange(
  weekStartDateStr: string,
  dayName: string,
  shiftName: string
): { startTime: Date; endTime: Date } | null {
  const parts = weekStartDateStr.trim().split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return null;

  const mondayDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const normalizedDay = dayName.toLowerCase().trim();
  const dayOffset = DAY_OFFSETS[normalizedDay] ?? 0;
  const workDate = new Date(mondayDate);
  workDate.setDate(mondayDate.getDate() + dayOffset);

  const normalizedShift = shiftName.toLowerCase().trim();
  let shiftTime = SHIFT_HOURS['sáng'];
  if (normalizedShift.includes('chiều')) shiftTime = SHIFT_HOURS['chiều'];
  else if (normalizedShift.includes('tối')) shiftTime = SHIFT_HOURS['tối'];
  else if (normalizedShift.includes('khuya')) shiftTime = SHIFT_HOURS['khuya'];

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
}

export interface SaveWeeklySchedulePayload {
  week_start_date: string;
  store_id?: string | null;
  store_name?: string;
  week_range: string;
  evening_shift_mode?: number;
  slots: ISlotItem[];
  workloads?: IWorkloadItem[];
  status?: 'draft' | 'published';
}

export class WeeklyScheduleService {
  /**
   * Lấy lịch làm việc đã lưu của một tuần theo cơ sở
   */
  async getScheduleByWeek(weekStartDate: string, storeId?: string | null): Promise<IWeeklyScheduleDoc | null> {
    const trimmedDate = weekStartDate.trim();
    const filter: Record<string, any> = { week_start_date: trimmedDate };
    if (storeId) {
      filter.store_id = storeId;
    }
    return WeeklyScheduleModel.findOne(filter);
  }

  /**
   * Lưu hoặc Cập nhật lịch làm việc của một tuần theo cơ sở
   * Tuân thủ 2 quy tắc khắt khe:
   * 1. Lưu lần đầu tạo lịch: Bắt buộc trước 24h tính từ ngày bắt đầu làm việc (trước 00:00 Chủ Nhật).
   * 2. Cập nhật lịch: So sánh từng chi tiết, ca đang diễn ra hoặc đã kết thúc thì KHÔNG ĐƯỢC phép điều chỉnh, chỉ điều chỉnh khi chưa tới ca của ngày đó!
   */
  async saveSchedule(
    payload: SaveWeeklySchedulePayload,
    creatorName: string,
    creatorRole: string
  ): Promise<IWeeklyScheduleDoc> {
    const trimmedDate = payload.week_start_date.trim();
    const mondayDate = parseISODate(trimmedDate);
    const now = new Date();

    const filter: Record<string, any> = { week_start_date: trimmedDate };
    if (payload.store_id) {
      filter.store_id = payload.store_id;
    }

    const existing = await WeeklyScheduleModel.findOne(filter);

    if (!existing) {
      // 1. QUY TẮC LƯU LẦN ĐẦU: Phải trước 24h tính từ ngày bắt đầu làm (trước 00:00 Chủ Nhật)
      const initialDeadline = new Date(mondayDate.getTime() - 24 * 60 * 60 * 1000);
      if (now.getTime() >= initialDeadline.getTime()) {
        throw new AppError(
          'Lịch làm việc phải được tạo và lưu lần đầu trước 24 tiếng tính từ ngày bắt đầu làm (trước 00:00 Chủ Nhật). Đã quá hạn tạo lịch lần đầu!',
          400
        );
      }

      const normalizedWorkloads = (payload.workloads || []).map((w: any) => ({
        name: w.name || w.staff_name,
        staff_name: w.staff_name || w.name,
        assigned_shifts: w.assigned_shifts ?? w.assigned_count ?? 0,
        assigned_count: w.assigned_count ?? w.assigned_shifts ?? 0,
        target_shifts: w.target_shifts ?? w.target_count ?? 2,
        target_count: w.target_count ?? w.target_shifts ?? 2,
        status: w.status || 'Đủ',
      }));

      // Lấy tên cơ sở nếu có
      let storeName = payload.store_name || '';
      if (!storeName && payload.store_id) {
        const storeDoc = await StoreConfigModel.findById(payload.store_id);
        if (storeDoc) storeName = storeDoc.store_name;
      }

      // Tạo mới bản ghi
      const newDoc = await WeeklyScheduleModel.create({
        week_start_date: trimmedDate,
        store_id: payload.store_id || null,
        store_name: storeName,
        week_range: payload.week_range,
        evening_shift_mode: payload.evening_shift_mode || 2,
        slots: payload.slots,
        workloads: normalizedWorkloads,
        status: payload.status || 'published',
        first_created_at: now,
        created_by_name: creatorName,
        created_by_role: creatorRole,
      });

      return newDoc;
    }

    // 2. QUY TẮC CẬP NHẬT: So sánh từng chi tiết, không được phép điều chỉnh ca đang diễn ra hoặc đã qua!
    const oldSlotMap = new Map<string, ISlotItem>();
    existing.slots.forEach((s) => {
      oldSlotMap.set(`${s.day}_${s.shift}_${s.role}`, s);
    });

    for (const newSlot of payload.slots) {
      const key = `${newSlot.day}_${newSlot.shift}_${newSlot.role}`;
      const oldSlot = oldSlotMap.get(key);

      // Nếu có sự thay đổi nhân sự (đổi người hoặc xóa người hoặc thêm người)
      const oldStaff = (oldSlot?.staff_name || '').trim();
      const newStaff = (newSlot.staff_name || '').trim();

      if (oldStaff !== newStaff) {
        const timeRange = getShiftTimeRange(trimmedDate, newSlot.day, newSlot.shift);
        if (timeRange) {
          // Nếu ca đó đã diễn ra hoặc ĐANG TRONG CA:
          if (now.getTime() >= timeRange.startTime.getTime()) {
            throw new AppError(
              `Không được phép điều chỉnh ca ${newSlot.shift} (${newSlot.day}) vì ca này đang diễn ra hoặc đã kết thúc! Chỉ được phép điều chỉnh khi chưa tới ca của ngày đó.`,
              400
            );
          }
        }
      }
    }

    // Nếu tất cả các thay đổi đều hợp lệ, tiến hành cập nhật
    existing.week_range = payload.week_range || existing.week_range;
    existing.evening_shift_mode = payload.evening_shift_mode || existing.evening_shift_mode;
    existing.slots = payload.slots;
    if (payload.workloads) {
      existing.workloads = payload.workloads.map((w: any) => ({
        name: w.name || w.staff_name,
        staff_name: w.staff_name || w.name,
        assigned_shifts: w.assigned_shifts ?? w.assigned_count ?? 0,
        assigned_count: w.assigned_count ?? w.assigned_shifts ?? 0,
        target_shifts: w.target_shifts ?? w.target_count ?? 2,
        target_count: w.target_count ?? w.target_shifts ?? 2,
        status: w.status || 'Đủ',
      }));
    }
    if (payload.status) existing.status = payload.status;
    existing.created_by_name = creatorName;
    existing.created_by_role = creatorRole;

    await existing.save();
    return existing;
  }

  /**
   * Cập nhật nhanh một ô ca đơn lẻ
   * Cũng kiểm tra: chỉ được phép sửa khi chưa tới ca của ngày đó!
   */
  async updateSingleSlot(
    weekStartDate: string,
    slotToUpdate: ISlotItem,
    creatorName: string,
    creatorRole: string,
    storeId?: string | null
  ): Promise<IWeeklyScheduleDoc> {
    const trimmedDate = weekStartDate.trim();
    const filter: Record<string, any> = { week_start_date: trimmedDate };
    if (storeId) {
      filter.store_id = storeId;
    }
    const existing = await WeeklyScheduleModel.findOne(filter);

    if (!existing) {
      throw new AppError('Chưa có lịch làm việc được lưu cho tuần này', 404);
    }

    const timeRange = getShiftTimeRange(trimmedDate, slotToUpdate.day, slotToUpdate.shift);
    const now = new Date();

    if (timeRange && now.getTime() >= timeRange.startTime.getTime()) {
      throw new AppError(
        `Không được phép điều chỉnh ca ${slotToUpdate.shift} (${slotToUpdate.day}) vì ca này đang diễn ra hoặc đã kết thúc! Chỉ được phép điều chỉnh khi chưa tới ca của ngày đó.`,
        400
      );
    }

    // Cập nhật slot
    let found = false;
    existing.slots = existing.slots.map((s) => {
      if (s.day === slotToUpdate.day && s.shift === slotToUpdate.shift && s.role === slotToUpdate.role) {
        found = true;
        return {
          ...s,
          staff_name: slotToUpdate.staff_name,
          is_empty: !slotToUpdate.staff_name,
          is_disabled: Boolean(slotToUpdate.is_disabled),
          is_checked_in: typeof slotToUpdate.is_checked_in === 'boolean' ? slotToUpdate.is_checked_in : s.is_checked_in,
        };
      }
      return s;
    });

    if (!found) {
      existing.slots.push(slotToUpdate);
    }

    existing.created_by_name = creatorName;
    existing.created_by_role = creatorRole;
    await existing.save();

    // Tự động giải quyết thông báo ca trống nếu ca đã được xếp người làm (trên toàn bộ các Table Role)
    if (slotToUpdate.staff_name && slotToUpdate.staff_name.trim() !== '') {
      try {
        const emptySlotBaseCode = `${trimmedDate}:${slotToUpdate.day}:${slotToUpdate.shift}:${slotToUpdate.role || 'slot'}`;
        const emptyCodes = [
          `EMPTY_1D:${emptySlotBaseCode}`,
          `EMPTY_2D:${emptySlotBaseCode}`,
          `EMPTY_UPCOMING:${emptySlotBaseCode}`,
        ];
        for (const model of Object.values(ALL_ROLE_NOTIFICATION_MODELS)) {
          await model.updateMany(
            { code: { $in: emptyCodes } },
            { $set: { is_resolved: true } }
          );
        }
      } catch (err) {
        console.warn('Non-blocking error resolving empty slot notification across roles:', err);
      }
    }

    return existing;
  }

  /**
   * Tích điểm danh (Check-in) cho nhân viên vào đúng ca và ngày đó
   * Quyền thực hiện: Quản lý, Trưởng ca, Admin hệ thống
   * Lưu ý: Điểm danh KHÔNG bị chặn bởi thời gian bắt đầu ca (vì nhân viên check-in khi ca diễn ra hoặc trong ngày đó).
   */
  async toggleSlotCheckIn(
    weekStartDate: string,
    payload: {
      day: string;
      shift: string;
      role: string;
      is_checked_in?: boolean;
      slots?: ISlotItem[];
      week_range?: string;
      evening_shift_mode?: number;
    },
    updaterName: string,
    updaterRole: string
  ): Promise<{ updatedSlot: ISlotItem; is_checked_in: boolean; schedule: IWeeklyScheduleDoc }> {
    const trimmedDate = weekStartDate.trim();
    let existing = await WeeklyScheduleModel.findOne({ week_start_date: trimmedDate });

    // Nếu chưa có lịch tuần lưu trong CSDL nhưng client có gửi kèm slots
    if (!existing) {
      if (payload.slots && payload.slots.length > 0) {
        const now = new Date();
        const targetSlot = payload.slots.find(
          (s) => s.day === payload.day && s.shift === payload.shift && s.role === payload.role
        );
        if (!targetSlot || !targetSlot.staff_name) {
          throw new AppError(
            `Ca ${payload.shift} (${payload.day}) chưa được phân công nhân sự, không thể tích điểm danh!`,
            400
          );
        }
        const nextStatus = typeof payload.is_checked_in === 'boolean'
          ? payload.is_checked_in
          : !targetSlot.is_checked_in;

        // RÀNG BUỘC THỜI GIAN CHECK-IN THEO CẤU HÌNH HỆ THỐNG:
        if (nextStatus === true) {
          const timeRange = getShiftTimeRange(trimmedDate, payload.day, payload.shift);
          if (timeRange) {
            const now = new Date();
            const nowMs = now.getTime();
            const startMs = timeRange.startTime.getTime();

            // Đọc cấu hình check-in từ CSDL (thời gian trước ca được phép)
            const storeConfig = await StoreConfigModel.findOne().exec();
            const allowedBeforeMin = storeConfig?.allowed_checkin_before_minutes ?? 30;
            const earliestAllowedMs = startMs - allowedBeforeMin * 60 * 1000;

            // 1. Chặn check-in khi chưa đến khung giờ cho phép (trước ca quá sớm)
            if (nowMs < earliestAllowedMs) {
              throw new AppError(
                `Chưa tới khung giờ check-in ca ${payload.shift} (${payload.day})! Cấu hình hệ thống chỉ cho phép check-in trước giờ vào ca tối đa ${allowedBeforeMin} phút.`,
                400
              );
            }

            // 2. Giới hạn ca trong quá khứ: chỉ được tích cho ca đang làm và đã làm trong giới hạn từ tuần trước trở lại đây
            const currentMonday = new Date(now);
            const dayOfWeek = currentMonday.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            currentMonday.setDate(currentMonday.getDate() + diff);
            currentMonday.setHours(0, 0, 0, 0);

            const previousMonday = new Date(currentMonday);
            previousMonday.setDate(previousMonday.getDate() - 7);

            if (startMs < previousMonday.getTime()) {
              throw new AppError(
                `Ca ${payload.shift} (${payload.day}) đã vượt quá giới hạn tuần trước! Không thể tích điểm danh bù cho ca đã qua quá lâu.`,
                400
              );
            }
          }
        }

        targetSlot.is_checked_in = nextStatus;

        existing = await WeeklyScheduleModel.create({
          week_start_date: trimmedDate,
          week_range: payload.week_range || trimmedDate,
          evening_shift_mode: payload.evening_shift_mode || 2,
          slots: payload.slots,
          workloads: [],
          status: 'published',
          first_created_at: now,
          created_by_name: updaterName,
          created_by_role: updaterRole,
        });

        return {
          updatedSlot: targetSlot,
          is_checked_in: nextStatus,
          schedule: existing,
        };
      } else {
        throw new AppError(
          'Chưa có lịch làm việc được lưu cho tuần này! Vui lòng lưu lịch trước khi tích điểm danh.',
          404
        );
      }
    }

    // Tìm ô ca trong lịch
    const slotIndex = existing.slots.findIndex(
      (s) => s.day === payload.day && s.shift === payload.shift && s.role === payload.role
    );

    if (slotIndex === -1) {
      throw new AppError(`Không tìm thấy ca ${payload.shift} (${payload.day}) trong lịch làm việc!`, 404);
    }

    const currentSlot = existing.slots[slotIndex];
    if (currentSlot.is_empty || !currentSlot.staff_name) {
      throw new AppError(
        `Ca ${payload.shift} (${payload.day}) chưa có nhân sự phân công, không thể tích điểm danh!`,
        400
      );
    }

    const nextStatus = typeof payload.is_checked_in === 'boolean'
      ? payload.is_checked_in
      : !currentSlot.is_checked_in;

    // RÀNG BUỘC THỜI GIAN CHECK-IN THEO CẤU HÌNH HỆ THỐNG:
    if (nextStatus === true) {
      const timeRange = getShiftTimeRange(trimmedDate, payload.day, payload.shift);
      if (timeRange) {
        const now = new Date();
        const nowMs = now.getTime();
        const startMs = timeRange.startTime.getTime();

        // Đọc cấu hình check-in từ CSDL (thời gian trước ca được phép)
        const storeConfig = await StoreConfigModel.findOne().exec();
        const allowedBeforeMin = storeConfig?.allowed_checkin_before_minutes ?? 30;
        const earliestAllowedMs = startMs - allowedBeforeMin * 60 * 1000;

        // 1. Chặn check-in khi chưa đến khung giờ cho phép (trước ca quá sớm)
        if (nowMs < earliestAllowedMs) {
          throw new AppError(
            `Chưa tới khung giờ check-in ca ${payload.shift} (${payload.day})! Cấu hình hệ thống chỉ cho phép check-in trước giờ vào ca tối đa ${allowedBeforeMin} phút.`,
            400
          );
        }

        // 2. Giới hạn ca trong quá khứ: chỉ được tích cho ca đang làm và đã làm trong giới hạn từ tuần trước trở lại đây
        const currentMonday = new Date(now);
        const dayOfWeek = currentMonday.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentMonday.setDate(currentMonday.getDate() + diff);
        currentMonday.setHours(0, 0, 0, 0);

        const previousMonday = new Date(currentMonday);
        previousMonday.setDate(previousMonday.getDate() - 7);

        if (startMs < previousMonday.getTime()) {
          throw new AppError(
            `Ca ${payload.shift} (${payload.day}) đã vượt quá giới hạn tuần trước! Không thể tích điểm danh bù cho ca đã qua quá lâu.`,
            400
          );
        }
      }
    }

    currentSlot.is_checked_in = nextStatus;
    existing.slots[slotIndex] = currentSlot;
    existing.markModified('slots');
    existing.created_by_name = updaterName;
    existing.created_by_role = updaterRole;

    await existing.save();

    // Tự động giải quyết hoặc kích hoạt lại cảnh báo chưa check-in trên toàn bộ các Table Role
    try {
      if (currentSlot.staff_name && currentSlot.staff_name.trim() !== '') {
        const slotCode = `UNCHECKED:${trimmedDate}:${payload.day}:${payload.shift}:${currentSlot.staff_name.trim()}`;
        for (const model of Object.values(ALL_ROLE_NOTIFICATION_MODELS)) {
          if (nextStatus) {
            await model.updateOne({ code: slotCode }, { $set: { is_resolved: true } });
          } else {
            await model.updateOne({ code: slotCode }, { $set: { is_resolved: false } });
          }
        }
      }
    } catch (err) {
      console.warn('Non-blocking error syncing checkin notification across roles:', err);
    }

    return {
      updatedSlot: currentSlot,
      is_checked_in: nextStatus,
      schedule: existing,
    };
  }
}

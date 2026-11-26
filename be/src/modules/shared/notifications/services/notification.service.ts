import {
  ALL_ROLE_NOTIFICATION_MODELS,
  getNotificationModelForRole,
  ScheduleNotificationModel,
  TruongCaNotificationModel,
  QuanLyNotificationModel,
  AdminNotificationModel,
  PhoCaLamLichNotificationModel,
  PhoCaVatLieuNotificationModel,
  NhanVienNotificationModel,
  type IScheduleNotificationDoc,
  type NotificationSeverity,
  type NotificationType,
} from '../models/notification.model.js';
import { WeeklyScheduleModel } from '../../../pho_ca_lam_lich/scheduling/models/weekly-schedule.model.js';
import { UserModel } from '../../../quan_ly/staff/models/user.model.js';
import { getShiftTimeRange } from '../../../pho_ca_lam_lich/scheduling/services/weekly-schedule.service.js';
import type { Model } from 'mongoose';

function formatVNTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatVNDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export interface NotificationFilterOptions {
  userId?: string;
  userCode?: string;
  userName?: string;
  role?: string;
  targetRole?: string;
  severity?: NotificationSeverity | 'all';
  unreadOnly?: boolean;
  includeResolved?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  role_counts?: Record<string, number>;
}

let lastScanAt = 0;
let activeScanPromise: Promise<void> | null = null;
const SCAN_COOLDOWN_MS = 60 * 1000;

type BulkOp = {
  updateOne?: { filter: Record<string, any>; update: Record<string, any>; upsert?: boolean };
  updateMany?: { filter: Record<string, any>; update: Record<string, any> };
};

function queueUpsert(
  buckets: Map<Model<IScheduleNotificationDoc>, BulkOp[]>,
  model: Model<IScheduleNotificationDoc>,
  item: Partial<IScheduleNotificationDoc> & { code: string }
): void {
  const ops = buckets.get(model) || [];
  ops.push({
    updateOne: {
      filter: { code: item.code },
      update: {
        $set: {
          code: item.code,
          type: item.type,
          severity: item.severity,
          title: item.title,
          message: item.message,
          week_start_date: item.week_start_date,
          day: item.day,
          shift: item.shift,
          role_in_slot: item.role_in_slot || 'All',
          staff_name: item.staff_name || null,
          user_code: item.user_code || null,
          user_id: item.user_id || null,
          shift_start_time: item.shift_start_time || null,
          shift_end_time: item.shift_end_time || null,
          hours_until_shift: item.hours_until_shift ?? null,
          target_role: item.target_role,
          is_resolved: item.is_resolved ?? false,
        },
        $setOnInsert: {
          is_read: false,
          is_dismissed: false,
          read_by: [],
        },
      },
      upsert: true,
    },
  });
  buckets.set(model, ops);
}

function queueResolve(
  buckets: Map<Model<IScheduleNotificationDoc>, BulkOp[]>,
  models: Model<IScheduleNotificationDoc>[],
  codes: string[]
): void {
  for (const model of models) {
    const ops = buckets.get(model) || [];
    ops.push({
      updateMany: {
        filter: { code: { $in: codes }, is_resolved: false },
        update: { $set: { is_resolved: true } },
      },
    });
    buckets.set(model, ops);
  }
}

export class ScheduleNotificationService {
  async scanAndGenerateNotifications(now: Date = new Date()): Promise<void> {
    if (Date.now() - lastScanAt < SCAN_COOLDOWN_MS) {
      return;
    }
    if (activeScanPromise) {
      return activeScanPromise;
    }

    activeScanPromise = this.runBulkScan(now).finally(() => {
      lastScanAt = Date.now();
      activeScanPromise = null;
    });
    return activeScanPromise;
  }

  private async runBulkScan(now: Date): Promise<void> {
    try {
      const schedules = await WeeklyScheduleModel.find({})
        .sort({ week_start_date: -1 })
        .limit(3)
        .lean();
      if (!schedules || schedules.length === 0) return;

      const allUsers = await UserModel.find({ is_active: true }).lean();
      const userByName = new Map<string, any>();
      for (const u of allUsers) {
        const displayName = (u as any).full_name || (u as any).name;
        if (displayName) {
          userByName.set(String(displayName).trim().toLowerCase(), u);
        }
      }

      const buckets = new Map<Model<IScheduleNotificationDoc>, BulkOp[]>();
      const allModels = Object.values(ALL_ROLE_NOTIFICATION_MODELS);
      const staffManagers = [
        TruongCaNotificationModel,
        QuanLyNotificationModel,
        AdminNotificationModel,
        PhoCaLamLichNotificationModel,
      ];

      for (const schedule of schedules) {
        if (!schedule.slots || schedule.slots.length === 0) continue;

        for (const slot of schedule.slots) {
          if (slot.is_disabled) continue;

          const timeRange = getShiftTimeRange(schedule.week_start_date, slot.day, slot.shift);
          if (!timeRange) continue;
          const { startTime, endTime } = timeRange;

          if (slot.staff_name && slot.staff_name.trim() !== '' && !slot.is_empty) {
            const staffTrim = slot.staff_name.trim();
            const matchedUser = userByName.get(staffTrim.toLowerCase());
            const staffUserId = matchedUser ? String(matchedUser._id) : null;
            const staffUserCode = matchedUser?.user_code || null;
            const staffDisplayName = matchedUser?.full_name || matchedUser?.name || staffTrim;

            const hasShiftEnded = now.getTime() > endTime.getTime();
            const slotCode = `UNCHECKED:${schedule.week_start_date}:${slot.day}:${slot.shift}:${staffUserCode || staffTrim}`;

            if (hasShiftEnded) {
              if (!slot.is_checked_in) {
                const base = {
                  code: slotCode,
                  type: 'UNCHECKED_EXPIRED_SHIFT' as NotificationType,
                  severity: 'high' as NotificationSeverity,
                  week_start_date: schedule.week_start_date,
                  day: slot.day,
                  shift: slot.shift,
                  role_in_slot: slot.role || 'All',
                  staff_name: staffDisplayName,
                  user_code: staffUserCode,
                  user_id: staffUserId,
                  shift_start_time: startTime,
                  shift_end_time: endTime,
                  is_resolved: false,
                };
                queueUpsert(buckets, TruongCaNotificationModel, {
                  ...base,
                  title: `⚠️ Hết ca chưa điểm danh: [${staffUserCode || 'NV'}] ${staffDisplayName}`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} của nhân sự [${staffUserCode || 'N/A'}] ${staffDisplayName} đã kết thúc lúc ${formatVNTime(endTime)} nhưng chưa được tích điểm danh check-in!`,
                  target_role: 'truong_ca',
                });
                queueUpsert(buckets, QuanLyNotificationModel, {
                  ...base,
                  title: `⚠️ Quá giờ chưa check-in: [${staffUserCode || 'NV'}] ${staffDisplayName}`,
                  message: `Nhân sự [${staffUserCode || 'N/A'}] ${staffDisplayName} ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} chưa được trưởng ca điểm danh sau khi hết ca.`,
                  target_role: 'quan_ly',
                });
                queueUpsert(buckets, AdminNotificationModel, {
                  ...base,
                  title: `⚠️ Hết ca chưa check-in: [${staffUserCode || 'NV'}] ${staffDisplayName}`,
                  message: `Ca ${slot.shift} (${slot.day}) của [${staffUserCode || 'N/A'}] ${staffDisplayName} đã hết lúc ${formatVNTime(endTime)} nhưng chưa có dữ liệu check-in.`,
                  target_role: 'admin_he_thong',
                });
                queueUpsert(buckets, NhanVienNotificationModel, {
                  ...base,
                  title: `⚠️ Bạn chưa được check-in ca ${slot.shift} (${slot.day})`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} của bạn [Mã NV: ${staffUserCode || 'N/A'}] đã hết giờ làm lúc ${formatVNTime(endTime)} nhưng chưa được ghi nhận check-in. Vui lòng báo trưởng ca để tích điểm danh!`,
                  target_role: 'nhan_vien',
                });
              } else {
                queueResolve(buckets, allModels, [slotCode]);
              }
            } else {
              const isToday =
                now.getDate() === startTime.getDate() &&
                now.getMonth() === startTime.getMonth() &&
                now.getFullYear() === startTime.getFullYear();

              if (isToday && startTime.getTime() > now.getTime()) {
                const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                queueUpsert(buckets, NhanVienNotificationModel, {
                  code: `STAFF_SHIFT:${schedule.week_start_date}:${slot.day}:${slot.shift}:${staffUserCode || staffTrim}`,
                  type: 'SHIFT_PERSONAL_REMINDER' as NotificationType,
                  severity: (diffHours <= 2 ? 'high' : 'medium') as NotificationSeverity,
                  title: `📅 Ca làm hôm nay: Ca ${slot.shift} (${formatVNTime(startTime)} - ${formatVNTime(endTime)})`,
                  message: `Chào ${staffDisplayName} [Mã NV: ${staffUserCode || 'N/A'}], bạn có lịch làm ca ${slot.shift} ngày ${slot.day} (${formatVNDate(startTime)}). Hãy có mặt trước 10 phút để nhận bàn giao ca!`,
                  week_start_date: schedule.week_start_date,
                  day: slot.day,
                  shift: slot.shift,
                  role_in_slot: slot.role || 'All',
                  staff_name: staffDisplayName,
                  user_code: staffUserCode,
                  user_id: staffUserId,
                  shift_start_time: startTime,
                  shift_end_time: endTime,
                  hours_until_shift: Math.round(diffHours),
                  target_role: 'nhan_vien',
                  is_resolved: false,
                });
              }
            }
          }

          const isEmptySlot = !slot.staff_name || slot.staff_name.trim() === '' || slot.is_empty;
          const emptySlotBaseCode = `${schedule.week_start_date}:${slot.day}:${slot.shift}:${slot.role || 'slot'}`;
          const code1Day = `EMPTY_1D:${emptySlotBaseCode}`;
          const code2Days = `EMPTY_2D:${emptySlotBaseCode}`;
          const codeUpcoming = `EMPTY_UPCOMING:${emptySlotBaseCode}`;

          if (isEmptySlot) {
            if (startTime.getTime() > now.getTime()) {
              const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
              const baseEmpty = {
                week_start_date: schedule.week_start_date,
                day: slot.day,
                shift: slot.shift,
                role_in_slot: slot.role || 'All',
                staff_name: null,
                shift_start_time: startTime,
                shift_end_time: endTime,
                hours_until_shift: Math.round(diffHours),
                is_resolved: false,
              };

              if (diffHours <= 24) {
                const p = {
                  ...baseEmpty,
                  code: code1Day,
                  type: 'EMPTY_SLOT_1_DAY' as NotificationType,
                  severity: 'urgent' as NotificationSeverity,
                  title: `🚨 KHẨN CẤP: Ca trống trước 1 ngày chưa có người!`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} chỉ còn ~${Math.max(1, Math.round(diffHours))} giờ nữa là bắt đầu nhưng VẪN CHƯA CÓ NGƯỜI LÀM (Nhắc lần 2)! Cần điều phối gấp.`,
                };
                queueUpsert(buckets, TruongCaNotificationModel, { ...p, target_role: 'truong_ca' });
                queueUpsert(buckets, QuanLyNotificationModel, { ...p, target_role: 'quan_ly' });
                queueUpsert(buckets, AdminNotificationModel, { ...p, target_role: 'admin_he_thong' });
                queueUpsert(buckets, PhoCaLamLichNotificationModel, {
                  ...p,
                  target_role: 'pho_ca_lam_lich',
                  title: `🚨 Ca trống gấp cần xếp: Ca ${slot.shift} (${slot.day})`,
                });
                queueResolve(buckets, staffManagers, [code2Days]);
              } else if (diffHours <= 48) {
                const p = {
                  ...baseEmpty,
                  code: code2Days,
                  type: 'EMPTY_SLOT_2_DAYS' as NotificationType,
                  severity: 'urgent' as NotificationSeverity,
                  title: `⚠️ GẤP: Ca trống trước 2 ngày chưa có người làm`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} còn ~${Math.round(diffHours)} giờ nữa bắt đầu nhưng hiện đang trống nhân sự. Cần xếp người vào ca.`,
                };
                queueUpsert(buckets, TruongCaNotificationModel, { ...p, target_role: 'truong_ca' });
                queueUpsert(buckets, QuanLyNotificationModel, { ...p, target_role: 'quan_ly' });
                queueUpsert(buckets, AdminNotificationModel, { ...p, target_role: 'admin_he_thong' });
                queueUpsert(buckets, PhoCaLamLichNotificationModel, {
                  ...p,
                  target_role: 'pho_ca_lam_lich',
                  title: `⚠️ Cần xếp ca trống: Ca ${slot.shift} (${slot.day})`,
                });
              } else if (diffHours <= 96) {
                const p = {
                  ...baseEmpty,
                  code: codeUpcoming,
                  type: 'EMPTY_SLOT_UPCOMING' as NotificationType,
                  severity: 'medium' as NotificationSeverity,
                  title: `Ca trống sắp tới (còn ~${Math.round(diffHours / 24)} ngày)`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} hiện chưa có người nhận ca. Hãy chuẩn bị nhân sự dự phòng.`,
                };
                queueUpsert(buckets, TruongCaNotificationModel, { ...p, target_role: 'truong_ca' });
                queueUpsert(buckets, QuanLyNotificationModel, { ...p, target_role: 'quan_ly' });
                queueUpsert(buckets, AdminNotificationModel, { ...p, target_role: 'admin_he_thong' });
                queueUpsert(buckets, PhoCaLamLichNotificationModel, { ...p, target_role: 'pho_ca_lam_lich' });
              }
            }
          } else {
            queueResolve(buckets, staffManagers, [code1Day, code2Days, codeUpcoming]);
          }

          if (startTime.getTime() > now.getTime()) {
            const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (diffHours <= 6) {
              queueUpsert(buckets, PhoCaVatLieuNotificationModel, {
                code: `MATERIAL:${schedule.week_start_date}:${slot.day}:${slot.shift}`,
                type: 'MATERIAL_CHECK_REMINDER' as NotificationType,
                severity: (diffHours <= 2 ? 'high' : 'medium') as NotificationSeverity,
                title: `📦 Chuẩn bị vật liệu ca ${slot.shift} (${slot.day})`,
                message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} sắp diễn ra trong ~${Math.max(1, Math.round(diffHours))}h. Phó ca vật liệu vui lòng kiểm tra tồn kho đá, sữa, syrup và vật tư pha chế sẵn sàng!`,
                week_start_date: schedule.week_start_date,
                day: slot.day,
                shift: slot.shift,
                role_in_slot: slot.role || 'All',
                staff_name: null,
                shift_start_time: startTime,
                shift_end_time: endTime,
                hours_until_shift: Math.round(diffHours),
                target_role: 'pho_ca_vat_lieu',
                is_resolved: false,
              });
            }
          }
        }
      }

      await Promise.all(
        Array.from(buckets.entries())
          .filter(([, ops]) => ops.length > 0)
          .map(([model, ops]) => model.bulkWrite(ops as any[], { ordered: false }))
      );
    } catch (err) {
      console.error('Error scanning schedule notifications across role collections:', err);
    }
  }

  /**
   * Lấy danh sách thông báo và số liệu thống kê từ Table Collection của Role tương ứng
   */
  async getNotifications(options: NotificationFilterOptions = {}): Promise<{
    notifications: IScheduleNotificationDoc[];
    stats: NotificationStats;
    target_role: string;
    role_tables: string[];
  }> {
    // 1. Quét đồng bộ dữ liệu mới nhất
    await this.scanAndGenerateNotifications();

    // 2. Xác định Role cần lấy dữ liệu - Mỗi Role chỉ xem dữ liệu trong Table của chính mình
    const effectiveRole = options.role || options.targetRole || 'nhan_vien';
    const targetModel = getNotificationModelForRole(effectiveRole);

    const query: any = {};
    query.is_dismissed = false;

    if (!options.includeResolved) {
      query.is_resolved = false;
    }

    if (options.severity && options.severity !== 'all') {
      query.severity = options.severity;
    }

    // Nếu là nhân viên: CHỈ ĐƯỢC THẤY THÔNG BÁO CỦA CHÍNH BẢN THÂN THEO ID / USER_CODE / TÊN
    // Tuyệt đối không dùng chung hay thấy thông báo của nhân viên khác
    if (effectiveRole === 'nhan_vien') {
      const staffConditions: any[] = [];
      if (options.userId) {
        staffConditions.push({ user_id: String(options.userId) });
      }
      if (options.userCode) {
        staffConditions.push({ user_code: options.userCode });
      }
      if (options.userName) {
        staffConditions.push({ staff_name: options.userName });
      }

      if (staffConditions.length > 0) {
        query.$or = staffConditions;
      } else {
        query._id = { $in: [] };
      }
    }

    if (options.unreadOnly && options.userCode) {
      query.read_by = { $ne: options.userCode };
    }

    const docs = await targetModel.find(query).lean();

    // Sắp xếp theo mức độ ưu tiên: urgent (4) -> high (3) -> medium (2) -> low (1)
    const priorityWeight: Record<NotificationSeverity, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const sorted = (docs as IScheduleNotificationDoc[]).sort((a, b) => {
      const weightA = priorityWeight[a.severity] || 0;
      const weightB = priorityWeight[b.severity] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Thống kê trên tập dữ liệu hợp lệ của role này (đã qua lọc ID nếu là nhân viên)
    const countQuery = { ...query, is_dismissed: false, is_resolved: false };
    const activeDocs = await targetModel.find(countQuery).lean();

    const roleCounts: Record<string, number> = {};
    roleCounts[effectiveRole] = activeDocs.length;

    const stats: NotificationStats = {
      total: activeDocs.length,
      unread: options.userCode
        ? activeDocs.filter((d: any) => !d.read_by?.includes(options.userCode)).length
        : activeDocs.filter((d: any) => !d.is_read).length,
      urgent_count: activeDocs.filter((d: any) => d.severity === 'urgent').length,
      high_count: activeDocs.filter((d: any) => d.severity === 'high').length,
      medium_count: activeDocs.filter((d: any) => d.severity === 'medium').length,
      low_count: activeDocs.filter((d: any) => d.severity === 'low').length,
      role_counts: roleCounts,
    };

    const formattedList = sorted.map((item) => ({
      ...item,
      is_read: options.userCode ? (item.read_by || []).includes(options.userCode) : item.is_read,
    }));

    return {
      notifications: formattedList as IScheduleNotificationDoc[],
      stats,
      target_role: effectiveRole,
      role_tables: Object.keys(ALL_ROLE_NOTIFICATION_MODELS),
    };
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(notificationId: string, userCode?: string, role?: string): Promise<boolean> {
    const update: any = { is_read: true };
    if (userCode) {
      update.$addToSet = { read_by: userCode };
    }

    if (role && ALL_ROLE_NOTIFICATION_MODELS[role]) {
      const res = await ALL_ROLE_NOTIFICATION_MODELS[role].findByIdAndUpdate(notificationId, update);
      return !!res;
    }

    // Fallback: Tìm và cập nhật trên toàn bộ các table
    for (const model of Object.values(ALL_ROLE_NOTIFICATION_MODELS)) {
      const res = await model.findByIdAndUpdate(notificationId, update);
      if (res) return true;
    }
    return false;
  }

  /**
   * Đánh dấu toàn bộ thông báo là đã đọc cho Role
   */
  async markAllAsRead(userCode?: string, role?: string): Promise<number> {
    const query: any = { is_dismissed: false, is_resolved: false };
    const update: any = { is_read: true };
    if (userCode) {
      update.$addToSet = { read_by: userCode };
    }

    let totalModified = 0;
    if (role && ALL_ROLE_NOTIFICATION_MODELS[role]) {
      const res = await ALL_ROLE_NOTIFICATION_MODELS[role].updateMany(query, update);
      return res.modifiedCount;
    }

    for (const model of Object.values(ALL_ROLE_NOTIFICATION_MODELS)) {
      const res = await model.updateMany(query, update);
      totalModified += res.modifiedCount;
    }
    return totalModified;
  }

  /**
   * Ẩn / Bỏ qua thông báo (dismiss)
   */
  async dismissNotification(notificationId: string, role?: string): Promise<boolean> {
    if (role && ALL_ROLE_NOTIFICATION_MODELS[role]) {
      const res = await ALL_ROLE_NOTIFICATION_MODELS[role].findByIdAndUpdate(notificationId, {
        $set: { is_dismissed: true },
      });
      return !!res;
    }

    for (const model of Object.values(ALL_ROLE_NOTIFICATION_MODELS)) {
      const res = await model.findByIdAndUpdate(notificationId, {
        $set: { is_dismissed: true },
      });
      if (res) return true;
    }
    return false;
  }
}

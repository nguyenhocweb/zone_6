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
import { WeeklyScheduleModel } from '../models/weekly-schedule.model.js';
import { UserModel } from '../../user/models/user.model.js';
import { getShiftTimeRange } from './weekly-schedule.service.js';
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

async function upsertToModel(
  model: Model<IScheduleNotificationDoc>,
  item: Partial<IScheduleNotificationDoc> & { code: string }
): Promise<void> {
  await model.findOneAndUpdate(
    { code: item.code },
    {
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
    { upsert: true, returnDocument: 'after' }
  );
}

export class ScheduleNotificationService {
  /**
   * Quét và tự động đồng bộ cảnh báo vào các TABLE RIÊNG BIỆT CHO TỪNG ROLE trong MongoDB:
   * 1. notifications_truong_ca (Trưởng ca: Hết ca chưa check-in [Cao], Ca trống 1-2 ngày [Gấp])
   * 2. notifications_quan_ly (Quản lý: Cảnh báo toàn quán, ca trống, quá hạn check-in)
   * 3. notifications_admin (Admin: Giám sát toàn hệ thống)
   * 4. notifications_pho_ca_lam_lich (Phó ca làm lịch: Ca trống cần xếp gấp, đợt đăng ký)
   * 5. notifications_pho_ca_vat_lieu (Phó ca vật liệu: Nhắc kiểm tra vật liệu trước ca)
   * 6. notifications_nhan_vien (Nhân viên: Nhắc ca làm cá nhân, nhắc check-in, đợt đăng ký)
   */
  async scanAndGenerateNotifications(now: Date = new Date()): Promise<void> {
    try {
      const schedules = await WeeklyScheduleModel.find({}).sort({ week_start_date: -1 }).limit(10);
      if (!schedules || schedules.length === 0) return;

      // Nạp danh sách User để gắn ID (user_id) và Mã NV (user_code) chính xác, tránh dùng chung thông báo
      const allUsers = await UserModel.find({ is_active: true }).lean();
      const userByName = new Map<string, any>();
      for (const u of allUsers) {
        if (u.name) {
          userByName.set(u.name.trim().toLowerCase(), u);
        }
      }

      for (const schedule of schedules) {
        if (!schedule.slots || schedule.slots.length === 0) continue;

        for (const slot of schedule.slots) {
          if (slot.is_disabled) continue;

          const timeRange = getShiftTimeRange(schedule.week_start_date, slot.day, slot.shift);
          if (!timeRange) continue;

          const { startTime, endTime } = timeRange;

          // =========================================================================
          // 1. TRƯỜNG HỢP: HẾT CA MÀ CHƯA CHECK-IN -> MỨC ĐỘ CAO (HIGH)
          // Gắn ID cụ thể của nhân viên (user_id, user_code) để không bị nhầm lẫn dùng chung
          // =========================================================================
          if (slot.staff_name && slot.staff_name.trim() !== '' && !slot.is_empty) {
            const staffTrim = slot.staff_name.trim();
            const matchedUser = userByName.get(staffTrim.toLowerCase());
            const staffUserId = matchedUser ? String(matchedUser._id) : null;
            const staffUserCode = matchedUser?.user_code || null;
            const staffDisplayName = matchedUser?.name || staffTrim;

            const hasShiftEnded = now.getTime() > endTime.getTime();
            const slotCode = `UNCHECKED:${schedule.week_start_date}:${slot.day}:${slot.shift}:${staffUserCode || staffTrim}`;

            if (hasShiftEnded) {
              if (!slot.is_checked_in) {
                // Đẩy vào Table Trưởng ca
                await upsertToModel(TruongCaNotificationModel, {
                  code: slotCode,
                  type: 'UNCHECKED_EXPIRED_SHIFT' as NotificationType,
                  severity: 'high' as NotificationSeverity,
                  title: `⚠️ Hết ca chưa điểm danh: [${staffUserCode || 'NV'}] ${staffDisplayName}`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} của nhân sự [${staffUserCode || 'N/A'}] ${staffDisplayName} đã kết thúc lúc ${formatVNTime(endTime)} nhưng chưa được tích điểm danh check-in!`,
                  week_start_date: schedule.week_start_date,
                  day: slot.day,
                  shift: slot.shift,
                  role_in_slot: slot.role || 'All',
                  staff_name: staffDisplayName,
                  user_code: staffUserCode,
                  user_id: staffUserId,
                  shift_start_time: startTime,
                  shift_end_time: endTime,
                  target_role: 'truong_ca',
                  is_resolved: false,
                });

                // Đẩy vào Table Quản lý
                await upsertToModel(QuanLyNotificationModel, {
                  code: slotCode,
                  type: 'UNCHECKED_EXPIRED_SHIFT' as NotificationType,
                  severity: 'high' as NotificationSeverity,
                  title: `⚠️ Quá giờ chưa check-in: [${staffUserCode || 'NV'}] ${staffDisplayName}`,
                  message: `Nhân sự [${staffUserCode || 'N/A'}] ${staffDisplayName} ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} chưa được trưởng ca điểm danh sau khi hết ca.`,
                  week_start_date: schedule.week_start_date,
                  day: slot.day,
                  shift: slot.shift,
                  role_in_slot: slot.role || 'All',
                  staff_name: staffDisplayName,
                  user_code: staffUserCode,
                  user_id: staffUserId,
                  shift_start_time: startTime,
                  shift_end_time: endTime,
                  target_role: 'quan_ly',
                  is_resolved: false,
                });

                // Đẩy vào Table Admin
                await upsertToModel(AdminNotificationModel, {
                  code: slotCode,
                  type: 'UNCHECKED_EXPIRED_SHIFT' as NotificationType,
                  severity: 'high' as NotificationSeverity,
                  title: `⚠️ Hết ca chưa check-in: [${staffUserCode || 'NV'}] ${staffDisplayName}`,
                  message: `Ca ${slot.shift} (${slot.day}) của [${staffUserCode || 'N/A'}] ${staffDisplayName} đã hết lúc ${formatVNTime(endTime)} nhưng chưa có dữ liệu check-in.`,
                  week_start_date: schedule.week_start_date,
                  day: slot.day,
                  shift: slot.shift,
                  role_in_slot: slot.role || 'All',
                  staff_name: staffDisplayName,
                  user_code: staffUserCode,
                  user_id: staffUserId,
                  shift_start_time: startTime,
                  shift_end_time: endTime,
                  target_role: 'admin_he_thong',
                  is_resolved: false,
                });

                // Đẩy vào Table Nhân viên - Gắn chặt user_id và user_code của chính nhân viên đó
                await upsertToModel(NhanVienNotificationModel, {
                  code: slotCode,
                  type: 'UNCHECKED_EXPIRED_SHIFT' as NotificationType,
                  severity: 'high' as NotificationSeverity,
                  title: `⚠️ Bạn chưa được check-in ca ${slot.shift} (${slot.day})`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} của bạn [Mã NV: ${staffUserCode || 'N/A'}] đã hết giờ làm lúc ${formatVNTime(endTime)} nhưng chưa được ghi nhận check-in. Vui lòng báo trưởng ca để tích điểm danh!`,
                  week_start_date: schedule.week_start_date,
                  day: slot.day,
                  shift: slot.shift,
                  role_in_slot: slot.role || 'All',
                  staff_name: staffDisplayName,
                  user_code: staffUserCode,
                  user_id: staffUserId,
                  shift_start_time: startTime,
                  shift_end_time: endTime,
                  target_role: 'nhan_vien',
                  is_resolved: false,
                });
              } else {
                // Đã check-in -> Đánh dấu resolved trên toàn bộ các table
                for (const model of Object.values(ALL_ROLE_NOTIFICATION_MODELS)) {
                  await model.updateOne({ code: slotCode }, { $set: { is_resolved: true } });
                }
              }
            } else {
              // Ca chưa hết: Nếu là ca trong ngày của nhân viên -> Tạo thông báo nhắc ca làm cá nhân cho Nhân viên
              const isToday =
                now.getDate() === startTime.getDate() &&
                now.getMonth() === startTime.getMonth() &&
                now.getFullYear() === startTime.getFullYear();

              if (isToday && startTime.getTime() > now.getTime()) {
                const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                const staffShiftCode = `STAFF_SHIFT:${schedule.week_start_date}:${slot.day}:${slot.shift}:${staffUserCode || staffTrim}`;
                await upsertToModel(NhanVienNotificationModel, {
                  code: staffShiftCode,
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

          // =========================================================================
          // 2. TRƯỜNG HỢP: CA TRỐNG CHƯA CÓ NGƯỜI LÀM
          // - Trước 2 ngày (24h - 48h): GẤP (URGENT)
          // - Trước 1 ngày (<= 24h): GẤP (URGENT - Nhắc lần 2)
          // =========================================================================
          const isEmptySlot = !slot.staff_name || slot.staff_name.trim() === '' || slot.is_empty;
          const emptySlotBaseCode = `${schedule.week_start_date}:${slot.day}:${slot.shift}:${slot.role || 'slot'}`;
          const code1Day = `EMPTY_1D:${emptySlotBaseCode}`;
          const code2Days = `EMPTY_2D:${emptySlotBaseCode}`;
          const codeUpcoming = `EMPTY_UPCOMING:${emptySlotBaseCode}`;

          if (isEmptySlot) {
            if (startTime.getTime() > now.getTime()) {
              const diffMs = startTime.getTime() - now.getTime();
              const diffHours = diffMs / (1000 * 60 * 60);

              if (diffHours <= 24) {
                // TRƯỚC 1 NGÀY (<= 24h) -> GẤP (Nhắc lần 2)
                const payload = {
                  code: code1Day,
                  type: 'EMPTY_SLOT_1_DAY' as NotificationType,
                  severity: 'urgent' as NotificationSeverity,
                  title: `🚨 KHẨN CẤP: Ca trống trước 1 ngày chưa có người!`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} chỉ còn ~${Math.max(1, Math.round(diffHours))} giờ nữa là bắt đầu nhưng VẪN CHƯA CÓ NGƯỜI LÀM (Nhắc lần 2)! Cần điều phối gấp.`,
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

                // Lưu đồng bộ vào Table Trưởng ca, Quản lý, Admin và Phó ca làm lịch
                await upsertToModel(TruongCaNotificationModel, { ...payload, target_role: 'truong_ca' });
                await upsertToModel(QuanLyNotificationModel, { ...payload, target_role: 'quan_ly' });
                await upsertToModel(AdminNotificationModel, { ...payload, target_role: 'admin_he_thong' });
                await upsertToModel(PhoCaLamLichNotificationModel, {
                  ...payload,
                  target_role: 'pho_ca_lam_lich',
                  title: `🚨 Ca trống gấp cần xếp: Ca ${slot.shift} (${slot.day})`,
                });

                // Giải quyết cảnh báo 2 ngày trước để tránh trùng lặp
                for (const model of [
                  TruongCaNotificationModel,
                  QuanLyNotificationModel,
                  AdminNotificationModel,
                  PhoCaLamLichNotificationModel,
                ]) {
                  await model.updateOne({ code: code2Days }, { $set: { is_resolved: true } });
                }
              } else if (diffHours <= 48) {
                // TRƯỚC 2 NGÀY (24h - 48h) -> GẤP (URGENT)
                const payload = {
                  code: code2Days,
                  type: 'EMPTY_SLOT_2_DAYS' as NotificationType,
                  severity: 'urgent' as NotificationSeverity,
                  title: `⚠️ GẤP: Ca trống trước 2 ngày chưa có người làm`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} còn ~${Math.round(diffHours)} giờ nữa bắt đầu nhưng hiện đang trống nhân sự. Cần xếp người vào ca.`,
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

                await upsertToModel(TruongCaNotificationModel, { ...payload, target_role: 'truong_ca' });
                await upsertToModel(QuanLyNotificationModel, { ...payload, target_role: 'quan_ly' });
                await upsertToModel(AdminNotificationModel, { ...payload, target_role: 'admin_he_thong' });
                await upsertToModel(PhoCaLamLichNotificationModel, {
                  ...payload,
                  target_role: 'pho_ca_lam_lich',
                  title: `⚠️ Cần xếp ca trống: Ca ${slot.shift} (${slot.day})`,
                });
              } else if (diffHours <= 96) {
                // TRƯỚC 3-4 NGÀY (> 48h) -> TRUNG BÌNH (MEDIUM)
                const payload = {
                  code: codeUpcoming,
                  type: 'EMPTY_SLOT_UPCOMING' as NotificationType,
                  severity: 'medium' as NotificationSeverity,
                  title: `Ca trống sắp tới (còn ~${Math.round(diffHours / 24)} ngày)`,
                  message: `Ca ${slot.shift} (${slot.day}) ngày ${formatVNDate(startTime)} hiện chưa có người nhận ca. Hãy chuẩn bị nhân sự dự phòng.`,
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

                await upsertToModel(TruongCaNotificationModel, { ...payload, target_role: 'truong_ca' });
                await upsertToModel(QuanLyNotificationModel, { ...payload, target_role: 'quan_ly' });
                await upsertToModel(AdminNotificationModel, { ...payload, target_role: 'admin_he_thong' });
                await upsertToModel(PhoCaLamLichNotificationModel, { ...payload, target_role: 'pho_ca_lam_lich' });
              }
            }
          } else {
            // Đã xếp người vào ca -> Đánh dấu resolved cho các table
            for (const model of [
              TruongCaNotificationModel,
              QuanLyNotificationModel,
              AdminNotificationModel,
              PhoCaLamLichNotificationModel,
            ]) {
              await model.updateMany(
                {
                  code: { $in: [code1Day, code2Days, codeUpcoming] },
                  is_resolved: false,
                },
                { $set: { is_resolved: true } }
              );
            }
          }

          // =========================================================================
          // 3. TRƯỜNG HỢP: NHẮC KIỂM TRA NGUYÊN VẬT LIỆU CHO PHÓ CA VẬT LIỆU
          // =========================================================================
          if (startTime.getTime() > now.getTime()) {
            const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (diffHours <= 6) {
              const materialCode = `MATERIAL:${schedule.week_start_date}:${slot.day}:${slot.shift}`;
              await upsertToModel(PhoCaVatLieuNotificationModel, {
                code: materialCode,
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

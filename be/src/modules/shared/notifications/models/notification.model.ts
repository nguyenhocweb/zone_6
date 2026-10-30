import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
  | 'UNCHECKED_EXPIRED_SHIFT'    // Hết ca chưa checkin (Cao)
  | 'EMPTY_SLOT_1_DAY'           // Ca trống trước 1 ngày (Gấp - nhắc lần 2)
  | 'EMPTY_SLOT_2_DAYS'          // Ca trống trước 2 ngày (Gấp)
  | 'EMPTY_SLOT_UPCOMING'        // Ca trống sắp tới > 2 ngày (Trung bình)
  | 'OVERLOAD_ALERT'             // Cảnh báo quá tải/thiếu ca (Trung bình)
  | 'SCHEDULE_DEADLINE'          // Hạn chốt lưu lịch tuần mới (Gấp)
  | 'MATERIAL_CHECK_REMINDER'    // Nhắc kiểm tra nguyên vật liệu (Cao/Trung bình)
  | 'SHIFT_PERSONAL_REMINDER'    // Nhắc ca làm cá nhân nhân viên (Cao)
  | 'REGISTRATION_WINDOW_ALERT'  // Thông báo đợt đăng ký ca làm (Thấp/Trung bình)
  | 'GENERAL_INFO';              // Thông tin chung (Thấp)

export interface IScheduleNotificationDoc extends Document {
  code: string;                          // Mã định danh duy nhất chống trùng lặp
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  week_start_date: string;              // "2026-10-19"
  day: string;                          // "Thứ 2", "Thứ 3"...
  shift: string;                        // "Sáng", "Chiều", "Tối", "Khuya"
  role_in_slot: string;                 // "Pha chế", "Giữ xe", "All"...
  staff_name?: string | null;
  user_code?: string | null;            // Dành cho thông báo cá nhân nhân viên
  user_id?: string | null;              // ID tài khoản nhân viên (MongoDB _id)
  shift_start_time?: Date | null;
  shift_end_time?: Date | null;
  hours_until_shift?: number | null;
  target_role: string;                  // 'truong_ca' | 'quan_ly' | 'admin_he_thong' | 'pho_ca_lam_lich' | 'pho_ca_vat_lieu' | 'nhan_vien'
  is_read: boolean;
  is_dismissed: boolean;
  is_resolved: boolean;                 // true khi ca đã được check-in hoặc ca trống đã được lấp
  read_by: string[];                    // Danh sách mã user_code/email đã đọc
  created_at: Date;
  updated_at: Date;
}

export function createNotificationSchema(): Schema<IScheduleNotificationDoc> {
  const schema = new Schema<IScheduleNotificationDoc>(
    {
      code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
      },
      type: {
        type: String,
        required: true,
        enum: [
          'UNCHECKED_EXPIRED_SHIFT',
          'EMPTY_SLOT_1_DAY',
          'EMPTY_SLOT_2_DAYS',
          'EMPTY_SLOT_UPCOMING',
          'OVERLOAD_ALERT',
          'SCHEDULE_DEADLINE',
          'MATERIAL_CHECK_REMINDER',
          'SHIFT_PERSONAL_REMINDER',
          'REGISTRATION_WINDOW_ALERT',
          'GENERAL_INFO',
        ],
        index: true,
      },
      severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        index: true,
        default: 'medium',
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
      },
      week_start_date: {
        type: String,
        required: true,
        index: true,
        trim: true,
      },
      day: {
        type: String,
        required: true,
        trim: true,
      },
      shift: {
        type: String,
        required: true,
        trim: true,
      },
      role_in_slot: {
        type: String,
        default: 'All',
        trim: true,
      },
      staff_name: {
        type: String,
        default: null,
        trim: true,
      },
      user_code: {
        type: String,
        default: null,
        trim: true,
      },
      user_id: {
        type: String,
        default: null,
        index: true,
        trim: true,
      },
      shift_start_time: {
        type: Date,
        default: null,
      },
      shift_end_time: {
        type: Date,
        default: null,
      },
      hours_until_shift: {
        type: Number,
        default: null,
      },
      target_role: {
        type: String,
        required: true,
        index: true,
      },
      is_read: {
        type: Boolean,
        default: false,
        index: true,
      },
      is_dismissed: {
        type: Boolean,
        default: false,
        index: true,
      },
      is_resolved: {
        type: Boolean,
        default: false,
        index: true,
      },
      read_by: {
        type: [String],
        default: [],
      },
    },
    {
      timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
  );

  schema.index({ severity: 1, is_resolved: 1, is_dismissed: 1 });
  schema.index({ week_start_date: 1, day: 1, shift: 1 });

  return schema;
}

// =========================================================================
// CÁC TABLE / COLLECTION RIÊNG BIỆT CHO TỪNG ROLE TRONG DATABASE MONGODB ATLAS
// =========================================================================

// 1. Table Thông Báo Trưởng Ca
export const TruongCaNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.TruongCaNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'TruongCaNotification',
    createNotificationSchema(),
    'notifications_truong_ca'
  );

// 2. Table Thông Báo Quản Lý
export const QuanLyNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.QuanLyNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'QuanLyNotification',
    createNotificationSchema(),
    'notifications_quan_ly'
  );

// 3. Table Thông Báo Admin Hệ Thống
export const AdminNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.AdminNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'AdminNotification',
    createNotificationSchema(),
    'notifications_admin'
  );

// 4. Table Thông Báo Phó Ca Làm Lịch
export const PhoCaLamLichNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.PhoCaLamLichNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'PhoCaLamLichNotification',
    createNotificationSchema(),
    'notifications_pho_ca_lam_lich'
  );

// 5. Table Thông Báo Phó Ca Vật Liệu
export const PhoCaVatLieuNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.PhoCaVatLieuNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'PhoCaVatLieuNotification',
    createNotificationSchema(),
    'notifications_pho_ca_vat_lieu'
  );

// 6. Table Thông Báo Nhân Viên
export const NhanVienNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.NhanVienNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'NhanVienNotification',
    createNotificationSchema(),
    'notifications_nhan_vien'
  );

// Model fallback/tương thích ngược
export const ScheduleNotificationModel: Model<IScheduleNotificationDoc> =
  mongoose.models.ScheduleNotification ||
  mongoose.model<IScheduleNotificationDoc>(
    'ScheduleNotification',
    createNotificationSchema(),
    'schedule_notifications'
  );

// Map ánh xạ Role sang Model tương ứng
export const ALL_ROLE_NOTIFICATION_MODELS: Record<string, Model<IScheduleNotificationDoc>> = {
  truong_ca: TruongCaNotificationModel,
  quan_ly: QuanLyNotificationModel,
  admin_he_thong: AdminNotificationModel,
  pho_ca_lam_lich: PhoCaLamLichNotificationModel,
  pho_ca_vat_lieu: PhoCaVatLieuNotificationModel,
  nhan_vien: NhanVienNotificationModel,
};

export function getNotificationModelForRole(role: string): Model<IScheduleNotificationDoc> {
  const model = ALL_ROLE_NOTIFICATION_MODELS[role];
  return model || TruongCaNotificationModel;
}

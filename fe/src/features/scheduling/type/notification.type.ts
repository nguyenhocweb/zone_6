export type NotificationSeverity = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
  | 'UNCHECKED_EXPIRED_SHIFT'    // Hết ca chưa checkin (Cao)
  | 'EMPTY_SLOT_1_DAY'           // Ca trống trước 1 ngày (Gấp - Nhắc lần 2)
  | 'EMPTY_SLOT_2_DAYS'          // Ca trống trước 2 ngày (Gấp)
  | 'EMPTY_SLOT_UPCOMING'        // Ca trống sắp tới > 2 ngày (Trung bình)
  | 'OVERLOAD_ALERT'             // Cảnh báo quá tải/thiếu ca (Trung bình)
  | 'SCHEDULE_DEADLINE'          // Hạn chốt lưu lịch tuần mới (Gấp)
  | 'MATERIAL_CHECK_REMINDER'    // Nhắc kiểm tra nguyên vật liệu (Cao/Trung bình)
  | 'SHIFT_PERSONAL_REMINDER'    // Nhắc ca làm cá nhân nhân viên (Cao)
  | 'REGISTRATION_WINDOW_ALERT'  // Thông báo đợt đăng ký ca làm (Thấp/Trung bình)
  | 'GENERAL_INFO';              // Thông tin chung (Thấp)

export interface ScheduleNotification {
  _id: string;
  code: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  week_start_date: string;
  day: string;
  shift: string;
  role_in_slot: string;
  staff_name?: string | null;
  user_code?: string | null;
  user_id?: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  hours_until_shift?: number | null;
  target_role: string;
  is_read: boolean;
  is_dismissed: boolean;
  is_resolved: boolean;
  read_by?: string[];
  created_at: string;
  updated_at: string;
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

export interface GetNotificationsResponse {
  success: boolean;
  data: ScheduleNotification[];
  stats: NotificationStats;
  target_role?: string;
  role_tables?: string[];
}

export const ROLE_TABLE_LABELS: Record<
  string,
  { label: string; icon: string; desc: string; collection: string }
> = {
  truong_ca: {
    label: "Trưởng Ca",
    icon: "🛡️",
    desc: "Ca trống gấp & điểm danh hết ca",
    collection: "notifications_truong_ca",
  },
  quan_ly: {
    label: "Quản Lý",
    icon: "👑",
    desc: "Toàn bộ cảnh báo vận hành quán",
    collection: "notifications_quan_ly",
  },
  admin_he_thong: {
    label: "Admin Hệ Thống",
    icon: "⚡",
    desc: "Giám sát hệ thống & toàn quán",
    collection: "notifications_admin",
  },
  pho_ca_lam_lich: {
    label: "Phó Ca Làm Lịch",
    icon: "📅",
    desc: "Ca trống cần xếp & đợt đăng ký",
    collection: "notifications_pho_ca_lam_lich",
  },
  pho_ca_vat_lieu: {
    label: "Phó Ca Vật Liệu",
    icon: "📦",
    desc: "Kiểm tra vật liệu & kho trước ca",
    collection: "notifications_pho_ca_vat_lieu",
  },
  nhan_vien: {
    label: "Nhân Viên",
    icon: "👤",
    desc: "Ca làm cá nhân & nhắc check-in",
    collection: "notifications_nhan_vien",
  },
};

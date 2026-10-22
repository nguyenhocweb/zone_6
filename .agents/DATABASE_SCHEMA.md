# DANH BẠ CƠ SỞ DỮ LIỆU & COLLECTIONS (MONGODB ATLAS + MONGOOSE)

Tài liệu này lưu vết toàn bộ cơ sở dữ liệu MongoDB Atlas (Database: `zone_6`), các collections và Mongoose Models tương ứng trong dự án Node.js (`be/`).

---

## 🌐 THÔNG TIN KẾT NỐI MONGODB ATLAS
- **Cluster**: `nguyenhocweb.pqyjucr.mongodb.net`
- **Database Name**: `zone_6`
- **Connection URI**: `mongodb+srv://My_Restaurant:Matkhau2k3.@nguyenhocweb.pqyjucr.mongodb.net/zone_6?retryWrites=true&w=majority&appName=nguyenhocweb`
- **Mongoose Configuration**: `strictQuery: true`, `serverSelectionTimeoutMS: 15000`

---

## 📊 BẢNG THEO DÕI COLLECTIONS & MODELS HIỆN CÓ

| Tên Collection | Mongoose Model | File Location | Indexes Quan Trọng | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `UserModel` | `be/src/modules/user/models/user.model.ts` | `user_code (unique)`, `email (unique)`, `qr_code (unique)` | Quản lý nhân sự, mã QR chấm công, mức lương theo giờ (18,000 VND) |
| `weekly_schedules` | `WeeklyScheduleModel` | `be/src/modules/scheduling/models/weekly-schedule.model.ts` | `week_number, year (compound)` | Lịch làm việc tổng thể phân theo từng tuần |
| `shift_assignments` | `ShiftAssignmentModel` | `be/src/modules/scheduling/models/shift-assignment.model.ts` | `{ user_id, work_date, shift_type }` (unique) | Chi tiết ca làm từng ngày của nhân viên |
| `attendances` | `AttendanceModel` | `be/src/modules/attendance/models/attendance.model.ts` | `user_id, work_date`, `verification_status` | Lịch sử check-in, ảnh selfie, tọa độ GPS, xác minh đúng ca & tính lương |
| `store_configs` | `StoreConfigModel` | `be/src/modules/store/models/store-config.model.ts` | `store_name` | Tọa độ GPS quán Zone Six, bán kính Geofencing (50m) & khung giờ ca |
| `shift_registrations` | `ShiftRegistrationModel` | `be/src/modules/scheduling/models/shift-registration.model.ts` | `{ user_id, week_start_date }` (unique) | Đăng ký ca làm tuần của nhân sự (Quy tắc 1: Mọi vai trò đều có thể đăng ký) |
| `registration_windows` | `RegistrationWindowModel` | `be/src/modules/scheduling/models/registration-window.model.ts` | `week_start_date` (unique), `is_open`, `close_at` | Cấu hình mở/đóng đợt đăng ký và hẹn giờ đóng theo ngày giờ cụ thể cho từng tuần |
| `notifications_truong_ca` | `TruongCaNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo Trưởng ca (Hết ca chưa check-in [Cao], Ca trống trước 1-2 ngày [Gấp]) |
| `notifications_quan_ly` | `QuanLyNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo Quản lý (Toàn bộ cảnh báo vận hành, ca trống gấp, vi phạm check-in) |
| `notifications_admin` | `AdminNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo Admin hệ thống (Giám sát toàn diện hệ thống, lỗi vận hành) |
| `notifications_pho_ca_lam_lich` | `PhoCaLamLichNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo Phó ca làm lịch (Ca trống cần xếp gấp, đóng/mở đợt đăng ký ca) |
| `notifications_pho_ca_vat_lieu` | `PhoCaVatLieuNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo Phó ca vật liệu (Nhắc kiểm tra nguyên vật liệu trước ca, kiểm kê kho) |
| `notifications_nhan_vien` | `NhanVienNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo Nhân viên (Nhắc ca làm cá nhân trong ngày, nhắc check-in, đợt đăng ký mới) |
| `schedule_notifications` | `ScheduleNotificationModel` | `be/src/modules/scheduling/models/notification.model.ts` | `code (unique)`, `severity`, `is_resolved` | Table thông báo tổng hợp (fallback & backwards-compatible) |
| `zalo_configs` | `ZaloConfigModel` | `be/src/modules/zalo/models/zalo-config.model.ts` | `thread_type, target_id` | Cấu hình kênh nhận tin Zalo mặc định (Group/User), ảnh đính kèm & mẫu tin nhắn |

---

## 🛠️ CHI TIẾT CẤU TRÚC SCHEMAS

### 1. Bảng `users` (Nhân sự, Xác thực & Phân quyền)
```typescript
{
  user_code: { type: String, required: true, unique: true, uppercase: true, index: true }, // "Z6-ADMIN", "Z6-QL01", "Z6-TC01", "Z6-NV01", "Z6-PCVL01", "Z6-PCL01"
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true }, // Mật khẩu Plain Text (theo yêu cầu đặc tả dự án không mã hóa)
  role: { 
    type: String, 
    enum: [
      'admin_he_thong',   // Admin hệ thống
      'quan_ly',          // Quản lý
      'truong_ca',        // Trưởng ca
      'nhan_vien',        // Nhân viên
      'pho_ca_vat_lieu',  // Phó ca (chuyên về vật liệu)
      'pho_ca_lam_lich'   // Phó ca chuyên về làm lịch
    ], 
    default: 'nhan_vien', 
    index: true 
  },
  phone: { type: String, default: null },
  qr_code: { type: String, unique: true, sparse: true, index: true }, // Token quét QR
  hourly_rate: { type: Number, default: 18000, min: 0 }, // 18,000 VNĐ / giờ
  position: { type: String, default: 'service' },
  is_active: { type: Boolean, default: true, index: true },
  created_at: Date,
  updated_at: Date
}
```

### 2. Bảng `weekly_schedules` (Lịch Làm Việc Theo Tuần - Phân Ca & Workloads Chi Tiết)
```typescript
{
  week_start_date: { type: String, required: true, unique: true, index: true }, // "2026-10-19"
  week_range: { type: String, required: true },                                // "19/10/2026 – 25/10/2026"
  evening_shift_mode: { type: Number, enum: [1, 2], default: 2 },
  slots: [{
    day: String,         // "Thứ 2", "Thứ 3"...
    shift: String,       // "Sáng", "Chiều", "Tối", "Khuya"
    role: String,        // "Pha chế", "Giữ xe", "All"
    staff_name: String,  // Tên nhân sự hoặc null
    is_empty: Boolean,
    is_disabled: Boolean,
    is_leader: Boolean,
    is_checked_in: Boolean // Điểm danh (check-in) ca làm việc (Chỉ Admin, Quản lý, Trưởng ca được tích)
  }],
  workloads: [{
    name: String,
    target_shifts: Number,
    assigned_shifts: Number,
    status: String
  }],
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  first_created_at: { type: Date, default: Date.now }, // Thời điểm lưu lần đầu (bắt buộc trước 24h trước tuần làm việc)
  created_by_name: { type: String, default: 'Quản lý' },
  created_by_role: { type: String, default: 'quan_ly' },
  created_at: Date,
  updated_at: Date
}
```

### 3. Bảng `shift_assignments` (Phân Ca Làm Việc)
```typescript
{
  schedule_id: { type: Schema.Types.ObjectId, ref: 'WeeklySchedule', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  work_date: { type: Date, required: true, index: true }, // YYYY-MM-DD
  shift_type: { type: String, enum: ['MORNING', 'AFTERNOON', 'NIGHT'], required: true },
  start_time: { type: String, required: true }, // "07:00", "12:00", "18:00"
  end_time: { type: String, required: true },   // "12:00", "18:00", "23:00"
  planned_hours: { type: Number, required: true, default: 5 },
  status: { type: String, enum: ['ASSIGNED', 'CONFIRMED', 'CANCELLED', 'SWAPPED'], default: 'ASSIGNED' },
  created_at: Date,
  updated_at: Date
}
```

### 4. Bảng `attendances` (Chấm Công Check-in, GPS, Ảnh Selfie & Xác Minh Đúng Ca)
```typescript
{
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignment_id: { type: Schema.Types.ObjectId, ref: 'ShiftAssignment', default: null, index: true },
  work_date: { type: Date, required: true, index: true },
  check_in_time: { type: Date, required: true },
  check_out_time: { type: Date, default: null },
  photo_url: { type: String, required: true }, // URL ảnh chụp camera trực tiếp kèm dấu chìm
  address: { type: String, default: '' }, // Địa chỉ trực tiếp từ định vị GPS lúc check-in
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: 0 }
  },
  distance_meters: { type: Number, required: true }, // Khoảng cách so với quán
  is_geofence_valid: { type: Boolean, required: true }, // <= 50m
  is_shift_valid: { type: Boolean, required: true },    // Đúng ca xếp lịch
  late_minutes: { type: Number, default: 0 },
  early_leave_minutes: { type: Number, default: 0 },
  actual_hours: { type: Number, default: 0 },
  hourly_rate_snapshot: { type: Number, required: true }, // 18,000 VND
  earned_amount: { type: Number, default: 0 }, // actual_hours * hourly_rate_snapshot
  verification_status: {
    type: String,
    enum: ['VALID', 'WRONG_SHIFT', 'OUT_OF_RANGE', 'LATE', 'MANUAL_APPROVED'],
    default: 'VALID',
    index: true
  },
  created_at: Date,
  updated_at: Date
}
```

### 4. 6 Table Thông Báo Riêng Biệt Cho Từng Role (`notifications_*`)
Các Table: `notifications_truong_ca`, `notifications_quan_ly`, `notifications_admin`, `notifications_pho_ca_lam_lich`, `notifications_pho_ca_vat_lieu`, `notifications_nhan_vien`.
```typescript
{
  code: { type: String, required: true, unique: true, index: true },
  type: {
    type: String,
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
      'GENERAL_INFO'
    ],
    index: true
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  week_start_date: { type: String, required: true, index: true },
  day: { type: String, required: true },
  shift: { type: String, required: true },
  role_in_slot: { type: String, default: 'All' },
  staff_name: { type: String, default: null },
  user_code: { type: String, default: null },           // Mã định danh nhân viên (VD: "Z6-STF01")
  user_id: { type: String, default: null, index: true }, // MongoDB _id của tài khoản nhân sự
  shift_start_time: { type: Date, default: null },
  shift_end_time: { type: Date, default: null },
  hours_until_shift: { type: Number, default: null },
  target_role: { type: String, required: true, index: true }, // 'truong_ca' | 'quan_ly' | 'admin_he_thong' | 'pho_ca_lam_lich' | 'pho_ca_vat_lieu' | 'nhan_vien'
  is_read: { type: Boolean, default: false, index: true },
  is_dismissed: { type: Boolean, default: false, index: true },
  is_resolved: { type: Boolean, default: false, index: true },
  read_by: { type: [String], default: [] },
  created_at: Date,
  updated_at: Date
}
```


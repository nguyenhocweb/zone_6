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
| `toppings` | `ToppingModel` | `be/src/modules/pho_ca_vat_lieu/material/models/topping.model.ts` | `code (unique)`, `is_active` | Bảng topping & phụ gia trong kho (Trân châu trắng 3Q, trân châu hoàng kim, thạch củ năng, đào ngâm), chứa `portion_unit` (cách bán) và `selling_price` (giá bán lẻ) |
| `sellable_toppings` | `SellableToppingModel` | `be/src/modules/pho_ca_vat_lieu/material/models/sellable-topping.model.ts` | `name`, `code`, `is_active` | Bảng riêng biệt quản lý thực đơn topping bán cho khách hàng kèm cách thức bán (1 vá, 1 miếng, 1 muỗng...), giá bán, tỷ lệ lãi gộp % và liên kết tồn kho thời gian thực |
| `materials` | *(Legacy/Fallback)* | `be/src/modules/pho_ca_vat_lieu/material/models/material.model.ts` | `code (unique)`, `category`, `is_active` | Bảng vật liệu cũ (đã phân tách thành 3 bảng riêng biệt packagings, ingredients, toppings) |
| `recipes` | `RecipeModel` | `be/src/modules/pho_ca_vat_lieu/material/models/recipe.model.ts` | `code (unique)`, `store_id`, `{ store_id, type }`, `{ store_id, category }` | Sổ tay công thức món phân lập theo từng chi nhánh (`store_id`), cấu hình ly phục vụ nóng/lạnh, liên kết `category_id` |
| `recipe_categories` | `RecipeCategoryModel` | `be/src/modules/pho_ca_vat_lieu/material/models/recipe-category.model.ts` | `name (unique)`, `type`, `is_active` | Bảng quản lý danh mục món độc lập (Trà trái cây, Cà phê, Trà sữa, Đá xay, Bán thành phẩm nội bộ, Cốt trà & Syrup), cho phép chọn hoặc thêm mới tự động |
| `packagings` | `PackagingModel` | `be/src/modules/pho_ca_vat_lieu/material/models/packaging.model.ts` | `code (unique)`, `temperature_mode`, `is_active` | Bảng quản lý bao bì, ly nhựa (PP, PET), ly giấy, túi, ống hút, có thuộc tính `cup_size` (Size S 350ml, Size M 500ml, Size L 700ml, 1000ml...) |
| `inventory_audits` | `InventoryAuditModel` | `be/src/modules/pho_ca_vat_lieu/material/models/inventory-audit.model.ts` | `audit_code (unique)`, `store_id`, `status`, `audit_shift` | Bảng lưu lịch sử kiểm kê kho thực tế, ca kiểm kho (`audit_shift`), chế độ đếm đơn lẻ & đếm nhiều (Thùng/Lốc/Bao), chênh lệch và trạng thái duyệt (`pending_review`, `adjusted`, `confirmed`) |
| `inventory_audit_configs` | `InventoryAuditConfigModel` | `be/src/modules/pho_ca_vat_lieu/material/models/inventory-audit-config.model.ts` | `store_id (unique)`, `is_active` | Bảng cấu hình quy trình kiểm kho theo chi nhánh: phân quyền vai trò tạo phiếu, phân quyền vai trò sửa/duyệt, danh sách ca kiểm kho bắt buộc trong ngày, chu kỳ tần suất (hàng ngày, 2-3 ngày/lần, hàng tuần) & giờ nhắc nhở |
| `suppliers` | `SupplierModel` | `be/src/modules/admin_he_thong/supplier/models/supplier.model.ts` | `code (unique)`, `name`, `is_active` | Bảng quản lý nhà cung cấp & nguồn hàng vật tư, danh sách nguyên vật liệu liên kết và đơn giá nhập (Độc quyền Admin & Quản lý) |
| `shift_configs` | `ShiftConfigModel` | `be/src/modules/pho_ca_lam_lich/scheduling/models/shift-config.model.ts` | `{ store_id, shift_code } (unique)`, `store_id`, `is_active` | Bảng cấu hình ca làm việc & định biên nhân sự theo chi nhánh: tên ca, mã ca, giờ bắt đầu/kết thúc, số giờ công, số nhân viên tối thiểu (`min_staff`), tối đa (`max_staff`), định biên tối thiểu Pha chế (`min_barista`), Phục vụ (`min_service`), màu nhận diện & các ngày áp dụng |
| `orders` | `OrderModel` | `be/src/modules/pos/models/order.model.ts` | `order_code (unique)`, `{ store_id, created_at }` | Bảng lưu trữ hóa đơn bán hàng vĩnh viễn sau thanh toán, chi tiết món, topping, số tiền, phương thức (VietQR/Tiền mặt), người tạo, người thu |
| `pos_sessions` | `PosSessionModel` | `be/src/modules/pos/models/pos-session.model.ts` | `session_code (unique)`, `{ store_id, shift_id }` | Bảng phiên làm việc giỏ hàng trực tiếp (Live Cart) theo ca trực tại chi nhánh, hỗ trợ đồng bộ đa thiết bị qua WebSocket |

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
  assigned_store_id: { type: Schema.Types.ObjectId, ref: 'StoreConfig', default: null, index: true }, // Cơ sở làm việc cố định (cho trưởng ca, phó ca, nhân viên)
  assigned_stores: [{ type: Schema.Types.ObjectId, ref: 'StoreConfig' }], // Danh sách cơ sở phụ trách (cho quản lý chuỗi)
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

### 17. Bảng `recipe_categories` (Danh Mục Món & Bán Thành Phẩm Độc Lập)
```typescript
{
  name: { type: String, required: true, unique: true, trim: true, index: true }, // "Trà trái cây", "Cà phê", "Trà sữa", "Đá xay", "Bán thành phẩm nội bộ", "Cốt trà & Syrup"...
  type: { 
    type: String, 
    enum: ['customer_product', 'internal_prep', 'both'], 
    default: 'customer_product', 
    index: true 
  },
  description: { type: String, default: null },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true, index: true },
  created_at: Date,
  updated_at: Date
}
```

### 18. Bảng `packagings`, `ingredients`, `toppings` & `sellable_toppings` (Multi-Store Isolated Collections)
```typescript
// Tất cả các bảng tồn kho và vật tư chi nhánh đều bắt buộc có store_id:
{
  store_id: { type: Schema.Types.ObjectId, ref: 'StoreConfig', required: true, index: true }, // Chi nhánh sở hữu tồn kho
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['packaging', 'ingredient', 'topping'], required: true },
  unit: { type: String, required: true },
  quantity_in_stock: { type: Number, default: 0 },
  min_threshold: { type: Number, default: 0 },
  cost_per_unit: { type: Number, default: 0 },
  // Thuộc tính mở rộng theo loại:
  cup_size?: string,             // Dành cho packagings (Size S 350ml, Size M 500ml, Size L 700ml...)
  temperature_mode?: string,     // 'hot', 'cold', 'both'
  applicable_to?: string,        // 'beverage', 'internal_prep', 'both' (nguyên liệu pha chế)
  portion_unit?: string,         // Dành cho toppings & sellable_toppings (1 vá, 1 miếng, 1 viên...)
  selling_price?: number,        // Giá bán lẻ cho khách của topping
  gross_profit_margin?: number,  // Biên lãi gộp % tự động tính
  is_active: { type: Boolean, default: true, index: true }
}
```

### 19. Bảng `purchase_requisitions` (Phiếu Yêu Cầu Nhập Kho Chi Nhánh)
```typescript
{
  code: { type: String, required: true, unique: true, index: true }, // "PR-20261029-CN01-001"
  store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true, index: true },
  store_name: { type: String, default: null },
  creator_id: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
  creator_name: { type: String, default: null },
  creator_role: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_PO', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING',
    index: true 
  },
  priority: { type: String, enum: ['NORMAL', 'URGENT'], default: 'NORMAL' },
  expected_delivery_date: { type: Date, default: null },
  notes: { type: String, default: null },
  rejection_reason: { type: String, default: null },
  items: [{
    material_id: String,
    material_code: String,
    material_name: String,
    category: String,
    unit: String,
    current_stock: Number,
    min_threshold: Number,
    requested_quantity: Number,
    approved_quantity: Number,
    suggested_supplier_id: String,
    suggested_supplier_name: String,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'IN_PO'], default: 'PENDING' }
  }],
  created_at: Date,
  updated_at: Date
}
```

### 20. Bảng `purchase_orders` (Đơn Thu Mua Đa Chi Nhánh / Đơn Riêng Nhà Cung Cấp)
```typescript
{
  po_number: { type: String, required: true, unique: true, index: true }, // "PO-20261029-001"
  order_type: { type: String, enum: ['CONSOLIDATED', 'BRANCH_DIRECT'], required: true },
  supplier_id: { type: Schema.Types.ObjectId, ref: 'suppliers', required: true, index: true },
  supplier_name: { type: String, required: true },
  created_by_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  created_by_name: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['PENDING', 'SENT', 'CONFIRMED', 'SHIPPING', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING',
    index: true 
  },
  delivery_destination: { type: String, enum: ['CENTRAL_HUB', 'STORE_DIRECT'], required: true },
  delivery_store_id: { type: Schema.Types.ObjectId, ref: 'stores', default: null, index: true },
  delivery_address: { type: String, required: true },
  contact_person: { type: String, default: null },
  contact_phone: { type: String, default: null },
  total_estimated_cost: { type: Number, default: 0 },
  expected_arrival_date: { type: Date, default: null },
  received_at: { type: Date, default: null },
  received_by_id: { type: Schema.Types.ObjectId, ref: 'users', default: null },
  received_by_name: { type: String, default: null },
  notes: { type: String, default: null },
  items: [{
    requisition_id: String,
    target_store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true },
    target_store_name: String,
    material_id: String,
    material_code: String,
    material_name: String,
    category: String,
    unit: String,
    ordered_quantity: Number,
    received_quantity: { type: Number, default: 0 },
    unit_price: Number,
    subtotal: Number
  }],
  created_at: Date,
  updated_at: Date
}
```


